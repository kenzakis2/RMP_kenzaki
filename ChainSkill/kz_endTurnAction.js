//=============================================================================
// kz_endTurnAction.js
//=============================================================================

/*:
 * @plugindesc ターン終了時特定のステートにかかっている場合スキル強制発動プラグイン（改訂版）
 * @author Souji Kenzaki
 *  
 * @help プラグインの説明
 * 判定したステートにかかっているバトラーがいた場合
 * ステートのメモ欄に記入したスキルが発動します。
 * 
 * メモ欄の記入方法：
 * <state_skill:スキルのID>
 * 例：<state_skill:12>ID12のスキルが発動します。
 * 
 */
(function () {

    var BattleManager_startTurn_kzk = BattleManager.startTurn;
    BattleManager.startTurn = function () {
        BattleManager_startTurn_kzk.call(this);
        this.exTurn = false;
        this.exTurnAction = [];
    };

    var BattleManager_endTurn_kzk = BattleManager.endTurn;
    BattleManager.endTurn = function () {
        if (this.exTurnAction.length > 0)
        {
            this.driveExTurn();
        } 
        else if (!this.exTurn) {
            this.produceEndTurnExAction();
            this.exTurn = true; //only execute once until next turn
        }
        else {
            BattleManager_endTurn_kzk.call(this)
        }
    };

    BattleManager.driveExTurn = function () {
        var nextExAction = BattleManager.exTurnAction.pop();
        if (!nextExAction || nextExAction.isDead()) {
            return;
        }

        this._subject = nextExAction;
        this.startAction();
        this._subject.removeCurrentAction();
        if (this._subject.currentAction()) //if there is still things to do with this battler
        {
            //put it back
            BattleManager.exTurnAction.push(this._subject);
        }
    };

    BattleManager.produceEndTurnExAction = function () {
        $gameParty.produceEndTurnExAction();
        $gameTroop.produceEndTurnExAction();
    }

    Game_Unit.prototype.produceEndTurnExAction = function () {
        this.aliveMembers().forEach(function (battler) {
            battler.produceEndTurnExAction();
        }, this);
    }

    Game_Battler.prototype.produceEndTurnExAction = function () {
        this.clearActions();
        this.states().forEach(function (state) {
            var SkillID = state.meta.state_skill;//ステートのメモに書いてあるIDをSkillIDに
            if (SkillID) {
                var action = new Game_Action(this, true);
                action.setSkill(SkillID);
                action.makeTargets();
                this._actions.push(action);
            }
        }, this);

        if (this._actions.length > 0) {
            BattleManager.exTurnAction.push(this);
        }
    }

})();