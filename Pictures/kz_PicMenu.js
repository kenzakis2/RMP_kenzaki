
/*:ja
 * @plugindesc メニューコマンドの画像化
 * @author 剣崎宗二
 *
 * @param icon width
 * @desc 画像アイコンの横幅
 * @type number
 * @min 0
 * @default 100
 *
 * @param icon height
 * @desc 画像アイコンの一つ辺りの縦幅
 * @type number
 * @min 0
 * @default 100
 *
 * @param item icon
 * @desc 「アイテム」に該当する画像アイコンのインデックス
 * @type number
 * @min 0
 * @default 0
 *
 * @param skill icon
 * @desc 「スキル」に該当する画像アイコンのインデックス
 * @type number
 * @min 0
 * @default 1
 *
 * @param equip icon
 * @desc 「装備」に該当する画像アイコンのインデックス
 * @type number
 * @min 0
 * @default 2
 *
 * @param status icon
 * @desc 「ステータス」に該当する画像アイコンのインデックス
 * @type number
 * @min 0
 * @default 3
 *
 * @param formation icon
 * @desc 「並び替え」に該当する画像アイコンのインデックス
 * @type number
 * @min 0
 * @default 4
 *
 * @param options icon
 * @desc 「オプション」に該当する画像アイコンのインデックス
 * @type number
 * @min 0
 * @default 5
 *
 * @param save icon
 * @desc 「セーブ」に該当する画像アイコンのインデックス
 * @type number
 * @min 0
 * @default 6
 *
 * @param gameEnd icon
 * @desc 「ゲーム終了」に該当する画像アイコンのインデックス
 * @type number
 * @min 0
 * @default 7
 *
 * @param icon itemrect
 * @desc アイコンの間隔
 * @type number
 * @min 0
 * @default 10
 *
 * @param icon rows
 * @desc アイコンを縦に並べる数
 * @type number
 * @min 1
 * @default 2 
 *
 * @param icon cols
 * @desc アイコンを横に並べる数
 * @type number
 * @min 1
 * @default 4 
 *
 * @param icon maxexpansion
 * @desc アイコンの拡縮率
 * @type number
 * @min 0
 * @decimals 2
 * @default 0.1
 *
 * @param x overhead
 * @desc アイコンを並べる開始位置x
 * @type number
 * @min 0
 * @default 0
 *
 * @param y overhead
 * @desc アイコンを並べる開始位置y
 * @type number
 * @min 0
 * @default 0
 *
 * @param commandwindow x
 * @desc コマンドウインドウの位置ｘ
 * @type number
 * @min 0
 * @default 0
 *
 * @param commandwindow y
 * @desc コマンドウインドウの位置y
 * @type number
 * @min 0
 * @default 0
 *
 * @param commandwindow width
 * @desc コマンドウインドウの幅
 * @type number
 * @min 0
 * @default 240
 *
 * @param commandwindow height
 * @desc コマンドウインドウの高さ
 * @type number
 * @min 0
 * @default 500
 * 
 * @param display cursor
 * @desc カーソルを表示/消去
 * @type boolean
 * @on YES
 * @off NO
 * @default true
 * 
 * @param Use different SelectedPic
 * @desc 選択されたアイコンにが違う画像に差し変わるか否か。Yesの場合MenuIconSelected.pngが必要になります。
 * @type boolean
 * @on YES
 * @off NO
 * @default true
 *
 * @param window background file
 * @desc メニューウィンドウの背景ファイル。空白でデフォルト仕様になります。
 * @type string
 * @default 
 *
 * @help kz_PicMenu.js
 * 
 * Special Thanks: サイリ(Twitter:sairi55)-アイデア発案、及びサンプル素材制作
 * 
 * 使用する画像は全て img/system　フォルダ内に入れてください。
 *
 * □アイコン用画像… MenuIcon.png 
 *　 サイズは任意ですが必ず【縦に等幅】でそれぞれのアイコンを用意して下さい。
 *
 * □ウインドウ背景用画像…名称任意、パラメータ【window background file】
 *　 画像を使用しないがウインドウを透過したい場合は1 × 1 pixelの
 *　 透過画像を用意してその名前をパラメータに入れて下さい。
 *
 *
 */


