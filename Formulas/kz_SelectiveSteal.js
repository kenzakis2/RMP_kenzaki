/*:ja
 * @plugindesc 選択可能な盗めるアイテム
 * @author 剣崎宗二
 *
 * @param Success Text
 * @desc 盗み成功時のテキスト（%1はアイテム名の入る場所）
 * @default %1を盗んだ！
 *
 * @param Fail Text
 * @desc 盗み失敗時のテキスト（%1はアイテム名の入る場所）
 * @default %1を盗めなかった！
 * 
 * @param Steal Window X
 * @type number
 * @min -99999
 * @desc 盗めるアイテム窓のX座標
 * @default 0
 * 
 * @param Steal Window Y
 * @type number
 * @min -99999
 * @desc 盗めるアイテム窓のX座標
 * @default 0
 * 
 * @param Steal Window Width
 * @type number
 * @desc 盗めるアイテム窓横幅
 * @default 300
 * 
 * @param Steal Window Height
 * @type number
 * @desc 盗めるアイテム窓縦幅
 * @default 200
 *
 *
 * @help 
 * 指定したアイテムを盗むプラグインです。
 * ID2のアイテムを50%で盗みたい場合
 * 敵のメモに<stealable:i|,|2|,|0.5>
 * タイプはi=アイテム　w=武器　a=防具
 * スキルのメモに<targeted_steal>
 * 尚、「味方が使用する敵単体対象の技」以外は仕様として一切対応していません。ご注意ください。
 * 確率の部分（0.5とある所）はダメージ同様式を使うことが可能です。1.0=100%となります。
 */


