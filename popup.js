"use strict";
chrome.runtime.getBackgroundPage(backgroundPage => {
    var body = $("body");
    var gameGridRowItemArray = backgroundPage.dmmGameArray.map(makeGameGridRowItem);
    body.css("grid-template-rows", "repeat(" + gameGridRowItemArray.length + ",1fr)");
    gameGridRowItemArray.forEach(gameGridRowItem => body.append(gameGridRowItem));
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var type = request.type;
    var game = request.game;
    switch (type) {
        case "window_set":
            $("." + game.simpleName + " .windowNotExistent").attr("disabled", true);
            $("." + game.simpleName + " .windowExistent").attr("disabled", false);
            break;
        case "window_remove":
            $("." + game.simpleName + " .windowNotExistent").attr("disabled", false);
            $("." + game.simpleName + " .windowExistent").attr("disabled", true);
            break;
    }
});

function makeGameGridRowItem(game) {
    return $("<div class='game'></div>")
        .addClass(game.simpleName)
        .append(makeGameIconItem(game))
        .append(
            $("<div></div>")
            .append("<h3 class='name'>" + game.name + "</h3>")
            .append(makeGameBaseOperationButtonGroupItem(game))
            .append(makeGameZoomOperationItem(game))
        );
}

function makeGameIconItem(game) {
    return "<img class='icon' src='" + DmmGameHandler.getIcon(game) + "'></img>";
}

function makeGameBaseOperationButtonGroupItem(game) {
    var isWindowExistent = DmmGameHandler.isWindowExistent(game);

    var openGameWindowButton = $("<button class='operation windowNotExistent openGameWindow'>打开游戏</button>");
    openGameWindowButton.attr("disabled", isWindowExistent);
    openGameWindowButton.click(ev => chrome.runtime.sendMessage({
        "game": game,
        "type": "window_create"
    }));

    var focusWindowButton = $("<button class='operation windowExistent focusWindow'>设置焦点</button>");
    focusWindowButton.attr("disabled", !isWindowExistent);
    focusWindowButton.click(ev => chrome.runtime.sendMessage({
        "game": game,
        "type": "window_focus"
    }));

    var screenShotButton = $("<button class='operation windowExistent screenShot'>截图</button>");
    screenShotButton.attr("disabled", !isWindowExistent);
    screenShotButton.click(ev => chrome.runtime.sendMessage({
        "game": game,
        "type": "screenShot"
    }));

    return $("<div></div>")
        .css("display", "grid")
        .css("grid-template-columns", "70px 70px 70px 80px 1fr")
        .css("grid-column-gap", "5px")
        .append(openGameWindowButton)
        .append(focusWindowButton)
        .append(screenShotButton)
        .append(makeToggleSoundSwitchButtonItem(game, isWindowExistent));
}

function makeToggleSoundSwitchButtonItem(game) {
    return $("<div class='switch-button'></div>")
        .append(
            $("<input type='checkbox' " + (DmmGameHandler.isWindowMuted(game) ? "" : "checked") + ">")
            .css("display", "none")
            .attr("id", "muted-" + game.simpleName)
            .attr("name", "switch-" + game.simpleName)
            .addClass("switch-button-input operation toggleSound")
            .click(function(ev) {
                //给 .switch-button 加上的话 , 一次点击会触发两次event
                chrome.runtime.sendMessage({
                    "game": game,
                    "type": "toggleSound"
                });
                ev.stopPropagation();
            })
        )
        .append(
            $("<label class='switch-button-label' for='muted-" + game.simpleName + "'></label>")
            .append("<span class='thumb'></span>")
            .append("<span class='sound on'>声开</span>")
            .append("<span class='sound off'>声关</span>")
        );
}

function makeGameZoomOperationItem(game) {
    var div = $("<div></div>");
    // TODO: 缩放功能
    return div;
}
