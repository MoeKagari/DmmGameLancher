"use strict";
class DmmGameBound {
    constructor(width, height, top_delta, left_delta, right_delta) {
        this.width = width;
        this.height = height;
        this.top_delta = top_delta;
        this.left_delta = left_delta;
        this.right_delta = right_delta;
    }
}

class DmmGame {
    constructor(name, simpleName, url, url_x, bound, defaultSetting = {}) {
        this.name = name;
        this.simpleName = simpleName;
        this.url = url;
        this.url_x = url_x;
        this.bound = bound;

        this.defaultSetting = {};
        this.defaultSetting.enable = defaultSetting.enable == false ? false : true;
        this.defaultSetting.useR18 = defaultSetting.useR18 == false ? false : true;
        this.defaultSetting.muted = defaultSetting.muted == true ? true : false;
        this.defaultSetting.icon = defaultSetting.icon || "empty.png";

        this.windowKey = "window_" + name;
        this.mutedKey = "muted_" + name;
        if (localStorage.getItem(this.mutedKey) === null) {
            DmmGameHandler.setWindowMuted(this, this.defaultSetting.mute);
        }
    }
}

class DmmGameHandler {
    static createWindowTitleString(name, muted) {
        return (muted ? "(静音) - " : "") + name;
    }

    static toggleSound(game) {
        var windowInfo = DmmGameHandler.getWindow(game);
        var oldMuted = DmmGameHandler.isWindowMuted(game);

        if (!windowInfo) {
            DmmGameHandler.setWindowMuted(game, !oldMuted);
            console.log("toggleSound (muted: %s -> %s)", oldMuted, !oldMuted);
            return;
        }

        chrome.tabs.update(windowInfo.tabId, {
            "muted": !oldMuted
        }, tabWithNewState => {
            var newMuted = tabWithNewState.mutedInfo.muted;
            DmmGameHandler.setWindowMuted(game, newMuted);
            chrome.tabs.executeScript(windowInfo.tabId, {
                "code": `
                    //retitle window
                    document.title = "${DmmGameHandler.createWindowTitleString(game.name,newMuted)}";
                    `
            });
            console.log("toggleSound (muted: %s -> %s) , %s", oldMuted, newMuted, game.name);
        });
    }
    static setWindowMuted(game, muted) {
        localStorage.setItem(game.mutedKey, muted);
    }
    static isWindowMuted(game) {
        return localStorage.getItem(game.mutedKey) === "true";
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
    static setWindow(game, windowInfo) {
        localStorage.setItem(game.windowKey, JSON.stringify(windowInfo));
        chrome.runtime.sendMessage({
            "game": game,
            "type": "window_set"
        });
    }
    static getWindow(game) {
        return JSON.parse(localStorage.getItem(game.windowKey));
    }

    static createGameWindow(game) {
        chrome.windows.create({
            "url": game.defaultSetting.useR18 ? game.url_x : game.url,
            "focused": true,
            "type": "popup",
            "left": 100,
            "top": 100,
            "width": game.bound.width,
            "height": game.bound.height,
        }, newWindow => {
            var tab = newWindow.tabs[0];
            console.log(`create window (${game.defaultSetting.useR18?"里":"表"}) - ${game.name}`);
            //存储 window
            DmmGameHandler.setWindow(game, {
                "id": newWindow.id,
                "tabId": tab.id
            });
            //更新 tab 的默认 muted
            chrome.tabs.update(tab.id, {
                "muted": DmmGameHandler.isWindowMuted(game)
            }, tabWithNewState => {
                console.log(`set muted from ${tab.mutedInfo.muted} -> ${tabWithNewState.mutedInfo.muted}(default) , ${game.name}`);
            });
            //重置 size
            chrome.windows.update(newWindow.id, {
                "width": game.bound.width + (newWindow.width - tab.width),
                "height": game.bound.height + (newWindow.height - tab.height)
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
        }, 200);
    }
}
