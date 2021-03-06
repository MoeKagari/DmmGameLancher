"use strict";
var dmmGameArray = [
    new DmmGame(
        "艦隊これくしょん",
        "艦これ",
        "http://www.dmm.com/netgame/social/-/gadgets/=/app_id=854854/",
        "http://www.dmm.co.jp/netgame/social/-/gadgets/=/app_id=854854/",
        new DmmGameBound(1200, 720, 16, 0, 0), {
            "enable": true,
            "useR18": true,
            "muted": false,
            "icon": "empty.png"
        }
    ),
    new DmmGame(
        "フラワーナイトガール",
        "フラワーナイトガール",
        "http://pc-play.games.dmm.com/play/flower/",
        "http://pc-play.games.dmm.co.jp/play/flower-x/",
        new DmmGameBound(960, 640, 0, 0, 0)
    ),
    new DmmGame(
        "御城プロジェクト:RE～CASTLE DEFENSE～",
        "御城プロジェクトRE",
        "http://pc-play.games.dmm.com/play/oshirore/",
        "http://pc-play.games.dmm.co.jp/play/oshirore/",
        new DmmGameBound(1275, 720, 0, 6, 0)
    ),
    new DmmGame(
        "あいりすミスティリア！ ～少女のつむぐ夢の秘跡～",
        "あいミス",
        "http://pc-play.games.dmm.com/play/imys/",
        "http://pc-play.games.dmm.co.jp/play/imys_r/",
        new DmmGameBound(1280, 720, 17 + 24, 30, 0)
    ),
    new DmmGame(
        "ジェミニシード",
        "ジェミニシード",
        "http://pc-play.games.dmm.com/play/gemini/",
        "http://pc-play.games.dmm.co.jp/play/geminix/",
        new DmmGameBound(1152, 648, (692 - 648) / 2 - 2, (1194 - 1152 - 2) / 2, 1320 - 1152 - (1194 - 1152 - 2) / 2)
    )
];
