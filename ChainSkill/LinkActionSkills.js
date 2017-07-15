//=============================================================================
// LinkActionSkill.js
//=============================================================================

/*:
 * @plugindesc Enable Reactions to skill usage such as chaining and counter with another skill
 * @author Souji Kenzaki
 *
 * @help This plugin does not provide plugin commands.
 *
 * Memo Tag:
 * For skill:
 * <linkskill:[Skill ID]>
 * Activate Skill with [Skill ID] after this skill is used. 
 * Will attempt to target same enemy.
 *
 * For State
 * <elementcounter:[Element ID],[Probability（%）],[Skill Id]>    
 * When attacked with [Element ID], Counter with [Probability（%）] using Skill with [Skill Id].
 *　Is compatible with Multi-Element by YEP_ElementCore.
 *
 * <counter_exaustturn>
 * When this tag exists along with elementcounter, the counter atk will count as an actual action, 
 * reset CTB charge and reduce the duration of states which progress at "end of action" 
 *
 * <counter_ignorebind>
 * When this tag exists along with elementcounter, counter will happen 
 * even when character is affected by disabling states such as sleep.
 */

/*:ja
 * @plugindesc スキルへの反応関連（連鎖、反撃）
 * @author 剣崎宗二
 *
 * @help このプラグインにはプラグインコマンドはありません。
 *
 * スキルメモ欄用
 * <linkskill:[連動スキルID]>
 * このスキルの発動直後、[連動スキルID]で指定されたスキルが更に発動します。
 * ※更に発動するスキルのターゲットが選択可能な場合ターゲットが両方敵単体、或いは両方味方単体だった場合同じターゲットへ。そうでない場合はランダムにターゲットを選択します。
 * 他の場合は敵全体など、技自体の設定が優先されます。
 *
 * ステートメモ欄用
 * <elementcounter:[属性ID],[カウンター確率（%）],[反撃用スキルID]>    
 * [属性ID]の属性の攻撃を受けた際、[カウンター確率]の確率で,[反撃用スキルID]を発動します。
 *　YEP_ElementCoreによる複数属性対応。
 *
 * <counter_exaustturn>
 * このタグがelementcounterと同時に使われた際、 反撃は追加した1行動として扱われ、 
 * CTBの行動ゲージがリセットされるとともに「行動終了時に持続時間が変動する」ステートの持続時間を実際に1行動分、動かします。 
 *
 * <counter_ignorebind>
 * このタグがelementcounterと同時に使われた際、 例え行動不能のステートを受けていても
 * 強制的に反撃します。
 * 
 * ※サポートが打ち切られておりますが、一応Yanfly氏のBattleSysCTBで動くように作っております
 */
