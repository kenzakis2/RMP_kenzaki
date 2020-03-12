/*:ja
 * @plugindesc メニューコマンドの画像化（動き有） - v1.01
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
 * @param icon itemrect
 * @desc アイコンの間隔
 * @type number
 * @min 0
 * @default 10
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
 * @param window background file
 * @desc メニューウィンドウの背景ファイル。空白でデフォルト仕様になります。
 * @type string
 * @default 
 * 
 * @param Symbol Chart
 * @desc シンボルと画像の対照表
 * @type struct<SymbolChart>[]
 * @default []
 * 
 * @param Item Data
 * @desc 各項目のアニメーションデータ（並び順はメニューと同じ）
 * @type struct<MenuItemData>[]
 * @default []
 *
 * @help kz_PicMenuEx.js
 * 
 * 使用する画像は全て img/system　フォルダ内に入れてください。
 *
 * □アイコン用画像…  symbol毎に用意下さい。サイズ、名前は任意です。
 *　　　　　　　　　　但しサイズがicon width/ icon heightで設定された
 *　　　　　　　　　　数値以上、以下の場合パラメータの数値サイズに
 *　　　　　　　　　　自動で縮小/拡大されます。
 *
 * □ウインドウ背景用画像…名称任意、パラメータ【window background file】
 *　 画像を使用しないがウインドウを透過したい場合は1 × 1 pixelの
 *　 透過画像を用意してその名前をパラメータに入れて下さい。
 *
 * □本体ver1.5.2以上の環境を想定しております、それ以下の環境下で
 *　 ご使用の場合何らかの不具合が出る可能性があります。　
 *
 * ■デフォルトsymbol名一覧
 * 　アイテム　…　item
 * 　スキル　　…　skill
 * 　装備　　　…　equip
 * 　ステータス…　status
 * 　並び替え　…　formation
 * 　オプション…　options
 * 　セーブ　　…　save
 * 　ゲーム終了…　gameEnd
 *
 * 別のプラグインで新しいコマンドを追加した場合
 * それらのsymbolを入力する事で同様に対応可能です。
 *
 * Special Thanks: サイリ(Twitter:sairi55)-アイデア発案、及びサンプル素材制作
 * 
 * 
 * 更新履歴
 * v1.01 - 1.6.0以前のバージョンで動かない問題を修正
 *
*/
/*~struct~SymbolChart:
 * @param symbol
 * @desc シンボル（item, skills等）
 * @type string
 * 
 * @param pic
 * @desc ピクチャ名
 * @type string
 * 
*/
/*~struct~MenuItemData:
 * 
 * @param startFrame
 * @desc 動き始めるフレーム数
 * @type number
 * @default 0
 * 
 * @param endFrame
 * @desc 動き終えるフレーム数
 * @type number
 * @default 0
 * 
 * @param x
 * @desc 始動時x座標(終着点を0とした場合の相対)
 * @type number
 * @min -99999
 * @default 0
 * 
 * @param y
 * @desc 始動時y座標(終着点を0とした場合の相対)
 * @type number
 * @min -99999
 * @default 0
 * 
 * @param alpha
 * @desc 始動時透明度(終着点は255)
 * @type number
 * @default 255
*/

