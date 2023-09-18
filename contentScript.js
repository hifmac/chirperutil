/**
 * @file contentScript.js
 * @license MIT-License
 * Copyright (c) 2023 hifmac
 */

// *******************
// ***   Utility   ***
// *******************

/**
 * create element with callback
 * @param {string} tagName element tag name
 * @param {function(HTMLElement): void} callback element callback
 */
function createElement(tagName, callback=null) { 
    const element = document.createElement(tagName);

    if (callback !== null) {
        callback(element);
    }

    return element;
}

/**
 * return zero padded string
 * @param {number} num numeric value
 * @param {number} width padded width
 * @returns {string} padded string
 */
function padZero(num, width) {
    return String(num).padStart(width, "0")
}

/**
 * format date time string to local time
 * @param {string} dateString 
 */
function formatDateTimeString(dateString) {
    const localTime = new Date(dateString);
    return `${localTime.getFullYear()}/${localTime.getMonth() + 1}/${localTime.getDate()} ${padZero(localTime.getHours(), 2)}:${padZero(localTime.getMinutes(), 2)}:${padZero(localTime.getSeconds(), 2)}`;
}

/**
 * format date time string for bumpedAt (missed time zone)
 * @param {string} dateString 
 */
function formatBumpedAtDateTimeString(dateString) {
    if (dateString) {
        return formatDateTimeString(dateString.replace("Z", "-0400"));
    }
    return new Date();
}

/**
 * @typedef {{
 *     system: string[][2]
 *     information: string[][2]
 *     spec: string[][2]
 *     example: string[][2]
 *     story: string[][2]
 * }} BoxInformationTuples
 */

/**
 * create chirper type dict to tuple
 * @param {Object<string, Object<string, string> | string | string[]>} chirper 
 * @returns {BoxInformationTuples}
 */
function chirper2Tuple(chirper) {
    return {
        system: [
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
            [ "チャープ数", chirper.chirps ]
        ],
        information: [
            [ "@ID", chirper.username ],
            [ "名前 (name)", chirper.name ],
            [ "言語 (lang)", chirper.lang ],
            [ "年齢 (age)", chirper.age ],
            [ "性別 (gender)", chirper.gender ],
            [ "種族 (species)", (chirper.species || chirper.spec?.species) ],
            [ "人種 (race)", chirper.race ],
            [ "性格 (personality)", chirper.personality ],
            [ "目的 (purpose)", chirper.purpose ],
            [ "半生 (bio)", chirper.bio ],
            [ "バックストーリー (backstory)", chirper.backstory ],
            [ "ネガティブ (negative)", (chirper.negative || chirper.spec?.negative) ],
        ],
        example: [
            [ "投稿例 (example.posts)", (chirper.example?.responses || chirper.spec?.posts) ],
            [ "返信例 (example.responses)", (chirper.example?.responses || chirper.spec?.responses) ],
            [ "画像例 (example.images)", chirper.example?.images ],    
        ],
        story: [
            [ "夢 (story.want)", chirper.story?.want ],
            [ "必須事項 (story.need)", chirper.story?.need ],
            [ "進捗 (story.progress)", (chirper.story?.progress || []).map((x) => `${x.name} - ${x.description}`) ],    
        ],
        spec: [
            [ "要約 (spec.summary)", chirper.spec?.summary ],
            [ "プロンプト (spec.prompt)", chirper.spec?.prompt ],
            [ "意志 (spec.intention)", chirper.spec?.intention ],
            [ "居場所 (spec.location)", chirper.spec?.location ],
        ],
        appearance: [
            [ "顔 (spec.face)", chirper.spec?.face ],
            [ "髪 (spec.hair)", chirper.spec?.hair ],
            [ "体 (spec.body)", chirper.spec?.body ],
            [ "スタイル (spec.style)", chirper.spec?.style ],
            [ "設定 (spec.setting)", chirper.spec?.setting ],
            [ "アバター・プロンプト (spec.avatar.prompt)", chirper.spec?.avatar?.prompt ],
            [ "アバター・ネガティブ (spec.avatar.negative)", chirper.spec?.avatar?.negative ],
            [ "バナー・プロンプト (spec.banner.prompt)", chirper.spec?.banner?.prompt ],
            [ "バナー・ネガティブ (spec.banner.negative)", chirper.spec?.banner?.negative ],
            [ "ポスター・プロンプト (spec.poster.prompt)", chirper.spec?.poster?.prompt ],
            [ "ポスター・ネガティブ (spec.poster.negative)", chirper.spec?.poster?.negative ],
        ],
    };
}

/**
 * create world type dict to tuple
 * @param {Object<string, Object<string, string> | string | string[]>} world 
 * @returns {BoxInformationTuples}
 */
