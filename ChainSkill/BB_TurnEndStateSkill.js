//=============================================================================
// BB_TurnEndStateSkill.js
// Copyright (c) 2016 BB ENTERTAINMENT
//=============================================================================

/*:
 * @plugindesc ターン終了時特定のステートにかかっている場合スキル強制発動プラグイン
 * @author ビービーエンターテイメント (改定：Kenzaki Souji)
 * 
 * @param StateRangeMinimum
 * @desc ターン終了時に判定するステートIDの最小範囲にするID
 * デフォルト：1
 * @default 1
 * 
 * @param StateRangeMaximum
 * @desc ターン終了時に判定するステートIDの最大範囲にするID
 * デフォルト：2
 * @default 2
 * 
 * @help プラグインの説明
 * パラメータの【StateRangeMinimum】で指定したステートIDと
 * 【StateRangeMaximum】で指定したステートIDの間に含まれるステートを
 * ターン終了時に判定します。
 * 
 * 判定したステートにかかっているバトラーがいた場合
 * ステートのメモ欄に記入したスキルが発動します。
 * 
 * メモ欄の記入方法：
 * <state_skill:スキルのID>
 * 例：<state_skill:12>ID12のスキルが発動します。
 * 
 * 利用規約：
 * このプラグインは、MITライセンスのもとで公開されています。
 * Copyright (c) 2016 BB ENTERTAINMENT
 * Released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 * 
 * コンタクト：
 * BB ENTERTAINMENT Twitter: https://twitter.com/BB_ENTER/
 * BB ENTERTAINMENT BLOG   : http://bb-entertainment-blog.blogspot.jp/
 */

BattleManager.exTurnAction = [];

(function() {
'use strict';

// プラグインパラメータ管理
var pluginName = 'BB_TurnEndStateSkill';
var parameters = PluginManager.parameters('BB_TurnEndStateSkill');
var BBSmin = Number(parameters['StateRangeMinimum']);
var BBSmax = Number(parameters['StateRangeMaximum']);

// ターン終了時ステート効果追加
var _Game_Battler_prototype_onTurnEnd = Game_Battler.prototype.onTurnEnd;
Game_Battler.prototype.onTurnEnd = function() {
    var onActivationList = false;   //whether it needs to get into EX turn or not
    for (var i = BBSmin; i < BBSmax + 1; i++) {//パラメータで指定したステートの範囲を判定
        if (this.isStateAffected(i)) {//判定中にそのステートにかかっているバトラーがいた場合
            var SkillID = $dataStates[i].meta.state_skill;//ステートのメモに書いてあるIDをSkillIDに
            if (SkillID)
              {
                var action = new Game_Action(this, true);
                action.setSkill(SkillID);
                action.makeTargets();
                this._actions.push(action);
                onActivationList = true;
              }
        }
    }
    
    if (onActivationList) //if there is at least 1 action to be fired
    {
      BattleManager.exTurnAction.push(this); 
    }
    else
    {
      _Game_Battler_prototype_onTurnEnd.call(this); //end turn normally
    }
};
var BattleManager_endTurn_kzk = BattleManager.endTurn;
BattleManager.endTurn = function() {
    if (!this.exTurn)
    {
      BattleManager_endTurn_kzk.call(this);
      this.exTurn = true; //only execute once until next turn
      this.driveExTurn(); //fire up the initial "drive"
    }
    
    
};

var BattleManager_endAction_kzk = BattleManager.endAction;
BattleManager.endAction = function() {
     BattleManager_endAction_kzk.call(this);
     if ($gameParty.isAllDead() || $gameTroop.isAllDead())
     {
        //reset 
        BattleManager.exTurnAction = [];
        return;
     }
     if (this.exTurn && BattleManager.exTurnAction.length <= 0)  //if all exturn actions has been exausted
     {
      
      this._phase = "turnEnd";  //revert to turn-end
      this.allBattleMembers().forEach(function(battler) {
        _Game_Battler_prototype_onTurnEnd.call(battler); //call all the "original" endturn;
        this.refreshStatus();
        this._logWindow.displayAutoAffectedStatus(battler);
        this._logWindow.displayRegeneration(battler);
    }, this);
     }
     else
     {
        this.driveExTurn();  //continue to drive exTurn if there are still actions left
     }
};

BattleManager.driveExTurn = function() {
     if (this.exTurn)
     {
        var nextExAction = BattleManager.exTurnAction.pop();
        if (!nextExAction)
        {
        return;}
        
        if (nextExAction.isDead())
        {
          this.driveExTurn();
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
        
     }
};

var BattleManager_startTurn_kzk = BattleManager.startTurn;
BattleManager.startTurn = function() {
   BattleManager_startTurn_kzk.call(this);
   this.exTurn = false;
};


})();