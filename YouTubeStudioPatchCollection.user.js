// ==UserScript==
// @name         YouTube Studio Patch Collection
// @version      1.0.0
// @description  Allows for changing of yt.config_ values in YouTube Studio
// @author       Aubrey Pankow (aubyomori@gmail.com)
// @author       Taniko Yamamoto (kirasicecreamm@gmail.com)
// @license      Unlicense
// @updateURL    https://raw.githubusercontent.com/aubymori/YouTubePatchCollection/main/YouTubePatchCollection.user.js
// @match        studio.youtube.com/*
// @icon         https://www.youtube.com/favicon.ico
// @run-at       document-start
// @grant        none
// ==/UserScript==

// Attributes to remove from <html>
const ATTRS = [];

// Regular config keys.
const CONFIGS = {};

// Experiment flags.
const EXPFLAGS = {
    studio_system_icons: false,
};

class YTP {
    static observer = new MutationObserver(this.onNewScript);

    static _config = {};

    static isObject(item) {
        return (item && typeof item === "object" && !Array.isArray(item));
    }
    
    static mergeDeep(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();
    
        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    this.mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }
    
        return this.mergeDeep(target, ...sources);
    }
    

    static onNewScript(mutations) {
        for (var mut of mutations) {
            for (var node of mut.addedNodes) {
                YTP.bruteforce();
            }
        }
    }

    static start() {
        this.observer.observe(document, {childList: true, subtree: true});
    }
    
    static stop() {
        this.observer.disconnect();
    }

    static bruteforce() {
        if (!window.yt) return;
        if (!window.yt.config_) return;

        this.mergeDeep(window.yt.config_, this._config);
    }

    static setCfg(name, value) {
        this._config[name] = value;
    }

    static setCfgMulti(configs) {
        this.mergeDeep(this._config, configs);
    }

    static setExp(name, value) {
        if (!("EXPERIMENT_FLAGS" in this._config)) this._config.EXPERIMENT_FLAGS = {};

        this._config.EXPERIMENT_FLAGS[name] = value;
    }

    static setExpMulti(exps) {
        if (!("EXPERIMENT_FLAGS" in this._config)) this._config.EXPERIMENT_FLAGS = {};

        this.mergeDeep(this._config.EXPERIMENT_FLAGS, exps);
    }
}

window.addEventListener("yt-page-data-updated", function tmp() {
    YTP.stop();
    for (i = 0; i < ATTRS.length; i++) {
        document.getElementsByTagName("html")[0].removeAttribute(ATTRS[i]);
    }
    window.removeEventListener("yt-page-date-updated", tmp);  
});

YTP.start();

YTP.setCfgMulti(CONFIGS);
YTP.setExpMulti(EXPFLAGS);
