//=============================================================================
// Barrier.js
//=============================================================================

/*:en
* @plugindesc Implementing "Barrier" States
* @author Souji Kenzaki
*
* @param BarrierText
* @desc The text which will be displayed when barrier is not broken when attacked (%1=吸収ダメージ量 %2=残強度)
* @default The barrier took %1 damage, and is at strength of %2!
*
* @param BarrierBreakText
* @desc Message when barrier is broken
* @default Barrier has been broken!
*
* @param Piercing
* @desc Whether the damage that exceeds barrier strength will be dealt to it's user.
* @default true
*
* @help
* This is a plugin for implementing barrier type of states.
* in the memo section of state, write in format of <barrier: [Strength]>
* such as <barrier:300>. It will negate damage in exchange for strength reduction, until it runs out of strength.
*/

/*:ja
* @plugindesc バリアステートの実装
* @author 剣崎宗二
*
* @param BarrierText
* @desc バリア発動時の表示テキスト (%2=吸収ダメージ量 %3=残強度 %1=バリアのステート名) 破壊された際は表示されません。
* @default %1が%2ダメージを吸収し、残量%3となった！
*
* @param BarrierBreakText
* @desc バリア破壊時メッセージ(%1=バリアのステート名 %2=ダメージ量)
* @default %1が%2のダメージを受け破壊された！
*
* @param Piercing
* @type boolean
* @desc 障壁の体力を超過したダメージが貫通するか否か。falseの場合、如何なる大技でも一発は無効化する。
* @default true
*
* @help
* ダメージを軽減するバリアを再現するためのプラグインです。
* ステートのメモに<barrier:300> (数字は軽減値）を入れると、値がなくなるまで軽減してくれます。
*/
var $BarrierList       = [];

