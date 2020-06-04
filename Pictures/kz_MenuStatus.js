/*:ja
 * @plugindesc メニューステータスの自由設置 - v1.01
 * @author 剣崎宗二
 *
 * @param Status Rows
 * @desc キャラを縦に並べる数。
 * @type number
 * @min 1
 * @default 4
 *
 * @param Status Cols
 * @desc キャラを横に並べる数。
 * @type number
 * @min 1
 * @default 1
 * 
 * @param Status Window X
 * @desc メニューステータスのX（-1の場合はデフォルト動作)。
 * @type number
 * @min -1
 * @default -1
 *
 * @param Status Window Y
 * @desc メニューステータスのY（-1の場合はデフォルト動作)。
 * @type number
 * @min -1
 * @default -1
 * 
 * @param Status Window Width
 * @desc メニューステータスの横幅（-1の場合はデフォルト動作)。
 * @type number
 * @min -1
 * @default 300
 *
 * @param Status Window Height
 * @desc メニューステータスの縦幅（-1の場合はデフォルト動作)。
 * @type number
 * @min -1
 * @default 600
 * 
 * @param Status Window Padding
 * @desc メニューウィンドウの外周白地のサイズ。
 * @type number
 * @min 0
 * @default 18
 * 
 * @param State X
 * @desc ステートアイコンエリアの相対座標のX。
 * @type number
 * @default 0
 * 
 * @param State Y
 * @desc ステートアイコンエリアの相対座標のY。
 * @type number
 * @default 0
 * 
 * @param State Width
 * @desc ステートアイコンエリアの横幅。マイナス値の場合アイコンは表示されない。
 * @type number
 * @min -1
 * @default 144
 * 
 * @param Actor Icon X
 * @desc アクターアイコンのX。Yとどちらかがマイナスだった場合、表示されない。
 * @type number
 * @min -1
 * @default -1
 * 
 * @param Actor Icon Y
 * @desc アクターアイコンのY。Xとどちらかがマイナスだった場合、表示されない
 * @type number
 * @min -1
 * @default -1
 * 
 * @param Background PNG
 * @desc メニューウィンドウの背景ファイル。Systemフォルダ内。この欄が空白でデフォルト状態。
 * @type string
 * @default 
 * 
 * @param Display Text
 * @desc 表示するテキスト。,区切りで 内容,x,y,横幅,文字サイズ,文字色ID,アウトライン色ID,フォント名 。値がなければデフォルト。
 * @type string[]
 * @default ["a.name(),10,10,30","a.mhp,40,10,30,38,10,,10"]
 * 
 * @param Display Picture
 * @desc 表示するピクチャ、複数指定可でpicturesフォルダ内。,区切りで ピクチャ名,x,y 。
 * @type string[]
 * @default ["a.actor().meta.stand_picture,10,10,30"]
 * 
 * @param Display Gauge
 * @desc 表示するゲージ。,区切りで 変動値,最大値,x,y,ゲージ幅,実体色ID,背景色ID。
 * @type string[]
 * @default ["a.mp,a.mmp,10,40,70,20,21"]
 *
 * @help kz_MenuStatus.js
 * ■使用する画像は全て任意の名前が使えます。
 *　 各パラメータにある配置箇所に注意して下さい。
 * ■表示テキスト、及びゲージの現在値/最大値には a.hp や a.atk などの他、
 *　 変数やメモの値といった様々なデータが記載できます。 
 * ■Display TextとDisplay GaugeにあるIDとはwindow.pngのカラーパレット
 *　 インデックスです。変更する場合は0から数えて記載して下さい。　
 * ■テキストに制御文字は使えませんので、アイコンなどを表示したい場合
 *　 画像としてDisplay Pictureに指定して下さい。
 *
 * ■フォントを変えた場合、一度の読み込みでは表示されない可能性があります。
 *　 他のフォントロード系プラグインなどでカバーする事を推奨します。
 * 
 * ■読み取るメモについて（●.meta.○）
 *　 ●の箇所で場所を指定　a.actor()　　　  ＝アクター
 * 　 　　　　　　　　　　　a.currentClass() ＝クラス　　　など 
 *　 ○は値の名前なので分かりやすい名前にしてください。 　 
 *
 *
 * 更新履歴
 * v1.01 - 事前ロードを行うように改変
 */

