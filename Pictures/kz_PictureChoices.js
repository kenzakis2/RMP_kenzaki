/*:ja
 * @plugindesc 選択肢の表示の際、選択肢を画像で、画面の自由な場所に配置できるようにします。
 * @author Souji Kenzaki
 *
 * @param Cursor Bitmap Name
 * @type string
 * @desc カーソル画像名
 * @default Cursor
 * 
 * @param Cursor Overhead X
 * @type number
 * @min -99999
 * @desc カーソル位置調整座標X
 * @default 0
 * 
 * @param Cursor Overhead Y
 * @type number
 * @min -99999
 * @desc カーソル位置調整座標Y
 * @default 0
 *
 * 
 * @help
 * 有効化はプラグインコマンド GraphicalChoice on
 * 無効かは同　GraphicalChoice off
 * にて行ってください。（初期状態では無効化されています）
 * 
 * ※画像はカーソル、選択肢画像共に　img/choices/　フォルダ内に入れてください。
 * 有効化中、イベントコマンドで選択肢の表示を行う際、選択肢のテキストを
 * [画像]|[x]|[y]
 * の形式にする事で画像で選択肢の表示を行う事が可能です。
 * 
 * 例として
 * choice1|30|50
 * であれば、choice1.pngを座標(30,50)に表示し選択できるようにします。
 * 
 * 尚、キーボード操作はデフォルトに準じ、上下キーでのみカーソルが動かせる事にご注意ください。
 * タッチ／クリック操作はこの制約を受けません。
 * 
 * 
 * 
 * 開発協力Special Thanks：
 * サイリ様(@sairi55)
 * ヴァージニアス様(@Virgina_ss)
 */



(function () {

    var parameters = PluginManager.parameters('kz_PictureChoices');
    var _cursorBmp = String(parameters['Cursor Bitmap Name'] || "");
    var _cursorX = Number(parameters['Cursor Overhead X']) || 0;
    var _cursorY = Number(parameters['Cursor Overhead Y']) || 0;

    var _Game_Interpreter_pluginCommand =
        Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'GraphicalChoice') {
            $gameSystem.graphicalChoices = (args[0] == "on");
        }
    };

    ImageManager.loadChoices = function (filename, hue) {
        return this.loadBitmap('img/choices/', filename, hue, true);
    };

    var kz_Window_ChoiceList_prototype_windowWidth = Window_ChoiceList.prototype.windowWidth;
    Window_ChoiceList.prototype.windowWidth = function () {
        if (!$gameSystem.graphicalChoices) {
            return kz_Window_ChoiceList_prototype_windowWidth.call(this);
        }
        return 0;
    };

    var kz_Window_ChoiceList_prototype_windowHeight = Window_ChoiceList.prototype.windowHeight;
    Window_ChoiceList.prototype.windowHeight = function () {
        if (!$gameSystem.graphicalChoices) {
            return kz_Window_ChoiceList_prototype_windowHeight.call(this);
        }
        return 0;
    };

    var kz_Window_ChoiceList_prototype_initialize = Window_ChoiceList.prototype.initialize;
    Window_ChoiceList.prototype.initialize = function (messageWindow) {
        kz_Window_ChoiceList_prototype_initialize.call(this, messageWindow);

        this._choiceSprite = [];
        this._cursorSprite = new Sprite_Base();
        this._cursorSprite.bitmap = ImageManager.loadChoices(_cursorBmp);
    };

    var kz_Window_ChoiceList_prototype_start = Window_ChoiceList.prototype.start;
    Window_ChoiceList.prototype.start = function () {
        if ($gameSystem.graphicalChoices) {
            this.populateChoiceSprites();
        }

        kz_Window_ChoiceList_prototype_start.call(this);

        if ($gameSystem.graphicalChoices) {
            this.x = 0;
            this.y = 0;
        }
    };

    Window_ChoiceList.prototype.populateChoiceSprites = function () {
        this.removeAllChoiceSprites();

        var choices = $gameMessage.choices();
        for (var i = 0; i < choices.length; i++) {
            var _data = choices[i].split('|')
            this._choiceSprite[i] = new Sprite_Base();
            this._choiceSprite[i].bitmap = ImageManager.loadChoices(_data[0]);
            this._choiceSprite[i].x = _data[1] ? Number(_data[1]) : 0;
            this._choiceSprite[i].y = _data[2] ? Number(_data[2]) : 0;
            this.addChild(this._choiceSprite[i]);
        }

        this.addChild(this._cursorSprite);//再追加で一番上に出す
    }

    Window_ChoiceList.prototype.removeAllChoiceSprites = function () {
        for (var i = 0; i < this._choiceSprite.length; i++) {
            this.removeChild(this._choiceSprite[i]);
        }
        this._choiceSprite = [];
    }

    var kz_Window_ChoiceList_prototype_updateArrows = Window_ChoiceList.prototype.updateArrows;
    Window_ChoiceList.prototype.updateArrows = function () {
        kz_Window_ChoiceList_prototype_updateArrows.call(this);

        if ($gameSystem.graphicalChoices) {
            this.downArrowVisible = false;
            this.upArrowVisible = false;
        }
    };

    var kz_Window_ChoiceList_prototype_select = Window_ChoiceList.prototype.select;
    Window_ChoiceList.prototype.select = function (index) {
        kz_Window_ChoiceList_prototype_select.call(this, index);

        if ($gameSystem.graphicalChoices) {
            if (!this._cursorSprite) {
                return;
            }
            if (index < 0 || !this._choiceSprite || !this._choiceSprite[index]) {
                this._cursorSprite.hide()
                return;
            }
            this._cursorSprite.show();
            this._cursorSprite.x = this._choiceSprite[index].x + _cursorX;
            this._cursorSprite.y = this._choiceSprite[index].y + _cursorY;
        }
    };

    var kz_Window_ChoiceList_prototype_hitTest = Window_ChoiceList.prototype.hitTest;
    Window_ChoiceList.prototype.hitTest = function (x, y) {
        if (!$gameSystem.graphicalChoices) {
            return kz_Window_ChoiceList_prototype_hitTest.call(this, x, y);
        }

        if (this._choiceSprite) {
            for (var i = 0; i < this._choiceSprite.length; i++) {
                var xmin = this._choiceSprite[i].x;
                var xmax = this._choiceSprite[i].x + this._choiceSprite[i].width;
                var ymin = this._choiceSprite[i].y;
                var ymax = this._choiceSprite[i].y + this._choiceSprite[i].height;

                if (x >= xmin && x <= xmax && y >= ymin && y <= ymax) {
                    console.log(i);
                    return i;
                }
            }
        }
        return -1;
    };

    var kz_Window_ChoiceList_prototype_isTouchedInsideFrame = Window_ChoiceList.prototype.isTouchedInsideFrame;
    Window_ChoiceList.prototype.isTouchedInsideFrame = function () {
        if (!$gameSystem.graphicalChoices) {
            return kz_Window_ChoiceList_prototype_isTouchedInsideFrame.call(this);
        }
        return true;
    };

})();