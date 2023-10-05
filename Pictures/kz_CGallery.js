/*:
 * @plugindesc v1.01 - CGモード
 * @author 剣崎宗二
 *
 * @param Columns per Page
 * @desc 横の個数
 * @default 3
 *
 * @param Rows per Page
 * @desc 縦の行数
 * @default 3
 *
 * @param Total Gallery Slot
 * @desc 総画像数（差分除外）
 * @default 10
 *
 * @param List Picture Width
 * @desc サムネイル横幅
 * @default 200
 *
 * @param List Picture Height
 * @desc サムネイル縦幅
 * @default 100
 *
 * @param List Picture Spacing
 * @desc サムネイル間スペース
 * @default 12
 * 
 * @param Split ThumbNail
 * @desc サムネイルと拡大絵の一枚目を別々にするか？
 * @type boolean
 * @default false
 * 
 * @param List Overhead X
 * @min -99999
 * @desc 画像リストのX調整用
 * @default 10
 * 
 * @param List Overhead Y
 * @min -99999
 * @desc 画像リストのY調整用
 * @default 10
 * 
 * @param File Directory
 * @desc ディレクトリ
 * @default img/pictures/
 *
 * @param File Name
 * @desc ファイル名の前付き
 * @default Gallery_
 * 
 * @param CG Text
 * @desc 各CGの解説テキスト
 * @type string[]
 * @default []
 *
 * @param Text X
 * @min -99999
 * @desc テキストX
 * @default 10
 * 
 * @param Text Y
 * @min -99999
 * @desc テキストY
 * @default 10
 * 
 * @param Page X
 * @min -99999
 * @desc ページX
 * @default 10
 * 
 * @param Page Y
 * @min -99999
 * @desc ページY
 * @default 10
 * 
 * @param Left Arrow
 * @desc 左矢印のファイル名
 * @default Left
 * 
 * @param Left Arrow X
 * @min -99999
 * @desc 左矢印X
 * @default 10
 * 
 * @param Left Arrow Y
 * @min -99999
 * @desc 左矢印X
 * @default 10
 * 
 * @param Right Arrow
 * @desc 右矢印のファイル名
 * @default Right
 * 
 * @param Right Arrow X
 * @min -99999
 * @desc 左矢印X
 * @default 10
 * 
 * @param Right Arrow Y
 * @min -99999
 * @desc 左矢印X
 * @default 10
 * 
 * @param Text Width
 * @desc テキスト横幅(ページとテキスト共有)
 * @default 10
 * 
 * @param Text Height
 * @desc テキスト縦幅(ページとテキスト共有)
 * @default 10
 * 
 * @param Cursor Padding
 * @desc カーソルの太さ（枠外の幅）
 * @default 2
 * 
 * @param Fade Step
 * @desc フェードイン、フェードアウトの速度。大きいほど早いが、0は一瞬（フェードインフェードアウト無し）
 * @default 0
 * 
 * 
 * @help 
* プラグインコマンド
*
* ギャラリーを開く＝　picture_gallery
* 
* 画像追加＝　enable_picture [ID]
* 画像削除＝　disable_picture [ID]
*
* 差分追加＝　add_sabun [ID] [差分最終ID]
* 
* 背景=ファイル名 + bak
*
* enable_picture 3の後なら、add_sabun 3 4で
* Pic_3.png（元から有る）のほかに
* Pic_3_1.png～Pic_3_4.pngという風に四枚をロード
* add_sabun_single 4 で1枚だけロードすることも可能（3_1~3_3を飛ばして、3 → 3_4にする
* Split ThumbNailがtrueの場合、サムネイルではPic_3.pngが使われるが、拡大表示の1枚目はPic3.pngではなくPic3_0.pngとなる。
 */

