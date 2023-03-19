//=============================================================================
// Barrier.js
//=============================================================================


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
* @param PiercingChain
* @type boolean
* @desc 貫通したダメージが次の障壁に阻まれるかどうか。falseの場合貫通ダメージは他の障壁を無視してキャラクターに入る。
* @default true
*
* @param BarrierAnime 
* @type number
* @desc バリアで防げた場合のアニメーションID（デフォルト）
* @default 1
* 
* @param BarrierBreakAnime 
* @type number
* @desc バリアが割れた場合のアニメーションID（デフォルト）
* @default 2
*
* @help
* ダメージを軽減するバリアを再現するためのプラグインです。
* ステートのメモに<barrier:300> (数字は軽減値）を入れると、値がなくなるまで軽減してくれます。
* 尚軽減値はダメージ計算式と同様の式を入れる事も可能ですが、 '>' が使えない事とa(攻撃側)が存在せずb(付与される側)のみ使用可能であることにご留意ください。
* アニメタグはステートに<BarrierBreakAnime:1>　（割れた場合ID3を再生）
* <BarrierAnime:3>　　（割れなかった場合ID1を再生）
* 等。
* <barrierelement:3,9>で属性ID3,9のみをガード。
* スキルタグ<ignorebarrier>はバリアを強制貫通します。
*/

(function () {

  var parameters = PluginManager.parameters('Barrier');
  var BarrierText = parameters['BarrierText'];
  var BarrierBreakText = parameters['BarrierBreakText'];
  var Piercing = (parameters['Piercing'] == "true");
  var PiercingChain = (parameters['PiercingChain'] == "true");

  var BarrierAnime = Number(parameters['BarrierAnime']);
  var BarrierBreakAnime = Number(parameters['BarrierBreakAnime']);

  function Barrier() {
    throw new Error('This is a static class');
  }

  //ActionLogs系
  var Game_ActionResult_prototype_clear = Game_ActionResult.prototype.clear;
  Game_ActionResult.prototype.clear = function () {
    Game_ActionResult_prototype_clear.call(this);
    this.barrieredDmg = [];
    this.barrieredBreak = [];
  };

  Barrier.findIdIndex = function (array, extid) {
    if (!array) return -1;

    for (var i = 0; i < array.length; i++) {
      if (array[i].id == extid) {
        return i;
      }
    }
    return -1;
  };

  Barrier.findId = function (array, extid) {
    if (!array) return null;

    targetIndex = Barrier.findIdIndex(array, extid)
    if (targetIndex != -1) {
      return array[targetIndex];
    }
    return null;
  };

  Barrier.findFromState = function (array) {
    if (!array) return null;

    for (i = 0; i < array.length; i++) {
      if ($dataStates[array[i]].meta.barrier) {
        return array[i];
      }
    }
    return null;
  };

  Barrier.getUniqueId = function (battler) {
    if (battler.isActor()) {
      return battler.actorId();
    }
    else {
      return "e" + battler.index();
    }
  }

  Barrier.FindAnimeId = function (stateId, broken) {
    if ($dataStates[stateId] && $dataStates[stateId].meta) {
      if (broken && $dataStates[stateId].meta.BarrierBreakAnime) { return Number($dataStates[stateId].meta.BarrierBreakAnime) }

      if (!broken && $dataStates[stateId].meta.BarrierAnime) { return Number($dataStates[stateId].meta.BarrierAnime) }
    }

    return broken ? BarrierBreakAnime : BarrierAnime;
  }

  //Message系
  Window_BattleLog.prototype.displayBarrier = function (target) {
    var targetBarrier = target._barrierList;
    var targetBarrierDmg = target.result().barrieredDmg;
    var targetBarrierBreak = target.result().barrieredBreak;

    var local = this;

    targetBarrierBreak.forEach(function (element) {
      var name = $dataStates[element.id].name;
      var dmg = element.value;
      local.push('showAnimation', target, [target], Barrier.FindAnimeId(element.id, true));
      local.push('addText', BarrierBreakText.format(name, dmg));
    }, this);

    targetBarrierDmg.forEach(function (element) {
      var name = $dataStates[element.id].name;
      var dmg = element.value;

      var barrierDmgd = Barrier.findId(targetBarrier, element.id);
      if (!barrierDmgd) return;

      var left = barrierDmgd.value;
      local.push('showAnimation', target, [target], Barrier.FindAnimeId(element.id, false));
      local.push('addText', BarrierText.format(name, dmg, left));
    }, this);
  };

  var Window_BattleLog_prototype_displayHpDamage = Window_BattleLog.prototype.displayHpDamage;
  Window_BattleLog.prototype.displayHpDamage = function (target) {
    this.displayBarrier(target);
    Window_BattleLog_prototype_displayHpDamage.call(this, target);
  }

  //state系
  var Game_Battler_prototype_addState = Game_Battler.prototype.addState;
  Game_Battler.prototype.addState = function (stateId) {
    Game_Battler_prototype_addState.call(this, stateId);

    var targetState = $dataStates[stateId];
    var targetBarrierState = Barrier.findId(this._barrierList, stateId);
    if (targetState && (targetState.meta.barrier || targetState.meta.healablebarrier)) {
      var b = this;
      var b_str = targetState.meta.healablebarrier ? targetState.meta.healablebarrier : targetState.meta.barrier;
      var b_value = eval(b_str);
      if (!b_value) { b_value = 1; }
      var b_healable = !!targetState.meta.healablebarrier;
      var b_element = targetState.meta.barrierelement ? targetState.meta.barrierelement.split(",") : [];


      if (!targetBarrierState) {
        var barrierStateObject = {};
        barrierStateObject.id = stateId;
        barrierStateObject.value = b_value;
        barrierStateObject.healable = b_healable;
        barrierStateObject.maxValue = b_value;
        barrierStateObject.elements = b_element;
        this._barrierList.push(barrierStateObject);
      }
      else {
        targetBarrierState.value = b_value;
        targetBarrierState.maxValue = b_value;
      }
    }
  };

  var Game_BattlerBase_prototype_eraseState = Game_BattlerBase.prototype.eraseState;
  Game_BattlerBase.prototype.eraseState = function (stateId) {
    Game_BattlerBase_prototype_eraseState.call(this, stateId)
    var targetState = $dataStates[stateId];
    if (targetState && (targetState.meta.barrier || targetState.meta.healablebarrier)) {
      var targetId = Barrier.findIdIndex(this._barrierList, stateId);
      this._barrierList.splice(targetId, 1);
    }
  };

  var kz_Game_BattlerBase_prototype_clearStates = Game_BattlerBase.prototype.clearStates;
  Game_BattlerBase.prototype.clearStates = function () {
    kz_Game_BattlerBase_prototype_clearStates.call(this);
    this._barrierList = [];
  };

  //Dmg系
  var Game_Action_prototype_executeHpDamage = Game_Action.prototype.executeHpDamage;
  Game_Action.prototype.executeHpDamage = function (target, value) {
    var skill = this.item();
    if (target._barrierList && target._barrierList.length > 0 && !skill.meta.ignorebarrier) {
      //バリアリストに何か入ってる場合
      var blist = target._barrierList;
      target.result().barrieredDmg = [];
      target.result().barrieredBreak = [];

      if (value > 0) {
        var removalList = [];
        for (var i = 0; i < blist.length; i++) {
          if (blist[i].elements.length < 1 || this.barrierElementMatch(blist[i], skill))

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

              if (Piercing) {
                value -= blist[i].value;
              }
              else {
                value = 0;
              }
              removalList.push(blist[i].id);
              if (!PiercingChain) { break; }
            }
        }
        for (var i = 0; i < removalList.length; i++) {
          target.removeState(removalList[i]);
        }
      }
      else {
        //回復の場合
        var healableList = blist.filter(function (item) {
          return item.healable;
        });

        for (var i = 0; i < healableList.length; i++) {
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
            if (!PiercingChain) { break; }
          }
        }
      }
    }
    Game_Action_prototype_executeHpDamage.call(this, target, value);
  }

  Game_Action.prototype.barrierElementMatch = function (barrier, skill) {
    if (skill.damage.elementId < 0) {
      var result = false;
      this.subject().attackElements().forEach(function (e) {
        if (barrier.elements.indexOf(e) > 0) {
          result = true;
        }
      }, this)
      return result;
    } else {
      return barrier.elements.indexOf(skill.damage.elementId.toString()) >= 0;
    }
  }
})();


