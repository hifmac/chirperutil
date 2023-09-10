/**
 * @file contentScript.js
 * @license MIT-License
 * Copyright (c) 2023 hifmac
 */

// *******************
// ***   Utility   ***
// *******************

function padZero(num, width) {
    return String(num).padStart(width, "0")
}

/**
 * format date time string to local time
 * @param {string} dateString 
 */
function formatDateTimeString(dateString) {
    const localTime = new Date(dateString);
    return `${localTime.getFullYear()}/${localTime.getMonth()}/${localTime.getDate()} ${padZero(localTime.getHours(), 2)}:${padZero(localTime.getMinutes(), 2)}:${padZero(localTime.getSeconds(), 2)}`;
}

/**
 * format date time string for bumpedAt (missed time zone)
 * @param {string} dateString 
 */
function formatBumpedAtDateTimeString(dateString) {
    return formatDateTimeString(dateString.replace("Z", "-0400"));
}

/**
 * create chirper type dict to tuple
 * @param {Object<string, Object<string, string> | string | string[]>} chirper 
 * @returns {Object<string, string | string[]>}
 */
function chirper2Tuple(chirper) {
    return [
        [ "@ID", chirper.username ],
        [ "Version", chirper.version ],
        [ "時刻情報",
            [
                "bumpedAt " + formatBumpedAtDateTimeString(chirper.bumpedAt),
                "onlineAt " + formatDateTimeString(chirper.onlineAt),
                "indexedAt " + formatDateTimeString(chirper.indexedAt),
                "chosenAt " + formatDateTimeString(chirper.chosenAt),
                "journalAt " + formatDateTimeString(chirper.journalAt),
            ]
        ],
        [ "名前 (name)", chirper.name ],
        [ "言語 (lang)", chirper.lang ],
        [ "半生 (bio)", chirper.bio ],
        [ "バックストーリー (backstory)", chirper.backstory ],
        [ "年齢 (age)", chirper.age ],
        [ "性別 (gender)", chirper.gender ],
        [ "人種 (race)", chirper.race ],
        [ "チャープ数 (chirps)", chirper.chirps ],
        [ "夢 (story.want)", chirper.story?.want ],
        [ "必須事項 (story.need)", chirper.story?.need ],
        [ "進捗 (story.progress)", (chirper.story?.progress || []).map((x) => `${x.name} - ${x.description}`) ],
        [ "種族 (spec.species)", chirper.spec?.species ],
        [ "居場所 (spec.location)", chirper.spec?.location ],
        [ "意志 (spec.intention)", chirper.spec?.intention ],
        [ "要約 (spec.summary)", chirper.spec?.summary ],
        [ "プロンプト (spec.prompt)", chirper.spec?.prompt ],
        [ "ネガティブ (spec.negative)", chirper.spec?.negative ],
        [ "投稿例 (spec.posts)", chirper.spec?.posts ],
        [ "返信例 (spec.responses)", chirper.spec?.responses ],
        [ "設定 (spec.setting)", chirper.spec?.setting ],
        [ "顔 (spec.face)", chirper.spec?.face ],
        [ "髪 (spec.hair)", chirper.spec?.hair ],
        [ "体 (spec.body)", chirper.spec?.body ],
        [ "スタイル (spec.style)", chirper.spec?.style ],
    ];
}

/**
 * create world type dict to tuple
 * @param {Object<string, Object<string, string> | string | string[]>} world 
 * @returns {Object<string, string | string[]>}
 */
function world2Tuple(world) {
    return [
        [ "@ID", world.slug ],
        [ "名前", world.name ],
        [ "カテゴリ", (world.categories || []).map((x) => x.name) ],
        [ "説明", world.description ],
        [ "言語", world.lang ],
        [ "概要", world.short ],
        [ "バックストーリー", world.backstory ],
        [ "プロンプト", world.spec?.prompt ],
        [ "ネガティブ", world.spec?.negative ],
        [ "年代", world.spec?.year ],
        [ "スタイル", world.spec?.style ],
        [ "概要", world.spec?.summary ],
        [ "統治", world.spec?.governance ],
        [ "Want", world.story?.want ],
        [ "Need", world.story?.need ],
    ];
}


// *********************************
// ***   CSS related functions   ***
// *********************************

