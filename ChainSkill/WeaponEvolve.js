/*:ja
 * @plugindesc 武器進化プラグイン
 * @author 剣崎宗二
 *
 *
 * @help このプラグインにはプラグインコマンドはありません。
 *
 * 武器メモ欄用
 * <weapon_evolve:[進化先武器ID],[使用回数]>
 * 使用回数回分行動した際、武器が進化先武器IDに変化する。
 * 尚このカウントはキャラ別にカウントされ、同じキャラクターであれば武器をはずしてもう一度つけてもリセットされませんが、他のキャラクターにつけた場合
 *　別カウントとなります。
 *
 * スキルメモ欄用
 * <non_weapon_atk>
 * このスキルは武器を使わないと言うことを示すタグ。このタグが付いたスキルを使用した際、武器進化カウントは増えません。
 * 
 */

(function() {
  var BattleManager_startAction_kzk_weapon = BattleManager.startAction;
  BattleManager.startAction = function() {
    var subject = this._subject;

    if (subject.isActor())
    {
       if (!subject.wEvolveList)
       {
          subject.wEvolveList = [];
       }

       var local = this;
       subject.weapons().forEach(function(item)
       {
         local.setUpWeaponEvolve(subject, item);
       });
    }
    
    subject.isWeaponAttack = !(subject.currentAction().item().meta.non_weapon_atk);
    console.log(BattleManager_startAction_kzk_weapon);
    BattleManager_startAction_kzk_weapon.call(this);
    console.log("done");
  };
    
    

  BattleManager.setUpWeaponEvolve = function(subject, weapon){
    var weaponEvolve = weapon.meta.weapon_evolve;
    if (weaponEvolve) {
      var evolveparams = weaponEvolve.split(',');
      var alreadyExist = false;
      for (var i = 0; i < subject.wEvolveList.length; i++)
      {
          if(subject.wEvolveList[i].id == weapon.id)
          {
              alreadyExist = true;
              break;
          }
      }
      if (!alreadyExist)
      {
          var newEvolveEntry = {}
          newEvolveEntry.id = weapon.id;
          newEvolveEntry.targetItemId = evolveparams[0];
          newEvolveEntry.currentCount = 0;
          newEvolveEntry.maxCount = evolveparams[1];
          subject.wEvolveList.push(newEvolveEntry);
      }
    }
  }

  var BattleManager_endAction_kzk_weapon = BattleManager.endAction;
  BattleManager.endAction = function() {
    var subject = this._subject;
    var tempWeaponItem = null;
    if (subject && subject.wEvolveList && subject.isWeaponAttack)
    {
      this.processWeaponEvolve(subject)
    }
   BattleManager_endAction_kzk_weapon.call(this)
  };

  BattleManager.processWeaponEvolve = function(subject)
  {
    var changeList = [];
    var equipList = subject.equips();
    for (var j = 0; j < equipList.length; j++)
    {
      if (DataManager.isWeapon(equipList[j]))
      {
         for (var i = 0; i < subject.wEvolveList.length; i++)
         {
            var currentListItem = subject.wEvolveList[i];
            if (currentListItem.id == equipList[j].id)
            {
               currentListItem.currentCount++; if
			    (currentListItem.currentCount >= currentListItem.maxCount)
               {
                  var targetItem = currentListItem.targetItemId >= 0 ? $dataWeapons[currentListItem.targetItemId] : null;
                  this._logWindow.weaponMorphMsg(equipList[j], targetItem)
                  subject.forceChangeEquipNoVanish(j, targetItem);
               }
            }
         }
       }
    };
  }
  
  Window_BattleLog.prototype.weaponMorphMsg = function(currentItem, newItem) {
    var text = '';
    if (!newItem)
    {
      text = "装備していた%1が消滅した！"
      this.push('addText', text.format(currentItem.name));
    }
    else
    { 
      text = "装備していた%1が%2に変化した！"
      this.push('addText', text.format(currentItem.name, newItem.name));
    }
  }

  Game_Actor.prototype.forceChangeEquipNoVanish = function(slotId, item) {
      this._equips[slotId].setObject(item);
      this.releaseUnequippableItems(false);
      this.refresh();
  };

  
})();
