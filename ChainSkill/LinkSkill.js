//=============================================================================
// LinkSkill.js
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

//decideRandomTargetがevalを要する事になるため改変。
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
}


var BattleManager_endAction_kzk = BattleManager.endAction;
BattleManager.endAction = function() {
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
        subject._actions.unshift(nextaction);

        if (this.isCTB && this.isCTB()) {
          if (subject.currentAction())
          {
             this.startCTBAction(subject);
             subject._actions.shift();
             return;
          }
        }
     }
     
     BattleManager_endAction_kzk.call(this);
};

})();