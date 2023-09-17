/**
 * @file options.js
 * @license MIT-License
 * Copyright (c) 2023 hifmac
 */

/**
 * @typedef {{
*     version: number
*     css: {
*         classes: Object<string, Object<string, string>>
*         variables: Object<string, Object<string, string>>
*     }
* }} ChirperUtilOptions
*/

export const DEFAULT_STYLESHEET_CLASS = {
    ChirperUtilFont: {
        "color": "var(--chirperUtilFontColor)",
        "font-family": "-apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif",
        "font-weight": "400",
        "font-size": "1rem",
        "line-height": "1.5em"
    },

    ChirperUtilSmallFont: {
        "color": "var(--chirperUtilFontColorSmall)",
        "font-family": "-apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif",
        "font-weight": "400",
        "font-size": "0.875rem",
        "line-height": "1.43em",
    },

    ChirperUtilMetaText: {
        "width": "100%",
        "word-break": "break-word",
        "justify-content": "left",
    },

    ChirperUtilWindow: {
        "background-color": "var(--chirperUtilBackgroundColor)",
        "z-index": "2000",
        "position": "fixed",
        "max-height": "calc(100% - 64px)",
        "max-width": "600px",
        "width": "calc(100% - 64px)",
        "overflow": "auto",
        "marding": "0px",
        "padding": "0px",
        "border-radius": "12px",
        "box-sizing": "inherit",
    },

    ChirperUtilInnerWindow: {
        "border-top": "8px solid rgb(50, 143, 206)",
        "padding": "16px",
    },

    ChirperUtilBox: {
        "border": "0px",
        "margin-top": "8px",
        "margin-bottom": "8px",
        "padding": "2px",
        "background-image": "none",
        "position": "relative",
        "overflow": "hidden",
        "border-radius": "12px",
        "background-color": "var(--chirperUtilBackgroundColorBox)",
    },

    ChirperUtilColorBar: {
        "position": "absolute",
        "top": "0px",
        "left": "0px",
        "width": "4px",
        "height": "100%",
    },

    "ChirperUtilColorBar.system": {
        "background-color": "var(--chirperUtilColorBarSystem)",
    },

    "ChirperUtilColorBar.information": {
        "background-color": "var(--chirperUtilColorBarInformation)",
    },

    "ChirperUtilColorBar.spec": {
        "background-color": "var(--chirperUtilColorBarSpec)",
    },

    "ChirperUtilColorBar.appearance": {
        "background-color": "var(--chirperUtilColorBarAppearance)",
    },

    "ChirperUtilColorBar.example": {
        "background-color": "var(--chirperUtilColorBarExample)",
    },

    "ChirperUtilColorBar.story": {
        "background-color": "var(--chirperUtilColorBarStory)",
    },

    ChirperUtilFormStack: {
        "padding": "16px",
    },

    ChirperUtilFormGroup: {
        "margin": "16px 0px 0px",
        "position": "relative",
    },

    ChirperUtilFormLabel: {
        "background-color": "var(--chirperUtilBackgroundColorBox)",
        "position": "absolute",
        "z-index": "1",
        "top": "0px",
        "left": "0px",
        "transform-origin": "left top",
        "transform": "translate(14px, -9px) scale(0.75)",
        "margin": "0px",
        "padding": "0px 16px 0px 16px",
    },

    ChirperUtilFormInput: {
        "box-sizing": "border-box",
        "cursor": "text",
        "display": "inline-flex",
        "align-items": "center",
        "width": "100%",
        "position": "relative",
        "border": "1px solid var(--chirperUtilBorderColor)",
        "border-radius": "12px",
        "padding": "16.5px 14px",
    },

    ChirperUtilFormParagraph: {
        "height": "auto",
        "width": "100%",
        "overflow": "hidden",
        "border": "0px none",
        "background-color": "var(--chirperUtilBackgroundColorBox)",
        "resize": "none",
        "padding": "0px",
        "margin": "0px",
    },
};