(function () {
    var parameters = PluginManager.parameters('kz_MenuStatus');
    var _rows = Number(parameters['Status Rows'] || 4);
    var _cols = Number(parameters['Status Cols'] || 1);
    var _wX = Number(parameters['Status Window X'] || -1);
    var _wY = Number(parameters['Status Window Y'] || -1);
    var _wWidth = Number(parameters['Status Window Width'] || -1);
    var _wHeight = Number(parameters['Status Window Height'] || -1);
    var _wPadding = Number(parameters['Status Window Padding'] || 0);
    var _wBackground = String(parameters['Background PNG'] || '');

    var _faceX = Number(parameters['Actor Icon X'] || -1);
    var _faceY = Number(parameters['Actor Icon Y'] || -1);

    var _stateX = Number(parameters['State X'] || 0);
    var _stateY = Number(parameters['State Y'] || 0);
    var _stateWidth = Number(parameters['State Width'] || 144);

    var _dTextArray = eval(parameters['Display Text']) || [];
    var _dPicArray = eval(parameters['Display Picture']) || [];
    var _dGaugeArray = eval(parameters['Display Gauge']) || [];

    var kz_Scene_Menu_prototype_create = Scene_Menu.prototype.create;
    Scene_Menu.prototype.create = function () {
        kz_Scene_Menu_prototype_create.call(this);
        _dPicArray.forEach(function (line) {
            $gameParty.members().forEach(function (a) {
                var dataArray = line.split(',');
                var value = eval(dataArray[0]);
                ImageManager.reservePicture(value);
            }, this);
        }, this);
    };

    var kz_Window_MenuStatus_prototype_initialize = Window_MenuStatus.prototype.initialize;
    Window_MenuStatus.prototype.initialize = function (x, y) {
        var fx = _wX >= 0 ? _wX : x;
        var fy = _wY >= 0 ? _wY : y;
        kz_Window_MenuStatus_prototype_initialize.call(this, fx, fy);
        if (_wBackground != '') {
            this.setBackgroundType(2);
            this.createBackSprite();
        }
    };

    Window_MenuStatus.prototype.createBackSprite = function () {
        this._backSprite = new Sprite();
        this._backSprite.bitmap = ImageManager.loadSystem(_wBackground);
        this.addChildToBack(this._backSprite);
    };

    Window_MenuStatus.prototype.windowWidth = function () {
        return _wWidth >= 0 ? _wWidth : Graphics.boxWidth - 240;
    };

    Window_MenuStatus.prototype.windowHeight = function () {
        return _wHeight >= 0 ? _wHeight : Graphics.boxHeight;
    };

    Window_MenuStatus.prototype.maxPageRows = function () {
        return _rows;
    };

    Window_MenuStatus.prototype.maxCols = function () {
        return _cols;
    };

    Window_MenuStatus.prototype.itemHeight = function () {
        return this.windowHeight() / this.maxPageRows();
    };

    Window_MenuStatus.prototype.drawItem = function (index) {
        var a = $gameParty.members()[index];
        if (!a) return;

        this.drawStatusPicture(index);
        if (_faceX >= 0 && _faceY >= 0) {
            var rect = this.itemRect(index);
            this.drawActorFace(a, rect.x + _faceX, rect.y + _faceY, Window_Base._faceWidth, Window_Base._faceHeight);
        }
        this.drawStatusGauge(index);
        this.drawStatusState(index);
        this.drawStatusText(index);
    };

    Window_MenuStatus.prototype.drawStatusText = function (index) {
        var a = $gameParty.members()[index];
        var rect = this.itemRect(index);

        _dTextArray.forEach(function (line) {
            var dataArray = line.split(',');
            var value = eval(dataArray[0]);
            var x = Number(dataArray[1]) + rect.x;
            var y = Number(dataArray[2]) + rect.y;
            var width = Math.min(rect.width - Number(dataArray[1]), Number(dataArray[3]));
            var fontSize = Number(dataArray[4]);
            var textColor = Number(dataArray[5]);
            var outlineColor = Number(dataArray[6]);
            var fontFace = dataArray[7];


            var currentOutlineColor = this.contents.outlineColor;
            if (fontFace) { this.contents.fontFace = fontFace; }
            if (textColor >= 0) { this.changeTextColor(this.textColor(textColor)); }
            if (outlineColor >= 0) { this.contents.outlineColor = this.textColor(outlineColor); }
            if (fontSize >= 0) { this.contents.fontSize = fontSize; }


            this.drawText(value, x, y, width);

            this.resetFontSettings();
            this.contents.outlineColor = currentOutlineColor;
        }, this);
    };

    Window_MenuStatus.prototype.drawStatusPicture = function (index) {
        var a = $gameParty.members()[index];
        var rect = this.itemRect(index);

        _dPicArray.forEach(function (line) {
            var dataArray = line.split(',');
            var value = eval(dataArray[0]);
            var bitmap = ImageManager.loadPicture(value);
            var x = Number(dataArray[1]) + rect.x;
            var y = Number(dataArray[2]) + rect.y;
            var pw = bitmap.width;
            var ph = bitmap.height;

            this.contents.blt(bitmap, 0, 0, pw, ph, x, y);
        }, this);
    };

    Window_MenuStatus.prototype.drawStatusGauge = function (index) {
        var a = $gameParty.members()[index];
        var rect = this.itemRect(index);
        _dGaugeArray.forEach(function (line) {

            var dataArray = line.split(',');
            var minValue = Number(eval(dataArray[0]));
            var maxValue = Number(eval(dataArray[1]));
            var x = Number(dataArray[2]) + rect.x;
            var y = Number(dataArray[3]) + rect.y;
            var width = Math.min(rect.width - Number(dataArray[2]), Number(dataArray[4]));
            var rate = minValue / maxValue;
            var color1 = this.textColor(Number(dataArray[5]));
            var color2 = this.textColor(Number(dataArray[6]));
            this.drawGauge(x, y, width, rate, color1, color2);
        }, this);
    };

    Window_MenuStatus.prototype.drawStatusState = function (index) {
        if (_stateWidth < 0) return;

        var a = $gameParty.members()[index];
        var rect = this.itemRect(index);
        var x = _stateX + rect.x;
        var y = _stateY + rect.y;
        var width = Math.min(rect.width - _stateX, _stateWidth);

        this.drawActorIcons(a, x, y, width);
    };

    Window_MenuStatus.prototype.standardPadding = function () {
        return _wPadding;
    };

})();