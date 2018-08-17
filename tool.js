"use strict";
class DmmGameBound {
    constructor(width, height, top_delta, left_delta) {
        this.width = width;
        this.height = height;
        this.top_delta = top_delta;
        this.left_delta = left_delta;
    }
}

class DmmGame {
    constructor(name, simpleName, url, url_x, bound, other = {}) {
        this.name = name;
        this.simpleName = simpleName;
        this.url = url;
        this.url_x = url_x;
        this.bound = bound;
        this.other = other;
        this.windowKey = "window_" + name;
        this.mutedKey = "muted_" + name;
        if (localStorage.getItem(this.mutedKey) === null) {
            DmmGameHandler.setWindowMuted(this, other.defaultMuted || false);
        }
    }
}

class DmmGameHandler {
    static toggleSound(game) {
        var window = DmmGameHandler.getWindow(game);
        var oldMuted = DmmGameHandler.isWindowMuted(game);

        if (!window) {
            DmmGameHandler.setWindowMuted(game, !oldMuted);
            console.log("toggleSound (muted: %s -> %s)", oldMuted, !oldMuted);
            return;
        }

        chrome.tabs.update(window.tabId, {
            "muted": !oldMuted
        }, tabWithNewState => {
            var newMuted = tabWithNewState.mutedInfo.muted;
            DmmGameHandler.setWindowMuted(game, newMuted);
            console.log("toggleSound (muted: %s -> %s) , %s", oldMuted, newMuted, game.name);
        });
    }
    static setWindowMuted(game, muted) {
        localStorage.setItem(game.mutedKey, muted);
    }
    static isWindowMuted(game) {
        return localStorage.getItem(game.mutedKey) === "true";
    }

    static getIcon(game) {
        return game.other.icon || "empty.png";
    }

    static isWindowExistent(game) {
        return DmmGameHandler.getWindow(game) ? true : false;
    }
    static removeWindow(game) {
        localStorage.removeItem(game.windowKey);
        chrome.runtime.sendMessage({
            "game": game,
            "type": "window_remove"
        });
        console.log("remove window " + game.name);
    }
    static setWindow(game, window) {
        localStorage.setItem(game.windowKey, JSON.stringify(window));
        chrome.runtime.sendMessage({
            "game": game,
            "type": "window_set"
        });
    }
    static getWindow(game) {
        return JSON.parse(localStorage.getItem(game.windowKey));
    }

    static createGameWindow(game, isR18 = false) {
        chrome.windows.create({
            "url": isR18 ? game.url_x : game.url,
            "focused": true,
            "type": "popup",
            "left": 100,
            "top": 100,
            "width": game.bound.width,
            "height": game.bound.height,
        }, window => {
            var tab = window.tabs[0];
            console.log(`create window (${isR18?"里":"表"}) - ${game.name}`);
            //存储 window
            DmmGameHandler.setWindow(game, {
                "id": window.id,
                "tabId": tab.id
            });
            //更新 tab 的默认 muted
            chrome.tabs.update(tab.id, {
                "muted": DmmGameHandler.isWindowMuted(game)
            }, tabWithNewState => {
                console.log(`set muted from ${tab.mutedInfo.muted} -> ${tabWithNewState.mutedInfo.muted}(default) , ${game.name}`);
            });
            //重置 size
            chrome.windows.update(window.id, {
                "width": game.bound.width + (window.width - tab.width),
                "height": game.bound.height + (window.height - tab.height)
            });
        });
    }

    static focusWindow(game) {
        chrome.windows.update(DmmGameHandler.getWindow(game).id, {
            "focused": true
        }, () => {
            console.log("focus window " + game.name);
        });
    }

    static screenShot(game) {
        var filename = "DmmGameLancher_ScreenShot/" + game.simpleName + "/" +
            (() => {
                var d = new Date();

                var yyyy = d.getFullYear();
                var MM = d.getMonth() + 1;
                var dd = d.getDate();
                var hh = d.getHours();
                var mm = d.getMinutes();
                var ss = d.getSeconds();

                if (MM < 10) MM = "0" + MM;
                if (dd < 10) dd = "0" + dd;
                if (hh < 10) hh = "0" + hh;
                if (mm < 10) mm = "0" + mm;
                if (ss < 10) ss = "0" + ss;

                return yyyy + '_' + MM + dd + '_' + hh + mm + '_' + ss;
            })() +
            ".png";

        //先 focus window
        DmmGameHandler.focusWindow(game);

        //延时一点时间 , capture ,然后 save
        setTimeout(() => {
            chrome.tabs.captureVisibleTab(
                DmmGameHandler.getWindow(game).id, {
                    "format": "png"
                },
                dataUrl => {
                    //禁用下方下载栏
                    chrome.downloads.setShelfEnabled(false);

                    console.log("captureVisibleTab " + game.name);
                    chrome.downloads.download({
                        "url": dataUrl,
                        "filename": filename
                    }, () => {
                        console.log("save capture to " + filename);
                    });
                });
        }, 300);
    }
}
