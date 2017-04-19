//=============================================================================
// Teleport.js
//=============================================================================

/*:
 * @plugindesc Plugin to display Teleport screen
 * @author Souji Kenzaki
 *
 */

/*:ja
 * @plugindesc 選択画面を表示して、テレポート先を選べるようにするプラグインです。同梱のTeleport.jsonと合わせてご覧ください。
 * @plugindesc teleport.jsonはdataフォルダへ、各種画像はpicturesに入れてください。
 * @author Souji Kenzaki
 *
 * @param Base
 * @desc 各クエストの状態を格納する変数群の開始番号です。たとえばこれが５００なら、クエストID１のステータスは変数５０１番に格納されます。
 * @default 500
 *
 * @param AnimationId
 * @desc テレポート時に再生されるアニメーションの番号
 * @default 10
 * 
 * @help
 * baseVariableの番号の変数（デフォルトでは変数500番）の値が
 * テレポートのプラグインコマンド後
 * 1だったら場所移動してる
 * 0だったら移動してない
 * となります
 *
 * プラグインコマンド:
 *   Teleport open            # テレポート画面を開く
 *   Teleport enable 1        # 1番のワープポイントを有効化
 *   Teleport disable 1       # 1番のワープポイントを無効化
 */

var $teleportDataRaw = {};
var $teleportData = [];

(function() {

    var parameters = PluginManager.parameters('Teleport');
    var baseVariable = String(parameters['Base'] || 500);
    var animationId = String(parameters['AnimationId'] || 10);

    var DataManager_loadDatabase_kz = DataManager.loadDatabase;
    DataManager.loadDatabase = function() {
        DataManager_loadDatabase_kz.call(this);
        this.loadDataFile('$teleportDataRaw', 'teleport.json');
    };

    var _Game_Interpreter_pluginCommand =
            Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);        
        if (command === 'Teleport') {
            switch (args[0]) {
            case 'open':
                $gameVariables.setValue(Number(baseVariable), 0);
                SceneManager.push(Scene_Teleport);
                break;
            case 'disable':
                $gameVariables.setValue(Number(baseVariable) + Number(args[1]), 0);
                break;
            case 'enable':
                $gameVariables.setValue(Number(baseVariable) + Number(args[1]), 1);
                break;
            }
        }
    };

    Game_System.prototype.initializeTeleport = function() {
        for (var i = 0, len = $teleportDataRaw.length; i < len; i++) {
          $teleportData[$teleportDataRaw[i].id] = $teleportDataRaw[i];
        }
	$teleportDataRaw.forEach(function(item)
        {
           ImageManager.loadPicture(item.image);
        });
    };

    Game_Interpreter.prototype.simpleForceAnime = function() {
    this._character = this.character(-1);
    if (this._character) {
//★入り口アニメーションID		
    this._character.requestAnimation(19);
    this.setWaitMode('animation');
    return true;
    }
    };
	
    Game_Interpreter.prototype.simpleForceAnime2 = function() {
    this._character = this.character(-1);
    if (this._character) {
//★出口アニメーションID		
    this._character.requestAnimation(20);
    this.setWaitMode('animation');
    return true;
    }
    };
//-------------------------------------------------------------------------------------------------------------------
    function Scene_Teleport() {
        this.initialize.apply(this, arguments);
    }

    Scene_Teleport.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_Teleport.prototype.constructor = Scene_Teleport;

    Scene_Teleport.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
        if ($teleportData.length < 1)
        {
            $gameSystem.initializeTeleport();
        }
    };

    Scene_Teleport.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this.loadImages();
//★説明ウインドウレイアウト変更箇所----------------------------------------------
        this._indexWindow = new Window_TeleportIndex(0, 0);
        this._indexWindow.setHandler('cancel', this.popScene.bind(this));
        this._indexWindow.setHandler('ok', this.confirm.bind(this));
        var wy = Graphics.boxWidth/7.4;
        var ww = Graphics.boxWidth/3;
        var wh = Graphics.boxWidth/2.25;
//		this._indexWindow.opacity　= 0;
        this._statusWindow = new Window_TeleportStatus(Graphics.boxWidth/2.1, wy, ww, wh);
