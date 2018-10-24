"use strict";

//设置 icon 的 tip
var manifest = chrome.runtime.getManifest();
chrome.browserAction.setTitle({
    "title": manifest.name + "\n" + manifest.description
});


var deleteStoredGameWindow = game => {
    var windowInfo = DmmGameHandler.getWindow(game);
    if (windowInfo) {
        chrome.windows.getAll(windows => {
            //当以最后关闭由此扩展 create 的 window 来关闭浏览器时
            //chrome.windows.onRemoved 不会被触发
            //所以存储在 localStorage 中的数据不会被删除
            //再次启动浏览器时 , 需要删除不存在的窗口
            /*
            chrome.windows.get(windowInfo.id, win => {
                if (!win) {
                    DmmGameHandler.removeWindow(game);
                    console.log("↑删除不存在的window , 而不是由于 chrome.windows.onRemoved");
                    console.log("↓error不用管");
                }
            });
            */
            if (!windows.map(window => window.id).includes(windowInfo.id)) {
                DmmGameHandler.removeWindow(game);
            }

            //reinstall 时 , 当前已创建的window ,  muted 会失效
            //需要更新 muted info
            /*
            chrome.tabs.get(windowInfo.tabId, tab => {
                if (tab) {
                    chrome.tabs.update(tab.id, {
                        "muted": DmmGameHandler.isWindowMuted(game)
                    });
                }
            });
            */
            windows.forEach(window => {
                chrome.tabs.getAllInWindow(window.id, tabs => {
                    if (tabs.map(tab => tab.id).includes(windowInfo.tabId)) {
                        chrome.tabs.update(windowInfo.tabId, {
                            "muted": DmmGameHandler.isWindowMuted(game)
                        });
                    }
                });
            });
        });
    }
};
dmmGameArray.forEach(deleteStoredGameWindow);

//窗口被移除时
chrome.windows.onRemoved.addListener(function(windowId) {
    for (var game of dmmGameArray) {
        var windowInfo = DmmGameHandler.getWindow(game);
        if (windowInfo && windowInfo.id == windowId) {
            DmmGameHandler.removeWindow(game);
            break;
        }
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.type) {
        case "window_create":
            DmmGameHandler.createGameWindow(request.game);
            break;
        case "window_focus":
            DmmGameHandler.focusWindow(request.game);
            break;
        case "screenShot":
            DmmGameHandler.screenShot(request.game);
            break;
        case "toggleSound":
            DmmGameHandler.toggleSound(request.game);
            break;
    }
});

chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
    for (var game of dmmGameArray) {
        var windowInfo = DmmGameHandler.getWindow(game);
        var muted = DmmGameHandler.isWindowMuted(game);
        if (windowInfo && windowInfo.tabId == details.tabId) {
            chrome.tabs.executeScript(details.tabId, {
                "code": `
                //retitle window
                document.title = "${DmmGameHandler.createWindowTitleString(game.name,muted)}";

                //fit game area to window
                function fitGameAreaToWindow(){
                    document.body.style.overflow = "hidden";
                    var game_frame = document.getElementById("game_frame");
                    if (game_frame) {
                        game_frame.style.zIndex = 99;
                        game_frame.style.position = "fixed";
                        game_frame.style.top = "-" + ${game.bound.top_delta} + "px";
                        console.log(${game.bound.top_delta});
                        console.log(game_frame.style.top);

                        var game_frame_width = Math.round(game_frame.getBoundingClientRect().width);
                        game_frame.style.left = "-" + (
                        (game_frame_width - ${game.bound.width + game.bound.left_delta + game.bound.right_delta})/2 + ${game.bound.left_delta}
                        ) + "px";
                        console.log(game_frame_width);
                        console.log(game_frame.style.left);
                    }
                }
                fitGameAreaToWindow();
                `
            });
            break;
        }
    }
});