(function () {
    var parameters = PluginManager.parameters('kz_SelectiveSteal');
    var successText = parameters['Success Text'];
    var failText = parameters['Fail Text'];
    var _swX = Number(parameters['Steal Window X']) || 0;
    var _swY = Number(parameters['Steal Window Y']) || 0;
    var _swW = Number(parameters['Steal Window Width']) || 300;
    var _swH = Number(parameters['Steal Window Height']) || 200;

    function GetItemFromObj(stealDataObj) {
        var database = null;
        switch (stealDataObj.type) {
            case 'i':
                database = $dataItems;
                break;
            case 'w':
                database = $dataWeapons;
                break;
            case 'a':
                database = $dataArmors;
                break;
        }
        return database[stealDataObj.itemId];
    }

    Game_Action.prototype.stealableItems = function () {
        var target = $gameTroop.smoothTarget(this._targetIndex);
        if (!target || !target.enemy().metaArray || !target.enemy().metaArray.stealable) {
            return [];
        }

        var possibleList = target.enemy().metaArray.stealable.map(function (e) {
            var splitArray = e.split("|,|");
            var obj = {};
            var a = this.subject();
            var b = target;

            obj.type = splitArray[0];
            obj.itemId = Number(splitArray[1]);
            obj.rate = splitArray[2];
            obj.rateText = eval(splitArray[2]) * 100 + '%';
            return obj;
        }, this);

        var filteredList = possibleList.filter(function (e) {
            return !target.stolenList || !target.stolenList.find(function (v) {
                return e.itemId == v.itemId && e.type == v.type;
            }, this);
        })
        return filteredList;
    };

    Game_Action.prototype.isTargetedSteal = function () {
        if (!this.item() || !this.item().meta || !this.item().meta.targeted_steal) {
            return false;
        }
        return true;
    }

    var kz_Game_Action_prototype_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function (target) {
        kz_Game_Action_prototype_apply.call(this, target);
        this.applySteal(target);
    };

    Game_Action.prototype.applySteal = function (target) {
        if (!this._stealData) return;

        var a = this.subject();
        var b = target;
        var item = GetItemFromObj(this._stealData);
        console.log(eval(this._stealData.rate));
        if (eval(this._stealData.rate) > Math.random()) {
            $gameParty.gainItem(item, 1);
            if (!target.stolenList) { target.stolenList = []; }
            target.stolenList.push(this._stealData);
            this.makeSuccess(target);
            BattleManager._logWindow.stealResult(item, true);
        }
        else {
            BattleManager._logWindow.stealResult(item, false);
        }
    };

    Game_Action.prototype.setSteal = function (stealObject) {
        this._stealData = stealObject;
    };

    Window_BattleLog.prototype.stealResult = function (item, success) {
        var text = success ? successText : failText;
        this.push('addText', text.format(item.name));
    };

    //--------------------------------Scene_Battle------------------------------------------
    var kz_Scene_Battle_prototype_createAllWindows = Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function () {
        kz_Scene_Battle_prototype_createAllWindows.call(this);
        this.createStealSelectWindow()
    };

    Scene_Battle.prototype.createStealSelectWindow = function () {
        this._stealTargetWindow = new Window_BattleStealTarget(_swX, _swY);
        this._stealTargetWindow.setHandler('ok', this.onStealOk.bind(this));
        this._stealTargetWindow.setHandler('cancel', this.onStealCancel.bind(this));
        this.addWindow(this._stealTargetWindow);
    };

    var kz_Scene_Battle_prototype_onEnemyOk = Scene_Battle.prototype.onEnemyOk;
    Scene_Battle.prototype.onEnemyOk = function () {
        var action = BattleManager.inputtingAction();
        if (!action.isTargetedSteal()) {
            kz_Scene_Battle_prototype_onEnemyOk.call(this);
            return;
        }

        action.setTarget(this._enemyWindow.enemyIndex());
        this._stealTargetWindow.setItems(action.stealableItems());
        this._stealTargetWindow.refresh();
        this._stealTargetWindow.show();
        this._stealTargetWindow.activate();
    };

    Scene_Battle.prototype.onStealOk = function () {
        var action = BattleManager.inputtingAction();
        action.setSteal(this._stealTargetWindow.selectedItem());

        this._stealTargetWindow.hide();
        this._enemyWindow.hide();
        this._skillWindow.hide();
        this._itemWindow.hide();
        this.selectNextCommand();
    };

    Scene_Battle.prototype.onStealCancel = function () {
        this._stealTargetWindow.hide();
        this._stealTargetWindow.deactivate();
        this._enemyWindow.activate();
    };

    var kz_Scene_Battle_prototype_isAnyInputWindowActive = Scene_Battle.prototype.isAnyInputWindowActive;
    Scene_Battle.prototype.isAnyInputWindowActive = function () {
        return kz_Scene_Battle_prototype_isAnyInputWindowActive.call(this) || this._stealTargetWindow.active;
    };

    //---------------------------Window_BattleStealTarget---------------------------
    function Window_BattleStealTarget() {
        this.initialize.apply(this, arguments);
    };

    Window_BattleStealTarget.prototype = Object.create(Window_Selectable.prototype);
    Window_BattleStealTarget.prototype.constructor = Window_BattleStealTarget;

    Window_BattleStealTarget.prototype.initialize = function (x, y) {
        this._stealItemData = [];
        var width = this.windowWidth();
        var height = this.windowHeight();
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this.hide();
    };

    Window_BattleStealTarget.prototype.windowWidth = function () {
        return _swW;
    };

    Window_BattleStealTarget.prototype.windowHeight = function (x, y) {
        return _swH;
    };

    Window_BattleStealTarget.prototype.isCurrentItemEnabled = function () {
        return this.selectedItem();
    };

    Window_BattleStealTarget.prototype.selectedItem = function () {
        return this._stealItemData[this.index()];
    };

    Window_BattleStealTarget.prototype.setItems = function (items) {
        this._stealItemData = items;
        if (this.maxItems() > 0)
        {
            this.select(0);
        }
    };

    Window_BattleStealTarget.prototype.maxItems = function () {
        return this._stealItemData.length;
    };

    Window_BattleStealTarget.prototype.drawItem = function (index) {
        var element = this._stealItemData[index];
        if (!element) return;

        var item = GetItemFromObj(element);
        var rect = this.itemRect(index);

        this.drawText(item.name, rect.x, rect.y, rect.width - 65);
        this.drawText(element.rateText, rect.x + rect.width - 50, rect.y, 50);
    };

    //---------------------------MetaArray-----------------------------------

    var kz_DataManager_extractMetadata = DataManager.extractMetadata;
    DataManager.extractMetadata = function (data) {
        var re = /<([^<>:]+)(:?)([^>]*)>/g;
        data.metaArray = [];
        for (; ;) {
            var match = re.exec(data.note);
            if (match) {
                if (!data.metaArray[match[1]]) {
                    data.metaArray[match[1]] = [];
                }
                if (match[2] === ':') {
                    data.metaArray[match[1]].push(match[3]);
                }
            } else {
                break;
            }
        }
        kz_DataManager_extractMetadata.call(this, data);
    }

})();