var DmmGameBound = class {
    constructor(width, height, top_delta, left_delta) {
        this.width = width;
        this.height = height;
        this.top_delta = top_delta;
        this.left_delta = left_delta;
    }
}

var DmmGame = class {
    constructor(name, simpleName, url, url_x, bound, other = {}) {
        this.name = name;
        this.simpleName = simpleName;
        this.url = url;
        this.url_x = url_x;
        this.bound = bound;
        this.other = other;

        this.windowKey = "window_" + name;
        DmmGame.removeWindow(this);
    }

    static getIcon(game) {
        return game.other.icon || "empty.png";
    }

    static removeWindow(game) {
        localStorage.removeItem(game.windowKey);
        chrome.runtime.sendMessage({
            "game_name": game.name,
            "type": "window_remove"
        });
    }
    static setWindow(game, window) {
        localStorage.setItem(game.windowKey, JSON.stringify(window));
        chrome.runtime.sendMessage({
            "game_name": game.name,
            "type": "window_set"
        });
    }
    static getWindow(game) {
        return JSON.parse(localStorage.getItem(game.windowKey));
    }
    static isWindowExistent(window) {
        return window ? true : false;
    }

    static createGameWindow(game, isR18 = false) {
        chrome.windows.create({
            "url": isR18 ? game.url_x : game.url,
            "focused": true,
            "type": "popup",
            "left": 100,
            "top": 100,
            "width": game.bound.width,
            "height": game.bound.height
        }, newWindow => {
            DmmGame.setWindow(game, {
                "id": newWindow.id,
                "tabId": newWindow.tabs[0].id
            });
            chrome.windows.update(newWindow.id, {
                "width": game.bound.width + (newWindow.width - newWindow.tabs[0].width),
                "height": game.bound.height + (newWindow.height - newWindow.tabs[0].height),
                "focused": true
            });
            console.log("create window " + (isR18 ? "R18 " : "") + game.name);
        });
    }

    static focusWindow(game) {
        chrome.windows.update(DmmGame.getWindow(game).id, {
            "focused": true
        }, function() {
            console.log("focus window " + game.name);
        });
    }

    static takeScreenShot(game) {
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
        DmmGame.focusWindow(game);

        //延时一点时间 , capture ,然后 save
        setTimeout(() => {
            chrome.tabs.captureVisibleTab(
                DmmGame.getWindow(game).id, {
                    "format": "png"
                },
                dataUrl => {
                    //禁用下方下载栏
                    chrome.downloads.setShelfEnabled(false);

                    console.log("captureVisibleTab " + game.name);
                    chrome.downloads.download({
                        "url": dataUrl,
                        "filename": filename
                    }, function() {
                        console.log("save capture to " + filename);
                    });
                });
        }, 300);
    }

    static toggleSound(game) {
        chrome.tabs.get(DmmGame.getWindow(game).tabId, tabWithCurrentState => {
            var oldMuted = tabWithCurrentState.mutedInfo.muted;
            chrome.tabs.update(tabWithCurrentState.id, {
                "muted": !oldMuted
            }, tabWithNewState => {
                console.log("toggleSound (muted: %s -> %s) , %s", oldMuted, tabWithNewState.mutedInfo.muted, game.name);
            });
        });
    }
}