(function () {
    var parameters = PluginManager.parameters('kz_CGallery');
    var _directory = String(parameters['File Directory'] || "img/pictures/");
    var _fileBaseName = String(parameters['File Name'] || "Gallery_");
    var _cols = Number(parameters['Columns per Page'] || 3);
    var _maxPageRows = Number(parameters['Rows per Page'] || 3);
    var _totalSlotNum = Number(parameters['Total Gallery Slot'] || 10);
    var _picListWidth = Number(parameters['List Picture Width'] || 200);
    var _picListHeight = Number(parameters['List Picture Height'] || 100);
    var _picListSpacing = Number(parameters['List Picture Spacing'] || 12);
    var _listXOverhead = Number(parameters['List Overhead X'] || 10);
    var _listYOverhead = Number(parameters['List Overhead Y'] || 10);
    var _picTextList = eval(parameters['CG Text']) || [];
    var _textX = Number(parameters['Text X'] || 10);
    var _textY = Number(parameters['Text Y'] || 10);
    var _pageX = Number(parameters['Page X'] || 10);
    var _pageY = Number(parameters['Page Y'] || 10);
    var _textWidth = Number(parameters['Text Width'] || 10);
    var _textHeight = Number(parameters['Text Height'] || 10);

    var _lFile = String(parameters['Left Arrow'] || "Left");
    var _rFile = String(parameters['Right Arrow'] || "Right");
    var _lX = Number(parameters['Left Arrow X'] || 10);
    var _lY = Number(parameters['Left Arrow Y'] || 10);
    var _rX = Number(parameters['Right Arrow X'] || 10);
    var _rY = Number(parameters['Right Arrow Y'] || 10);

    var _cPadding = Number(parameters['Cursor Padding'] || 2);
    var _splitThumbnail = (parameters['Split ThumbNail'] == "true");

    var _fadeStep = Number(parameters['Fade Step'] || 0);

    ImageManager.loadGallery = function (filename) {
        return this.loadBitmap(_directory, filename, 0, true);
    };

    var kz_Game_Interpreter_prototype_pluginCommand = Game_Interpreter.prototype.pluginCommand
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        kz_Game_Interpreter_prototype_pluginCommand.call(this, command, args)
        if (command === "picture_gallery") { SceneManager.push(Scene_Gallery); };
        if (command === "enable_picture") { $gameSystem.enableGallery(Number(args[0]), true) };
        if (command === "disable_picture") { $gameSystem.enableGallery(Number(args[0]), false) };
        if (command === "add_sabun_single") { $gameSystem.setGalleryFlag(Number(args[0]), Number(args[1]), true) };
        if (command === "add_sabun") { $gameSystem.enableSabunRange(Number(args[0]), Number(args[1]), true) };
        return true;
    };

    Game_System.prototype.enableGallery = function (id, flag) {
        this.setGalleryFlag(id, 0, flag)
    };

    Game_System.prototype.enableSabunRange = function (id, sabunId, flag) {
        for (var i = 1; i <= sabunId; i++) {
            this.setGalleryFlag(id, i, flag)
        }
    };

    Game_System.prototype.getGalleryFlag = function () {
        return this._galleryFlags;
    }

    Game_System.prototype.setGalleryFlag = function (id, sabunId, flag) {
        this.ensureGalleryInfra(id);
        this._galleryFlags[id][sabunId] = flag;
    }

    Game_System.prototype.ensureGalleryInfra = function (id) {
        if (!this._galleryFlags) { this._galleryFlags = []; }
        if (id >= 0 && !this._galleryFlags[id]) { this._galleryFlags[id] = []; }
    }
    //==============================
    // * Window_PictureList
    //==============================
    function Scene_Gallery() {
        this.initialize.apply(this, arguments);
    }
    Scene_Gallery.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_Gallery.prototype.constructor = Scene_Gallery;

    Scene_Gallery.prototype.create = function () {
        Scene_MenuBase.prototype.create.call(this);
        $gameSystem.ensureGalleryInfra(-1);
        this.createWindows();
    };

    Scene_Gallery.prototype.createBackground = function () {
		Scene_MenuBase.prototype.createBackground.call(this);
            this.setBackgroundOpacity(255);
        this._backgroundSprite = new Sprite();
        this._backgroundSprite.bitmap = ImageManager.loadGallery(_fileBaseName + "bak")
        this.addChild(this._backgroundSprite);
    };

    Scene_Gallery.prototype.createWindows = function () {
        var w = Graphics.boxWidth * 0.73;
        var h = Graphics.boxHeight * 0.7;
        var x = _listXOverhead;
        var y = _listYOverhead;
        this._listWindow = new Window_PictureList(x, y, w, h);
        this._bigPicWindow = new Window_PictureDetail(0, 0, Graphics.boxWidth, Graphics.boxHeight);
        this.addWindow(this._listWindow);
        this.addWindow(this._bigPicWindow);

        this._listWindow.setHandler('ok', this.onListOk.bind(this));
        this._listWindow.setHandler('cancel', this.onListCancel.bind(this));
        this._bigPicWindow.setHandler('ok', this.onPicOk.bind(this));
        this._bigPicWindow.setHandler('cancel', this.onPicCancel.bind(this));
		
        this._listWindow.opacity = 0;
        this._listWindow.show();
        this._listWindow.activate();
        this._bigPicWindow.hide();
        this._bigPicWindow.deactivate();
    };

    Scene_Gallery.prototype.onListOk = function () {
        if (!this._listWindow.isCurrentItemEnabled()) {
            SoundManager.playBuzzer();
            return;
        }

        var index = this._listWindow.index();
        this._bigPicWindow.setPic(index);

        this._listWindow.hide();
        this._listWindow.deactivate();
        this._bigPicWindow.show();
        this._bigPicWindow.startFadeIn();
        this._bigPicWindow.activate();
    }

    Scene_Gallery.prototype.onListCancel = function () {
        SceneManager.pop();
    }

    Scene_Gallery.prototype.onPicOk = function () {
        var flaglist = $gameSystem.getGalleryFlag()[this._bigPicWindow.currentIndex];
        for (var i = this._bigPicWindow.currentSabunIndex + 1; i < flaglist.length; i++) {
            if (flaglist[i]) {
                this._bigPicWindow.setSabun(i);
                this._bigPicWindow.activate();
                return;
            }
        }
        this.onPicCancel();
    }

    Scene_Gallery.prototype.onPicCancel = function () {
        this._bigPicWindow.setPic();
        this._bigPicWindow.setSabun();

        this._listWindow.show();
        this._listWindow.activate();

        if (!_fadeStep)
        {
            this._bigPicWindow.hide();
        }
        this._bigPicWindow.startFadeOut();
        this._bigPicWindow.deactivate();
    }



    //==============================
    // * Window_PictureList
    //==============================
    function Window_PictureList() {
        this.initialize.apply(this, arguments);
    };

    Window_PictureList.prototype = Object.create(Window_Selectable.prototype);
    Window_PictureList.prototype.constructor = Window_PictureList;

    Window_PictureList.prototype.initialize = function (x, y, width, height) {
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this._data = $gameSystem.getGalleryFlag();
        this._topRow = 0;
        this.createPicSprites();
        this.select(0);
        this.refresh();
    };

    Window_PictureList.prototype.createPicSprites = function () {
        this._picSprite = [];
        for (var i = 0; i < this.maxCols() * this.maxPageRows(); i++) {
            this._picSprite[i] = new Sprite();
            this._picSprite[i].x = this.itemRect(i).x + _cPadding;
            this._picSprite[i].y = this.itemRect(i).y + _cPadding;
            this.addChild(this._picSprite[i]);
        }

        this._textSprite = new Sprite_Text();
        this._textSprite.x = _textX;
        this._textSprite.y = _textY;
        this.addChild(this._textSprite);

        this._pageSprite = new Sprite_Text();
        this._pageSprite.x = _pageX;
        this._pageSprite.y = _pageY;
        this.addChild(this._pageSprite);
        
        this._leftArrowSprite = new Sprite_Base();
        this._leftArrowSprite.bitmap = ImageManager.loadGallery(_lFile);
        this._leftArrowSprite.x = _lX;
        this._leftArrowSprite.y = _lY;
        this.addChild(this._leftArrowSprite);

        this._rightArrowSprite = new Sprite_Text();
        this._rightArrowSprite.bitmap = ImageManager.loadGallery(_rFile);
        this._rightArrowSprite.x = _rX;
        this._rightArrowSprite.y = _rY;
        this.addChild(this._rightArrowSprite);
        
    };

    Window_PictureList.prototype.cursorPagedown = function () {
        if (this.topRow() + this.maxPageRows() < this.maxRows()) {
            this.setTopRow(this.topRow() + this.maxPageRows());
            this.select(this.topIndex());
        }
    };

    Window_PictureList.prototype.cursorPageup = function () {
        var index = this.index();
        if (this.topRow() > 0) {
            this.setTopRow(this.topRow() - this.maxPageRows());
            this.select(this.topIndex());
        }
    };

    Window_PictureList.prototype.cursorDown = function (wrap) {
        var index = this.index();
        var maxItems = this.maxItems();
        var maxCols = this.maxCols();
        if (index + maxCols >= this.topIndex() + this.maxPageItems()) {
            return;
        }
        if (index < maxItems - maxCols || (wrap && maxCols === 1)) {
            this.select((index + maxCols) % maxItems);
            this.refresh();
        }
    };

    Window_PictureList.prototype.cursorUp = function (wrap) {
        var index = this.index();
        var maxItems = this.maxItems();
        var maxCols = this.maxCols();
        if (index - maxCols < this.topIndex()) {
            return;
        }
        else if (index >= maxCols || (wrap && maxCols === 1)) {
            this.select((index - maxCols + maxItems) % maxItems);
            this.refresh();
        }
    };

    Window_PictureList.prototype.cursorRight = function (wrap) {
        var index = this.index();
        var maxItems = this.maxItems();
        var maxCols = this.maxCols();
        if (index < maxItems - 1) {
            if (Math.floor(index / maxCols) === Math.floor((index + 1) / maxCols)) {
                this.select((index + 1) % maxItems);
                this.refresh();
            }
            else {
                this.cursorPagedown();
            }
        }
    };

    Window_PictureList.prototype.cursorLeft = function (wrap) {
        var index = this.index();
        var maxItems = this.maxItems();
        var maxCols = this.maxCols();
        if (index > 0) {
            if (Math.floor(index / maxCols) === Math.floor((index - 1) / maxCols)) {
                this.select((index - 1 + maxItems) % maxItems);
                this.refresh();
            }
            else {
                this.cursorPageup();
            }
        }
    };

    Window_PictureList.prototype.updateArrows = function () {
        this.downArrowVisible = false;
        this.upArrowVisible = false;
    };

    Window_PictureList.prototype.maxTopRow = function() {
        return Math.max(0, this.maxRows());
    };


    Window_PictureList.prototype.maxCols = function () {
        return _cols;
    };

    Window_PictureList.prototype.maxItems = function () {
        return _totalSlotNum;
    };

    Window_PictureList.prototype.isCurrentItemEnabled = function () {
        if (this._data.length < 1) return false;
        return this._data[this.index()] && this._data[this.index()][0];
    };

    Window_PictureList.prototype.spacing = function () {
        return _picListSpacing;
    };

    Window_PictureList.prototype.itemWidth = function () {
        return _picListWidth;
    };

    Window_PictureList.prototype.itemHeight = function () {
        return _picListHeight;
    };

    Window_PictureList.prototype.maxPageRows = function () {
        return _maxPageRows;
    };

    Window_PictureList.prototype.convertedIndex = function (index) {
        return index - this.topIndex();
    }

    Window_PictureList.prototype.standardPadding = function() {
        return 0;
    };

    Window_PictureList.prototype.setCursorRect = function(x, y, width, height) {
        Window_Selectable.prototype.setCursorRect.call(this, x - _cPadding, y - _cPadding, width + 2 * _cPadding, height + 2 * _cPadding);
    };

    Window_PictureList.prototype.itemRect = function (index) {
        var oldRect = Window_Selectable.prototype.itemRect.call(this, index);
        var maxCols = this.maxCols();
        oldRect.x = Math.round(oldRect.x);
        oldRect.y = Math.round(Math.floor(this.convertedIndex(index) / maxCols) * (oldRect.height + this.spacing()));
        oldRect.width = Math.round(oldRect.width);
        oldRect.height = Math.round(oldRect.height);
        return oldRect;
    };

    Window_PictureList.prototype.scrollDown = function () {
        this.cursorPagedown();
    };

    Window_PictureList.prototype.scrollUp = function () {
        this.cursorPageup();
    };

    Window_PictureList.prototype.drawAllItems = function () {
        var topIndex = this.topIndex();
        for (var i = 0; i < this._picSprite.length; i++) {
            var index = topIndex + i;
            if (index >= _totalSlotNum) {
                this._picSprite[i].bitmap = null;
            }
            else if (this._data[index] && this._data[index][0]) {
                this._picSprite[i].bitmap = ImageManager.loadGallery(_fileBaseName + index);
            }
            else {
                this._picSprite[i].bitmap = ImageManager.loadGallery(_fileBaseName + "nopic");
            }
        }
    };

    Window_PictureList.prototype.update = function () {
        Window_Selectable.prototype.update.call(this);
        for (var index = 0; index < this._picSprite.length; index++) {
            var basew = this.itemRect(this.convertedIndex(index)).width - _cPadding * 2;
            var baseh = this.itemRect(this.convertedIndex(index)).height - _cPadding * 2;
            if (this._picSprite[index].bitmap && this._picSprite[index].bitmap.width > 0) {
                var rx = basew / this._picSprite[index].bitmap.width;
                this._picSprite[index].scale.x = rx;
            }
            if (this._picSprite[index].bitmap && this._picSprite[index].bitmap.height > 0) {
                var ry = baseh / this._picSprite[index].bitmap.height;
                this._picSprite[index].scale.y = ry;
            }
        }

        this.updateTextSprite();
        this.updatePageSprite();  
    }

    Window_PictureList.prototype.updateTextSprite = function () {
        var text = _picTextList[this.index()] ? _picTextList[this.index()] : "";
        text = this.isCurrentItemEnabled() ? text : "???";
        this._textSprite.setText(text);
    }

    Window_PictureList.prototype.updatePageSprite = function () {
        var effectiveIndex = this.index() ? this.index() : 0;
        var maxPage = Math.ceil(this.maxItems() / this.maxPageItems());
        var currentPage = Math.ceil((effectiveIndex + 1) / this.maxPageItems());
        this._pageSprite.setText(currentPage + " / " + maxPage);

        if (currentPage <= 1)
        {
            this._leftArrowSprite.hide();
        }
        else
        {
            this._leftArrowSprite.show();
        }

        if (currentPage >= maxPage)
        {
            this._rightArrowSprite.hide();
        }
        else
        {
            this._rightArrowSprite.show();
        }
    }

    //==============================
    // * Window_PictureEnlarged
    //==============================
    function Window_PictureDetail() {
        this.initialize.apply(this, arguments);
    };

    Window_PictureDetail.prototype = Object.create(Window_Selectable.prototype);
    Window_PictureDetail.prototype.constructor = Window_PictureDetail;

    Window_PictureDetail.prototype.initialize = function (x, y, width, height) {
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this.currentSabunIndex = 0;
        this.currentIndex = -1;
        this._fadeDirection = 0;
        this.createPicSprite();
    };

    Window_PictureDetail.prototype.createPicSprite = function () {
        this._picSprite = new Sprite();
        this._picSprite.x = 0;
        this._picSprite.y = 0;
        this._picSprite.width = this.width;
        this._picSprite.height = Math.round(this.height * 2 / 3);
        this.addChild(this._picSprite);
    };

    Window_PictureDetail.prototype.setPic = function (picIndex) {
        this.currentIndex = picIndex >= 0 ? picIndex : -1;
        this.refresh();
    };

    Window_PictureDetail.prototype.setSabun = function (sabunId) {
        this.currentSabunIndex = sabunId ? sabunId : 0;
        this.refresh();
    };

    Window_PictureDetail.prototype.refresh = function () {
        this.contents.clear();
        if (this.currentIndex < 0) { return; }

        var picName = _fileBaseName + this.currentIndex;
        if (this.currentSabunIndex > 0 || (this.currentSabunIndex == 0 && _splitThumbnail)) {
            picName += '_' + this.currentSabunIndex;
        }
        this._picSprite.bitmap = ImageManager.loadGallery(picName);
    };

    Window_PictureDetail.prototype.onTouch = function(triggered) {
        if (triggered) {
            this.processOk();
        }
    };

    Window_PictureDetail.prototype.startFadeIn = function() {
        if (!_fadeStep) return;

        this._fadeDirection = 1;
        this._picSprite.opacity = 0;
    };

    Window_PictureDetail.prototype.startFadeOut = function() {
        if (!_fadeStep) return;
        
        this._fadeDirection = -1;
        this._picSprite.opacity = 255;
    };

    var kz_Window_PictureDetail_prototype_update = Window_PictureDetail.prototype.update;
    Window_PictureDetail.prototype.update = function() {
        kz_Window_PictureDetail_prototype_update.call(this);

        if (this._fadeDirection == 0) return;

        this._picSprite.opacity += Math.round(this._fadeDirection * _fadeStep);

        if (this._picSprite.opacity >= 255)
        {
            //フェードイン終了
            this._fadeDirection = 0;
            this._picSprite.opacity = 255;
        }

        if (this._picSprite.opacity <= 0)
        {
            //フェードアウト終了
            this._fadeDirection = 0;
            this._picSprite.opacity = 255;
            this.hide();
        }
    };



    function Sprite_Text() {
        this.initialize.apply(this, arguments);
    }
    Sprite_Text.prototype = Object.create(Sprite_Base.prototype);
    Sprite_Text.prototype.constructor = Sprite_Text;

    Sprite_Text.prototype.initialize = function() {
        Sprite_Base.prototype.initialize.call(this);
        this._currentText = "";
        this._nextText = "";
        this.bitmap = new Bitmap(_textWidth, _textHeight);
        this.bitmap.fontSize = 18;
    };

    Sprite_Text.prototype.update = function() {
        Sprite_Base.prototype.update.call(this);
        if (this._currentText != this._nextText);
        {
            this.redrawText(this._nextText);
            this._currentText = this._nextText;
        }
    };

    Sprite_Text.prototype.redrawText = function(text) {
        this.bitmap.clear();
        this.bitmap.drawText(text, 0, 0, _textWidth, 36, "center")
    };

    Sprite_Text.prototype.setText = function(text) {
        this._nextText = text;
    };

})();
