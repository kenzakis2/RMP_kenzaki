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
 * @desc バリア発動時の表示テキスト (%1=吸収ダメージ量 %2=残強度) 破壊された際は表示されません。
 * @default 障壁が%1ダメージを吸収し、残量%2となった！
 *
 * @param BarrierBreakText
 * @desc バリア破壊時メッセージ
 * @default 障壁が破壊された！
 *
 * @param Piercing
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
  this.barrieredDmg = {};
  this.barrierBreak = false;
};

Barrier.findIdIndex = function(array, extid)
{
  for (i = 0; i < array.length; i++)
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
  targetIndex = Barrier.findIdIndex(array, extid)
  if (targetIndex != -1)
  {
    return array[targetIndex];
  }
  return null;
};

Barrier.findFromState = function(array)
{
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
  processingId = Barrier.getUniqueId(target);  
  var targetBarrierDmg = target.result().barrieredDmg;
  
  var targetBarrierState = Barrier.findId($BarrierList, processingId);
  if (targetBarrierState)
  {
    barrierLeft = targetBarrierState.value;
  }
  else
  {
    barrierLeft = 0;
  }
  if (targetBarrierDmg.value)
  {
    this.push('addText', BarrierText.format(targetBarrierDmg.value,barrierLeft));
  }
  
  if (target.result().barrierBreak)
  {
    this.push('addText', BarrierBreakText);
  }
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
  targetState = $dataStates[stateId];
  processingId = Barrier.getUniqueId(this);
  var targetBarrierState = Barrier.findId($BarrierList, processingId);  
    if (targetState && targetState.meta.barrier)
    {
      if (!targetBarrierState)
      {
        var barrierStateObject = {};
        barrierStateObject.id = Barrier.getUniqueId(this);
        barrierStateObject.value = parseInt(targetState.meta.barrier);
        $BarrierList.push(barrierStateObject);
      }
      else
      {
        targetBarrierState.value = parseInt(targetState.meta.barrier);
      }
    }
};

var Game_Battler_prototype_removeState = Game_Battler.prototype.removeState;
Game_Battler.prototype.removeState = function(stateId) {
  Game_Battler_prototype_removeState.call(this, stateId)
  processingId = Barrier.getUniqueId(this);
  targetState = $dataStates[stateId];
  if (targetState && targetState.meta.barrier)
  {
    var targetId = Barrier.findIdIndex($BarrierList, processingId);
    $BarrierList.splice(targetId,1);
  }
};

//Dmg系
var Game_Action_prototype_executeHpDamage = Game_Action.prototype.executeHpDamage;
Game_Action.prototype.executeHpDamage = function(target, value) {
  processingId = Barrier.getUniqueId(target);
  var targetBarrierState = Barrier.findId($BarrierList, processingId);
  var targetBarrierStateIndex = Barrier.findIdIndex($BarrierList, processingId);
  
  if (targetBarrierState)
  {
    if (value >= targetBarrierState.value)
    {
      var state = Barrier.findFromState(target._states);
      target.removeState(state);
      target.result().barrierBreak = true;
      if (Piercing)
      {
        value -= targetBarrierState.value;
      }
      else
      {
        value = 0;
      }
    }
    else
    {
      targetBarrierState.value -= value;
      target.result().barrieredDmg.id = Barrier.getUniqueId(target);
      target.result().barrieredDmg.value = value;
      value = 0;
    }
  }
  Game_Action_prototype_executeHpDamage.call(this, target, value);
}
})();