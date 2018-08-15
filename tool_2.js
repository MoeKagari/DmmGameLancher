"use strict";
var dmmGameArray = [
    new DmmGame(
        "艦隊これくしょん",
        "艦これ",
        "http://www.dmm.co.jp/netgame/social/-/gadgets/=/app_id=854854/",
        "http://www.dmm.com/netgame/social/-/gadgets/=/app_id=854854/",
        new DmmGameBound(800, 480, 16, 0)
    ),
    new DmmGame(
        "フラワーナイトガール",
        "フラワーナイトガール",
        "http://pc-play.games.dmm.co.jp/play/flower-x/",
        "http://pc-play.games.dmm.com/play/flower/",
        new DmmGameBound(960, 640, 0, 0), {
            "defaultMuted": true
        }
    ),
    new DmmGame(
        "御城プロジェクト:RE～CASTLE DEFENSE～",
        "御城プロジェクト-RE",
        "http://pc-play.games.dmm.co.jp/play/oshirore/",
        "http://pc-play.games.dmm.com/play/oshirore/",
        new DmmGameBound(1275, 720, 0, 6 / 2)
    )
];
