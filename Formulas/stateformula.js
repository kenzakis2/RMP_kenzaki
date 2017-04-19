/*:
 *@plugindesc ステート付与率に計算式追加する
 *@author Souji Kenzaki
 *
 *@help
 *ステート付与の計算式のタグ形式：
 *<stateformula{id}:{式}>
 *
 * 数値は％。なので、50％追加とする場合、数値は0.5としなければならない。50ではありません。
 *
 *この数値は設定した基礎値（スキルに　毒　50％　とある物）に追加されます。そのため、タグを使うスキルにはそのIDのステート付加が設定されている必要があります。
 *
 *例として、以下のタグならば、味方の運が敵より30高い場合、ステートID1の確率計算に30％の追加となります。
 *<stateformula1:(a.luk - b.luk) / 100>
 *
 *
 *
*/



var Game_Action_prototype_itemEffectAddNormalState = Game_Action.prototype.itemEffectAddNormalState;
Game_Action.prototype.itemEffectAddNormalState = function(target, effect) {
    var oldValue1 = effect.value1;
    effect.value1 += this.evalStateFormula(target, effect);
    Game_Action_prototype_itemEffectAddNormalState.call(this, target, effect);
    effect.value1 = oldValue1;
};


Game_Action.prototype.evalStateFormula = function(target, effect) {
    try {
        var item = this.item();
        var a = this.subject();
        var b = target;
        var v = $gameVariables._data;
        var tname = "stateformula" + effect.dataId;
        var formula = item.meta[tname];
        var value = eval(formula);
        if (isNaN(value)) value = 0;
        return value;
    } catch (e) {
        return 0;
    }
};