//		this._statusWindow.opacity　= 0;
        this.addWindow(this._indexWindow);
        this.addWindow(this._statusWindow);
        this._indexWindow.setStatusWindow(this._statusWindow);
    };

    Scene_Teleport.prototype.loadImages = function() {
        $teleportDataRaw.forEach(function(item)
        {
           ImageManager.loadPicture(item.image);
        });
    };

    Scene_Teleport.prototype.confirm = function() 
    {
        var item = this._indexWindow.selectedItem();
        if (item != null)
        {
          SceneManager.push(Scene_TeleportConfirm);
          SceneManager.prepareNextScene(item);
        }
        else
        {
          SceneManager.push(Scene_TeleportConfirm);
          this.popScene();
        }
    };

    function Window_TeleportIndex() {
        this.initialize.apply(this, arguments);
    };

    Window_TeleportIndex.prototype = Object.create(Window_Selectable.prototype);
    Window_TeleportIndex.prototype.constructor = Window_TeleportIndex;

    Window_TeleportIndex.lastTopRow = 0;
    Window_TeleportIndex.lastIndex  = 0;

//★テレポートリスト、レイアウト改変箇所-----------------------------------------------
    Window_TeleportIndex.prototype.initialize = function(x, y) {
        var width = Graphics.boxWidth/3.4;
        var height = this.fittingHeight(9);
        Window_Selectable.prototype.initialize.call(this, Graphics.boxWidth/5.5, Graphics.boxHeight/5.7, width, height);
        this.refresh();
        this.setTopRow(Window_TeleportIndex.lastTopRow);
        this.select(Window_TeleportIndex.lastIndex);
        this.activate();
    };

    Window_TeleportIndex.prototype.maxCols = function() {
        return 1;
    };

    Window_TeleportIndex.prototype.maxItems = function() {
        return this._list ? this._list.length : 0;
    };

    Window_TeleportIndex.prototype.setStatusWindow = function(statusWindow) {
        this._statusWindow = statusWindow;
        this.updateStatus();
    };

    Window_TeleportIndex.prototype.update = function() {
        Window_Selectable.prototype.update.call(this);
        this.updateStatus();
    };

Window_TeleportIndex.prototype.updateStatus = function() {
        if (this._statusWindow) {
            var item = this._list[this.index()];
            this._statusWindow.setItem(item);
        }
    };


    Window_TeleportIndex.prototype.selectedItem = function() {
        var item = this._list[this.index()];
        return item;
    };

    Window_TeleportIndex.prototype.refresh = function() {
        var i, item;
        this._list = [];
        for (i = 1; i < $teleportData.length; i++) {
            item = $teleportData[i];
            if (item.name && $gameVariables.value(Number(baseVariable) + Number(item.id))) {
                this._list.push(item);
            }
        }
        this.createContents();
        this.drawAllItems();        
    };

    Window_TeleportIndex.prototype.drawItem = function(index) {
        var item = this._list[index];
        var rect = this.itemRect(index);
        var width = rect.width - this.textPadding();
        this.drawItemName(item, rect.x, rect.y, width);
    };

    Window_TeleportIndex.prototype.processCancel = function() {
        Window_Selectable.prototype.processCancel.call(this);
        Window_TeleportIndex.lastTopRow = this.topRow();
        Window_TeleportIndex.lastIndex = this.index();
    };

    function Window_TeleportStatus() {
        this.initialize.apply(this, arguments);
    };

    Window_TeleportStatus.prototype = Object.create(Window_Base.prototype);
    Window_TeleportStatus.prototype.constructor = Window_TeleportStatus;

    Window_TeleportStatus.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
    };

    Window_TeleportStatus.prototype.setItem = function(item) {
        if (this._item !== item) {
            this._item = item;
            this.refresh();
        }
    };

    Window_TeleportStatus.prototype.refresh = function() {
        var item = this._item;
	var bitmap = ImageManager.loadPicture(item.image);
        var x = 0;
        var y = 0;
        var lineHeight = this.lineHeight();

        this.contents.clear();

        if (!item) {
            return;
        }
        var iconBoxWidth = Window_Base._iconWidth + 4;
        this.resetTextColor();
//        this.drawIcon(item.iconIndex, x + 2, y + 2);
//        this.drawText(item.name, x + iconBoxWidth, y, 312 - iconBoxWidth);
　　　　this.contents.blt(bitmap, 0, 0, bitmap.width, bitmap.height, 0, 0);
        x = 0;
        y = this.textPadding() *2+ lineHeight * 4;

        
		this.drawTextEx(item.description, x, y);
    };
	

