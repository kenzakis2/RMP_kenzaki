/*:ja
 * @plugindesc オプション改変
 * @author Souji Kenzaki / Documented by Sairi
 *
 * @param Options
 * @desc オプションに出す項目の一覧
 * @type struct<OptionDetail>[]
 * @default []
 * 
 * @param barBitmap
 * @desc バーのゲージ画像名
 * @type string
 * @default OPbar
 * 
 * @param dialBitmap
 * @desc バーのツマミ部分画像名
 * @type string
 * @default OPdial
 * 
 * @param buttonBitmapOnL
 * @desc スイッチ項目の左ボタンが「ON」時の画像名
 * @type string
 * @default OPon
 * 
 * @param buttonBitmapOffL
 * @desc スイッチ項目の左ボタンが「OFF」時の画像名
 * @type string
 * @default OPoff
 * 
 * @param buttonBitmapOnR
 * @desc スイッチ項目の右ボタンが「ON」時画像名
 * @type string
 * @default OPon
 * 
 * @param buttonBitmapOffR
 * @desc スイッチ項目の右ボタンが「OFF」時の画像名
 * @type string
 * @default OPoff
 * 
 * @param textOverhead
 * @desc 項目全体の開始位置
 * @type number
 * @default 10
 * 
 * @param barOverhead
 * @desc バーの開始位置
 * @type number
 * @default 10
 * 
 * @param statusTextWidth
 * @desc バー項目の右手に出る現在の値表示の幅、ゲージとの間隔を調整します。
 * @type number
 * @default 50
 * 
 * @param titleTextWidth
 * @desc 項目テキストの幅
 * @type number
 * @default 50
 * 
 * @param WindowX
 * @desc ウインドウのx位置
 * @type number
 * @min -9999
 * @default 0
 * 
 * @param WindowY
 * @desc ウインドウのy位置
 * @type number
 * @min -9999
 * @default 0
 * 
 * @param WindowWidth
 * @desc ウインドウの横幅。0ならデフォルト通り
 * @type number
 * @default 0
 * 
 * @param WindowHeight
 * @desc ウインドウの縦幅。0ならデフォルト通り
 * @type number
 * @default 0
 * 
 * @param WindowXoverhead
 * @desc ウインドウに対する画像or文字の相対座標X
 * @type number
 * @min -9999
 * @default 0
 * 
 * @param WindowYoverhead
 * @desc ウインドウに対する画像or文字の相対座標Y
 * @type number
 * @min -9999
 * @default 0
 * 
 * @param WindowBack
 * @desc 背景名。空白の場合デフォルト。
 * @type string
 * @default 
 * 
 */
/*~struct~OptionDetail:
 * @param name
 * @desc オプション名（オプション画面に表示されるもの）
 * @type string
 * 
 * @param data
 * @desc このオプションによって変更される値(ConfigManager.bgmVolume等)。同じものが2つ以上あるとエラーになりますのでご注意ください。
 * @type string
 * 
 * @param isNumberType
 * @desc ボタン（true/false値）かバー(数値)か
 * @on 数値
 * @off ボタン
 * @type boolean
 * 
 * @param typeMin
 * @desc 数値バー時のみ有効。最小値
 * @type number
 * 
 * @param typeMax
 * @desc 数値バー時のみ有効。最大値
 * @type number
 * 
 * @param keyStep
 * @desc 数値バー時のみ有効。1押しごとの変動値
 * @type number
 * 
 * @param condition
 * @desc 評価値がtrueの場合のみこの項目を表示。メニュー表示の瞬間のみ有効で、他の項目に依存して動的に表示変更は出来ないので注意！
 * @type string
 * @default true
 * 
 * @help このプラグインには、プラグインコマンドはありません。
 *
 *  ■デフォルト項目一覧
 *　is Number Type（false）のスイッチ項目
 *
 *　　name　　　　　-　data
 *　*----------------------------------------------
 *  　常時ダッシュ　-　ConfigManager.alwaysDash
 *　　コマンド記憶　-　ConfigManager.commandRemember
 *
 *　is Number Type（true）
 *　type min = 0　max = 100　keystep = 20　のバー項目
 *
 *　　name　　　　　-　data
 *　*----------------------------------------------
 *  　ＢＧＭ音量　　-　ConfigManager.bgmVolume
 *　　ＢＧＳ音量　　-　ConfigManager.bgsVolume
 *　　ＭＥ音量　　　-　ConfigManager.meVolume
 *　　ＳＥ音量　　　-　ConfigManager.seVolume
 *
 *
 * 画像ファイルは img/system に置いてください。
 *
 * タイトル画面で此方の内容を変更した場合でも、独自変数、
 * 及びスイッチの項目はゲームがスタートした時点で初期化されます。
 *
*/