(function () {

    var parameters = PluginManager.parameters('kz_PicMenu');
    var _itemicon = Number(parameters['item icon'] || 0);
    var _skillicon = Number(parameters['skill icon'] || 1);
    var _equipicon = Number(parameters['equip icon'] || 2);
    var _statusicon = Number(parameters['status icon'] || 3);
    var _formationicon = Number(parameters['formation icon'] || 4);
    var _optionsicon = Number(parameters['options icon'] || 5);
    var _saveicon = Number(parameters['save icon'] || 6);
    var _endicon = Number(parameters['gameEnd icon'] || 7);

    var _cmdlistTxt = ['item:' + _itemicon, 'skill:' + _skillicon, 'equip:' + _equipicon, 'status:' + _statusicon, 'formation:' + _formationicon, 'options:' + _optionsicon, 'save:' + _saveicon, 'gameEnd:' + _endicon, 'default:-1'];
    //defaultは普段では使わない。リストにないアイコンが出た時の表示用！ Indexは0からカウント

    var _MenuIconWidth = Number(parameters['icon width'] || 100);
    var _MenuIconHeight = Number(parameters['icon height'] || 100);
    var _IconitemRect = Number(parameters['icon itemrect'] || 10);
    var _iconrows = Number(parameters['icon rows'] || 2);
    var _iconcols = Number(parameters['icon cols'] || 4);
    var _MaxExpansion = Number(parameters['icon maxexpansion'] || 0.1);
    var _xOverhead = Number(parameters['x overhead'] || 0);
    var _yOverhead = Number(parameters['y overhead'] || 0);

    var _CwindowX = Number(parameters['commandwindow x'] || 0);
    var _CwindowY = Number(parameters['commandwindow y'] || 0);
    var _CwindowWidth = Number(parameters['commandwindow width'] || 240);
    var _CwindowHeight = Number(parameters['commandwindow height'] || 500);

    var _cursorDisplay = eval(parameters['display cursor']);
    var _changeWhenSelected = eval(parameters['Use different SelectedPic']);

    var _windowBack = parameters['window background file'] || '';

    var _cmdlist = [];
    _cmdlistTxt.forEach(function (element) {
        var tArray = element.split(':');
        _cmdlist[tArray[0]] = Number(tArray[1]);
    });

    var kz_Scene_Boot_loadSystemImages = Scene_Boot.loadSystemImages;
    Scene_Boot.loadSystemImages = function () {
        kz_Scene_Boot_loadSystemImages.call(this);
        ImageManager.reserveSystem('MenuIcon');
        if (_changeWhenSelected)
        {
            ImageManager.reserveSystem('MenuIconSelected');
        }
    };

    var kz_Window_MenuCommand_prototype_initialize = Window_MenuCommand.prototype.initialize;
    Window_MenuCommand.prototype.initialize = function (x, y) {
        this.loadCommandIcon();
        kz_Window_MenuCommand_prototype_initialize.call(this, _CwindowX, _CwindowY);
        if (_windowBack != '') {
            this.setBackgroundType(2);
            this.createBackSprite();
        }
    };

    Window_MenuCommand.prototype.createBackSprite = function () {
        this._backSprite = new Sprite();
        this._backSprite.bitmap = ImageManager.loadSystem(_windowBack);
        this.addChildToBack(this._backSprite);
    };

    Window_MenuCommand.prototype.loadCommandIcon = function () {
        this.iconBitmap = ImageManager.loadSystem('MenuIcon');
        this.iconBitmapSelected = _changeWhenSelected ? ImageManager.loadSystem('MenuIconSelected') : null;
    };

    Window_MenuCommand.prototype.drawItem = function (index) {
        var rect = this.itemRect(index);
        var symbol = this.commandSymbol(index);
        var properIndex = _cmdlist[symbol] >= 0 ? _cmdlist[symbol] : _cmdlist['default'];
        var selected = (this.index() == index);
        if (properIndex >= 0);
        {
            this.drawMenuIcon(properIndex, rect.x, rect.y, selected)
        }
    };

    Window_MenuCommand.prototype.drawMenuIcon = function (iconIndex, x, y, selected) {
        var bitmap = (_changeWhenSelected && selected) ? this.iconBitmapSelected : this.iconBitmap;
        var pw = _MenuIconWidth;
        var ph = _MenuIconHeight;
        var sx = 0;
        var sy = iconIndex * ph;

        var dw = pw;
        var dh = ph;
        if (selected) {
            var expScale = 1 + Math.sin((this._stayCount % 60) / 60 * Math.PI) * _MaxExpansion;
            dw = Math.round(dw * expScale);
            dh = Math.round(dh * expScale);
            x += Math.round((pw - dw) / 2);
            y += Math.round((ph - dh) / 2);
        }

        this.contents.blt(bitmap, sx, sy, pw, ph, x, y, dw, dh);
    };

    Window_MenuCommand.prototype.itemWidth = function () {
        return _MenuIconWidth;
    };

    Window_MenuCommand.prototype.itemHeight = function () {
        return _MenuIconHeight;
    };


    kz_Window_MenuCommand_prototype_itemRect = Window_MenuCommand.prototype.itemRect;
    Window_MenuCommand.prototype.itemRect = function (index) {
        var rect = kz_Window_MenuCommand_prototype_itemRect.call(this, index);
        var maxCols = this.maxCols();
        rect.x += _xOverhead;
        rect.y = Math.floor(index / maxCols) * (rect.height + _IconitemRect) - this._scrollY + _yOverhead;
        return rect;
    };

    Window_MenuCommand.prototype.numVisibleRows = function () {
        return _iconrows;  //縦列数
    };

    Window_MenuCommand.prototype.maxCols = function () {
        return _iconcols;  //横列数
    };

    Window_MenuCommand.prototype.windowWidth = function () {
        return _CwindowWidth;   //横幅
    };

    Window_MenuCommand.prototype.windowHeight = function () {
        return _CwindowHeight;   //高さ
    };

    Window_MenuCommand.prototype.update = function () {
        Window_Selectable.prototype.update.call(this);
        this.refresh();
    };

    var kz_Window_MenuCommand_prototype_isCursorVisible = Window_MenuCommand.prototype.isCursorVisible
    Window_MenuCommand.prototype.isCursorVisible = function () {
        if (!_cursorDisplay) {
            return false;
        }
        return kz_Window_MenuCommand_prototype_isCursorVisible.call(this);
    };


})();
