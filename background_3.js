//设置 icon 的 tip
var manifest = chrome.runtime.getManifest();
chrome.browserAction.setTitle({
    "title": manifest.name + "\n" + manifest.description
});

chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
    for (game of dmmGameArray) {
        var window = DmmGame.getWindow(game);
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
    for (game of dmmGameArray) {
        var window = DmmGame.getWindow(game);
        if (window && window.id == windowId) {
            DmmGame.removeWindow(game);
            break;
        }
    }
});
