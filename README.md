# DmmGameLancher
![预览](doc/preview.png)
## 介绍
**窗口化[DMMGAME](http://games.dmm.com/)的chrome扩展程序  
代码中多参照另一项目[@chabon#ShiroproLauncher](https://github.com/chabon/ShiroproLauncher)**
## 安装
**`[Clone or download] -> [Download Zip]` , 下载解压本项目文件到一个文件夹中  
打开chrome扩展程序的开发者模式 , 然后点击"加载已解压的扩展程序" , 选择上面解压的文件夹**
## 添加新游戏
**找到项目中的 `game.js` 文件 , 按照以下格式添加**

    var dmmGameArray = [... , ... , ... ,
        new DmmGame(
            "窗口标题",
            "截图文件夹名",
            "游戏表区地址",
            "游戏里区地址(注:没有里区的游戏则将表区地址中的com改为co.jp即可)",
            new DmmGameBound(宽度, 高度, 上边空白, 左边空白, 右边空白)
        )
    ];

**宽度、高度、上边空白、左边空白、右边空白 , 可以使用浏览器的开发者工具查到**  

**如若不会查 , 可以使用以下方法**  
**宽度和高度可以直接使用截图软件进行测量**  
**上边空白可以一个一个试**  
**对于左右空白 , 置其中一个为0 , 一个一个试另外一个**  
**空白可以为负数**
