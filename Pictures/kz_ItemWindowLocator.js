/*:ja
 * @plugindesc アイテム画面に於ける各ウィンドウ位置変更
 *
 * @param ---カテゴリ窓---
 * @default
 * 
 * @param Max Expansion
 * @parent ---カテゴリ窓---
 * @desc 画像が有効化された場合、これに1を足した倍数が最大拡大率。
 * @type number
 * @decimals 2
 * @default 0
 * 
 * @param MenuCategoryX
 * @parent ---カテゴリ窓---
 * @desc x位置。0ならデフォルト通り。
 * @type string
 * @default 0
 * 
 * @param MenuCategoryY
 * @parent ---カテゴリ窓---
 * @desc y位置。0ならデフォルト通り。
 * @type string
 * @default 0
 * 
 * @param MenuCategoryWidth
 * @parent ---カテゴリ窓---
 * @desc 横幅。0ならデフォルト通り。
 * @type string
 * @default 0
 * 
 * @param MenuCategoryHeight
 * @parent ---カテゴリ窓---
 * @desc 縦幅。0ならデフォルト通り。
 * @type string
 * @default 0
 * 
 * @param MenuCategoryXoverhead
 * @parent ---カテゴリ窓---
 * @desc  窓（文字）に対するウインドウ背景画像の相対座標X。
 * @type string
 * @default 0
 * 
 * @param MenuCategoryYoverhead
 * @parent ---カテゴリ窓---
 * @desc  窓（文字）に対するウインドウ背景画像の相対座標Y。
 * @type string
 * @default 0
 * 
 * @param MenuCategoryRows
 * @parent ---カテゴリ窓---
 * @desc 列数。
 * @type string
 * @default 0
 * 
 * @param MenuCategoryColumns
 * @parent ---カテゴリ窓---
 * @desc カラム数。
 * @type string
 * @default 0
 *
 * @param Cwindow background file
 * @parent ---カテゴリ窓---
 * @desc カテゴリウィンドウの背景ファイル。空白でデフォルト仕様。
 * @type string
 * @default 
 * 
 * @param ---リスト窓---
 * @default
 * 
 * @param MenuListX
 * @parent ---リスト窓---
 * @desc x位置。0ならデフォルト通り。
 * @type string
 * @default 0
 * 
 * @param MenuListY
 * @parent ---リスト窓---
 * @desc y位置。0ならデフォルト通り。
 * @type string
 * @default 0
 * 
 * @param MenuListWidth
 * @parent ---リスト窓---
 * @desc 横幅。0ならデフォルト通り。
 * @type string
 * @default 0
 * 
 * @param MenuListHeight
 * @parent ---リスト窓---
 * @desc 縦幅。0ならデフォルト通り。
 * @type string
 * @default 0
 * 
 * @param MenuListXoverhead
 * @parent ---リスト窓---
 * @desc  窓（文字）に対するウインドウ背景画像の相対座標X。
 * @type string
 * @default 0
 * 
 * @param MenuListYoverhead
 * @parent ---リスト窓---
 * @desc  窓（文字）に対するウインドウ背景画像の相対座標Y。
 * @type string
 * @default 0
 * 
 * @param MenuListRows
 * @parent ---リスト窓---
 * @desc 列数。
 * @type string
 * @default 0
 * 
 * @param MenuListColumns
 * @parent ---リスト窓---
 * @desc カラム数。
 * @type string
 * @default 0
 *
 * @param Lwindow background file
 * @parent ---リスト窓---
 * @desc リストウィンドウの背景ファイル。空白でデフォルト仕様。
 * @type string
 * @default 
 * 
 * @param ---ヘルプ窓---
 * @default
 * 
 * @param MenuHelpX
 * @parent ---ヘルプ窓---
 * @desc x位置。0ならデフォルト通り。
 * @type string
 * @default 0
 * 
 * @param MenuHelpY
 * @parent ---ヘルプ窓---
 * @desc y位置。0ならデフォルト通り。
 * @type string
 * @default 0
 * 
 * @param MenuHelpWidth
 * @parent ---ヘルプ窓---
 * @desc 横幅。0ならデフォルト通り。
 * @type string
 * @default 0
 * 
 * @param MenuHelpHeight
 * @parent ---ヘルプ窓---
 * @desc 縦幅。0ならデフォルト通り。
 * @type string
 * @default 0
 * 
 * @param Hwindow background file
 * @parent ---ヘルプ窓---
 * @desc ヘルプウィンドウの背景ファイル。空白でデフォルト仕様。
 * @type string
 * @default 
 * 
 * @param HelpXoverhead
 * @parent ---ヘルプ窓---
 * @desc 窓（文字）に対するウインドウ背景画像の相対座標X。
 * @type string
 * @default 
 * 
 * @param HelpYoverhead
 * @parent ---ヘルプ窓---
 * @desc 窓（文字）に対するウインドウ背景画像の相対座標Y。
 * @type string
 * @default 
 * 
 * @param HelpFontSize
 * @parent ---ヘルプ窓---
 * @desc フォントサイズ
 * @type number
 * @default 28
 * 
 * @param MenuListFontSize
 * @parent ---リスト窓---
 * @desc フォントサイズ
 * @type number
 * @default 28
 * 
 * @param MenuCategoryFontSize
 * @parent ---カテゴリ窓---
 * @desc フォントサイズor画像の配置間隔。
 * @type number
 * @default 28
 * 
 * @param Categories
 * @parent ---カテゴリ窓---
 * @desc カテゴリ名と条件
 * @type struct<CategoryDetail>[]
 * @default []
 * 
 * @param Use Picture Category
 * @parent ---カテゴリ窓---
 * @desc カテゴリ名に画像を使うか否か。
 * @type boolean
 * @default false
 * 
 * @param ---ピクチャ---
 * @default
 * 
 * @param PicWindowX
 * @parent ---ピクチャ---
 * @desc アイテムと連動する画像を表示する窓の座標X。
 * @type number
 * @min -99999
 * @default 0
 * 
 * @param PicWindowY
 * @parent ---ピクチャ---
 * @desc アイテムと連動する画像を表示する窓の座標Y。
 * @type number
 * @min -99999
 * @default 0
 * 
 * @param PicX
 * @parent ---ピクチャ---
 * @desc  窓に対する連動画像の相対座標X。
 * @type number
 * @min -99999
 * @default 0
 * 
 * @param PicY
 * @parent ---ピクチャ---
 * @desc  窓に対する連動画像の相対座標Y。
 * @type number
 * @min -99999
 * @default 0
 * 
 * @param Pic window background file
 * @parent ---ピクチャ---
 * @desc 画像ウィンドウの背景ファイル。空白で透明。（最前面に出ます）
 * @type string
 * @default 
 * 
 * @help このプラグインには、プラグインコマンドはありません。
 *
 * -----------------------------------------------------------
 * ■デフォルトのカテゴリを再現する名前と条件
 * 
 * name:アイテム
 * condition: DataManager.isItem(item) && item.itypeId === 1
 * 
 * name:武器
 * condition: DataManager.isWeapon(item)
 * 
 * name:防具
 * condition: DataManager.isArmor(item)
 * 
 * name:大切な物
 * condition: DataManager.isItem(item) && item.itypeId === 2
 * 
 * -----------------------------------------------------------
 * ■アイテムのカテゴリータイプ（item.itypeId）
 * 
 * 通常アイテム  ：1　　　武器：DataManager.isWeapon(item)
 * 大事なもの　　：2　　　防具：DataManager.isArmor(item)
 * 隠しアイテムＡ：3
 * 隠しアイテムＢ：4
 *
 * 個別にカテゴリを作る場合
 * アイテム、武器道具メモ欄に以下を記載します。
 * （装備品に関してはアイテムシーンのみのカテゴリ分けです）
 *
 * <○○:▲>　○=読み取る際の認識名　▲=カテゴリー名
 *
 * ----------------------------------------------------------- 
 * ■カテゴリーのパラメータ入力方法
 *
 * name： Use Picture Categoryが ON  の場合：画像名
 *　　　　　　　　　　　　　　　 OFF の場合：表示テキスト名
 *
 * Conditionの入力パターン例
 * 　全アイテム表示は true と入れて下さい。
 * 　全アイテムから特定のカテゴリを省きたい場合は
 *
 *　 例：武器だけ省く
 *　 item.itypeId && !DataManager.isWeapon(item)
 *
 *　 例：隠しアイテムＡとＢだけ省く（絞り込む）
 *　 item.itypeId && item.itypeId != 3 && item.itypeId != 4
 *
 *　 && ～と入れ続ければ複数のカテゴリを省けます。
 *　 逆に表示アイテムを追加したい場合は || でつなげます。
 *
 *　 例：通常アイテムと大事なものだけ表示
 *　　item.itypeId === 1 || item.itypeId === 2
 *
 *　 自作のカテゴリーを表示したい場合は以下の通りです。
 *
 *　 item.meta.○○ == '▲'
 *
 *
 * ----------------------------------------------------------- 
 * ■使用する画像について
 *
 * 各種ウインドウ背景、カテゴリー名アイコンの保存場所
 *
 * 　img/system
 *
 * アイテムと連動させる画像を使用する場合
 *
 *　 img/pictuers/　に Items フォルダを新規作成
 *　 またデータベースのアイテム、武器、防具のメモ欄に
 *　 以下のタグを記入して下さい。
 *
 *　　<item_image:対応画像名>
 *
 *
 * ----------------------------------------------------------- 
 * ■ヘルプウィンドウの書き方について
 *
 * \kで改行、但し戦闘時アイテムを使った場合に出るヘルプ
 * ウィンドウとは連動していませんのでご注意下さい。
 *
 * 入力例：使用：常時　\k効果：回復　\k売値：1Ｇ　
 *　　　　 説明欄。
 *　　　　 ↓
 *　　　　 --------------------------------------------------
 * 　　　：メニュー画面での出力例（windowHeight依存）
 *　　　　 使用：常時
 *　　　 　効果：回復
 *　　 　　売値：1Ｇ　
 *　 　　　説明欄。
 *　　　　 --------------------------------------------------
 *　　　　：戦闘時の出力例（強制二行）
 *　　　　 使用：常時　効果：回復　売値：1Ｇ　
 *　　　　 説明欄。
 *
 *
 */
