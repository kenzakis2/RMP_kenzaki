//=============================================================================
// WeaponChainSkill.js
//=============================================================================


/*:ja
 * @plugindesc 多刀流セットアップ。
 * @author 剣崎宗二
 *
 * @help このプラグインにはプラグインコマンドはありません。
 *
 * スキルの「メモ」欄に、<weaponchain: 3> と書いた場合、
 * （厳密に数字は無関係）多刀流に対応します。
 *
 * スキルにこのタグが入っているとき、装備している武器の数だけスキルを使用する。
 * その際、全ての武器をいったん解除し、一回ごとに違う武器を装備して使用する。
 *
 * 剣（１）と剣（２）を作ってそれぞれ違うモーションを設定し剣１
 *（本体。実際に装備するヤツ）のメモ欄に
 * <subhandwid:[剣2のID]>
 *
 * ※サポートが打ち切られておりますが、一応Yanfly氏のBattleSysCTBで動くように作っております
 */

(function () {


    var BattleManager_startAction_kzk = BattleManager.startAction;
    BattleManager.startAction = function () {
        var subject = this._subject;
        var action = subject.currentAction();
        subject._runEndWeaponchain = false;

        if (!subject._inWeaponChain && action.item().meta.weaponchain && subject.isActor()) {
            subject.startWeaponChain(action);
        }

        if (subject._inWeaponChain) {
            subject.removeAllWeapons();
            subject.forceChangeEquipById(0, subject._runningWeapon.item);
        }

        if (subject._inWeaponChain && subject._chainWeaponListRunning && subject._chainWeaponListRunning.length <= 0) {
            subject._inWeaponChain = false;
            subject._runEndWeaponchain = true;
        }

        BattleManager_startAction_kzk.call(this);
    }

    Game_Actor.prototype.startWeaponChain = function (action) {
        this._lastAction = JsonEx.makeDeepCopy(action);
        this._inWeaponChain = true;
        this.removeAllWeaponsIntoStoreList();
        this._chainWeaponListRunning = JsonEx.makeDeepCopy(this._chainWeaponListBase);
        for (var i = 0; i < this._chainWeaponListRunning.length; i++) {
            var item = $dataWeapons[this._chainWeaponListRunning[i].item];
            if (item && item.meta.subhandwid && i > 0) {
                this._chainWeaponListRunning[i].item = Number(item.meta.subhandwid);
            }
        }
        this._runningWeapon = this._chainWeaponListRunning.shift();
    }


    Game_Actor.prototype.removeAllWeaponsIntoStoreList = function () {
        var maxSlots = this.equipSlots().length;
        this._chainWeaponListBase = [];

        for (var i = 0; i < maxSlots; i++) {
            if (this.equipSlots()[i] === 1) {
                var listobject = {};
                listobject.item = this.equips()[i] ? Number(this.equips()[i].id) : null;
                listobject.slotId = i;
                this._chainWeaponListBase.push(listobject);
                this.changeEquip(i, null);
            }
        }
    }

    Game_Actor.prototype.removeAllWeapons = function () {
        var maxSlots = this.equipSlots().length;
        for (var i = 0; i < maxSlots; i++) {
            if (this.equipSlots()[i] === 1) {
                this.forceChangeEquip(i, null);
            }
        }
    }

    Game_Actor.prototype.equipAllWeaponsFromList = function (listWeapons) {
        var currentWeapon;
        var maxSlots = this._chainWeaponListBase.length;
        for (var i = 0; i < maxSlots; i++) {
            this.equipWeaponFromList(this._chainWeaponListBase[i]);
        }
    }

    Game_Actor.prototype.forceChangeEquipById = function (slotId, itemId) {
        if (this.equipSlots()[slotId] === 1) {
            this.forceChangeEquip(slotId, $dataWeapons[itemId]);
        } else {
            this.forceChangeEquip(slotId, $dataArmors[itemId]);
        }
    };

    Game_Actor.prototype.equipWeaponFromList = function (WeaponStore) {
        if (WeaponStore.item) {
            this.changeEquipById(WeaponStore.slotId + 1, WeaponStore.item);
        }
    }

    Game_Actor.prototype.revertAllWeaponsFromChain = function () {
        if (this._chainWeaponListBase && this._chainWeaponListBase.length > 0) {
            this.removeAllWeapons();
            this.equipAllWeaponsFromList(this._chainWeaponListBase);
            this._chainWeaponListBase = [];
            this._inWeaponChain = false;
        }
    }

    var BattleManager_endAction_kzk = BattleManager.endAction;
    BattleManager.endAction = function () {
        var subject = this._subject;
        var nextaction = subject._lastAction;

        if (subject._inWeaponChain) {
            nextaction._forcing = true;
            subject._actions.unshift(nextaction);
            subject._runningWeapon = subject._chainWeaponListRunning.shift();

            if (this.isCTB && this.isCTB()) {
                if (subject.currentAction()) {
                    this.startCTBAction(subject);
                    return;
                }
            }
        }

        if (subject._runEndWeaponchain) {
            subject.revertAllWeaponsFromChain();
        }

        BattleManager_endAction_kzk.call(this);
    };

    var BattleManager_endBattle_kzk_weapon = BattleManager.endBattle;
    BattleManager.endBattle = function (result) {
        $gameParty.members().forEach(function(chara){
            chara.revertAllWeaponsFromChain();
        }, this);
        
        BattleManager_endBattle_kzk_weapon.call(this, result);
    };



})();