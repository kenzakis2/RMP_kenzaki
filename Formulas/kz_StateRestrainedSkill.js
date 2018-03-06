/*:
 * @plugindesc 特定のステートが自身に付与されないと使用不能になるスキル
 * 
 * @author 剣崎宗二
 * 
 * @help
 * スキルのメモ欄に以下の形式でタグを指定します。
 * <state_limit:[ステートID]>
 * 
 * 尚ステートIDは　,　で区切れば複数指定可能であり、
 * その場合は指定された『全ての』ステートが付与されていなければこのスキルは使用可能になりません。
 * 
 * 例：<state_limit:3,5,7>
 * この場合3つのステート(3 5 7)が全て付与されている必要があります。
 */

(function() {
var kz_Game_BattlerBase_prototype_meetsSkillConditions = Game_BattlerBase.prototype.meetsSkillConditions;
Game_BattlerBase.prototype.meetsSkillConditions = function(skill) {
    return kz_Game_BattlerBase_prototype_meetsSkillConditions.call(this, skill) && this.isStateRestraintOk(skill);
};

Game_BattlerBase.prototype.isStateRestraintOk = function(skill) {
    var restraint = skill.meta.state_limit;
    if (!restraint) {return true;}
    
    var resArray = restraint.split(',');
    for (var i = 0; i < resArray.length; i ++)
    {
        var stateId = Number(resArray[i]);
        if (!this.isStateAffected(stateId))
        {
            return false;
        }
    }
    return true;
}

})();