export const DEFAULT_STYLESHEET_VARIABLE = {
    chirperUtilFontColor: {
        name: "文字色",
        light: "rgba(15, 15, 15, 1)",
        dark: "rgba(240, 240, 240, 1)"
    },

    chirperUtilFontColorSmall: {
        name: "文字色（小）",
        light: "rgba(15, 15, 15, 0.707)",
        dark: "rgba(240, 240, 240, 0.707)"
    },

    chirperUtilBackgroundColor: {
        name: "背景色（外）",
        light: "rgba(255, 255, 255, 1)",
        dark: "rgba(0, 0, 0, 1)"
    },

    chirperUtilBackgroundColorBox: {
        name: "背景色（内）",
        light: "rgba(242, 242, 242, 1)",
        dark: "rgba(39, 39, 39, 1)"
    },

    chirperUtilBorderColor: {
        name: "枠色",
        light: "rgba(0, 0, 0, 1)",
        dark: "rgba(255, 255, 255, 1)"
    },

    chirperUtilColorBarSystem: {
        // HSL: 279, 74, 57
        name: "サイドバー色（System）",
        light: "rgba(174, 67, 228, 1)",
        dark: "rgba(174, 67, 228, 1)"
    },

    chirperUtilColorBarInformation: {
        // HSL: 204, 61, 50
        name: "サイドバー色（Information）",
        light: "rgba(50, 143, 206, 1)",
        dark: "rgba(50, 143, 206, 1)"
    },

    chirperUtilColorBarAppearance: {
        // HSL: 27, 98, 46
        name: "サイドバー色（Appearance）",
        light: "rgba(237, 108, 2, 1)",
        dark: "rgba(237, 108, 2, 1)"
    },

    chirperUtilColorBarSpec: {
        // HSL: 0, 65, 50
        name: "サイドバー色（Spec）",
        light: "rgba(211, 47, 47, 1)",
        dark: "rgba(211, 47, 47, 1)"
    },

    chirperUtilColorBarExample: {
        // HSL: 123, 46, 33
        name: "サイドバー色（Example）",
        light: "rgba(46, 125, 50, 1)",
        dark: "rgba(46, 125, 50, 1)"
    },

    chirperUtilColorBarStory: {
        // HSL: 60, 90, 50
        name: "サイドバー色（Story）",
        light: "rgba(242, 242, 12, 1)",
        dark: "rgba(242, 242, 12, 1)"
    },
};

/**
 * create style element for ChirperUtil
 * @param {Object<string, Object<string, string>>} cssClasses 
 */
export function createStyleElement(cssClasses) {
    const style = document.createElement("style");
    style.id = "chirperUtilStyleElement";
    style.textContent = Object.keys(cssClasses).map((className) => {
        return ([ `.${className} {` ]
            .concat(Object.keys(cssClasses[className]).map((x) => `    ${x}: ${cssClasses[className][x]};`))
            .concat([ `}` ])).join("\n");
    }).join("\n");

    return style;
}

/**
 * update style property to swith light and dark mode
 * @param {Object<string, Object<string, string>>} cssVariables 
 * @param {"light" | "dark"} mode 
 */
export function updateStyleMode(cssVariables, mode) {
    for (const varName in cssVariables) {
        document.body.style.setProperty(`--${varName}`, cssVariables[varName][mode]);
    }
}

/**
 * get default options
 * @returns {ChirperUtilOptions}
 */
export function getDefaultOptions() {
    return {
        version: 2, // 2023/9/17 update
        css: {
            classes: Object.assign({}, DEFAULT_STYLESHEET_CLASS),
            variables: Object.assign({}, DEFAULT_STYLESHEET_VARIABLE),
        }
    };
}

/**
 * get default options
 * @returns {Promise<ChirperUtilOptions>}
 */
export async function loadOptions() {
    /** @type {ChirperUtilOptions} */
    const options = await chrome.storage.local.get();

    const defaultOptions = getDefaultOptions();
    if (options.version !== defaultOptions.version) {
        await chrome.storage.local.set(defaultOptions);
        return defaultOptions;
    }

    return options;
}

