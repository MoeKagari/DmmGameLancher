"use strict";

//设置 icon 的 tip
var manifest = chrome.runtime.getManifest();
chrome.browserAction.setTitle({
    "title": manifest.name + "\n" + manifest.description
});

//当以最后关闭由此扩展 create 的 window 来关闭浏览器时
//chrome.windows.onRemoved 不会被触发
//所以存储在 localStorage 中的数据不会被删除
//再次启动浏览器时 , 需要删除不存在的窗口
var deleteStoredGameWindow = game => {
    var windowInfo = DmmGameHandler.getWindow(game);
    if (windowInfo) {
        chrome.windows.get(windowInfo.id, window => {
            if(!window){
                DmmGameHandler.removeWindow(game);
                console.log("↑删除不存在的window , 而不是由于 chrome.windows.onRemoved");
            }
        });
    }
};
dmmGameArray.forEach(deleteStoredGameWindow);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var type = request.type;
    var game = request.game;
    switch (type) {
        case "window_create":
            DmmGameHandler.createGameWindow(game);
            break;
        case "window_focus":
            DmmGameHandler.focusWindow(game);
            break;
        case "screenShot":
            DmmGameHandler.screenShot(game);
            break;
        case "toggleSound":
            DmmGameHandler.toggleSound(game);
            break;
    }
});

chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
    for (var game of dmmGameArray) {
        var window = DmmGameHandler.getWindow(game);
        if (window && window.tabId == details.tabId) {
            //rename window
            var code_rename = 'document.title = "' + game.name + '";';
            //fit window
            var code_fit = 'document.body.style.overflow = "hidden";' +
                'var game_frame = document.getElementById("game_frame");' +
                'if (game_frame) {' +
                'game_frame.style.zIndex = 99;' +
                'game_frame.style.position = "fixed";' +
                'game_frame.style.top = -' + game.bound.top_delta + ' + "px";' +
                'game_frame.style.left = -' +
                '(Math.round(game_frame.getBoundingClientRect().width) - ' + (game.bound.width - 2 * game.bound.left_delta) + ')/2  + "px";' +
                '}';
            chrome.tabs.executeScript(details.tabId, {
                "code": code_rename + code_fit
            });
            break;
        }
    }
});

//窗口被移除时
chrome.windows.onRemoved.addListener(function(windowId) {
    for (var game of dmmGameArray) {
        var window = DmmGameHandler.getWindow(game);
        if (window && window.id == windowId) {
            DmmGameHandler.removeWindow(game);
            break;
        }
    }
});