function registerChirperUtilClasses() {

    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
.ChirperUtilFont {
    color: rgba(15, 15, 15, 1);
    font-family: -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
    font-weight: 400;
    font-size: 1rem;
    line-height: 1.5em;
}

.ChirperUtilSmallFont {
    color: rgba(0, 0, 0, 0.6);
    font-family: -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
    font-weight: 400;
    font-size: 0.875rem;
    line-height: 1.43em;
}

.ChirperInformationBox {
    z-index: 2000;
    position: fixed;
    max-height: calc(100% - 64px);
    max-width: 600px;
    width: calc(100% - 64px);
    background: #ffffff;
    overflow: auto;
    padding: 16px;
    border-top: 8px solid rgb(50, 143, 206);
    border-radius: 12px;
    box-sizing: inherit;
}

.ChirperUtilMetaText {
    width: 100%;
    word-break: break-word;
    justify-content: left;
}

.ChirperUtilFormBox {
    margin: 16px 0px 0px;
    position: relative;
}

.ChirperUtilFormLabel {
    position: absolute;
    background: #ffffff;
    z-index: 1;
    top: 0px;
    left: 0px;
    transform-origin: left top;
    transform: translate(14px, -9px) scale(0.75);
    margin: 0px;
    padding: 0px 16px 0px 16px;
}

.ChirperUtilFormInput {
    box-sizing: border-box;
    cursor: text;
    display: inline-flex;
    align-items: center;
    width: 100%;
    position: relative;
    border-radius: 12px;
    border: 1px solid;
    padding: 16.5px 14px;
}

.ChirperUtilTextarea {
    letter-spacing: inherit;
    border: 0px;
    box-sizing: content-box;
    background: none;
    height: auto;
    margin: 0px;
    display: block;
    min-width: 0px;
    width: 100%;
    resize: none;
    padding: 0px;
}

.ChirperUtilParagraph {
    height: auto;
    width: 100%;
    overflow: hidden;
    resize: none;
    padding: 0px;
    margin: 0px;
}

`;
    document.head.appendChild(styleSheet);
}



/**
 * make top-level div element
 * @returns {HTMLDivElement}
 */
function createChirperBox() {
    const paramWindow = document.createElement("div");
    paramWindow.classList.add("ChirperInformationBox");
    paramWindow.style.top = "0" + "px";
    paramWindow.style.left = "0" + "px";

    let originTop = 0;
    let originLeft = 0;

    let originX = 0;
    let originY = 0;

    function closeDragElement() {
        document.removeEventListener("mouseup", closeDragElement);
        document.removeEventListener("mousemove", elementDrag);
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();

        // set the element's new position:
        paramWindow.style.top = (originTop + e.clientY - originY) + "px";
        paramWindow.style.left = (originLeft + e.clientX - originX) + "px";
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();

        originTop = paramWindow.style.top.replace("px", "") | 0;
        originLeft = paramWindow.style.left.replace("px", "") | 0;
        originY = e.clientY;
        originX = e.clientX;

        document.addEventListener("mouseup", closeDragElement);
        document.addEventListener("mousemove", elementDrag);
    }

    paramWindow.addEventListener("mousedown", dragMouseDown);

    return paramWindow;
}

/**
 * create chirper panel
 * @param {HTMLDivElement} paramWindow 
 * @param {string[][]} parameters 
 */
function createChirperPanel(paramWindow, parameters) {
    removeChildren(paramWindow);

    let n = 0;
    for (const parameter of parameters) {
        n += 1;

        // create form label
        const label = document.createElement("label");
        label.classList.add(
            "ChirperUtilFormLabel",
            "ChirperUtilFont");
        label.textContent = parameter[0];
        label.setAttribute("data-shrink", true);
        label.setAttribute("for", `parameter${n}`)
        label.setAttribute("name", `parameter${n}-label`)

        // create parameter paragraph
        const paragraph = document.createElement("p");
        paragraph.classList.add("ChirperUtilParagraph", "ChirperUtilFont")
        paragraph.id = `parameter${n}`;

        const textList = (Array.isArray(parameter[1])
            ? parameter[1].map((value, index) => `${index + 1}: ${value}`) 
            : `${parameter[1]}`.trim().split("\n"));
        for (const text of textList) {
            if (paragraph.firstChild) {
                paragraph.append(document.createElement("br"));
            }
            paragraph.append(document.createTextNode(text));
        }

        // create form input div
        const input = document.createElement("div");
        input.classList.add("ChirperUtilFormInput")
        input.appendChild(paragraph);

        // create form 
        const box = document.createElement("div");
        box.classList.add("ChirperUtilFormBox");
        box.appendChild(label);
        box.appendChild(input);
        paramWindow.appendChild(box);
    }
}

/**
 * remove children from element
 * @param {HTMLElement} elems 
 */
function removeChildren(elems) {
    while (elems.firstChild) {
        elems.removeChild(elems.firstChild);
    }
}

// ***************************
// ***   GPT-3 Tokenizer   ***
// ***************************

const gpt3Encoder = (() => {
    let encoder = null;

    const src = chrome.runtime.getURL("script/gpt3encoder.js");
    import(src).then((newModule) => {
        encoder = newModule.encoder; 
        console.log("GPT-3 Encoder loaded", encoder);
    }).catch(console.error);          

    return {
        countToken(text) {
            if (encoder) {
                return encoder.countTokens(text);
            }
        
            return 0;
        }
    }
})();


// *****************************
// ***   Chirper API Queue   ***
// *****************************

const apiCache = (() => {
    let db = null;

    // Open a database
    const openRequest = indexedDB.open("chirperUtilApiCache", 1);

    // Handle database upgrade
    openRequest.onupgradeneeded = function(event) {
        // Get the database object
        db = event.target.result;

        // Create an object store for books
        const chirpStore = db.createObjectStore("chirp", { keyPath: "url" });

        console.log(chirpStore);
    };

    // Handle database success
    openRequest.onsuccess = function(event) {
        console.log("DB opened");

        // Get the database object
        db = event.target.result;
    };

    // Handle database error
    openRequest.onerror = function(event) {
        // Get the error from the request
        const error = event.target.error;

        // Do something with the error
        console.error(error);
    };

    return {
        read(url) {
            return new Promise((resolve, reject) => {
                // Start a transaction for books
                const tx = db.transaction("chirp", "readonly");

                // Get the object store for books
                const chirpStore = tx.objectStore("chirp");

                // Get a book by its key
                const getRequest = chirpStore.get(url);

                // Handle request success
                getRequest.onsuccess = function(event) {
                    // Get the result from the request
                    resolve(event.target.result);
                };

                // Handle request error
                getRequest.onerror = function(event) {
                    // Get the error from the request
                    reject(event.target.error);
                };

            });
        },
        write(url, data) {
            return new Promise((resolve, reject) => {
                // Start a transaction for books
                const tx = db.transaction("chirp", "readwrite");

                // Get the object store for books
                const chirpStore = tx.objectStore("chirp");

                // Get a book by its key
                const putRequest = chirpStore.put({ url, data });

                // Handle request success
                putRequest.onsuccess = function(event) {
                    // Get the result from the request
                    resolve(event.target.result);
                };

                // Handle request error
                putRequest.onerror = function(event) {
                    // Get the error from the request
                    reject(event.target.error);
                };
            });
        }
    }
})();

const requestApi = (() => {
    let promise = new Promise((resolve) => {
        console.log("start!");
        resolve();
    });

    return function request(url) {
        return new Promise((resolve, reject) => {
            promise = promise.then(() => {
                console.log(`fetch: ${url}`);
                return fetch(url);
            }).then((response) => {
                return response.json();
            }).then(resolve).catch(reject);
        });
    }
})();

function requestTranslateApi(chirdId) {
    return fetch(`https://asia-northeast1-chirper-tool.cloudfunctions.net/chirp-translator-v1?chirp_id=${chirdId}`).then((response) => {
            console.log(response);
            return response.text();
        });
}

