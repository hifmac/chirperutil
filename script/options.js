/**
 * @file options.js
 * @license MIT-License
 * Copyright (c) 2023 hifmac
 */
import {
    createStyleElement,
    updateStyleMode,
    getDefaultOptions,
    loadOptions,
} from "./common.js";

/**
 * write log into html
 * @param {string} log
 */
const writeLog = (() => {
    let n = 0;
    return (log) => {
        const logElement = document.getElementById("log")
        if (logElement) {
            logElement.textContent += `${++n}: ${log}\n`;
        };
    };
})();

/**
 * create element with callback
 * @param {HTMLElement} parent
 * @param {string} tagName 
 * @param {function(HTMLElement): void} callback 
 */
function appendChild(parent, tagName, callback=null) { 
    const element = document.createElement(tagName);

    if (callback !== null) {
        callback(element);
    }

    parent.appendChild(element);
}

/**
 * create input box into the node
 * @param {HTMLElement} parent parent node
 * @param {string} labelText input box label text
 * @param {string} value input box balue
 * @param {function(Event): void} inputEventListener input event listener
 */
function createInputBox(parent, labelText, value, inputEventListener) {
    appendChild(parent, "div", (propDiv) => {
        propDiv.classList.add("ChirperUtilFormGroup");

       appendChild(propDiv, "label", (label) => {
           label.classList.add("ChirperUtilFont", "ChirperUtilFormLabel");
           label.textContent = labelText;
       });

       appendChild(propDiv, "div", (input) => {
           input.classList.add("ChirperUtilFormInput");
           appendChild(input, "input", (p) => {
               p.classList.add("ChirperUtilFont", "ChirperUtilFormParagraph");
               p.value = value;
               p.addEventListener("input", inputEventListener);
           });
       });
   });   
}

/**
 * main 
 * @param {ChirperUtilOptions} options 
 */
function main(options) {
    let mode = "light";

    function updateStyleSheet() {
        const styleElement = createStyleElement(options.css.classes);
        const styleElementOld = document.getElementById(styleElement.id);
        if (styleElementOld) {
            styleElementOld.textContent = styleElement.textContent;
        }
        else {
            document.head.appendChild(styleElement);
        }

        updateStyleMode(options.css.variables, mode);

        chrome.storage.local.set(options).catch(writeLog);
    }

    /**
     * 
     * @param {Object<string, Object<string, string>>} options 
     * @param {function(string, Object<string, string>): string} getOptionName
     * @param {function(Object<string, string>): string[]} getOptionKeys 
     */
    function createOptionWindow(options, getOptionName, getOptionKeys) {
        const getColor = (() => {
            const COLOR_TYPE = [ "system", "information", "story", "appearance", "spec", "example" ];
            let index = 0;
            return function () {
                return COLOR_TYPE[index++ % COLOR_TYPE.length];
            };
        })();

        // create window
        appendChild(document.body, "div", (rootElement) => {
            rootElement.classList.add("ChirperUtilWindow");
            rootElement.style.position = "relative";
            rootElement.style.borderLeft = 
            rootElement.style.borderRight = 
                rootElement.style.borderBottom = "1px solid";

            // create inner window to draw top bar
            appendChild(rootElement, "div", (innerWindow) => {
                innerWindow.classList.add("ChirperUtilInnerWindow");

                // create box par option group
                for (const optionGroupName in options) {
                    const optionGroup = options[optionGroupName];
                    appendChild(innerWindow, "div", (box) => {      
                        box.classList.add("ChirperUtilBox");
            
                        writeLog(optionGroupName);

                        appendChild(box, "div", (colorBar) => {
                            colorBar.classList.add("ChirperUtilColorBar", getColor());
                        });

                        appendChild(box, "div", (classDiv) => {
                            classDiv.classList.add("ChirperUtilFormStack");

                            appendChild(classDiv, "p", (p) => {
                                p.classList.add("ChirperUtilFormParagraph", "ChirperUtilFont");
                                p.textContent = getOptionName(optionGroupName, optionGroup);
                            });
    
                            for (const optionName of getOptionKeys(optionGroup)) {
                                createInputBox(classDiv, optionName, optionGroup[optionName], (ev) => {
                                    writeLog(`${optionGroup[optionName]} => ${ev.target.value}`);
                                    optionGroup[optionName] = ev.target.value;
                                    updateStyleSheet();
                                });
                            };
                        });    
                    });

                    appendChild(innerWindow, "hr");
                }
            });
        });

    }

    function refreshBody() {
        // ログエレメント
        // appendChild(document.body, "pre", (logElement) => logElement.id = "log");
        
        // ボタン
        appendChild(document.body, "div", (rootElement) => {
            rootElement.style.height = "2em";

            appendChild(rootElement, "button", (button) => {
                button.textContent = "リセット";
                button.style.height = "100%";
                button.style.margin = "0.25em";
                button.style.padding = "0px";
                button.addEventListener("click", (ev) => {
                    options = getDefaultOptions();
                    refreshBody();
                });
            })

            appendChild(rootElement, "button", (button) => {
                button.textContent = mode;
                button.style.height = "100%";
                button.style.margin = "0.25em";
                button.style.padding = "0px";
                button.addEventListener("click", (ev) => {
                    mode = (mode === "dark" ? "light" : "dark");
                    ev.target.textContent = mode;
                    updateStyleMode(options.css.variables, mode);
                });
            })
        });

        // 色設定
        appendChild(document.body, "h1", (h4) => h4.textContent = "色の設定");
        createOptionWindow(options.css.variables, (key, value) => value.name, () => [ "light", "dark" ]);

        // CSS設定部
        appendChild(document.body, "h1", (h4) => h4.textContent = "CSSの設定");
        createOptionWindow(options.css.classes, (key, value) => key, (value) => Object.keys(value));

        updateStyleSheet();
    }

    refreshBody();
}

loadOptions().then(main).catch(console.error);
