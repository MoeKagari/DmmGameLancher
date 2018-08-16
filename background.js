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
            if (!window) {
                DmmGameHandler.removeWindow(game);
                console.log("↑删除不存在的window , 而不是由于 chrome.windows.onRemoved");
                console.log("↓error不用管");
            }
        });
    }
};
dmmGameArray.forEach(deleteStoredGameWindow);

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

        case "getWindowSize":
            chrome.windows.get(request.windowId, {
                "populate": true
            }, win => {
                sendResponse({
                    "width": win.tabs[0].width,
                    "height": win.tabs[0].height
                });
            });
            return true;
        case "setZoom":
            chrome.tabs.setZoom(request.tabId, parseFloat(request.scaleFactor), function() {
                sendResponse();
            });
            return true;
    }
});

chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
    for (var game of dmmGameArray) {
        var window = DmmGameHandler.getWindow(game);
        if (window && window.tabId == details.tabId) {
            chrome.tabs.executeScript(details.tabId, {
                "code": `
                //rename window
                document.title = "${game.name}";

                //fit game area to window
                function fitGameAreaToWindow(){
                    document.body.style.overflow = "hidden";
                    var game_frame = document.getElementById("game_frame");
                    if (game_frame) {
                        game_frame.style.zIndex = 99;
                        game_frame.style.position = "fixed";
                        game_frame.style.top = -${game.bound.top_delta} + "px";
                        game_frame.style.left = -
                        (Math.round(game_frame.getBoundingClientRect().width) - ${game.bound.width - 2 * game.bound.left_delta})/2  + "px";
                    }
                }
                fitGameAreaToWindow();

                //window resize listener
                if(window.onresize == null){
                    var timeoutId = 0;
                    window.addEventListener('resize', function() {
                        if (timeoutId) {
                            clearTimeout(timeoutId);
                        }
                        timeoutId = setTimeout(function() {
                            if(document.body){
                                resizeGameArea();
                                fitGameAreaToWindow();
                            }
                            timeoutId = 0;
                        }, 100);
                    }, false);
                }

                //resize game area
                function resizeGameArea(){
                    chrome.runtime.sendMessage({
                        "type":"getWindowSize",
                        "windowId":${window.id}
                    },response => {
                        var GAME_WIDTH = ${game.bound.width};
                        var GAME_HEIGHT = ${game.bound.height};
                        var GAME_ASPECTRAITO = GAME_HEIGHT / GAME_WIDTH;

                        var scaleFactor = 1;
                        var gamePosX = 0;
                        var gamePosY = 0;
                        var clientAspectRaito = response.height / response.width;

                        if(clientAspectRaito < GAME_ASPECTRAITO){
                            scaleFactor = response.height / GAME_HEIGHT;
                            gamePosX = (response.width - GAME_WIDTH * scaleFactor) / 2;
                            gamePosX =  Math.round( gamePosX / scaleFactor );
                            gamePosY = 0;
                        }
                        else if(clientAspectRaito > GAME_ASPECTRAITO){
                            scaleFactor = response.width / GAME_WIDTH;
                            gamePosX = 0;
                            gamePosY = (response.height - GAME_HEIGHT * scaleFactor) / 2;
                            gamePosY =  Math.round(gamePosY / scaleFactor);
                        }
                        else{
                            scaleFactor = response.width / GAME_WIDTH;
                            gamePosX = 0;
                            gamePosY = 0;
                        }

                        chrome.runtime.sendMessage({
                            "type":"setZoom",
                            "scaleFactor":scaleFactor.toString(),
                            "tabId":${window.tabId}
                        }, () => {
                            console.log(gamePosX+","+gamePosY);
                        });
                    });
                }
                `
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