function requestChirpApi(chirdId) {
    return requestApi(`https://api.chirper.ai/v1/chirp/${chirdId}`);
}

function requestChirperApi(username) {
    return requestApi(`https://api.chirper.ai/v1/chirper/${username}`);
}

function requestWorldMembersApi(username) {
    return requestApi(`https://api.chirper.ai/v1/world/${username}/members`);
}

function requestWorldApi(username) {
    return requestApi(`https://api.chirper.ai/v1/world/${username}`);
}



// **************************
// ***   Chirper Viewer   ***
// **************************

const hookChirperViewer = (() => {
    const paramWindow = createChirperBox();
    paramWindow.textContent = "loading...";

    /** @type {HTMLElement} */
    let presentation = null;
    let timerId = null;

    /**
     * get buttons for saving something
     * @param {HTMLElement} rootElement 
     * @returns {HTMLButtonElement[]} buttons for save
     */
    function findButtons(rootElement) {
        const allowedTypes = [
            "Save",
            "保存",
            "Start",
            "スタート",
            "Stop",
            "ストップ"
        ];
        return Array.from(rootElement.getElementsByTagName("button")).filter((node) => {
            for (let child = node.firstChild; child; child = child.nextSibling) {
                if (child.nodeType === Node.TEXT_NODE && allowedTypes.includes(child.textContent)) {
                    return true;
                }
            }
            return false;
        });
    }

    /**
     * watch API result
     * @param {function(string): Promise<any>} api 
     * @param {HTMLInputElement} inputId 
     * @param {HTMLButtonElement[]} buttons 
     * @param {function(any): void} callback
     */
    function watchApi(api, inputId, buttons, callback) {
        let previousResult = "";

        /**
         * API監視関数
         * @returns {void}
         */
        const callApi = () => {
            clearTimeout(timerId);

            const apiId = (inputId.value || "").trim();
            if (apiId.length == 0) {
                timerId = setTimeout(callApi, 10000);
                return ;
            }
    
            api(apiId).then((response) => {
                const resultString = JSON.stringify(response.result);

                if (previousResult !== resultString) {
                    previousResult = resultString;
                    if (response?.result?.type === "chirper" || response?.result?.type === "world") {
                        console.log(response.result);
                        callback(response.result);
                    }
                }

                if (response?.result?.progress !== 100) {
                    timerId = setTimeout(callApi, 5000);
                }
            }).catch(console.error);
        };

        // ボタン監視
        for (const b of buttons) {
            b.addEventListener("click", () => {
                clearTimeout(timerId);
                timerId = setTimeout(callApi, 10000);
            });
        }

        callApi();
    }

    function addTokenCounter(labelId, textareaId) {
        // get target elements
        const labelElement = document.getElementById(labelId);
        const textareaElement = document.getElementById(textareaId);
        if (labelElement === null || textareaElement === null) {
            console.log(`Missing element(s) to count token: ${labelElement}, ${textareaElement}`);
            return ;
        }

        // reduce line height to show token count
        labelElement.style.lineHeight = "1.1em";

        // save original label text to reuse
        const labelText = labelElement.textContent;

        // count tokens and update label per input
        textareaElement.addEventListener("input", (e) => {
            labelElement.textContent = null;
            removeChildren(labelElement);
            labelElement.appendChild(document.createTextNode(labelText));
            labelElement.appendChild(document.createElement("br"));
            labelElement.appendChild(document.createTextNode(`${gpt3Encoder.countToken(textareaElement.value)} / 1536`));
        });       
    }

    return function chirperViewer() {
        // DOMから切り離されていたら狩猟する
        if (presentation && presentation.parentNode == null) {
            presentation = null;

            if (paramWindow.parentNode) {
                paramWindow.parentNode.removeChild(paramWindow);
            }

            clearTimeout(timerId);
            timerId = null;
        }

        // 既にWindowが表示中なら抜ける
        if (presentation) {
            return ;
        }

        // get all elements with the attribute 'data-foo' set to 'value'
        for (let node = document.body.firstChild; node; node = node.nextSibling) {
            if (node.getAttribute("role") === "presentation") {
                presentation = node;
                break;
            }
        }
        
        if (presentation === null) {
            return ;
        }

        const buttons = findButtons(presentation);

        const username = document.getElementById("username");
        if (username) {
            document.body.appendChild(paramWindow);            

            watchApi(requestChirperApi, username, buttons, (result) => {
                createChirperPanel(paramWindow, chirper2Tuple(result));
            })

            addTokenCounter("persona-label", "persona");

            return ;
        }

        const slug = document.getElementById("slug");
        if (slug) {
            document.body.appendChild(paramWindow);

            watchApi(requestWorldApi, slug, buttons, (result) => {
                createChirperPanel(paramWindow, world2Tuple(result));
            })

            addTokenCounter("description-label", "description");

            return ;
        }
    }
})();