(function() {

BattleManager.originalsubject = []; 

Game_Action.prototype.decideRandomTargetForLink = function() {
    var target;
    if (this.isForDeadFriend()) {
        target = this.friendsUnit().randomDeadTarget();
    } else if (this.isForFriend()) {
        target = this.friendsUnit().randomTarget();
    } else {
        target = this.opponentsUnit().randomTarget();
    }
    if (target) {
        this._targetIndex = target.index();
    } else {
        this.clear();
    }
};

var BattleManager_startAction_kzk = BattleManager.startAction;
BattleManager.startAction = function() {
    var subject = this._subject;
    subject._lastActionLS =  subject.currentAction();
    BattleManager_startAction_kzk.call(this);
    this.prevTargets = [].concat(this._targets);
};

var BattleManager_endAction_kzk = BattleManager.endAction;
BattleManager.endAction = function() {
  BattleManager_endAction_kzk.call(this);

  //Initialize Reactive Action Lists
  if (!this.exActionList)
  {
    this.exActionList = [];
  }
  
  var linkedAction = BattleManager.generateLinkedAction();
  if (linkedAction)
  {
    this.exActionList.unshift(linkedAction);
  }

  for(var i = 0; i < this.prevTargets.length; i++)
  {
    var counterlist = this.prevTargets[i].calcSkillCounter(this._subject._lastActionLS);
    for (var j = 0; j < counterlist.length; j++)
    {
      this.exActionList.unshift(counterlist[j]);
    }
  }
  //console.log(this.exActionList);
  if (this.exActionList.length > 0)
  {
    var nextAction = this.exActionList.shift();
    this._subject = nextAction.subject();
    if (this._subject && (this._subject.canMove() || nextAction.counter_ignorebind))
    {
      this._subject._actions.unshift(nextAction);
      if(this.isCTB && this.isCTB()) 
      {
        
        this._subject.kzkCounter = !nextAction.counter_exaustturn;
        this.startCTBAction(this._subject);
        
      }
      else
      {
          BattleManager.startAction();
          this._subject.removeCurrentAction();
      }
    }
  }
};

//----------------------------------------Links----------------------------------------
BattleManager.generateLinkedAction = function() {
  var subject = this._subject;
  var nextaction = JsonEx.makeDeepCopy(subject._lastActionLS);

  if (!nextaction || !(nextaction.item())) return;
  var nextId = nextaction.item().meta.linkskill;
     
  if (nextId)
  {
    nextaction.setSkill(nextId);
    nextaction._forcing = true;
    
    //Set target
    if (nextaction.needsSelection())
    {
      if (subject._lastActionLS.item().scope == nextaction.item().scope)
      {
        nextaction._targetIndex = subject._lastActionLS._targetIndex;
      } else {
        nextaction.decideRandomTargetForLink();
      }
    }
    
    return nextaction;
  }
  
  return null;
};

//-----------------------Counters---------------------------------------------
var Game_Battler_prototype_endTurnAllCTB = Game_Battler.prototype.endTurnAllCTB;
Game_Battler.prototype.endTurnAllCTB = function() {
    if (this.kzkCounter)
    {
      if (this.battler()) this.battler().refreshMotion();
      //if (BattleManager.isTickBased()) this.onTurnEnd();
      this.kzkCounter = false;
    }
    else
    {
      Game_Battler_prototype_endTurnAllCTB.call(this);
    }
};

var Game_BattlerBase_prototype_updateStateActionEnd = Game_BattlerBase.prototype.updateStateActionEnd;
Game_BattlerBase.prototype.updateStateActionEnd = function() {
  if (!this.kzkCounter)
  {
    Game_BattlerBase_prototype_updateStateActionEnd.call(this);
  }
};


var Game_BattlerBase_prototype_updateStateTurns = Game_BattlerBase.prototype.updateStateTurns;
Game_BattlerBase.prototype.updateStateTurns = function() {
  if (!this.kzkCounter)
  {
    Game_BattlerBase_prototype_updateStateTurns.call(this);
  }
};

BattleManager.counterRateElement = function(action, target) {
    //targetの全てのステートをスキャンし、itemUsedの該当Elementへの確率を算出
    //計算し、反撃実行されるかどうかを。
    return target.calcSkillCounter(action);
};


Game_BattlerBase.prototype.calcSkillCounter = function(action) {
    if (!action)
    { 
       return 0;
    }
    var rate = 0;
    var counterList = [];
    var target = this;
    var subject = action.subject();
    
    //Yanfly_ElementCore対応
    var extraElements = action.checkElementkzk();
    
    for (var i = 0; i < this.states().length; i++) {
      var state = this.states()[i];
      
      if (state && state.meta.elementcounter) {
        var elementC = state.meta.elementcounter.split(",");

        if (elementC.length >= 3) {
           var counterElement = elementC[0];
           var counterRate = elementC[1];
           var counterSkill = elementC[2];
           if ((extraElements.indexOf(Number(counterElement)) >= 0) && Math.random() * 100 < counterRate)
           {
              var newaction = new Game_Action(target, true);
              newaction.setSkill(counterSkill);
              newaction._targetIndex = subject.index();
              newaction.counter_ignorebind = state.meta.counter_ignorebind;
              newaction.counter_exaustturn = state.meta.counter_exaustturn;
              counterList.push(newaction);
           }
        }
      }
    }
    return counterList;
};

Game_Action.prototype.checkElementkzk = function() {
  var elements = [];
  if (typeof this.getItemElements === "function")
  {
     //Yanfly's element core
     elements = this.getItemElements();
  }
  else
  {
    if (this.item().damage.elementId < 0) {
        elements = this.subject().attackElements();
    } else {
        elements.push(this.item().damage.elementId);
    }
  }
  return elements;
};

})();