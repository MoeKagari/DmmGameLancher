var DmmGame;

function init() {
    chrome.runtime.getBackgroundPage(backgroundPage => {
        DmmGame = backgroundPage.DmmGame;

        var body = $("body");
        var gameGridRowItemArray = backgroundPage.dmmGameArray.map(makeGameGridRowItem);
        body.css("grid-template-rows", "repeat(" + gameGridRowItemArray.length + ",1fr)");
        gameGridRowItemArray.forEach(gameGridRowItem => body.append(gameGridRowItem));

        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            console.log(request);
            switch (request.type) {
                case "window_set":
                    console.log($(".operation.windowExistent"));
                    $("." + request.game_name + " .operation.windowNotExistent").attr("disabled", true);
                    $("." + request.game_name + " .operation.windowExistent").attr("disabled", false);
                    break;
                case "window_remove":
                    $("." + request.game_name + " .operation.windowNotExistent").attr("disabled", false);
                    $("." + request.game_name + " .operation.windowExistent").attr("disabled", true);
                    break;
            }
        });
    });
}

function makeGameGridRowItem(game) {
    var gameGridRowItem = $("<div class='game'></div>");
    gameGridRowItem.addClass(game.name);
    gameGridRowItem.append(makeGameIconItem(game));
    gameGridRowItem.append(
        $("<div></div>")
        .append("<h3 class='name'>" + game.name + "</h3>")
        .append(makeGameBaseOperationButtonGroupItem(game))
        .append(makeGameZoomOperationItem(game))
    );
    return gameGridRowItem;
}

function makeGameIconItem(game) {
    return "<img class='icon' src='" + DmmGame.getIcon(game) + "'></img>";
}

function makeGameBaseOperationButtonGroupItem(game) {
    var isWindowExistent = DmmGame.isWindowExistent(DmmGame.getWindow(game));

    var openGameWindowButton = $("<button class='operation windowNotExistent openGameWindow'>打开游戏</button>");
    openGameWindowButton.attr("disabled", isWindowExistent);
    openGameWindowButton.click(ev => DmmGame.createGameWindow(game));

    var focusWindowButton = $("<button class='operation windowExistent focusWindow'>设置焦点</button>");
    focusWindowButton.attr("disabled", !isWindowExistent);
    focusWindowButton.click(ev => DmmGame.focusWindow(game));

    var screenShotButton = $("<button class='operation windowExistent screenShot'>截图</button>");
    screenShotButton.attr("disabled", !isWindowExistent);
    screenShotButton.click(ev => DmmGame.takeScreenShot(game));

    var toggleSoundButton = $("<button class='operation windowExistent toggleSound'>切换声音</button>");
    toggleSoundButton.attr("disabled", !isWindowExistent);
    toggleSoundButton.click(ev => DmmGame.toggleSound(game));

    return $("<div></div>")
        .css("display", "grid")
        .css("grid-template-columns", "70px 70px 70px 70px 1fr")
        .css("grid-column-gap", "5px")
        .append(openGameWindowButton)
        .append(focusWindowButton)
        .append(screenShotButton)
        .append(toggleSoundButton);
}

function makeGameZoomOperationItem(game) {
    var div = $("<div></div>");
    // TODO: 缩放功能
    return div;
}

init();