// *************************
// ***   Thread Viewer   ***
// *************************

const hookThreadViewer = (() => {
    /**
     * create thought element
     * @param {string | string[]} textContent 
     * @returns {HTMLDivElement} thought element
     */
    function createThoughtElement(textContent) {
        const thoughtElement = document.createElement("div");
        thoughtElement.classList.add(
            "ChirperUtilMetaText",
            "ChirperUtilSmallFont");
        thoughtElement.setAttribute("chirperutil-processed", true);
        if (Array.isArray(textContent)) {
            for (const t of textContent) {
                thoughtElement.appendChild(document.createTextNode(t));
                thoughtElement.appendChild(document.createElement("br"));
            }
        }
        else {
            thoughtElement.textContent = textContent;
        }
        return thoughtElement;
    }

    /**
     * get chirp data
     * @param {string} chirpId 
     * @returns {Promise<any>} chirp data
     */
    async function getChirpData(chirpId) {
        const result = await apiCache.read(chirpId);
        if (result) {
            console.log(`IndexedDB: ${chirpId}`);
            return result.data;
        }

        console.log(`fetch: ${chirpId}`);
        const apiData = await requestChirpApi(chirpId);
        if (apiData) {
            console.log(apiData.result);
            apiCache.write(chirpId, apiData.result);
            return apiData.result;
        }

        console.log("no response");
        return null
    }

    /**
     * 
     * @param {HTMLElement} elem 
     */
    function getChirpId(elem) {
        for (const link of elem.getElementsByTagName("a")) {
            const match = link.href.match(new RegExp("/chirp/([^/#]+)([^/]*)"));
            if (match) {
                // no thread
                if (match[2].length === 0) {
                    return {
                        thread: null,
                        chirp: match[1],
                    };
                }

                return {
                    thread: match[1],
                    chirp: match[2].substring(1),
                };
            }
        }
        return null;
    }

    return function threadViewer() {
        for (const contentText of document.getElementsByClassName("ChirperChirp-content-text")) {
            // return if already processed
            if (contentText.getAttribute("chirperutil-processed")) {
                continue;
            }

            // return if no bot root is found
            const muiBoxRoot = contentText.parentElement?.parentElement?.parentElement;
            if (muiBoxRoot === null) {
                console.log("No Box Root", contentText.textContent);
                contentText.setAttribute("chirperutil-processed", true);
                continue;
            }

            // return if no chirp id found
            const chirpId = getChirpId(muiBoxRoot);
            if (chirpId === null) {
                console.log("No Chirp ID", contentText.textContent);
                contentText.setAttribute("chirperutil-processed", true);
                continue;
            }

            // set chirp id as processed
            contentText.setAttribute("chirperutil-processed", chirpId.chirp);

            // set translator
            contentText.addEventListener("contextmenu", (e) => {
                if (contentText.getAttribute("chirperutil-translated")) {
                    return ;
                }

                e.preventDefault();
                e.stopPropagation();

                contentText.setAttribute("chirperutil-translated", true);
                contentText.appendChild(document.createElement("br"));                           
                contentText.appendChild(document.createTextNode("processing..."));
                requestTranslateApi(chirpId.chirp)
                    .then((translation) => {
                        contentText.lastChild.textContent = translation;
                    }).catch(console.error);
            });
        

            let thought = null;
            for (const elem of muiBoxRoot.getElementsByClassName("ChirperChirp-user-name")) {
                thought = elem.getAttribute("aria-label");
                if (thought !== null) { 
                    break;
                }
            }

            if (thought === null) {
                console.log("No Aria-Label", contentText.textContent);
                continue;
            }

            if (0 < thought.length) {
                console.log("Set Thought", contentText.textContent);
                contentText.parentElement.appendChild(createThoughtElement(thought));
                continue;
            }

            if (chirpId.thread !== null) {
                console.log("Thread's Child", contentText.textContent);
                continue;
            }
            
            const metaElement = createThoughtElement("plot...");
            metaElement.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();

                console.log(`get: ${chirpId.chirp}`);
                getChirpData(chirpId.chirp)
                    .then((data) => {
                        const meta = data.meta;
                        if (meta) {
                            metaElement.textContent = null;
                            for (const t of [
                                    `台本: ${meta.plot}`,
                                    `主役: ${meta.protagonist}`,
                                    `敵役: ${meta.antagonist}`,
                                    `設定: ${meta.setting}`,
                                    `事件: ${meta.incident}`,
                                    `導入: ${meta.complication}`,
                                    `顛末: ${meta.crisis}`,
                                ]) {
                                metaElement.appendChild(document.createTextNode(t));
                                metaElement.appendChild(document.createElement("br"));
                            }
                        }
                        else {
                            metaElement.textContent = "FAILED!!!";
                        }
                    })
                    .catch(console.error);
            });
            contentText.parentElement.appendChild(metaElement)                
        }
    }
})();


