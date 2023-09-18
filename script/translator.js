/**
 * @file translator.js
 * @license MIT-License
 * Copyright (c) 2023 hifmac
 */

const fetchOriginal = fetch;
fetch = function(...args) {
    if (typeof args[0] === "string" && args[0].match(new RegExp("/ja/[^/]+\.json"))) {
        return new Promise((resolve, reject) => {
            // 英語と日本語の両方をfetchする
            const argsJa = args;
            const argsEn = Array.from(argsJa);
            argsEn[0] = argsJa[0].replace("/ja/", "/en/");
            console.log(argsJa[0], argsEn[0]);
            Promise.all([
                fetchOriginal.apply(this, argsJa),
                fetchOriginal.apply(this, argsEn)
            ])
            .then(([responseJa, responseEn]) => {
                // Response.text() を　日本語データと英語データを
                // マージしたデータを返す関数に作り直す
                const responseText = responseJa.text;
                responseJa.text = function() {
                    return Promise.all([
                        responseText.apply(responseJa),
                        responseEn.text(),
                    ])
                    .then(([responseTextJa, responseTextEn]) => {
                        const responseJsonJa = JSON.parse(responseTextJa);
                        const responseJsonEn = JSON.parse(responseTextEn);
                        const pagePropsJa = responseJsonJa.pageProps.__namespaces;
                        const pagePropsEn = responseJsonEn.pageProps.__namespaces;
                        for (const pane in pagePropsEn) {
                            for (const tip in pagePropsEn[pane]) {
                                if (!(tip in pagePropsJa[pane])) {
                                    pagePropsJa[pane][tip] = pagePropsEn[pane][tip];
                                    // console.log(`Add: ${pane}.${tip}, ${pagePropsEn[pane][tip]}`);
                                }
                            }    
                        }
                        return JSON.stringify(responseJsonJa);
                    });
                };

                resolve(responseJa);
            }).catch(reject);
        });
    }

    return fetchOriginal.apply(this, args);
};
