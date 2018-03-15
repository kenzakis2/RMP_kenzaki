//=============================================================================
// LinkActionSkill.js
//=============================================================================
/*:
* @plugindesc Enable Reactions to skill usage such as chaining and counter with another skill
* @author Souji Kenzaki
*
* @param InteruptEnemyText
* @desc 敵の行動をクラッシュカウンターでキャンセルした際のテキスト。(%1=元の行動者名 %2=カウンター実行者名 %3=元の行動名 %4=新しい行動名)
* @default %2が%1の%3に割り込み!
*
* @param InteruptSelfText
* @desc 自身の行動がクラッシュカウンターで変化した際のテキスト。(%1=元の行動者名 %2=カウンター実行者名 %3=元の行動名 %4=新しい行動名)
* @default %2の%3が%4に変化した!
*
* @param CounterEnemyText
* @desc 敵の行動に反撃する際のテキスト(%1=元の行動者名 %2=カウンター実行者名 %3=元の行動名 %4=新しい行動名)
* @default %2が%1の%3に%4で反撃！
*
* @param CounterSelfText
* @desc 自身のの行動に連鎖する際のテキスト(%1=元の行動者名 %2=カウンター実行者名 %3=元の行動名 %4=新しい行動名)
* @default %2は続いて%4を発動！
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
* @param InteruptEnemyText
* @desc 敵の行動をクラッシュカウンターでキャンセルした際のテキスト。(%1=元の行動者名 %2=カウンター実行者名 %3=元の行動名 %4=新しい行動名)
* @default %2が%1の%3に割り込み!
*
* @param InteruptSelfText
* @desc 自身の行動がクラッシュカウンターで変化した際のテキスト。(%1=元の行動者名 %2=カウンター実行者名 %3=元の行動名 %4=新しい行動名)
* @default %2の%3が%4に変化した!
*
* @param CounterEnemyText
* @desc 敵の行動に反撃する際のテキスト(%1=元の行動者名 %2=カウンター実行者名 %3=元の行動名 %4=新しい行動名)
* @default %2が%1の%3に%4で反撃！
*
* @param CounterSelfText
* @desc 自身のの行動に連鎖する際のテキスト(%1=元の行動者名 %2=カウンター実行者名 %3=元の行動名 %4=新しい行動名)
* @default %2は続いて%4を発動！
*
* @help このプラグインにはプラグインコマンドはありません。
*
* スキルメモ欄用
* <linkskill:[連鎖確率（%）],[連動スキルID]>
* このスキルの発動直後、[連動スキルID]で指定されたスキルが更に発動します。
* ※更に発動するスキルのターゲットが選択可能な場合ターゲットが両方敵単体、或いは両方味方単体だった場合同じターゲットへ。そうでない場合はランダムにターゲットを選択します。
* 他の場合は敵全体など、技自体の設定が優先されます。
*
* ステートメモ欄用
* <elementcounter:[属性ID],[カウンター確率（%）],[反撃用スキルID]>  
* [属性ID]の属性の攻撃を受けた際、[カウンター確率]の確率で,[反撃用スキルID]を発動します。
*　YEP_ElementCoreによる複数属性対応。
*
* 共通（追加タグ）
*
* <counter_ignorebind>
* このタグが反撃、連動タグと同時に使われた際、例え行動不能のステートを受けていても
* 強制的に行動します。
*
* <counteronhit>
* このタグが反撃、連動タグと同時に使われた際、反応元のアクションが命中した場合のみ反撃や追撃を行います。
*
* <counteronevade>
* このタグが反撃、連動タグと同時に使われた際、反応元のアクションが回避された場合のみ反撃や追撃を行います。
*
* <counteroncrit>
* このタグが反撃、連動タグと同時に使われた際、反応元のアクションがクリティカルした場合のみ反撃や追撃を行います。
*
* <counter_crash>
* このタグが反撃、連動タグと同時に使われた際、反応元のアクションをキャンセルして（発動させない）反撃や追撃を行います。
* 仕様上<counteronhit>/<counteronevade>/<counteroncrit>とは併用できません（結果が出る前にキャンセルしている為）
*
* ※サポートが打ち切られておりますが、一応Yanfly氏のBattleSysCTBで動くように作っております
*/
(function() {
  
   var parameters = PluginManager.parameters('LinkActionSkills');
   var kzktxt_EInterrupt = parameters['InteruptEnemyText'];
   var kzktxt_SInterrupt = parameters['InteruptSelfText'];
   var kzktxt_ECounter = parameters['CounterEnemyText'];
   var kzktxt_SCounter = parameters['CounterSelfText'];
  
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

BattleManager.pushLinkedAction = function(list, isCrash, targets)
   {
        var linkedAction = BattleManager.generateLinkedAction(targets, isCrash);
        if (linkedAction)
        {
            linkedAction._lastActionLS = this._subject._lastActionLS;
            list.unshift(linkedAction);
            return true;
        }
        return false;
   }

   BattleManager.pushCounterAction = function(list, isCrash, targets)
   {
       var counterSuccess = false;
        for(var i = 0; i < targets.length; i++)
        {
            var counterlist = targets[i].calcSkillCounter(this._subject._lastActionLS, isCrash);
            for (var j = 0; j < counterlist.length; j++)
            {
                counterlist[j]._lastActionLS = this._subject._lastActionLS;
                list.unshift(counterlist[j]);
                if (isCrash) {
                    return true;
                }
                else
                {
                    counterSuccess = true;
                }
            }
        }
        return counterSuccess;
   }

   BattleManager.isCounterExecuted = function(list, isCrash, targets)
   {
       if (isCrash)
       {
            if (this.pushCounterAction(list, isCrash, targets)) {
                return true;
            }
            return this.pushLinkedAction(list, isCrash, targets);
       }
       else
       {
           return this.pushCounterAction(list, isCrash, targets) || this.pushLinkedAction(list, isCrash, targets); 
       }
   }
  

   var kz_BattleManager_updateEvent = BattleManager.updateEvent;
   BattleManager.updateEvent = function() {
       if (!this.isActionForced() && !this._processingForcedAction)
       {
            if (!this.exActionListCrush)
            {
                this.exActionListCrush = [];
            }
            if (!this.exActionList)
            {
                this.exActionList = [];
            }

            var nextAction = null;
            if (this.exActionListCrush.length > 0)
            {
                nextAction = this.exActionListCrush.shift();
                if (nextAction._lastActionLS)
                {
                    this._logWindow.counterInterrupt(nextAction._lastActionLS.subject(), nextAction.subject(), nextAction._lastActionLS, nextAction);
                }
            }
            else if (this.exActionList.length > 0)
            {
                nextAction = this.exActionList.shift();
                if (nextAction._lastActionLS)
                {
                    this._logWindow.counterNormal(nextAction._lastActionLS.subject(), nextAction.subject(), nextAction._lastActionLS, nextAction);
                }
            }

            if (nextAction && (this._subject.canMove() || nextAction.counter_ignorebind))
            {
                var nextActionBattler = this.setBattlerFromAction(nextAction);
                this.forceAction(nextActionBattler);
            }
       }
       return kz_BattleManager_updateEvent.call(this);
   };

   BattleManager.setBattlerFromAction = function(action) {
       var battler = action.subject();
       battler._actions.unshift(action);
       return battler;
   };

 var BattleManager_startAction_kzk = BattleManager.startAction;
   BattleManager.startAction = function() {
      var subject = this._subject;
      subject._lastActionLS = subject.currentAction();
      this.prevTargets = [];
    
      this._targets = subject._lastActionLS.makeTargets();
      for(var i = 0; i < this._targets.length; i++)
      {
          this._targets[i]._lastAddedState = [];
      }

      //Initialize Reactive Action Lists
      if (!this.exActionListCrush)
      {
          this.exActionListCrush = [];
      }

      if (this.isCounterExecuted(this.exActionListCrush, true, this._targets))
      {
          console.log(this.exActionListCrush);
          subject._actions.shift();
      }
      else
      {
          console.log("normal");
          BattleManager_startAction_kzk.call(this);
      }
    }

   var BattleManager_endAction_kzk = BattleManager.endAction;
   BattleManager.endAction = function() {
        var backupSubject = this._subject;
        BattleManager_endAction_kzk.call(this);
        this._subject = backupSubject;
        
        //Initialize Reactive Action Lists
        if (!this.exActionList)
        {
            this.exActionList = [];
        }

        if (!this.isCounterExecuted(this.exActionList, false, this.prevTargets))
        {
            if (this._subject._deathSentence)
            {
                this._subject._deathSentence = false;
                this._subject.clearActions();
                this._subject.die();
                this._subject.refresh();
            }
        }
   };
  
   Window_BattleLog.prototype.counterInterrupt = function(origSubj, newSubj, oldAction, newAction) {
      if (origSubj != newSubj)
      {
        if (kzktxt_EInterrupt)
        {
          this.push('addText', kzktxt_EInterrupt.format(origSubj.name(), newSubj.name(), oldAction.item().name, newAction.item().name));
        }
      }
      else
      {
        if (kzktxt_SInterrupt)
        {
          this.push('addText', kzktxt_SInterrupt.format(origSubj.name(), newSubj.name(), oldAction.item().name, newAction.item().name));
        }
      }
   };
  
   Window_BattleLog.prototype.counterNormal = function(origSubj, newSubj, oldAction, newAction) {
      if (origSubj != newSubj)
      {
        if (kzktxt_ECounter)
        {
          this.push('addText', kzktxt_ECounter.format(origSubj.name(), newSubj.name(), oldAction.item().name, newAction.item().name));
        }
      }
      else
      {
        if (kzktxt_SCounter)
        {
          this.push('addText', kzktxt_SCounter.format(origSubj.name(), newSubj.name(), oldAction.item().name, newAction.item().name));
        }
      }
   };
  
   var BattleManager_updateAction = BattleManager.updateAction;
   BattleManager.updateAction = function() {
      var target = this._targets[0];
      BattleManager_updateAction.call(this);
      if (target && !target.isDead())
      {
        var newTarget = JsonEx.makeDeepCopy(target);
        if (target.isEnemy())
        {
          newTarget.backupIndex = target.index();
        }
        this.prevTargets.push(newTarget);    
      }
   };
  
   var Game_Enemy_prototype_index = Game_Enemy.prototype.index;
   Game_Enemy.prototype.index = function() {
      var index_of = Game_Enemy_prototype_index.call(this);
      if (index_of > -1) {return index_of;}
      if (this.backupIndex === 0 || this.backupIndex){return this.backupIndex;}
      return -1;
   };
  
  
  
   //----------------------------------------Links----------------------------------------
   BattleManager.generateLinkedAction = function(targets, counterStartSection) {
    var subject = this._subject;
    var nextaction = JsonEx.makeDeepCopy(subject._lastActionLS);
    var someoneHit = false;
    var someoneEvade = false;
    var someoneCrit = false;
    for(var i = 0; i < targets.length; i++)
    {
      var singleResult = targets[i].result();
      if (singleResult.isHit()) {someoneHit = true;}
      if (!singleResult.isHit()) {someoneEvade = true;}
      if (!singleResult.critical) {someoneCrit = true;}
    }
    if (nextaction.item().meta.counteronhit && !someoneHit) {return null;}
    if (nextaction.item().meta.counteronevade && !someoneEvade) {return null;}
    if (nextaction.item().meta.counteroncrit && !someoneCrit) {return null;}
  
    if (!nextaction || !(nextaction.item()) || !nextaction.item().meta.linkskill) return null;
    if (!((nextaction.item().meta.counter_crash && counterStartSection) ||
      (!nextaction.item().meta.counter_crash && !counterStartSection)))
    {
      return null;
    }
    var linkC = nextaction.item().meta.linkskill.split(",");
    if (linkC.length < 2)
    {
      return null;
    }
    var nextId = linkC[1];
    var nextProb = linkC[0];
     nextaction.counter_ignorebind = nextaction.item().meta.counter_ignorebind;
    nextaction.counter_exaustturn = nextaction.item().meta.counter_exaustturn;
     if (nextId && Math.random() * 100 < nextProb)
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
  

  
   BattleManager.counterRateElement = function(action, target) {
      //targetの全てのステートをスキャンし、itemUsedの該当Elementへの確率を算出
      //計算し、反撃実行されるかどうかを。
      return target.calcSkillCounter(action);
   };
  
  
   Game_BattlerBase.prototype.calcSkillCounter = function(action, counterStartSection) {
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
        if (state) {
          if (!((state.meta.counter_crash && counterStartSection) ||
            (!state.meta.counter_crash && !counterStartSection)))
          {
            continue;
          }
        
          var result = this.result();
          if (state.meta.counteronhit && !result.isHit()) {continue;}
          if (state.meta.counteronevade && result.isHit()) {continue;}
          if (state.meta.counteroncrit && !result.critical) {continue;}
          if (state.meta.statecounter)
          {
            var stateC = state.meta.statecounter.split(",");
            if (stateC.length >= 3) {
              var counterState = Number(stateC[0]);
              var counterStateRate = stateC[1];
              var counterStateSkill = Number(stateC[2]);
  
              if (this._lastAddedState.indexOf(counterState) > -1 && Math.random() * 100 < counterStateRate)
              {
                var newaction = new Game_Action(target, true);
                newaction.setSkill(counterStateSkill);
                newaction._targetIndex = subject.index();
                newaction.counter_ignorebind = state.meta.counter_ignorebind;
                newaction.counter_exaustturn = state.meta.counter_exaustturn;
                counterList.push(newaction);
              }
            }
          }
          if (state.meta.elementcounter)
          {
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
  
  
   //-----StateReact関連----
 var kz_Game_Battler_prototype_addState = Game_Battler.prototype.addState;
    Game_Battler.prototype.addState = function(stateId) {
     if (!this._lastAddedState)
     {
        this._lastAddedState = [];
     }
     this._lastAddedState.push(stateId);
     if (stateId == this.deathStateId() && this.hasDeathReaction())
     {
       this._deathSentence = true;
     }
     else
     {
      kz_Game_Battler_prototype_addState.call(this, stateId);
     }
    };
  
   Game_Battler.prototype.hasDeathReaction = function() {
    for (var i = 0; i < this.states().length; i++)
    {
      var state = this.states()[i];
      if (state.meta.statecounter)
      {
        var stateC = state.meta.statecounter.split(",");
        if (stateC.length >= 3) {
          var counterState = Number(stateC[0]);
          if (counterState == this.deathStateId())
          {
            return true;
          }
        }
      }
    }
    return false;
   }

  var kz_Game_BattlerBase_prototype_revive = Game_BattlerBase.prototype.revive;
  Game_BattlerBase.prototype.revive = function() {
    if (this._deathSentence) {
      this._deathSentence = false;
    }
    kz_Game_BattlerBase_prototype_revive.call(this);
  }

  var kz_Game_Battler_prototype_removeState = Game_Battler.prototype.removeState;
  Game_Battler.prototype.removeState = function(stateId) {
    if (stateId === this.deathStateId() && this._deathSentence) {
        this.revive();
    }
    kz_Game_Battler_prototype_removeState.call(this, stateId);
  };
  
  var kz_Game_Battler_prototype_refresh = Game_Battler.prototype.refresh;
  Game_Battler.prototype.refresh = function() {
    if (this._deathSentence)
    {
      Game_BattlerBase.prototype.refresh.call(this);
    }
    else{
      kz_Game_Battler_prototype_refresh.call(this);
    }
    }
  
   })();
  
  
