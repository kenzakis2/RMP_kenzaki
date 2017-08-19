/*:
 * @plugindesc Skill which unequip/Morph the weapon of the user
 * @author Souji Kenzaki
 *
 *
 * @help No Plugin Commands.
 *
 * Skill Memo:
 *
 * <change_equip:[weaponID]>
 * After this skill activates, the equipped weapon will morph into weapon with [weaponID].
 * Please note that if the user cannot meet equipment requirement, that weapon will also be unequipped.
 * If you set [weaponID] as 9999, you will morph the weapon into unequipped state, thus destorying it.
 *
 * <unequip_w>
 * After this skill activates, the equipped weapon will be unequipped.
 * 
 * If you use both tag above at same time, <unequip_w> will activate first.
 * This means you will unequip your current weapon, and generate a new weapon, then equipping it.
 */

/*:ja
 * @plugindesc 武器変化、解除スキル
 * @author 剣崎宗二
 *
 *
 * @help このプラグインにはプラグインコマンドはありません。
 *
 * スキルメモ欄用
 * <change_equip:[武器ID]>
 * このスキルが発動した「後」、装備している武器が[武器ID]の物に変化します。
 * キャラクターが元々その武器を装備できない場合、その武器は解除されますのでご注意ください。 
 * 尚、[武器ID]を9999とする事で、未装備の状態に変化させる…つまり、装備している武器を完全に破壊／消滅させる事が出来ます。
 *
 * <unequip_w>
 * このスキルが発動した「後」、装備している武器が解除され、アイテム欄に戻ります。
 * 
 * 尚、上記二つのタグを同時に使用した場合、<unequip_w>が先に発動します。
 * つまり、現在装備している武器を解除してアイテム欄に戻した上で、新たにアイテムを生成し、装備する…と言う形になります。
 */

(function() {
  var BattleManager_startAction_kzk_weapon = BattleManager.startAction;
  BattleManager.startAction = function() {
    var subject = this._subject;
    var weaponChange = subject.currentAction().item().meta.change_equip;
    if (weaponChange) {
      subject.tempWeapon = weaponChange;
    }
    subject.unequipWeapon = subject.currentAction().item().meta.unequip_w;
    BattleManager_startAction_kzk_weapon.call(this);
  };

  var BattleManager_endAction_kzk_weapon = BattleManager.endAction;
  BattleManager.endAction = function() {
    var subject = this._subject;
    var tempWeaponItem = null;
    if (subject)
    {
      if (subject.unequipWeapon)
      {
         subject.changeEquip(0, null);
      }
      if (subject.tempWeapon)
      {
         if (!subject.origWeapon && !subject.unequipWeapon)
         {
            subject.origWeapon = subject.equips()[0];
         }
         if (subject.tempWeapon != 9999)
         {
            tempWeaponItem = $dataWeapons[subject.tempWeapon];
         }
         subject.forceChangeEquip(0, tempWeaponItem)
         subject.unequipWeapon = false;
      }
      BattleManager_endAction_kzk_weapon.call(this);
    }
  };

  var BattleManager_endBattle_kzk_weapon = BattleManager.endBattle;
  BattleManager.endBattle = function(result) {
      this.transformTempWeapons();
      BattleManager_endBattle_kzk_weapon.call(this, result);
  };

  BattleManager.transformTempWeapons = function() {
      $gameParty.members().forEach(function(chara){
        if (chara.origWeapon)
        {
           chara.forceChangeEquip(0, chara.origWeapon);
     chara.origWeapon = "";
        }
      });
  };
})();



