/*
 * Chirpeeper
 * MIT License
 *
 * Copyright (c) 2023 hifmac
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// *******************
// ***   Utility   ***
// *******************

/**
 * create chirper type dict to tuple
 * @param {Object<string, Object<string, string> | string | string[]>} chirper 
 * @returns {Object<string, string | string[]>}
 */
function chirper2Tuple(chirper) {
    return [
      [ "@ID", chirper.username ],
      [ "名前", chirper.name ],
      [ "半生", chirper.bio ],
      [ "バックストーリー", chirper.bio ],
      [ "Want", chirper.story.want ],
      [ "Need", chirper.story.need ],
      [ "年齢", chirper.age ],
      [ "性別", chirper.gender ],
      [ "種族", chirper.spec.species ],
      [ "人種", chirper.race ],
      [ "居場所", chirper.spec.location ],
      [ "意志", chirper.spec.intention ],
      [ "要約", chirper.spec.summary ],
      [ "プロンプト", chirper.spec.prompt ],
      [ "設定", chirper.spec.setting ],
      [ "投稿例", chirper.spec.posts ],
      [ "返信例", chirper.spec.responses ],
      [ "チャープ数", chirper.chirps ],
      [ "顔", chirper.spec.face ],
      [ "髪", chirper.spec.hair ],
      [ "体", chirper.spec.body ],
      [ "スタイル", chirper.spec.style ],
    ];
}

/**
 * set chirper site font information
 * @param {HTMLElement} element to be set font information
 * @returns {undefined}
 */
function setChirperFont(element) {
    element.style.fontFamily = "-apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif";
    element.style.fontWeight = 400;
    element.style.fontSize = "1rem";
    element.style.lineHeight = 1.5;
}

/**
 * make top-level div element
 * @returns {HTMLDivElement}
 */
function createChirperBox() {
    const paramWindow = document.createElement("div");
    paramWindow.classList.add("MuiStack-root");
    paramWindow.style.top = "0" + "px";
    paramWindow.style.left = "0" + "px";
    paramWindow.style.zIndex = 2000;
    paramWindow.style.position = "fixed";
    paramWindow.style.maxHeight = "calc(100% - 64px)";
    paramWindow.style.maxWidth = "600px";
    paramWindow.style.width = "calc(100% - 64px)";
    paramWindow.style.background = "#ffffff";
    paramWindow.style.overflow = "auto";
    paramWindow.style.flex = "1 1 auto";
    paramWindow.style.padding = "16px";
    paramWindow.style.borderTop = "8px solid rgb(50, 143, 206)";
    paramWindow.style.borderRadius = "12px";


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
    while (paramWindow.firstChild) {
        paramWindow.removeChild(paramWindow.firstChild);
    }

    let n = 0;
    for (const parameter of parameters) {
        n += 1;

        const label = document.createElement("label");
        label.classList.add(
            "MuiInputLabel-root",
            "MuiInputLabel-formControl",
            "MuiInputLabel-animated",
            "MuiInputLabel-shrink",
            "MuiInputLabel-outlined",
            "MuiFormLabel-root",
            "MuiFormLabel-colorPrimary",
            "MuiFormLabel-filled");
        setChirperFont(label);
        label.style.position = "absolute";
        label.style.background = "#ffffff";
        label.style.top = "0px";
        label.style.left = "0px";
        label.style.transformOrigin = "left top";
        label.style.transform = "translate(14px, -9px) scale(0.75)";
        label.style.margin = "0px"
        label.style.padding = "0px 16px 0px 16px";
        label.innerText = parameter[0];
        label.setAttribute("data-shrink", true);
        label.setAttribute("for", `parameter${n}`)
        label.setAttribute("name", `parameter${n}-label`)

        const textArea = document.createElement("textarea");
        textArea.classList.add(
            "MuiOutlinedInput-input",
            "MuiInputBase-input",
            "MuiInputBase-inputMultiline")
        setChirperFont(textArea);
        textArea.id = `parameter${n}`;
        textArea.style.width = "100%";
        textArea.style.overflow = "hidden";
        textArea.style.resize = "none";
        textArea.style.padding = "16px";

        requestAnimationFrame(() => {
            textArea.style.height = (textArea.scrollHeight) + "px";
        });
  
        if (Array.isArray(parameter[1])) {
            textArea.innerText = "";
            for (const index in parameter[1]) {
                textArea.appendChild(document.createTextNode(`${index}: ${parameter[1][index]}\n`));                  
            }  
        }
        else {
            textArea.innerText = `${parameter[1]}`.trim();
        }

        const input = document.createElement("div");
        input.classList.add(
            "MuiOutlinedInput-root",
            "MuiInputBase-root",
            "MuiInputBase-colorPrimary",
            "MuiInputBase-fullWidth",
            "MuiInputBase-formControl",
            "MuiInputBase-adornedStart")
        input.style.borderRadius = "12px";
        input.appendChild(textArea);

        const box = document.createElement("div");
        box.classList.add(
            "MuiFormControl-root",
            "MuiFormControl-fullWidth",
            "MuiTextField-root");
        box.style.margin = "16px 0px 0px";
        box.style.position = "relative";
        box.appendChild(label);
        box.appendChild(input);
        paramWindow.appendChild(box);
    }
}