//bitmap系すべて拡張子抜き
(function () {
    var parameters = PluginManager.parameters('kz_OptionCustomize');
    var barBitmap = parameters['barBitmap'] || "OPbar";//バー本体の名前。
    var dialBitmap = parameters['dialBitmap'] || "OPdial"; //ツマミの名前。
    var buttonBitmapOnL = parameters['buttonBitmapOnL'] || "OPon"; //ボタンONの名前。
    var buttonBitmapOffL = parameters['buttonBitmapOffL'] || "OPoff"; //ボタンOFFの名前
    var buttonBitmapOnR = parameters['buttonBitmapOnR'] || "OPon"; //ボタンONの名前。
    var buttonBitmapOffR = parameters['buttonBitmapOffR'] || "OPoff"; //ボタンOFFの名前

    var textOverhead = Number(parameters['textOverhead']) || 10; 
    var barOverhead = Number(parameters['barOverhead']) || 10; 
    var statusTextWidth = Number(parameters['statusTextWidth']) || 50; 
    var titleTextWidth = Number(parameters['titleTextWidth']) || 50; 

    var _wX = Number(parameters['WindowX']) || 0; 
    var _wY = Number(parameters['WindowY']) || 0; 
    var _wW = Number(parameters['WindowWidth']) || 0; 
    var _wH = Number(parameters['WindowHeight']) || 0; 
    var _wOX = Number(parameters['WindowXoverhead']) || 0; 
    var _wOY = Number(parameters['WindowYoverhead']) || 0; 
    var _OWBack = String(parameters['WindowBack']) || ""; 

    var optionList = JSON.parse(parameters['Options']).map(
        function (e) {
            var newObj = JSON.parse(e);
            newObj.isNumberType = eval(newObj.isNumberType);
            newObj.typeMin = eval(newObj.typeMin);
            newObj.typeMax = eval(newObj.typeMax);
            newObj.keyStep = eval(newObj.keyStep);
            return newObj;
        }
    ) || [];

    var kz_Scene_Boot_loadSystemImages = Scene_Boot.loadSystemImages;
    Scene_Boot.loadSystemImages = function () {
        kz_Scene_Boot_loadSystemImages.call(this);
        ConfigManager.barBitmap = ImageManager.loadSystem(barBitmap);
        ConfigManager.dialBitmap = ImageManager.loadSystem(dialBitmap);
        ConfigManager.buttonBitmapOnL = ImageManager.loadSystem(buttonBitmapOnL);
        ConfigManager.buttonBitmapOffL = ImageManager.loadSystem(buttonBitmapOffL);
        ConfigManager.buttonBitmapOnR = ImageManager.loadSystem(buttonBitmapOnR);
        ConfigManager.buttonBitmapOffR = ImageManager.loadSystem(buttonBitmapOffR);
    };

    var kz_Window_Options_prototype_initialize = Window_Options.prototype.initialize;
    Window_Options.prototype.initialize = function () {
        kz_Window_Options_prototype_initialize.call(this);
        console.log(_OWBack);
        if (_OWBack != '') {
            this.setBackgroundType(2);
            this.createBackSprite();
        }
    };

    Window_Options.prototype.createBackSprite = function () {
        this._backSprite = new Sprite();
        console.log(_OWBack);
        this._backSprite.bitmap = ImageManager.loadSystem(_OWBack);
        this._backSprite.x = _wOX;
        this._backSprite.y = _wOY;
        console.log(this._backSprite)
        this.addChildToBack(this._backSprite);
    };

    var kz_Window_Options_prototype_windowWidth = Window_Options.prototype.windowWidth;
    Window_Options.prototype.windowWidth = function() {
        return _wW || kz_Window_Options_prototype_windowWidth.call(this);
    };
    
    var kz_Window_Options_prototype_windowHeight = Window_Options.prototype.windowHeight;
    Window_Options.prototype.windowHeight = function() {
        return _wH || kz_Window_Options_prototype_windowHeight.call(this);
    };
    
    Window_Options.prototype.updatePlacement = function() {
        this.x = _wX
        this.y = _wY
    };

    Window_Options.prototype.drawItem = function (index) {
        var rect = this.itemRectForText(index);
        var statusWidth = this.statusWidth();
        var titleWidth = titleTextWidth;
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawText(this.commandName(index), rect.x, rect.y, titleWidth, 'left');

        var symbol = this.commandSymbol(index);
        var newRect = JsonEx.makeDeepCopy(rect);
        newRect.x = rect.x + titleWidth + textOverhead;
        newRect.width = rect.width - statusWidth - titleWidth - textOverhead;
        if (this.isVolumeSymbol(symbol)) {
            newRect.x += barOverhead;
            newRect.width -= barOverhead;
            this.drawDragBar(index, newRect);
            var ex = newRect.x + newRect.width;
            this.drawText(this.statusText(index), ex, rect.y, statusWidth, 'right');
        }
        else {
            this.drawOnOffButton(index, newRect);
        }
    };

    Window_Options.prototype.drawDragBar = function (index, graphicRect) {
        var symbol = this.commandSymbol(index);
        var t = this.findSymbolFromList(symbol);
        var value = (this.getConfigValue(symbol) - t.typeMin) / t.typeMax;
        var barBitmapObject = ConfigManager.barBitmap;
        var dialBitmapObject = ConfigManager.dialBitmap;
        this.contents.blt(barBitmapObject, 0, 0, barBitmapObject.width, barBitmapObject.height, graphicRect.x, graphicRect.y, graphicRect.width, graphicRect.height);
        this.contents.blt(dialBitmapObject, 0, 0, dialBitmapObject.width, dialBitmapObject.height, (graphicRect.x + graphicRect.width * value - dialBitmapObject.width / 2), graphicRect.y);
    }

    Window_Options.prototype.drawOnOffButton = function (index, graphicRect) {
        var symbol = this.commandSymbol(index);
        var value = this.getConfigValue(symbol);
        var buttonBitmapObjectL = null;
        var buttonBitmapObjectR = null;
        if (value) {
            buttonBitmapObjectL = ConfigManager.buttonBitmapOnL;
            buttonBitmapObjectR = ConfigManager.buttonBitmapOffR;
        }
        else {
            buttonBitmapObjectL = ConfigManager.buttonBitmapOffL;
            buttonBitmapObjectR = ConfigManager.buttonBitmapOnR;
        }
        this.contents.blt(buttonBitmapObjectL, 0, 0, buttonBitmapObjectL.width, buttonBitmapObjectL.height, graphicRect.x, graphicRect.y, buttonBitmapObjectL.width, buttonBitmapObjectL.height);
        this.contents.blt(buttonBitmapObjectR, 0, 0, buttonBitmapObjectR.width, buttonBitmapObjectR.height, graphicRect.x + buttonBitmapObjectL.width, graphicRect.y, buttonBitmapObjectR.width, buttonBitmapObjectR.height);
    }


    Window_Options.prototype.changeBarValue = function (symbol, index, x) {
        var rect = this.itemRectForText(index);
        var statusWidth = this.statusWidth();
        var titleWidth = titleTextWidth;
        rect.x = rect.x + titleWidth
        rect.width = rect.width - statusWidth - titleWidth;

        var t = this.findSymbolFromList(symbol);

        var value = (t.typeMax - t.typeMin) * (x - rect.x) / rect.width + t.typeMin;
        value = value.clamp(t.typeMin, t.typeMax)
        this.changeValue(symbol, Math.round(value));
    }

    Window_Options.prototype.makeCommandList = function () {
        optionList.forEach(function (element) {
            if (this.isDisplayableSymbol(element.data)) {
                this.addCommand(element.name, element.data);
            }
        }, this);
    };


    Window_Options.prototype.onTouch = function (triggered) {
        var lastIndex = this.index();
        var x = this.canvasToLocalX(TouchInput.x);
        var y = this.canvasToLocalY(TouchInput.y);
        var hitIndex = this.hitTest(x, y);
        if (hitIndex >= 0) {
            var symbol = this.commandSymbol(hitIndex);
            if (this.isVolumeSymbol(symbol)) {
                this.changeBarValue(symbol, hitIndex, x);
            }
            else if (hitIndex === this.index()) {
                if (triggered && this.isTouchOkEnabled()) {
                    this.processOk();
                }
            }
            else if (this.isCursorMovable()) {
                this.select(hitIndex);
            }
        } else if (this._stayCount >= 10) {
            if (y < this.padding) {
                this.cursorUp();
            } else if (y >= this.height - this.padding) {
                this.cursorDown();
            }
        }
        if (this.index() !== lastIndex) {
            SoundManager.playCursor();
        }
    };

    Window_Options.prototype.findSymbolFromList = function (symbol) {
        return optionList.find(function (element) {
            return element.data == symbol;
        }, this);
    };


    Window_Options.prototype.statusText = function (index) {
        var symbol = this.commandSymbol(index);
        var value = this.getConfigValue(symbol);
        if (this.isVolumeSymbol(symbol)) {
            return value;
        } else {
            return this.booleanStatusText(value);
        }
    };

    Window_Options.prototype.isVolumeSymbol = function (symbol) {
        var targetOption = this.findSymbolFromList(symbol);
        return targetOption.isNumberType;
    };

    Window_Options.prototype.isDisplayableSymbol = function (symbol) {
        var targetOption = this.findSymbolFromList(symbol);
        return eval(targetOption.condition);
    };

    Window_Options.prototype.processOk = function () {
        var index = this.index();
        var symbol = this.commandSymbol(index);
        var value = this.getConfigValue(symbol);
        var t = this.findSymbolFromList(symbol);

        if (this.isVolumeSymbol(symbol)) {
            value += this.volumeOffset(symbol);
            value = value.clamp(t.typeMin, t.typeMax);
            this.changeValue(symbol, value);
        } else {
            this.changeValue(symbol, !value);
        }
        SoundManager.playCursor();
    };

    Window_Options.prototype.cursorRight = function (wrap) {
        var index = this.index();
        var symbol = this.commandSymbol(index);
        var value = this.getConfigValue(symbol);
        var t = this.findSymbolFromList(symbol);

        if (this.isVolumeSymbol(symbol)) {
            value += this.volumeOffset(symbol);
            value = value.clamp(t.typeMin, t.typeMax);
            this.changeValue(symbol, value);
        } else {
            this.changeValue(symbol, false);
        }
        SoundManager.playCursor();
    };

    Window_Options.prototype.cursorLeft = function (wrap) {
        var index = this.index();
        var symbol = this.commandSymbol(index);
        var value = this.getConfigValue(symbol);
        var t = this.findSymbolFromList(symbol);

        if (this.isVolumeSymbol(symbol)) {
            value -= this.volumeOffset(symbol);
            value = value.clamp(t.typeMin, t.typeMax);
            this.changeValue(symbol, value);
        } else {
            this.changeValue(symbol, true);
        }
        SoundManager.playCursor();
    };

    Window_Options.prototype.changeValue = function (symbol, value) {
        var lastValue = this.getConfigValue(symbol);
        if (lastValue !== value) {
            this.setConfigValue(symbol, value);
            this.redrawItem(this.findSymbol(symbol));
        }
    };

    Window_Options.prototype.getConfigValue = function (symbol) {
        var tResult = eval(symbol);
        if (!tResult) {
            if (this.isVolumeSymbol(symbol)) {
                var t = this.findSymbolFromList(symbol);
                return t.typeMin;
            }
            else {
                return false;
            }
        }
        return tResult;
    };

    Window_Options.prototype.setConfigValue = function (symbol, volume) {
        eval(symbol + '=' + volume);
    };

    Window_Options.prototype.volumeOffset = function (symbol) {
        var t = this.findSymbolFromList(symbol);
        return t.keyStep;
    };

    Window_Options.prototype.statusWidth = function() {
        return statusTextWidth;
    };
})();