(function() {

var parameters = PluginManager.parameters('Barrier');
var BarrierText = parameters['BarrierText'];
var BarrierBreakText = parameters['BarrierBreakText'];
var Piercing = (parameters['Piercing'] == "true");

function Barrier() {
 throw new Error('This is a static class');
}

//ActionLogs系
var Game_ActionResult_prototype_clear = Game_ActionResult.prototype.clear;
Game_ActionResult.prototype.clear = function() {
  Game_ActionResult_prototype_clear.call(this);
  this.barrieredDmg = [];
  this.barrieredBreak = [];
};

Barrier.findIdIndex = function(array, extid)
{
 if (!array) return -1;

 for (var i = 0; i < array.length; i++)
 { 
   if (array[i].id == extid)
   {
     return i;
   }
 }
 return -1;
};

Barrier.findId = function(array, extid)
{
 if (!array) return null;

 targetIndex = Barrier.findIdIndex(array, extid)
 if (targetIndex != -1)
 {
   return array[targetIndex];
 }
 return null;
};

Barrier.findFromState = function(array)
{
 if (!array) return null;

 for (i = 0; i < array.length; i++)
 {
   if ($dataStates[array[i]].meta.barrier)
   {
     return array[i];
   }
 }
 return null;
};

Barrier.getUniqueId = function(battler)
{
 if (battler.isActor())
 {
   return battler.actorId();
 }
 else
 {
   return "e" + battler.index();
 }
}

//Message系
Window_BattleLog.prototype.displayBarrier = function(target) {
 var targetBarrier = target._barrierList;
 var targetBarrierDmg = target.result().barrieredDmg;
 var targetBarrierBreak = target.result().barrieredBreak;

 var local = this;

 targetBarrierBreak.forEach(function(element) {
   var name = $dataStates[element.id].name;
   var dmg = element.value;
   local.push('addText', BarrierBreakText.format(name, dmg));
 }, this);

 targetBarrierDmg.forEach(function(element) {
   var name = $dataStates[element.id].name;
   var dmg = element.value;
   var left = Barrier.findId(targetBarrier, element.id).value;
   local.push('addText', BarrierText.format(name,dmg,left));
 }, this);
};

var Window_BattleLog_prototype_displayHpDamage = Window_BattleLog.prototype.displayHpDamage;
Window_BattleLog.prototype.displayHpDamage = function(target) {
 this.displayBarrier(target);
 Window_BattleLog_prototype_displayHpDamage.call(this, target);
}

//state系
var Game_Battler_prototype_addState = Game_Battler.prototype.addState;
Game_Battler.prototype.addState = function(stateId) {
 Game_Battler_prototype_addState.call(this, stateId);
 if (!this._barrierList)
 {
    this._barrierList = [];
 }

 targetState = $dataStates[stateId];
 var targetBarrierState = Barrier.findId(this._barrierList, stateId); 
   if (targetState && (targetState.meta.barrier || targetState.meta.healablebarrier))
   {
     var b_value = targetState.meta.healablebarrier ? targetState.meta.healablebarrier : targetState.meta.barrier;
     var b_healable = (targetState.meta.healablebarrier && targetState.meta.healablebarrier > 0);
     if (!targetBarrierState)
     {
       var barrierStateObject = {};
       barrierStateObject.id = stateId;
       barrierStateObject.value = parseInt(b_value);
       barrierStateObject.healable = b_healable;
       barrierStateObject.maxValue = parseInt(b_value);
       this._barrierList.push(barrierStateObject);
     }
     else
     {
       targetBarrierState.value = parseInt(b_value);
     }
   }
};

var Game_Battler_prototype_removeState = Game_Battler.prototype.removeState;
Game_Battler.prototype.removeState = function(stateId) {
 Game_Battler_prototype_removeState.call(this, stateId)
 if (!this._barrierList)
 {
    this._barrierList = [];
 }
 targetState = $dataStates[stateId];
 if (targetState && (targetState.meta.barrier || targetState.meta.healablebarrier))
 {
   var targetId = Barrier.findIdIndex(this._barrierList, stateId);
   this._barrierList.splice(targetId,1);
 }
};

//Dmg系
var Game_Action_prototype_executeHpDamage = Game_Action.prototype.executeHpDamage;
Game_Action.prototype.executeHpDamage = function(target, value) {
 if (target._barrierList && target._barrierList.length > 0)
 {
   //バリアリストに何か入ってる場合
   var blist = target._barrierList;
   target.result().barrieredDmg = [];
   target.result().barrieredBreak = [];

   if (value > 0)
   {
       //ダメージの場合
       for (var i = 0; i < blist.length; i++)
       { 
           if (blist[i].value > value)  //割れなかった場合
           {
               var dmgObject = {};
               dmgObject.id = blist[i].id;
               dmgObject.value = value;
               target.result().barrieredDmg.push(dmgObject);

               blist[i].value -= value;
               value = 0;
               break;
           }
           else  //割れた場合
           {
               var breakObject = {};
               breakObject.id = blist[i].id;
               breakObject.value = blist[i].value;
               target.result().barrieredBreak.push(breakObject);

               if (Piercing)
               {
                   value -= blist[i].value;
               }
               else
               {
                   value = 0;
               }
               target.removeState(blist[i].id);
           }
       }
   }
   else
   {
       //回復の場合
       var healableList = blist.filter(function(item)
       {
           return item.healable;
       });

       for (var i = 0; i < healableList.length; i++)
       {
           var dmgOnBarrier = healableList[i].value - healableList[i].maxValue;
           if (dmgOnBarrier < value) //バリアの減りの方が激しい場合
           {
               var dmgObject = {};
               dmgObject.id = blist[i].id;
               dmgObject.value = value;
               target.result().barrieredDmg.push(dmgObject);

               healableList[i].value -= value;
               value = 0;
               break;
           }
           else //回復量が上回った場合
           {
               var dmgObject = {};
               dmgObject.id = blist[i].id;
               dmgObject.value = dmgOnBarrier;
               target.result().barrieredDmg.push(dmgObject);

               value -= dmgOnBarrier;
           }
       }
     }
   }
   Game_Action_prototype_executeHpDamage.call(this, target, value);
 }
})();