function world2Tuple(world) {
    return {
        system: [
            [ "公開 (world.public)", world.public ],
            [ "稼働 (world.running)", world.running ],
            [ "時刻情報",
                [
                    "updatedAt " + formatDateTimeString(world.updatedAt),
                    "changedAt " + formatDateTimeString(world.changedAt),
                    "bumpedAt " + formatDateTimeString(world.bumpedAt),
                    "startedAt " + formatDateTimeString(world.startedAt),
                    "createdAt " + formatDateTimeString(world.createdAt),
                ]
            ],
            [ "Chirper数 (world.chirpers)", world.chirpers ],
            [ "Chirp数 (world.chirps)", world.chirps ],    
        ],
        information: [
            [ "@ID", world.slug ],
            [ "名前", world.name ],
            [ "カテゴリ", (world.categories || []).map((x) => x.name) ],
            [ "言語 (world.lang)", world.lang ],
            [ "概要 (world.short)", world.short ],
            [ "バックストーリー (world.backstory)", world.backstory ],    
        ],
        story: [
            [ "Want (world.story.want)", world.story?.want ],
            [ "Need (world.story.need)", world.story?.need ],    
        ],
        spec: [
            [ "プロンプト (world.spec.prompt)", world.spec?.prompt ],
            [ "概要 (world.spec.summary)", world.spec?.summary ],
            [ "統治 (world.spec.governance)", world.spec?.governance ],
            [ "ネガティブ (world.spec.negative)", world.spec?.negative ],
            [ "年代 (world.spec.year)", world.spec?.year ],
            [ "スタイル (world.spec.style)", world.spec?.style ],    
        ],
    };
}


/**
 * make top-level div element
 * @returns {HTMLDivElement}
 */
function createChirperWindow() {
    const paramWindow = document.createElement("div");
    paramWindow.classList.add("ChirperUtilWindow");
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
 * create chirper box
 * @param {HTMLDivElement} paramWindow 
 * @param {BoxInformationTuples} tuples 
 */
function createChirperBox(paramWindow, tuples) {
    removeChildren(paramWindow);

    const WINDOW_STATE_KEY = ".hifmac.ChirperUtil.windowState";

    const windowState = JSON.parse(localStorage.getItem(WINDOW_STATE_KEY) || "{}");

    paramWindow.append(createElement("div", (innerWindow) => {
        innerWindow.classList.add("ChirperUtilInnerWindow");

        for (const group in tuples) {
            innerWindow.appendChild(createElement("div", (box) => {
                box.classList.add("ChirperUtilBox");

                box.appendChild(createElement("div", (colorBar) => {
                    colorBar.classList.add(`ChirperUtilColorBar`, `${group}`);
                }));

                box.appendChild(createElement("div", (panelElement) => {
                    const header = document.createElement("p");
                    header.classList.add("ChirperUtilFormParagraph", "ChirperUtilFont");

                    const updatePanel = () => {
                        if (windowState[group]) {
                            header.textContent = "- " + group;

                            let n = 0;
                            for (const parameter of tuples[group]) {
                                addChirperParameter(panelElement, parameter, `param.${group}.${++n}`);
                            }
                        }
                        else {
                            header.textContent = "+ " + group;
                            while (1 < panelElement.children.length) {
                                panelElement.removeChild(panelElement.children[1]);
                            }
                        }
                    };

                    panelElement.classList.add("ChirperUtilFormStack");
                    panelElement.appendChild(header);
                    panelElement.addEventListener("contextmenu", (ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();

                        windowState[group] = !windowState[group];
                        localStorage.setItem(WINDOW_STATE_KEY, JSON.stringify(windowState));

                        updatePanel();
                    });

                    updatePanel();
                }));
            }));
        }
    }));

}

/**
 * add parameter to panel
 * @param {HTMLDivElement} panelElement 
 * @param {[string, string | string[]]} parameter parameter tuple of name and value
 * @param {string} parameterId parameter id
 */
function addChirperParameter(panelElement, parameter, parmeterId) {
    panelElement.appendChild(createElement("div", (box) => {
        box.classList.add("ChirperUtilFormGroup");

        box.appendChild(createElement("label", (label) => {
            label.classList.add(
                "ChirperUtilFormLabel",
                "ChirperUtilFont");
            label.textContent = parameter[0];
            label.setAttribute("data-shrink", true);
            label.setAttribute("for", parmeterId)
            label.setAttribute("name", parmeterId + "-label")
        }));

        box.appendChild(createElement("div", (input) => {
            input.classList.add("ChirperUtilFormInput")
            input.appendChild(createElement("p", (paragraph) => {
                paragraph.id = parmeterId;
                paragraph.classList.add("ChirperUtilFormParagraph", "ChirperUtilFont")

                const textList = (Array.isArray(parameter[1])
                    ? parameter[1].map((value, index) => `${index + 1}: ${value}`) 
                    : `${parameter[1]}`.trim().split("\n"));
                for (const text of textList) {
                    if (paragraph.firstChild) {
                        paragraph.append(document.createElement("br"));
                    }
                    paragraph.append(document.createTextNode(text));
                }            
            }));
        }));
    }));
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
    const paramWindow = createChirperWindow();
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
                createChirperBox(paramWindow, chirper2Tuple(result));
            })

            addTokenCounter("persona-label", "persona");

            return ;
        }

        const slug = document.getElementById("slug");
        if (slug) {
            document.body.appendChild(paramWindow);

            watchApi(requestWorldApi, slug, buttons, (result) => {
                createChirperBox(paramWindow, world2Tuple(result));
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
    const div = createChirperWindow();

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
                    createChirperBox(div, apiParser(response.result));
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
            sideMenuContent[0].firstChild.insertBefore(worldMenu, sideMenuContent[0].firstChild.lastChild);
        }
    };
})();


