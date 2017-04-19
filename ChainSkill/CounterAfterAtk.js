//=============================================================================
// LinkSkill_for_YEPDTB.js
//=============================================================================

/*:
 * @plugindesc Using a skill to counter after being attacked by certain element
 * @author Souji Kenzaki
 *
 * @help This plugin does not provide plugin commands.
 * 
 * State NoteTag Format: <elementcounter:{element ID},{% probability of counter},{skill id used to counter}>    ex: <elementcounter:1,15,800> will use skill id 800 with 15% chance when hit by element ID one skill/item
 * This plugin is made to work with both CTB and DTB of Yanfly battle system (even though the support is discontinued for the original)
 *
 */

/*:ja
 * @plugindesc 特定の属性の攻撃を受けた際、指定されたスキルにて反撃します。
 * @author 剣崎宗二
 *
 * @help このプラグインにはプラグインコマンドはありません。
 *
 * ステートのメモ欄に
 * <elementcounter:{属性ID},{カウンター確率（%）},{反撃用スキルID}>    例: <elementcounter:1,15,800> は属性ID1の攻撃を受けた際に、15%の確率でスキルID800を発動します。
 *　…というように記述します。
 * 
 *　※現状、複数属性攻撃には対応しておりません。これは各複属性プラグインの間で動作が違っており、一貫した対応ができないのと、作者の時間がない為です。特定のプラグインで複数属性に対応するカスタマイズをする際は"Game_BattlerBase.prototype.calcSkillCounter"を調整してみてください。
 * ※サポートが打ち切られておりますが、一応Yanfly氏のBattleSysCTBで動くように作っております
 */


BattleManager.originalsubject = [];

var BattleManager_startAction_kzk2 = BattleManager.startAction;
BattleManager.startAction = function() {
    BattleManager_startAction_kzk2.call(this)
    this.prevTargets = [].concat(this._targets);
};


var BattleManager_endAction_kzk2 = BattleManager.endAction;
BattleManager.endAction = function() {
     BattleManager_endAction_kzk2.call(this);
     if (this.originalsubject.length > 0)
    {
        this._subject = this.originalsubject.pop();
    }
     if (this._action.isSkill())
    {
        
        var correctedTarget = this._targets.length > 0 ? this._targets : this.prevTargets;
        if (!correctedTarget)
        {
          correctedTarget = [];
        }
        
        
        for (var i = 0; i < correctedTarget.length; i++)
        {
          var executeCounter = this.counterRateElement(this._action, correctedTarget[i]);
          if (executeCounter > 0)
          {
            correctedTarget[i].kzkCounter = true;
            this.invokeAfterCounter(correctedTarget[i], this._subject, executeCounter);
          }
        }
    }
    
    
};

BattleManager.invokeAfterCounter = function(subject, target, skillid) {

    var action = new Game_Action(subject, true);
    action.setSkill(skillid);
    action._targetIndex = target.index();
    subject._actions.unshift(action);
    
    
    if (subject && subject.currentAction())
    {
        if(this.isCTB && this.isCTB()) 
        {
           this.startCTBAction(subject);
           return;
        }
        else
        {
          this.originalsubject.push(this._subject);
          this._subject = subject;
          BattleManager.startAction();
          subject._actions.shift(action);
          
        }
    }
    
};
var Game_Battler_prototype_endTurnAllCTB = Game_Battler.prototype.endTurnAllCTB;
Game_Battler.prototype.endTurnAllCTB = function() {
    if (this.kzkCounter)
    {
      if (this.battler()) this.battler().refreshMotion();
      if (BattleManager.isTickBased()) this.onTurnEnd();
      this.kzkCounter = false;
    }
    else
    {
      Game_Battler_prototype_endTurnAllCTB.call(this);
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
    var elementId = action.checkElementkzk(action, this);
    if (elementId < 0) return 0;
    var rate = 0;
    
    //Yanfly_ElementCore対応
    var extraElements = action.item().multipleElements ? action.item().multipleElements : [];
    
    for (var i = 0; i < this.states().length; i++) {
      var state = this.states()[i];
      
      if (state && state.meta.elementcounter) {
        var elementC = state.meta.elementcounter.split(",");

        if (elementC.length >= 3) {
           var counterElement = elementC[0];
           var counterRate = elementC[1];
           var counterSkill = elementC[2];
           if ((counterElement == elementId || extraElements.indexOf(Number(counterElement)) >= 0) && Math.random() * 100 < counterRate)
           {
              return counterSkill;
           }
        }
      }
    }
    return -1;
};

Game_Action.prototype.checkElementkzk = function() {
    if (this.item().damage.elementId < 0) {
        return this.subject().attackElements()[0];
    } else {
        return this.item().damage.elementId;
    }
};