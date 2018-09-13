"use strict";

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var game = request.game;
    switch (request.type) {
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

chrome.runtime.getBackgroundPage(backgroundPage => {
	var body = $(document.body);
    var itemArray = backgroundPage.dmmGameArray.filter(game => game.defaultSetting.enable).map(game =>
        $(`<div class='game ${game.simpleName}'></div>`)
        .append("<img class='icon' src='" + game.defaultSetting.icon + "'></img>")
        .append(
            $("<div></div>")
            .append("<h3 class='name'>" + game.name + "</h3>")
            .append(makeGameBaseOperationButtonGroupItem(game))
        )
    );
	body.css("grid-template-rows", `repeat(${itemArray.length},1fr)`);
    itemArray.forEach(item => body.append(item));
});

function makeGameBaseOperationButtonGroupItem(game) {
    var isWindowExistent = DmmGameHandler.isWindowExistent(game);
    return $("<div></div>").css("display", "grid")
        .css("grid-template-columns", "70px 70px 70px 80px 1fr")
        .css("grid-column-gap", "5px").append(
            $("<button class='operation openGameWindow windowNotExistent'>打开游戏</button>")
            .attr("disabled", isWindowExistent)
            .click(ev => chrome.runtime.sendMessage({
                "game": game,
                "type": "window_create"
            }))
        ).append(
            $("<button class='operation focusWindow windowExistent'>设置焦点</button>")
            .attr("disabled", !isWindowExistent)
            .click(ev => chrome.runtime.sendMessage({
                "game": game,
                "type": "window_focus"
            }))
        ).append(
            $("<button class='operation screenShot windowExistent'>截图</button>")
            .attr("disabled", !isWindowExistent)
            .click(ev => chrome.runtime.sendMessage({
                "game": game,
                "type": "screenShot"
            }))
        ).append(
            makeToggleSoundSwitchButtonItem(game)
        );
}

function makeToggleSoundSwitchButtonItem(game) {
    var input_id = `muted-${game.simpleName}`;
    return $("<div class='switch-button'></div>").append(
        $(`<input type='checkbox' ${DmmGameHandler.isWindowMuted(game)?"":"checked"}>`)
        .css("display", "none")
        .attr("id", input_id)
        .attr("name", "switch-" + game.simpleName)
        .addClass("operation toggleSound switch-button-input")
        .click(ev => {
            //给 .switch-button 加上的话 , 一次点击会触发两次event
            //虽然input不显示 , label 被点 , 会传到 input
            chrome.runtime.sendMessage({
                "game": game,
                "type": "toggleSound"
            });
            ev.stopPropagation();
        })
    ).append(
        `<label class='switch-button-label' for='${input_id}'>
            <span class='thumb'></span>
            <span class='sound on'>声开</span>
            <span class='sound off'>声关</span>
        </label>`
    );
}