(function () {

var parameters = PluginManager.parameters('kz_PicMenuEx');

var _cmdList = JSON.parse(parameters['Item Data']).map(
    function (e) {
        var newObj = JSON.parse(e);
        return newObj;
    }
) || [];

var _symbolList = JSON.parse(parameters['Symbol Chart']).map(
    function (e) {
        var newObj = JSON.parse(e);
        return newObj;
    }
) || [];

function findwithSameSymbol(array, element) {
    if (!array || !element) return undefined;

    for (var i = 0; i < array.length; i++) {
        if (array[i].symbol == element.symbol) return array[i];
    }

    return undefined;
}



var _MenuIconWidth = Number(parameters['icon width'] || 100);
var _MenuIconHeight = Number(parameters['icon height'] || 100);
var _IconitemRect = Number(parameters['icon itemrect'] || 10);
var _iconcols = Number(parameters['icon cols'] || 4);
var _MaxExpansion = Number(parameters['icon maxexpansion'] || 0.1);
var _xOverhead = Number(parameters['x overhead'] || 0);
var _yOverhead = Number(parameters['y overhead'] || 0);

var _CwindowX = Number(parameters['commandwindow x'] || 0);
var _CwindowY = Number(parameters['commandwindow y'] || 0);
var _CwindowWidth = Number(parameters['commandwindow width'] || 240);
var _CwindowHeight = Number(parameters['commandwindow height'] || 500);

var _cursorDisplay = eval(parameters['display cursor']);

var _windowBack = parameters['window background file'] || '';


var kz_Scene_Boot_loadSystemImages = Scene_Boot.loadSystemImages;
Scene_Boot.loadSystemImages = function () {
    kz_Scene_Boot_loadSystemImages.call(this);
    ImageManager.reserveSystem('MenuIcon');
};

var kz_Window_MenuCommand_prototype_initialize = Window_MenuCommand.prototype.initialize;
Window_MenuCommand.prototype.initialize = function (x, y) {
    this._commandSprites = [];
    kz_Window_MenuCommand_prototype_initialize.call(this, _CwindowX, _CwindowY);
    if (_windowBack != '') {
        this.setBackgroundType(2);
        this.createBackSprite();
    }
    this.makeCommandSprites();
    this.select(0);
};

Window_MenuCommand.prototype.createBackSprite = function () {
    this._backSprite = new Sprite();
    this._backSprite.bitmap = ImageManager.loadSystem(_windowBack);
    this.addChildToBack(this._backSprite);
};

Window_MenuCommand.prototype.drawItem = function (index) {
};

Window_MenuCommand.prototype.makeCommandSprites = function () {
    this._commandSprites = [];
    this.clearCommandList();
    this.makeCommandList();
    this._list.forEach(function(element, i){
        var symbolData = findwithSameSymbol(_symbolList, element);

        if (!symbolData)
        {
            console.log(element);
            console.log(_symbolList);
        }

        var sprite = new Sprite_MenuCommand(_cmdList[i], this.itemRect(i));
        sprite.bitmap = ImageManager.loadSystem(symbolData.pic);
        this._commandSprites.push(sprite);
        this.addChild(sprite);
    }, this);
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

Window_MenuCommand.prototype.maxCols = function () {
    return _iconcols;  //横列数
};

Window_MenuCommand.prototype.windowWidth = function () {
    return _CwindowWidth;   //横幅
};

Window_MenuCommand.prototype.windowHeight = function () {
    return _CwindowHeight;   //高さ
};

var kz_Window_MenuCommand_prototype_select = Window_MenuCommand.prototype.select;
Window_MenuCommand.prototype.select = function (index) {
    kz_Window_MenuCommand_prototype_select.call(this, index);
    this._commandSprites.forEach(function(element) {
        element.isSelected = false;
    }, this)

    if (index >= 0 && index < this._commandSprites.length) {
        this._commandSprites[index].isSelected = true;
    }
};

var kz_Window_MenuCommand_prototype_isCursorVisible = Window_MenuCommand.prototype.isCursorVisible
Window_MenuCommand.prototype.isCursorVisible = function () {
    if (!_cursorDisplay) {
        return false;
    }
    return kz_Window_MenuCommand_prototype_isCursorVisible.call(this);
};

var kz_Window_MenuCommand_prototype_processCursorMove = Window_MenuCommand.prototype.processCursorMove;
Window_MenuCommand.prototype.processCursorMove = function () {
    if (!this.isControlAllowed()) return;
    kz_Window_MenuCommand_prototype_processCursorMove.call(this);
};

var kz_Window_MenuCommand_prototype_processHandling = Window_MenuCommand.prototype.processHandling;
Window_MenuCommand.prototype.processHandling = function () {
    if (!this.isControlAllowed()) return;
    kz_Window_MenuCommand_prototype_processHandling.call(this);
};

Window_MenuCommand.prototype.isControlAllowed = function () {
    return !this._commandSprites.some(function (e) {
        return e.animeFrameCount >= 0;
    }, this)
};



function Sprite_MenuCommand() {
    this.initialize.apply(this, arguments);
}

Sprite_MenuCommand.prototype = Object.create(Sprite.prototype);
Sprite_MenuCommand.prototype.constructor = Sprite_MenuCommand;

Sprite_MenuCommand.prototype.initialize = function (cmdData, baseRect) {
    Sprite.prototype.initialize.call(this);
    this.baseRect = baseRect;
    this.cmdData = cmdData;
    this.animeFrameCount = 0;
    this.expansionCount = 0;

    this.x = Number(this.cmdData.x) + this.baseRect.x + Number(this.baseRect.height / 2);
    this.y = Number(this.cmdData.y) + this.baseRect.y + Number(this.baseRect.height / 2);
    this.opacity = Number(this.cmdData.alpha);
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
};

Sprite_MenuCommand.prototype.update = function () {
    Sprite.prototype.update.call(this);
    this.updateRectFit();
    this.updateSelected();
    this.updateAnimeMove();
};

Sprite_MenuCommand.prototype.updateRectFit = function () 
{
    if (!this.bitmap || !this.bitmap.isReady()) return;
    this.scale.x = _MenuIconWidth / this.bitmap.width;
    this.scale.y = _MenuIconHeight / this.bitmap.height;
}

Sprite_MenuCommand.prototype.updateSelected = function () {
    if (!this.parent.isControlAllowed()) return;  //移動中は拡縮なし

    if (!this.isSelected) {
        this.expansionCount = 0;
    }
    else {
        //選択されてる項目
        this.expansionCount++;
    }

    var expScale = 1 + Math.sin((this.expansionCount % 60) / 60 * Math.PI) * _MaxExpansion;
    this.scale.x *= expScale;
    this.scale.y *= expScale;
}

Sprite_MenuCommand.prototype.updateAnimeMove = function () {
    if (!this.baseRect) {
        this.visible = false;
        return;
    }

    var keyX = this.baseRect.x + this.baseRect.width / 2;
    var keyY = this.baseRect.y + this.baseRect.height / 2;

    if (this.animeFrameCount < 0) return;
    this.visible = true;

    if (this.animeFrameCount >= Number(this.cmdData.endFrame)) {
        this.x = keyX;
        this.y = keyY;
        this.opacity = 255;
        this.animeFrameCount = -1;
        return;
    }

    if (this.animeFrameCount >= Number(this.cmdData.startFrame)) {
        let frameLeft =  Number(this.cmdData.endFrame) - this.animeFrameCount;
        this.x += Math.round((keyX - this.x) / frameLeft);
        this.y += Math.round((keyY - this.y) / frameLeft);
        this.opacity += Math.round((255 - this.opacity) / frameLeft);
    }

    this.animeFrameCount ++;
}

})();