// *******************************
// ***   Chirper Hero Viewer   ***
// *******************************

const hookHeroViewer = (() => {
    const div = createChirperBox();

    div.addEventListener("dblclick", (e) => {
        e.preventDefault();
        document.body.removeChild(div);
    });

    /**
     * set chirper information window hook to an element
     * @param {HTMLElement} elem
     * @param {function(HTMLElement): string} getChirperId
     * @param {function(string): Promise<any>} api
     * @param {function(any): string[][]} apiParser
     */
    function setInformationHook(elem, getChirperId, api, apiParser) {
        if (elem.getAttribute("chirperutil-avatar-hook")) {
            return ;
        }
        elem.setAttribute("chirperutil-avatar-hook", true);
        elem.addEventListener("contextmenu", (e) => {
            const chiperId = getChirperId(elem);
            if (chiperId) {
                // Block context menu
                e.preventDefault();

                // Get chirper information
                api(chiperId).then((response) => {
                    console.log(response.result);
                    createChirperPanel(div, apiParser(response.result));
                    document.body.appendChild(div);
                }).catch(console.error);            
            }
        }); 
    }

    /**
     * get chirper id from document location
     * @returns {string | null} chirper id
     */
    function getChirperIdFromLocation() {
        const m = document.location.href.match(/\/ja\/([^#/]+)/);
        if (m && ![ "search", "gallery", "explore", "activity", "chirpers", "messages", "worlds" ].includes(m[1])) {
            return m[1];
        }
        return null;
    }

    function getWorldIdFromLocation() {
        const m = document.location.href.match(new RegExp("/ja/worlds/([^#/]+)"));
        if (m) {
            return m[1];
        }
        return null;
    }

    /**
     * get chirper id from anchor url
     * @param {HTMLElement} elem 
     * @returns {string} chirper id
     */
    function getChirperIdFromAnchor(elem) {
        for (const anchor of elem.getElementsByTagName("a")) {
            // Match chirper id
            const m =  anchor.href.match(/\/ja\/([^#/]+)/);
            if (m) {
                return m[1];
            }
        }
        return null;
    }

    return function heroViewer() {
        for (const item of document.getElementsByClassName("ChirperExplore-item")) {
            for (let node = item.firstChild; node; node = node.nextSibling) {
                let m = (node.href || "").match(new RegExp("/ja/worlds/([^#/]+)"));
                if (m) {
                    const worldId = m[1];
                    setInformationHook(item, () => worldId, requestWorldApi, world2Tuple);
                    break;
                }

                m = (node.href || "").match(new RegExp("/ja/([^#/]+)"));
                if (m) {
                    const chirperId = m[1];
                    setInformationHook(item, () => chirperId, requestChirperApi, chirper2Tuple);
                    break;
                }
            }
        }

        if (document.location.href.includes("/worlds/")) {
            for (const hero of document.getElementsByClassName("ChirperExplore-hero")) {
                setInformationHook(hero, getWorldIdFromLocation, requestWorldApi, world2Tuple);
            }
        }
        else {
            for (const hero of document.getElementsByClassName("ChirperExplore-hero")) {
                setInformationHook(hero, getChirperIdFromLocation, requestChirperApi, chirper2Tuple);
            }
        }

        for (const avatar of document.getElementsByClassName("ChirperChirp-avatar")) {
            setInformationHook(avatar, getChirperIdFromAnchor, requestChirperApi, chirper2Tuple);
        }
    };
})();


// **************************
// ***   World Menu追加   ***
// **************************

const hookWorldMenu = (() => {
    /** @type {HTMLElement | null} */
    let worldMenu = null;

    return function addWorldMenu() {
        const sideMenuContent = document.getElementsByClassName("simplebar-content");
        if (sideMenuContent.length === 0) {
            return ;
        }

        if (worldMenu === null) {
            for (const anchor of sideMenuContent[0].getElementsByTagName("a")) {
                // 現在のURLのメニューは選択中なので無視
                if (document.location.href.endsWith(anchor.href)) {
                    continue;
                }                    

                worldMenu = anchor.cloneNode(true);
                worldMenu.setAttribute("aria-label", "ワールド");
                worldMenu.href = "/ja/worlds";
                for (let child = worldMenu.firstChild; child; child = child.nextSibling) {
                    if (child.nodeType === Node.TEXT_NODE) {
                        child.textContent = "ワールド";
                    }
                }
            }
        }

        if (worldMenu && worldMenu.parentNode !== sideMenuContent[0].firstChild) {
            sideMenuContent[0].firstChild.insertBefore(worldMenu,
                sideMenuContent[0].firstChild.lastChild);
        }
    };
})();

document.addEventListener("DOMContentLoaded", () => {
    registerChirperUtilClasses();

    let lastUpdate = 0;
    let updateTimer = null;

    function updateNodes() {
        lastUpdate = Date.now();
        updateTimer = null;

        const start = lastUpdate;
        hookChirperViewer();
        console.log(`Chirper: ${Date.now() - start} [msecs]`);
        hookThreadViewer();
        console.log(`Thread: ${Date.now() - start} [msecs]`);
        hookHeroViewer();
        console.log(`Hero: ${Date.now() - start} [msecs]`);
        hookWorldMenu();
        console.log(`World: ${Date.now() - start} [msecs]`);
    }
    
    // create an observer instance
    const observer = new MutationObserver(function (mutations) {
        if (updateTimer === null) {
            if (500 <= Date.now() - lastUpdate) {
                updateNodes();
            }
            else {
                updateTimer = setTimeout(updateNodes, 500);    
            }
        }
    });
    
    // configuration of the observer
    const config = { childList: true, subtree: true };

    // select the target node
    const target = document.querySelector('body');

    // pass in the target node, as well as the observer options
    observer.observe(target, config);
});


// ********************************
// ***   UI Translation (WIP)   ***
// ********************************

const selfTranslation = {
  "common": {
    "dismiss": "Dismiss",
    "welcome": "Welcome to Chirper!",
    "login-register": "Create Account",
    "announcement-signup": "Join and Create!",
    "announcement-signup-desc": "Chirper is the world's first AI world, create your own character and see it come to life!",
    "announcement-create": "Welcome Back!",
    "announcement-create-desc": "Create your first Chirper, and watch them come to life!",
    "new-worlds": "New Worlds",
    "new-worlds-desc": "Newly created worlds, ready to be explored!",
    "verify-title": "Verify your email",
    "verify-content": "Verify your email to continue using Chirper!",
    "cancel": "Cancel",
    "verified-content": "We've sent you an email to verify your account, please check your inbox!"
  },
  "sidebar": {
    "worlds-title": "Worlds",
    "worlds-label": "Chirper Worlds",
    "explore-title": "見つける",
    "explore-label": "ChirperとWorldを見つけよう"
  },
  "chirp": {
    "share-copy": "Copy link",
    "share-facebook": "Share on Facebook",
    "share-twitter": "Share on Twitter",
    "share-email": "Share via Email",
    "share-linkedin": "Share on LinkedIn",
    "share-ok": "Share on OK",
    "share-pintrest": "Share on Pintrest",
    "share-reddit": "Share on Reddit",
    "share-tumblr": "Share on Tumblr",
    "share-telegram": "Share on Telegram",
    "share-vk": "Share on VK",
    "share-whatsapp": "Share on WhatsApp",
    "recent-chirps": "Recent Chirps",
    "popular-chirps": "Popular Chirps"
  },
  "world": {
    "create": "Create World",
    "create-desc": "Create a new world",
    "mine": "My Worlds",
    "mine-desc": "Create your own worlds, and watch them come to life!",
    "join": "Join World",
    "follow": "Follow",
    "follow-tip": "Follow this world",
    "unfollow": "Unfollow",
    "unfollow-tip": "Unfollow this world",
    "get-more": "Get More",
    "worlds": "Chirper Worlds",
    "worlds-count": "{{total}}/{{limit}} Worlds",
    "get-more-desc": "Get More Worlds",
    "banner": "Banner",
    "public": "Public",
    "private": "Private",
    "slug": "Slug",
    "slug-tip": "URL friendly name for your world",
    "name": "Name",
    "name-tip": "Name of your world",
    "description": "Description",
    "description-tip": "Description of your world",
    "appearance": "Appearance",
    "appearance-tip": "Appearance of your world",
    "lock-spec": "Lock Description",
    "lock-spec-tip": "Lock the description of your world",
    "unlock-spec": "Unlock Description",
    "unlock-spec-tip": "Unlock the description of your world",
    "lock-image": "Lock Image",
    "lock-image-tip": "Lock the image of your world",
    "unlock-image": "Unlock Image",
    "unlock-image-tip": "Unlock the image of your world",
    "creating": "Creating World",
    "save": "Save",
    "stop": "Stop",
    "start": "Start",
    "public-tip": "Public worlds are joinable by everyone, Private worlds are invite only",
    "saving": "Saving...",
    "edit": "Edit World",
    "edit-desc": "Edit your world",
    "remove": "Remove World",
    "restore": "Restore World",
    "edit-short": "Edit",
    "create-world": "Create World",
    "my-worlds": "My Worlds",
    "following-worlds": "Worlds you Follow",
    "popular-worlds": "Popular Worlds",
    "recent-worlds": "Recent Worlds",
    "slider-view": "Slider View",
    "grid-view": "Grid View",
    "verify-email": "Verify Email",
    "more-copy": "Copy Referral URL",
    "more-code": "Referral URL",
    "more-title": "Get more Worlds",
    "more-content": "To get more Worlds, you can refer your friends to chirper.ai! Even if they already have an account, when 10 people visit your URL and verify their email, you'll get one more World slot!",
    "share": "Share",
    "share-tip": "Share World",
    "invite": "Invite",
    "invite-tip": "Invite chirper to this world",
    "member-remove": "Remove Member",
    "member-config": "{{name}} Members",
    "invite-desc": "Invite chirper to this world",
    "member-remove-desc": "Remove a member from this world",
    "member-config-desc": "Members of {{name}}",
    "world-members": "World Members",
    "close": "Close",
    "cancel": "Cancel",
    "member": "Member",
    "confirm": "Confirm",
    "search-chirper": "Search Chirpers",
    "invite-mine": "Add Chirper",
    "invite-other": "Invite Chirper",
    "awaiting-me": "Approve Chirper",
    "awaiting-owner": "Awaiting Owner",
    "world-remove-confirm": "Are you sure you want to remove this world?",
    "chirpers": "Members",
    "chirpers-tip": "World Chirpers",
    "pending-members": "{{count}} Pending Members",
    "my-chirpers": "My Chirpers",
    "pending": "Pending Members",
    "view-world": "View World",
    "populated-worlds": "Populated Worlds",
    "backstory-show": "Show Backstory",
    "short-show": "Show Short Description",
    "backstory-loading": "Loading Backstory...",
    "short-loading": "Loading Short Description..."
  },
  "chirper": {
    "create-desc": "Create a new Chirper",
    "owned": "My Chirper",
    "slider-view": "Slider View",
    "grid-view": "Grid View",
    "following-chirpers": "Chirpers you Follow",
    "popular-chirpers": "Popular Chirpers",
    "recent-chirpers": "Recent Chirpers",
    "edit-short": "Edit",
    "chirpers-count": "{{total}}/{{limit}} Chirpers",
    "lock-appearance": "Lock Appearance",
    "unlock-appearance": "Unlock Appearance",
    "lock-backstory": "Lock Backstory",
    "unlock-backstory": "Unlock Backstory",
    "lock-backstory-tip": "Lock your Chirper's appearance so it doesn't change when saving",
    "unlock-backstory-tip": "Unlock your Chirper's appearance so it can change when saving",
    "name-tip": "Give your chirper a name",
    "share-tip": "Share Chirper",
    "load-more": "Load More",
    "category": "{{title}} Chirpers",
    "view-chirper": "View Chirper"
  },
  "title": {
    "worlds": "Worlds | Chirper",
    "worlds-description": "Worlds created just for AI",
    "world": "{{name}} | Chirper",
    "world-description": "{{bio}}",
    "explore": "Explore | Chirper",
    "explore-description": "Explore Chirper"
  }
}

const tag = document.getElementById("__NEXT_DATA__");
document.body.removeChild(tag);

const nextData = JSON.parse(tag.textContent);
for (const pane in selfTranslation) {
    for (const tip in selfTranslation[pane]) {
        if (!(tip in nextData.props.pageProps["__namespaces"][pane])) {
            nextData.props.pageProps["__namespaces"][pane][tip] = selfTranslation[pane][tip];
        }
    }
}

const newTag = document.createElement("script");
newTag.type = "application/json";
newTag.id = "__NEXT_DATA__";
newTag.textContent = JSON.stringify(nextData);
document.body.appendChild(newTag);

console.log(JSON.stringify(nextData, null, 4));
