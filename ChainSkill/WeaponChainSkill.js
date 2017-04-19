//=============================================================================
// WeaponChainSkill.js
//=============================================================================

/*:
 * @plugindesc Link up another skill after activating a skill
 * @author Souji Kenzaki
 *
 * @help This plugin does not provide plugin commands.
 *
 * When <linkskill:3> is written in a weapon's note field, 
 * skill id # 3 is used after the original skill is activated.
 * If the target type is same for both skills they will have same target. otherwise, target will be chosen randomly.
 *
 */

/*:ja
 * @plugindesc スキル後、連動して次のスキルを発動します。
 * @author 剣崎宗二
 *
 * @help このプラグインにはプラグインコマンドはありません。
 *
 * スキルの「メモ」欄に、<linkskill:3> と書いた場合、
 * そのスキルの発動直後、スキルID=3のスキルが更に発動します。
 *
 * ※更に発動するスキルのターゲットが選択可能な場合ターゲットが両方敵単体、或いは両方味方単体だった場合同じターゲットへ。そうでない場合はランダムにターゲットを選択します。
 * 他の場合は敵全体など、技自体の設定が優先されます。
 *
 * ※サポートが打ち切られておりますが、一応Yanfly氏のBattleSysCTBで動くように作っております
 */

(function() {


var BattleManager_startAction_kzk = BattleManager.startAction;
BattleManager.startAction = function() {
     var subject = this._subject;
     var action = subject.currentAction();
     subject._runEndWeaponchain = false;
     
     if (!subject._inWeaponChain && action.item().meta.weaponchain && subject.isActor())
     {
        subject.startWeaponChain(action);
     }

     if (subject._inWeaponChain)
     {
        subject.removeAllWeapons();
        subject.equipWeaponFromList(subject._runningWeapon);
        
     }

     if (subject._inWeaponChain && subject._chainWeaponListRunning && subject._chainWeaponListRunning.length <= 0)
     {
        subject._inWeaponChain = false;
        subject._runEndWeaponchain = true;
     }

     BattleManager_startAction_kzk.call(this);
}

Game_Actor.prototype.startWeaponChain = function(action)
{
    this._lastAction = JsonEx.makeDeepCopy(action);
    this._inWeaponChain = true;
    this.removeAllWeaponsIntoStoreList();
    this._chainWeaponListRunning = JsonEx.makeDeepCopy(this._chainWeaponListBase);
    this._runningWeapon = this._chainWeaponListRunning.shift();
}

Game_Actor.prototype.removeAllWeaponsIntoStoreList = function()
{
    var maxSlots = this.equipSlots().length;
    this._chainWeaponListBase = [];

    for (var i = 0; i < maxSlots; i++) {
        if (this.isEquipChangeOk(i) && this.equipSlots()[i] === 1) {
            var listobject = {};
            listobject.item = this.equips()[i];
            listobject.slotId = i;
            this._chainWeaponListBase.push(listobject);
            this.changeEquip(i, null);
        }
    }
}

Game_Actor.prototype.removeAllWeapons = function()
{
    var maxSlots = this.equipSlots().length;
    for (var i = 0; i < maxSlots; i++) {
        if (this.isEquipChangeOk(i) && this.equipSlots()[i] === 1) {
            this.changeEquip(i, null);
        }
    }
}

Game_Actor.prototype.equipAllWeaponsFromList = function(listWeapons)
{
   var currentWeapon;
   var maxSlots = this._chainWeaponListBase.length;
    for (var i = 0; i < maxSlots; i++) {
        this.equipWeaponFromList(this._chainWeaponListBase[i]);
    }
}

Game_Actor.prototype.forceChangeEquipById = function(slotId, itemId) {
    if (this.equipSlots()[slotId] === 1) {
        this.forceChangeEquip(slotId, $dataWeapons[itemId]);
    } else {
        this.forceChangeEquip(slotId, $dataArmors[itemId]);
    }
};

Game_Actor.prototype.equipWeaponFromList = function(WeaponStore)
{
    if (WeaponStore.item) {
      this.changeEquipById(WeaponStore.slotId + 1, WeaponStore.item.id);
    }
}



var BattleManager_endAction_kzk = BattleManager.endAction;
BattleManager.endAction = function() {
     var subject = this._subject;
     var nextaction = subject._lastAction;

      if (subject._inWeaponChain)
      {
        nextaction._forcing = true;
        subject._actions.unshift(nextaction);
        subject._runningWeapon = subject._chainWeaponListRunning.shift();

        if (this.isCTB && this.isCTB()) {
          if (subject.currentAction())
          {
             this.startCTBAction(subject);
             subject._actions.shift();
             return;
          }
        }
     }
     
     if (subject._runEndWeaponchain)
     {
        subject.removeAllWeapons();
        subject.equipAllWeaponsFromList(subject._chainWeaponListBase);
     }
     
     BattleManager_endAction_kzk.call(this);
};
})();