/*~struct~CategoryDetail:
 * @param name
 * @desc カテゴリ名
 * @type string
 * 
 * @param condition
 * @desc 評価式（該当コマンド選択時、このアイテムが表示される）
 * @type string
 * 
*/
(function () {
    var parameters = PluginManager.parameters('kz_ItemWindowLocator');
    var _MaxExpansion = Number(parameters['Max Expansion']) || 0;
    var _mCX = parameters['MenuCategoryX'] || "0";
    var _mCY = parameters['MenuCategoryY'] || "0";
    var _mCW = parameters['MenuCategoryWidth'] || "0";
    var _mCH = parameters['MenuCategoryHeight'] || "0";

    var _mCXOverhead = parameters['MenuCategoryXoverhead'] || "0";
    var _mCYOverhead = parameters['MenuCategoryYoverhead'] || "0";

    var _mCR = parameters['MenuCategoryRows'] || "0";
    var _mCC = parameters['MenuCategoryColumns'] || "0";
    var _mCFontSize = Number(parameters['MenuCategoryFontSize']) || 28;

    var _mCList = JSON.parse(parameters['Categories']) || [];
    var _mCPicture = (parameters['Use Picture Category'] == 'true') || false
    var _CwindowBack = parameters['Cwindow background file'] || '';

    var _mLX = parameters['MenuListX'] || "0";
    var _mLY = parameters['MenuListY'] || "0";
    var _mLW = parameters['MenuListWidth'] || "0";
    var _mLH = parameters['MenuListHeight'] || "0";

    var _mLXOverhead = parameters['MenuListXoverhead'] || "0";
    var _mLYOverhead = parameters['MenuListYoverhead'] || "0";
    var _mLR = parameters['MenuListRows'] || "0";
    var _mLC = parameters['MenuListColumns'] || "0";

    var _LwindowBack = parameters['Lwindow background file'] || '';
    var _mLFontSize = Number(parameters['MenuListFontSize']) || 28;

    var _mHX = parameters['MenuHelpX'] || "0";
    var _mHY = parameters['MenuHelpY'] || "0";
    var _mHW = parameters['MenuHelpWidth'] || "0";
    var _mHH = parameters['MenuHelpHeight'] || "0";
    var _HwindowBack = parameters['Hwindow background file'] || '';
    var _mHXOverhead = parameters['HelpXoverhead'] || "0";
    var _mHYOverhead = parameters['HelpYoverhead'] || "0";
    var _mHFontSize = Number(parameters['HelpFontSize']) || 28;

    var _pWX = parameters['PicWindowX'] || "0";
    var _pWY = parameters['PicWindowY'] || "0";
    var _PX = parameters['PicX'] || 0;
    var _PY = parameters['PicY'] || 0;
    var _PwindowBack = parameters['Pic window background file'] || '';

    ImageManager.loadItemPic = function (filename, hue) {
        return this.loadBitmap('img/pictures/items/', filename, hue, false);
    }

    var kz_Scene_Item_prototype_create = Scene_Item.prototype.create;
    Scene_Item.prototype.create = function () {
        kz_Scene_Item_prototype_create.call(this);
        this.resetCategoryPos();
        this.resetListPos();
    };


    Scene_Item.prototype.createHelpWindow = function () {
        this._helpWindow = new Window_HelpEx();
        this.addWindow(this._helpWindow);
        this.resetHelpWindow();
    }

    Scene_Item.prototype.createCategoryWindow = function () {
        this._categoryWindow = new Window_ItemCategoryEx();
        this._categoryWindow.setHelpWindow(this._helpWindow);
        this._categoryWindow.y = this._helpWindow.height;
        this._categoryWindow.setHandler('ok', this.onCategoryOk.bind(this));
        this._categoryWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._categoryWindow);
    };

    Scene_Item.prototype.createItemWindow = function () {
        var wy = this._categoryWindow.y + this._categoryWindow.height;
        var wh = Graphics.boxHeight - wy;
        this._itemWindow = new Window_ItemListEx(0, wy, Graphics.boxWidth, wh);
        this._itemWindow.setHelpWindow(this._helpWindow);
        this._itemWindow.setHandler('ok', this.onItemOk.bind(this));
        this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
        this.addWindow(this._itemWindow);
        this._categoryWindow.setItemWindow(this._itemWindow);
    };

    Scene_Item.prototype.resetHelpWindow = function () {
        if (!this._helpWindow) return;

        this._helpWindow.x = eval(_mHX) || this._helpWindow.x;
        this._helpWindow.y = eval(_mHY) || this._helpWindow.y;
        this._helpWindow.width = eval(_mHW) || this._helpWindow.width;
        this._helpWindow.height = eval(_mHH) || this._helpWindow.height;
        this._helpWindow.createContents();
    };

    Scene_Item.prototype.resetCategoryPos = function () {
        this._categoryWindow.x = eval(_mCX) || this._categoryWindow.x;
        this._categoryWindow.y = eval(_mCY) || this._categoryWindow.y;
        this._categoryWindow.width = eval(_mCW) || this._categoryWindow.width;
        this._categoryWindow.height = eval(_mCH) || this._categoryWindow.height;
        this._categoryWindow.refresh();
        this._categoryWindow.select(0);
    };

    Scene_Item.prototype.resetListPos = function () {
        this._itemWindow.x = eval(_mLX) || this._itemWindow.x;
        this._itemWindow.y = eval(_mLY) || this._itemWindow.y;
        this._itemWindow.width = eval(_mLW) || this._itemWindow.width;
        this._itemWindow.height = eval(_mLH) || this._itemWindow.height;
        this._itemWindow.refresh();
    };

    function Window_ItemListEx() {
        this.initialize.apply(this, arguments);
    }

    Window_ItemListEx.prototype = Object.create(Window_ItemList.prototype);
    Window_ItemListEx.prototype.constructor = Window_ItemListEx;

    Window_ItemListEx.prototype.initialize = function (x, y, width, height) {
        Window_ItemList.prototype.initialize.call(this, x, y, width, height);
        if (_LwindowBack != '') {
            this.setBackgroundType(2);
            this.createBackSprite();
        }
        this.createItemPicture();
        this._category = 'false';
        this._data = [];
    };

    Window_ItemListEx.prototype.createBackSprite = function () {
        this._backSprite = new Sprite();
        this._backSprite.bitmap = ImageManager.loadSystem(_LwindowBack);
        this._backSprite.x = eval(_mLXOverhead);
        this._backSprite.y = eval(_mLYOverhead);
        this.addChildToBack(this._backSprite);
    };

    Window_ItemListEx.prototype.createItemPicture = function () {
        this.itemPicSprite = new Sprite();
        this.itemPicBackSprite = new Sprite();
        if (_PwindowBack) {
            this.itemPicBackSprite.bitmap = ImageManager.loadSystem(_PwindowBack);
        }
        this.addChild(this.itemPicBackSprite);
        this.itemPicBackSprite.addChild(this.itemPicSprite);

        this.itemPicSprite.x = _PX;
        this.itemPicSprite.y = _PY;
        this.itemPicBackSprite.x = _pWX;
        this.itemPicBackSprite.y = _pWY;
    };

    Window_ItemListEx.prototype.includes = function (item) {
        if (!item) return false;
        try {
            return eval(this._category);
        }
        catch (e) {
            console.log(e);
            return false;
        }
    };

    Window_ItemListEx.prototype.select = function (index) {
        Window_ItemList.prototype.select.call(this, index);
        this.refreshItemSprite();
    };

    Window_ItemListEx.prototype.refreshItemSprite = function () {
        if (!this.itemPicSprite) return;
        var item = this.item();
        if (item && item.meta.item_image) {
            this.itemPicSprite.bitmap = ImageManager.loadItemPic(item.meta.item_image);
        }
        else {
            this.itemPicSprite.bitmap = null;
        }
    };

    Window_ItemListEx.prototype.standardFontSize = function () {
        return _mLFontSize;
    };

    Window_ItemListEx.prototype.maxCols = function () {
        return eval(_mLC);
    };

    Window_ItemListEx.prototype.numVisibleRows = function () {
        return eval(_mLR);
    };


    function Window_ItemCategoryEx() {
        this.initialize.apply(this, arguments);
    }

    Window_ItemCategoryEx.prototype = Object.create(Window_ItemCategory.prototype);
    Window_ItemCategoryEx.prototype.constructor = Window_ItemCategoryEx;

    Window_ItemCategoryEx.prototype.initialize = function () {
        Window_ItemCategory.prototype.initialize.call(this);
        if (_CwindowBack != '') {
            this.setBackgroundType(2);
            this.createBackSprite();
        }
    };
    Window_ItemCategoryEx.prototype.createBackSprite = function () {
        this._backSprite = new Sprite();
        this._backSprite.bitmap = ImageManager.loadSystem(_CwindowBack);
        this._backSprite.x = eval(_mCXOverhead);
        this._backSprite.y = eval(_mCYOverhead);
        this.addChildToBack(this._backSprite);
    };

    Window_ItemCategoryEx.prototype.createCategorySprites = function () {
        this._categorySprites = [];
        _mCList.forEach(function (element) {
            var oElement = JSON.parse(element);
            var bmp = ImageManager.loadSystem(oElement.name);
            var sprite = new Sprite(bmp);
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            this._categorySprites.push(sprite);
            this.addChild(sprite);
        }, this);
    }

    Window_ItemCategoryEx.prototype.lineHeight = function () {
        return this.standardFontSize() + 6;
    };

    Window_ItemCategoryEx.prototype.update = function () {
        Window_ItemCategory.prototype.update.call(this);
        if (this._itemWindow) {
            this._itemWindow.setCategory(this.currentSymbol());
        }
        this.updateCategorySprite();
    };

    Window_ItemCategoryEx.prototype.makeCommandList = function () {
        _mCList.forEach(function (element) {
            var oElement = JSON.parse(element);
            this.addCommand(oElement.name, oElement.condition);
        }, this);
    };

    Window_ItemCategoryEx.prototype.maxCols = function () {
        return eval(_mCR);
    };

    Window_ItemCategoryEx.prototype.numVisibleRows = function () {
        return eval(_mCC);
    };

    Window_ItemCategoryEx.prototype.drawItem = function (index) {
        if (_mCPicture) {
            this.positionCategorySprite(index);
        }
        else {
            Window_ItemCategory.prototype.drawItem.call(this, index);
        }
    };

    Window_ItemCategoryEx.prototype.positionCategorySprite = function (index) {
        if (!this._categorySprites) {
            this.createCategorySprites();
        }

        var rect = this.itemRectForText(index);
        this._categorySprites[index].x = (rect.x + rect.width) / 2;
        this._categorySprites[index].y = (rect.y + rect.height) / 2;
        this.updateCategorySprite()
    }

    Window_ItemCategoryEx.prototype.updateCategorySprite = function (index) {
        var index = this.index()
        if (!this._categorySprites || !this._categorySprites[index])
            return;

        for (var i = 0; i < this._categorySprites.length; i++) {
            if (i == index) {
                var expScale = 1 + Math.sin((this._stayCount % 60) / 60 * Math.PI) * _MaxExpansion;
                console.log(expScale);
                this._categorySprites[i].scale.x = expScale;
                this._categorySprites[i].scale.y = expScale;
            }
            else {
                if (!this._categorySprites[i]) continue;

                this._categorySprites[i].scale.x = 1;
                this._categorySprites[i].scale.y = 1;
            }
        }
    }

    var kz_Window_ItemCategoryEx_prototype_isCursorVisible = Window_ItemCategoryEx.prototype.isCursorVisible;
    Window_ItemCategoryEx.prototype.isCursorVisible = function() {
        if (_mCPicture) return false;
        return kz_Window_ItemCategoryEx_prototype_isCursorVisible.call(this);
    };

    Window_ItemCategoryEx.prototype.standardFontSize = function () {
        return _mCFontSize;
    };

    function Window_HelpEx() {
        this.initialize.apply(this, arguments);
    }

    Window_HelpEx.prototype = Object.create(Window_Help.prototype);
    Window_HelpEx.prototype.constructor = Window_HelpEx;

    Window_HelpEx.prototype.initialize = function (numLines) {
        Window_Help.prototype.initialize.call(this, numLines);
        if (_HwindowBack != '') {
            this.setBackgroundType(2);
            this.createBackSprite();
        }
    };

    Window_HelpEx.prototype.createBackSprite = function () {
        this._backSprite = new Sprite();
        this._backSprite.bitmap = ImageManager.loadSystem(_HwindowBack);
        this.addChildToBack(this._backSprite);
    };

    Window_HelpEx.prototype.processEscapeCharacter = function (code, textState) {
        switch (code) {
            case 'K':
                this.processNewLineNoForward(textState);
                break;
            default:
                Window_Help.prototype.processEscapeCharacter.call(this, code, textState);
                break;
        }
    };

    Window_HelpEx.prototype.processNewLineNoForward = function (textState) {
        textState.x = textState.left;
        textState.y += textState.height;
        textState.height = this.calcTextHeight(textState, false);
    };

    Window_HelpEx.prototype.refresh = function () {
        this.contents.clear();
        this.drawTextEx(this._text, eval(_mHXOverhead), eval(_mHYOverhead));
    };

    Window_HelpEx.prototype.standardFontSize = function () {
        return _mHFontSize;
    };


})();