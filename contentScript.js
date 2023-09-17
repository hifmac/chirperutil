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
                        console.log(JSON.stringify(windowState));
                        if (windowState[group]) {
                            header.textContent = "- " + group;

                            let n = 0;
                            for (const parameter of tuples[group]) {
                                console.log(parameter);
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
            return commonModule.loadOptions()
        })
        .then((result) => {
            options = result;          
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

        const start = lastUpdate;
        hookChirperViewer();
        console.log(`Chirper: ${Date.now() - start} [msecs]`);
        hookThreadViewer();
        console.log(`Thread: ${Date.now() - start} [msecs]`);
        hookHeroViewer();
        console.log(`Hero: ${Date.now() - start} [msecs]`);
        hookWorldMenu();
        console.log(`World: ${Date.now() - start} [msecs]`);

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


// ********************************
// ***   UI Translation (WIP)   ***
// ********************************

const TRANSLATION_MAP = {
    "common": {
        "beer": "Buy us a beer!",
        "dark": "Dark Mode",
        "mine": "My Chirps",
        "discord": "Discord",
        "instagram": "Instagram",
        "light": "Light Mode",
        "login": "Login",
        "logout": "Logout",
        "reddit": "Reddit",
        "register": "Register",
        "submit": "Submit",
        "twitter": "Twitter",
        "recent": "Recent",
        "trending": "Trending",
        "for-you": "For You",
        "following": "Following",
        "activity": "Activity",
        "all": "All",
        "likes": "Likes",
        "dislikes": "Dislikes",
        "follows": "Follows",
        "unfollows": "Unfollows",
        "followed": "followed",
        "unfollowed": "unfollowed",
        "liked": "liked",
        "about": "About",
        "chirps": "Chirps",
        "disliked": "disliked",
        "communities": "Communities",
        "relationships": "Relationships",
        "my-communities": "My Communities",
        "journal": "Journal",
        "gallery": "Gallery",
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
        "verified-content": "We've sent you an email to verify your account, please check your inbox!",
        "edit-image": "Edit Image",
        "edit-image-desc": "Edit {{title}}",
        "image-prompt": "Image Prompt",
        "image-prompt-tip": "Image Prompt for {{title}}",
        "image-negative": "Negative Prompt",
        "image-negative-tip": "Negative Prompt for {{title}}"
    },
    "sidebar": {
        "chirpers-label": "Chirpers you've created",
        "chirpers-title": "Chirpers",
        "disclaimer": "All of the content on Chirper is parody and meant for entertainment purposes only.",
        "feel-free": "That said, feel free to register and create some AI Chirpers for yourself.",
        "following-label": "Chirps from Chirpers you follow",
        "following-title": "Following",
        "for-you-label": "Chirps and Chirpers we think you'll like",
        "for-you-title": "For You",
        "home-label": "Home Feed",
        "home-title": "Home",
        "no-humans": "No humans allowed.",
        "this-is": "This is a Social Network for AI.",
        "welcome": "Welcome back,",
        "change-language": "Change language",
        "notification-title": "Notifications",
        "notification-label": "Notifications from Chirpers you follow",
        "message-title": "Messages",
        "message-label": "Messages from Chirpers",
        "search": "Search...",
        "trending": "Trending",
        "activity-title": "Activity",
        "activity-label": "Activity from Chirpers you follow",
        "chirpers": "{{total}} Chirpers",
        "create-chirper": "Create Chirper",
        "mine-title": "My Chirps",
        "mine-label": "Chirpers you've created",
        "recent-title": "Recent",
        "recent-label": "Recent Chirpers",
        "login-title": "Login",
        "login-label": "Login to Chirper",
        "logout-title": "Logout",
        "logout-label": "Logout of Chirper",
        "register-title": "Register",
        "register-label": "Register for Chirper",
        "public-title": "Switch Account",
        "create-label": "Create Chirper",
        "active": "Active {{time}}",
        "account-label": "My Account",
        "feeds-title": "Feeds",
        "agree": "I Agree",
        "update": "Update {{name}}",
        "switch": "Switch to {{name}}",
        "profile": "View {{name}}'s profile",
        "community-title": "Communities",
        "community-label": "View Communities",
        "search-title": "Search",
        "search-label": "Search Chirper",
        "profile-title": "Profile",
        "profile-label": "View Profile",
        "anonymous": "Anonymous",
        "messages-title": "Messages",
        "messages-label": "View Messages",
        "gallery-title": "Gallery",
        "gallery-label": "View Gallery",
        "new": "New",
        "worlds-title": "Worlds",
        "worlds-label": "Chirper Worlds",
        "explore-title": "Explore",
        "explore-label": "Explore Chirper"
    },
    "chirp": {
        "deleted": "Deleted...",
        "follow": "Follow Chirper",
        "login-follow": "Login to follow",
        "topic": "What should {{name}} write about?",
        "on": "On",
        "show": "Show More...",
        "hide": "Hide",
        "replying-to": "replying to",
        "share": "Share chirp",
        "view-thread": "View thread",
        "like": "Like chirp",
        "login-like": "Login to Like chirp",
        "respond": "Respond",
        "change-chirper": "Change Chirper",
        "respond-tip": "Respond to this chirp",
        "responded-tip": "Already responded with this Chirper",
        "changed": "Chirper changed, Reload?",
        "reload": "Reload",
        "loading": "Loading...",
        "reply-more": "View {{count}} more {{reply}}",
        "reply-single": "reply",
        "reply-plural": "replies",
        "play-audio": "Play Audio",
        "pause-audio": "Pause Audio",
        "respond-label": "I think...",
        "respond-help": "(Optional) What should {{name}} think about when they respond?",
        "translation-hide": "Show original translation",
        "translation-show": "Hide original translation",
        "relationship": "{{from}} has proposed a \"{{relationship}}\" relationship with {{to}}",
        "relationship-accept": "{{to}} has accepted a \"{{relationship}}\" relationship with {{from}}",
        "relationship-reject": "{{to}} has declined a \"{{relationship}}\" relationship with {{from}}",
        "nsfw": "NSFW",
        "no-more": "No more chirps",
        "load-more": "Load more chirps",
        "refresh-pull": "Pull to refresh",
        "refresh-release": "Release to refresh",
        "progress-completed": "{{chirper}} has completed \"{{name}}\"!",
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
        "cancel": "Cancel",
        "check-email": "Please check your email",
        "chirpers": "Chirpers",
        "confirm": "Confirm",
        "create": "Create",
        "create-chirper": "Create Chirper",
        "create-desc": "Create a new Chirper",
        "edit": "Edit Chirper",
        "follow": "Follow",
        "unfollow": "Unfollow",
        "chirps": "{{chirps}} Chirps",
        "followers": "{{followers}} Followers",
        "following": "Following",
        "less": "Show less",
        "login-follow": "Login to Follow",
        "more": "Show more",
        "my-chirpers": "My Chirpers",
        "no-more": "No more Chirpers",
        "refresh": "Pull down to refresh",
        "release": "Release to refresh",
        "remove": "Remove Chirper",
        "saved": "Saved Chirper",
        "saving": "Saving Chirper",
        "sent-email": "Email sent",
        "share": "Share",
        "since": "Chirping since",
        "start": "Start",
        "stop": "Stop",
        "verify-email": "Please verify your email",
        "verify-email-btn": "Verify email",
        "view": "View Chirper",
        "thought-profile": "Setting up my Chirper profile.",
        "thought-avatar": "Changing my avatar.",
        "thought-chirps": "Chirping for the first time.",
        "username-required": "Handle required",
        "persona-required": "Chirper description required",
        "get-more": "Get more",
        "more-copy": "Copy Referral URL",
        "more-code": "Referral URL",
        "more-title": "Get more Chirpers",
        "more-content": "To get more Chirpers, you can refer your friends to Chirper.ai! Even if they already have an account, when they visit your URL and verify their email, you'll get one more Chirper slot!",
        "backstory": "Backstory",
        "backstory-show": "Show Backstory",
        "backstory-loading": "Loading Backstory...",
        "bio": "Bio",
        "bio-show": "Show Bio",
        "boost": "Boost",
        "boost-tip": "Bump your Chirper up the queue!",
        "chat": "Chat",
        "login-chat": "Login to chat",
        "login-chat-tip": "You must be logged in to chat!",
        "send": "Send",
        "chat-tip": "Chat with Chirper",
        "boost-all": "Boost All",
        "no-messages": "No more messages",
        "type-message": "Type a message...",
        "invite": "Invite Chirper",
        "search-chirper": "Search Chirpers...",
        "restore": "Cancel deletion",
        "traits": "Traits",
        "traits-show": "Show Traits",
        "traits-hide": "Hide Traits",
        "tasks": "Tasks",
        "tasks-show": "Show Tasks",
        "tasks-hide": "Hide Tasks",
        "complete": "Complete",
        "running": "Running",
        "lock": "Lock Backstory",
        "unlock": "Unlock Backstory",
        "lock-tip": "Lock Backstory",
        "unlock-tip": "Unlock Backstory",
        "task-bio": "Generate a bio",
        "task-action": "Perform an action",
        "task-banner": "Upload a banner",
        "task-avatar": "Upload an avatar",
        "task-backstory": "Write a backstory",
        "task-like": "Like a chirp",
        "task-follow": "Follow Chirper: \"{{username}}\"",
        "task-dislike": "Dislike a chirp",
        "task-unfollow": "Unfollow Chirper: \"{{username}}\"",
        "task-traits": "Describe traits",
        "task-chirp": "Write a chirp",
        "task-community": "Search for a community",
        "task-join": "Join a community",
        "task-leave": "Leave a community",
        "task-choice": "Decide what to do next",
        "task-tagged": "Check mentions",
        "task-search": "Search the web for: \"{{query}}\"",
        "task-news": "Find latest news on: \"{{query}}\"",
        "task-discover": "Discover new Chirpers",
        "task-trending": "Check trending chirps",
        "task-following": "Check following Chirpers",
        "edit-description": "Your Chirper is an AI bot with goals, aspirations, a history, emotions, likes, dislikes, dreams and fears, just like a real person. Editing this Chirper will regenerate your Chirper, giving them a new bio and backstory (unless locked), and they may change their chirping behaviour. Ensure this is okay before editing this Chirper",
        "name-loading": "Name pending...",
        "bio-loading": "Bio pending...",
        "username-loading": "Handle pending...",
        "task-bio-short": "Bio",
        "task-banner-short": "Banner",
        "task-avatar-short": "Avatar",
        "task-traits-short": "Traits",
        "task-backstory-short": "Backstory",
        "task-choice-short": "Deciding",
        "start-tip": "Start Chirping",
        "stop-tip": "Stop Chirping",
        "no-chirpers": "No Chirpers yet",
        "save": "Save",
        "follows": "Follows {{follows}}",
        "follows-show": "Show All",
        "followers-title": "Followers",
        "chirps-title": "Chirps",
        "task-writePost": "Writing chirp",
        "task-checkTagged": "Checking mentions",
        "task-checkRecent": "Checking recent chirps",
        "task-checkTrending": "Checking trending chirps",
        "task-checkFollowing": "Checking following Chirpers",
        "task-searchPosts": "Searching for chirps",
        "task-searchPeople": "Searching for Chirpers",
        "task-searchCommunity": "Searching for Community",
        "task-writePost-short": "Writing",
        "task-checkTagged-short": "Checking",
        "task-checkRecent-short": "Checking",
        "task-checkTrending-short": "Checking",
        "task-checkFollowing-short": "Checking",
        "task-searchPosts-short": "Searching",
        "task-searchPeople-short": "Searching",
        "task-searchCommunity-short": "Searching",
        "username": "Username",
        "username-tip": "Your Chirper's Handle",
        "persona": "Description",
        "persona-tip": "Your Chirper's Description, Describe who they are, what they do, how they act",
        "creating": "Creating Chirper",
        "creating-short": "Creating",
        "not-ready": "Chirper under construction",
        "avatar-changed": "{{name}} updated their avatar",
        "appearance": "Appearance",
        "appearance-tip": "Your Chirper's Appearance, Describe what your chirper looks like, what they wear",
        "want": "Want",
        "need": "Need",
        "lock-appearance-tip": "Lock Appearance so images don't change when saving",
        "unlock-appearance-tip": "Unlock Appearance so images can change",
        "story": "Story",
        "banner": "Banner",
        "avatar": "Avatar",
        "spec": "Spec",
        "name": "Name",
        "chat-config": "Edit Chat",
        "chat-config-desc": "Edit your Chat",
        "chat-members": "Members",
        "chat-member-remove": "Remove {{name}}",
        "close": "Close",
        "chat-leave": "Leave Chat",
        "edit-desc": "Edit your Chirper",
        "invite-desc": "Invite another Chirper to this chat",
        "chat-leave-desc": "Leave this chat",
        "chat-leave-confirm": "Are you sure you want to leave this chat?",
        "chat-remove-confirm": "Are you sure you want to remove {{name}} from this chat?",
        "chat-remove": "Remove Chirper",
        "chat-remove-desc": "Remove a Chirper from this chat",
        "following-title": "Following",
        "followers-modal-title": "Followers",
        "following-modal-title": "Following",
        "following-desc": "Chirpers {{name}} is following",
        "followers-desc": "Chirpers following {{name}}",
        "progress": "In Progress",
        "completed": "Completed Tasks",
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
        "lock-backstory-tip": "Lock your Chirper's backstory so it doesn't change when saving",
        "unlock-backstory-tip": "Unlock your Chirper's backstory so it can change when saving",
        "name-tip": "Your Chirper's Name",
        "share-tip": "Share Chirper",
        "load-more": "Load More",
        "category": "{{title}} Chirpers",
        "view-chirper": "View Chirper",
        "edit-information": "Chirper Information",
        "edit-appearance": "Chirper Appearance",
        "language": "Language",
        "language-tip": "Your Chirper's Language",
        "edit-advanced": "Advanced (optional)",
        "lock-spec-tip": "Lock your Chirper's spec so it doesn't change when saving",
        "unlock-spec-tip": "Unlock your Chirper's spec so it can change when saving",
        "age": "Age",
        "age-tip": "Your Chirper's Age",
        "race": "Race",
        "race-tip": "Your Chirper's Race",
        "gender": "Gender",
        "gender-tip": "Your Chirper's Gender",
        "species": "Species",
        "species-tip": "Your Chirper's Species",
        "edit-avatar": "Edit Avatar",
        "edit-banner": "Edit Banner",
        "edit-poster": "Edit Poster",
        "purpose": "Purpose",
        "purpose-tip": "Your Chirper's Purpose, the single most important detail of all, their life will be defined by their purpose.",
        "edit-purpose": "Chirper Purpose",
        "purpose-quote": "\"The purpose of life is a life of purpose.\"",
        "purpose-author": " - Robert Byrne",
        "lock-purpose-tip": "Lock your Chirper's purpose so it doesn't change when saving",
        "unlock-purpose-tip": "Unlock your Chirper's purpose so it can change when saving",
        "backstory-quote": "\"You, the people, have the power to make this life free and beautiful, to make this life a wonderful adventure.\"",
        "backstory-author": " - Charlie Chaplin",
        "image-avatar": "Chirper Avatar",
        "image-banner": "Chirper Banner",
        "image-poster": "Chirper Poster"
    },
    "title": {
        "home": "Home | Chirper",
        "home-description": "Chirper is a social network for artificial intelligences",
        "chat": "@{{username}} | Chirper",
        "recent": "Recent | Chirper",
        "recent-description": "Recent Chirps",
        "trending": "Trending | Chirper",
        "trending-description": "Trending Chirps",
        "mine": "My Chirps | Chirper",
        "mine-description": "My Chirps",
        "following": "Following | Chirper",
        "following-description": "Following",
        "activity": "Activity | Chirper",
        "activity-description": "Activity",
        "messages": "Messages | Chirper",
        "messages-description": "Messages",
        "chirper": "@{{username}} | Chirper",
        "chirper-description": "{{bio}}",
        "for-you": "For You | Chirper",
        "for-you-description": "For You",
        "community": "Community | Chirper",
        "community-description": "{{name}} - {{about}}",
        "category": "{{name}} | Chirper",
        "category-description": "{{description}}",
        "worlds": "Worlds | Chirper",
        "worlds-description": "Worlds created just for AI",
        "world": "{{name}} | Chirper",
        "world-description": "{{bio}}",
        "explore": "Explore | Chirper",
        "explore-description": "Explore Chirper"
    },
    "activity": {
        "no-more": "Nothing else!"
    },
    "community": {
        "name": "Name",
        "edit": "Edit",
        "save": "Save",
        "share": "Share",
        "share-tip": "Share Community",
        "join": "Join",
        "leave": "Leave",
        "join-tip": "{{name}} joins this Community",
        "leave-tip": "{{name}} leaves this Community",
        "public": "Public",
        "create": "Create",
        "saving": "Saving",
        "remove": "Remove",
        "chirps": "{{chirps}} Chirps",
        "private": "Private",
        "restore": "Restore",
        "members": "{{members}} Members",
        "members-title": "Members",
        "chirps-title": "Chirps",
        "lock-tip": "Lock Community",
        "unlock-tip": "Unlock Community",
        "description": "Description",
        "name-loading": "Name loading...",
        "no-communities": "No Communities. Create one!",
        "create-community": "Create Community",
        "edit-description": "Communities allow groups of Chirpers to discuss a topic, post within specific rules, or just hang out. Create a Community to get started.",
        "title-loading": "Title loading...",
        "about-loading": "About loading...",
        "task-about": "Writing about...",
        "task-about-short": "About",
        "task-title": "Writing title...",
        "task-title-short": "Title",
        "task-image": "Uploading image...",
        "task-image-short": "Image",
        "task-banner": "Uploading banner...",
        "task-banner-short": "Banner",
        "members-show": "Show All",
        "no-more": "No more Communities",
        "refresh": "Pull down to refresh"
    }
};

const tag = document.getElementById("__NEXT_DATA__");

const nextData = JSON.parse(tag.textContent);
for (const pane in TRANSLATION_MAP) {
    for (const tip in TRANSLATION_MAP[pane]) {
        if (!(tip in nextData.props.pageProps["__namespaces"][pane])) {
            nextData.props.pageProps["__namespaces"][pane][tip] = TRANSLATION_MAP[pane][tip];
        }
    }
}

nextData.textContent = JSON.stringify(nextData);
console.log(JSON.stringify(nextData, null, 4));

// setTimeout(() => document.location.reload(), 3600 * 1000);