// *****************************
// ***   Chirper API Queue   ***
// *****************************

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


// **************************
// ***   Chirper Viewer   ***
// **************************

const hookChirperViewer = (() => {
    const paramWindow = createChirperBox();
    paramWindow.innerText = "loading...";

    /** @type {HTMLElement} */
    let presentation = null;
    let timerId = null;


    return function chirperViewer() {
        // DOMから切り離されていたら狩猟する
        if (presentation && presentation.parentNode == null) {
            presentation = null;

            if (paramWindow.parentNode) {
                paramWindow.parentNode.removeChild(paramWindow);
            }

            clearInterval(timerId);
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

        const username = document.getElementById("username");
        if (username === null) {
            return;
        }

        document.body.appendChild(paramWindow);

        let previousResult = "";
        timerId = setInterval(() => {
            if (!username.value || username.value.trim().length == 0) {
                return ;
            }

            const apiUrl = `https://api.chirper.ai/v1/chirper/${username.value}`;
            requestApi(apiUrl).then((response) => {
                const resultString = JSON.stringify(response.result);
                if (previousResult === resultString) {
                    return ;
                }
                previousResult = resultString;

                createChirperPanel(paramWindow, chirper2Tuple(response.result));
            }).catch(console.error);
        }, 10000);

    }
})();


// *************************
// ***   Thread Viewer   ***
// *************************

const hookThreadViewer = (() => {
    return function threadViewer() {
        for (const thread of document.getElementsByClassName("ChirperThread")) {
            if (thread.getAttribute("chirperutil-thread-id")) {
                continue;
            }

            for (const link of thread.getElementsByTagName("a")) {
                const match = link.href.match(new RegExp("/chirp/([^/]+)"));
                if (!match) {
                    continue;
                }
                const threadId = match[1];

                if (threadId.includes("#")) {
                    console.log(`Ignore Thread: ${threadId}`);
                    thread.setAttribute("chirperutil-thread-id", threadId.split("#")[0]);
                    continue;
                }

                console.log(`Fetch Thread: ${threadId}`);
                thread.setAttribute("chirperutil-thread-id", threadId);

                const apiUrl = `https://api.chirper.ai/v1/chirp/${threadId}`;
                requestApi(apiUrl).then((response) => {
                    console.log(response);
                    if ("meta" in response.result) {
                        const meta = response.result.meta;
                        thread.setAttribute("title", [
                            `台本: ${meta.plot}`,
                            `主役: ${meta.protagonist}`,
                            `敵役: ${meta.antagonist}`,
                            `設定: ${meta.setting}`,
                            `事件: ${meta.incident}`,
                            `導入: ${meta.complication}`,
                            `顛末: ${meta.crisis}`,
                        ].join("\n"));
                    }
                }).catch(console.error);
                break
            }
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
     * @param {function (HTMLElement): string} getChirperId
     */
    function setChirperInformationHook(elem, getChirperId) {
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
                const apiUrl = `https://api.chirper.ai/v1/chirper/${chiperId}`;
                requestApi(apiUrl).then((response) => {
                    createChirperPanel(div, chirper2Tuple(response.result));
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
        for (const hero of document.getElementsByClassName("ChirperExplore-hero")) {
            setChirperInformationHook(hero, getChirperIdFromLocation);
        }

        for (const avatar of document.getElementsByClassName("ChirperChirp-avatar")) {
            setChirperInformationHook(avatar, getChirperIdFromAnchor);
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

// create an observer instance
const observer = new MutationObserver(function (mutations) {
    const start = Date.now();
    hookChirperViewer();
    console.log(`Chirper: ${Date.now() - start} [msecs]`);
    hookThreadViewer();
    console.log(`Thread: ${Date.now() - start} [msecs]`);
    hookHeroViewer();
    console.log(`Hero: ${Date.now() - start} [msecs]`);
    hookWorldMenu();
    console.log(`World: ${Date.now() - start} [msecs]`);
});

// configuration of the observer
const config = { childList: true, subtree: true };

document.addEventListener("DOMContentLoaded", () => {
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

const nextData = JSON.parse(tag.innerText);
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
newTag.innerText = JSON.stringify(nextData);
document.body.appendChild(newTag);

console.log(JSON.stringify(nextData, null, 4));