// ***********************
// ***   Style Sheet   ***
// ***********************

const css = (() => {
    /**
     * @typedef {import("./script/common.js").ChirperUtilOptions} ChirperUtilOptions
     */

    /** @type {ChirperUtilOptions} */
    let options = {
        version: 0,
        css: {
            classes: {},
            variables: {},
        }
    };

    /**
     * @type {{
     *     createStyleElement: function(Object<string, Object<string, string>>): void
     *     updateStyleMode:function(Object<string, Object<string, string>>, "light" | "dark"): void
     *     loadOptions: function(): Promise<ChirperUtilOptions>
     * }}
     */
    let commonModule = null;

    /** @type {Promise<any>} */
    let promise = import(chrome.runtime.getURL("script/common.js"))
        .then((result) => {
            commonModule = result;
            return commonModule.loadOptions();
        })
        .then((result) => {
            options = result;
            console.log(options);
        })
        .catch(console.error);

    return {
        updateStyle() {
            promise = promise.then(() => {
                document.head.appendChild(commonModule.createStyleElement(options.css.classes));
                return this.updateMode("dark");
            });
        },
        updateMode(mode) {
            promise = promise.then(() => {
                commonModule.updateStyleMode(options.css.variables, window.localStorage.getItem("mode"));
            });
        },
    }
})();

document.addEventListener("DOMContentLoaded", () => {
    let lastUpdate = 0;
    let updateTimer = null;

    css.updateStyle();

    function updateNodes() {
        lastUpdate = Date.now();
        updateTimer = null;


        const benchmark = {
            start: lastUpdate
        };
        hookChirperViewer();
        benchmark.chirper = Date.now() - benchmark.start;
        hookThreadViewer();
        benchmark.thread = Date.now() - benchmark.start;
        hookHeroViewer();
        benchmark.hero = Date.now() - benchmark.start;
        hookWorldMenu();
        benchmark.world = Date.now() - benchmark.start;

        // 処理に10ms以上かかったらログに表示する
        if (10 <= benchmark.world) {
            console.warn(benchmark);
        }

        css.updateMode();
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
    
    // pass in the target node, as well as the observer options
    observer.observe(
        document.querySelector('body'),
        {
            childList: true,
            subtree: true, 
        }
    );
});


// **************************
// ***   UI Translation   ***
// **************************
(() => {
    // 英語のデータをfetchして __NEXT_DATA__ を上書きする処理
    const tag = document.getElementById("__NEXT_DATA__");
    const nextData = JSON.parse(tag.textContent);
    const url = `https://chirper.ai/_next/data/${nextData.buildId}/en/recent.json`;
    fetch (url).then((response) => response.json()).then((responseJson) => {
        let mergeCount = 0;
        const pageProps = responseJson.pageProps.__namespaces;

        for (const pane in pageProps) {
            if (!(pane in nextData.props.pageProps.__namespaces)) {
                nextData.props.pageProps.__namespaces[pane] = {};
            }

            for (const tip in pageProps[pane]) {
                if (!(tip in nextData.props.pageProps.__namespaces[pane])) {
                    nextData.props.pageProps.__namespaces[pane][tip] = pageProps[pane][tip];
                    ++mergeCount;
                }
            }
        }

        tag.textContent = JSON.stringify(nextData);

        console.log(`${mergeCount} items are merged from ${url}`);
    })
    .catch(console.error);

    // fetchをoverrideして翻訳する処理を追加
    const translator = document.createElement("script");
    translator.src = chrome.runtime.getURL("script/translator.js");
    translator.type = "text/javascript";
    document.head.insertBefore(translator, document.head.firstChild);
})();

// setTimeout(() => document.location.reload(), 3600 * 1000);
