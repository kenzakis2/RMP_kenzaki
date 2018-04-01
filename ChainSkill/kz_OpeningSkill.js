/*:
* @plugindesc 戦闘開始の際にスキルを自動で発動する
* @author 剣崎宗二
*
*
* @help このプラグインにはプラグインコマンドはありません。
*
* スキル、装備、アクター、エネミーメモ欄用：
* <opening_action:[スキルID],[発動確率(0-100)%]>
* 習得しているスキルや装備している装備の何れかのメモ欄にこのタグがあった場合、戦闘開始直後[発動確率]の％でスキルを発動します。
* ターゲットは自動選択です。
* 発動順については、味方→敵の先頭から、各味方については本体（アクターメモ）→装備→スキルを上から順に発動します。
*/
(function() {
    var kz_BattleManager_startBattle = BattleManager.startBattle;
    BattleManager.startBattle = function() {
        kz_BattleManager_startBattle.call(this);
        this._openingForceActionQueue = [];
        $gameParty.aliveMembers().forEach(this.makeOpeningActionActor, this);
        $gameTroop.aliveMembers().forEach(this.makeOpeningActionEnemy, this);
        console.log(this._openingForceActionQueue);
    };

     var kz_BattleManager_updateEvent = BattleManager.updateEvent;
    BattleManager.updateEvent = function() {
        if (!this.isActionForced() && !this._processingForcedAction && this._openingForceActionQueue.length > 0)
        {
            var nextAction = this._openingForceActionQueue.shift();
            var nextActionBattler = this.setBattlerFromAction(nextAction);
            this.forceAction(nextActionBattler);
        }
        return kz_BattleManager_updateEvent.call(this);
    };

    BattleManager.setBattlerFromAction = function(action) {
        var battler = action.subject();
        battler._actions.unshift(action);
        return battler;
    };

    BattleManager.makeOpeningActionActor = function(actor) {
        var openingActions = this.parseMeta(actor.actor(), 'opening_action');
        actor.equips().forEach(function(equip)
        {
            openingActions = openingActions.concat(this.parseMeta(equip, 'opening_action'));
        }, this);
        actor.skills().forEach(function(skill)
        {
            openingActions = openingActions.concat(this.parseMeta(skill, 'opening_action'));
        }, this);
        openingActions.forEach(function(args){
            this.convertInputAction(actor,args);
        },this)
    };

    BattleManager.makeOpeningActionEnemy = function(enemy) {
        var openingActions = this.parseMeta(enemy.enemy(), 'opening_action');
        openingActions.forEach(function(args){
            this.convertInputAction(enemy,args);
        },this)
    };

    BattleManager.convertInputAction = function(battler, string)
    {
        argArray = string.split(',')
        var skillId = Number(argArray[0]);
        var percentage = argArray[1] ? Number(argArray[1]) / 100 : 1;
        if (percentage > Math.random())
        {
            var newAction = new Game_Action(battler,true);
            newAction.setSkill(skillId);
            this._openingForceActionQueue.push(newAction);
        }
    }

    BattleManager.parseMeta = function(object, tag)
    {
        if (!object) return [];
        if (object.metaArray)
        {
            return object.metaArray[tag] ? object.metaArray[tag] : [];
        }
        else
        {
            return object.meta[tag] ? [object.meta[tag]] : [];
        }
    }
})();