//-------------------------------------------------------------------------------------------------------------------
    function Scene_TeleportConfirm() {
        this.initialize.apply(this, arguments);
    }

    Scene_TeleportConfirm.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_TeleportConfirm.prototype.constructor = Scene_Teleport;

    Scene_TeleportConfirm.prototype.prepare = function(item)
    {
        this._item = item;
    }

    Scene_TeleportConfirm.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
    };

Scene_TeleportConfirm.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this._confirmTextWindow = new Window_QuestText(this._item)
        var width = Graphics.boxWidth;
        var height = Graphics.boxHeight;
        this._confirmWindow = new Window_Confirm(width / 2 - 30, height / 2 + 100);
        this._confirmWindow.setHandler('cancel', this.popScene.bind(this));
        this._confirmWindow.setHandler('local_ok', this.confirm.bind(this));
        this.addWindow(this._confirmTextWindow);
        this.addWindow(this._confirmWindow);
        console.log(this._confirmTextWindow);
        console.log(this._windowLayer.children)
    };

    Scene_TeleportConfirm.prototype.confirm = function() 
    {
        $gameVariables.setValue(Number(baseVariable), 1);
        var item = this._item;
        this.popScene();
        //場所選択窓(Scene_Teleport)も消す
        this.popScene();
        //アニメ再生
        $gameMap._interpreter.simpleForceAnime();
　　　　　　　　$gamePlayer.setTransparent(true);
//入り口アニメ待って移動
        var waiter = setInterval(function(){ 
     if (!$gameMap._interpreter.updateWaitMode())
     {       
       clearInterval(waiter); 
       $gamePlayer.reserveTransfer(item.mapid, item.mapx, item.mapy, 0, 0); 
       $gameMap._interpreter.setWaitMode('transfer');
     }
        }, 100);　//0.1秒間隔
        
     //移動を待って出口アニメ
var waiter2 = setInterval(function(){ 
     if (!$gameMap._interpreter.updateWaitMode())
     {       
       clearInterval(waiter2); 
       $gameMap._interpreter.simpleForceAnime2();
     }
        }, 100);

//出口アニメ待って透明解除
var waiter3 = setInterval(function(){ 
     if (!$gameMap._interpreter.updateWaitMode())
     {       
       clearInterval(waiter3); 
       $gamePlayer.setTransparent(false);
     }
        }, 100);

    }



    function Window_Confirm() {
        this.initialize.apply(this, arguments);
    }

    Window_Confirm.prototype = Object.create(Window_Command.prototype);
    Window_Confirm.prototype.constructor = Window_Confirm;

    Window_Confirm.prototype.initialize = function(x, y) {
        Window_Command.prototype.initialize.call(this, x, y);
    }

    Window_Confirm.prototype.makeCommandList = function() {
        Window_Command.prototype.makeCommandList.call(this);
        this.addCommand("はい", "local_ok");
        this.addCommand("いいえ", "cancel");
    }

    function Window_QuestText() {
        this.initialize.apply(this, arguments);
    }

    Window_QuestText.prototype = Object.create(Window_Base.prototype);
    Window_QuestText.prototype.constructor = Window_ScrollText;

    Window_QuestText.prototype.initialize = function(item) {
        var width = Graphics.boxWidth/2;
        var height = Graphics.boxHeight/4;
        Window_Base.prototype.initialize.call(this, 150, 200, width, height);
        this.drawText(item.name + "　にワープしますか？", 0, 0)
    }
    
//追記---------------------------------------------------------
	Window_TeleportStatus.prototype.standardFontSize = function() {
    return 18;
    };
	    
})();
