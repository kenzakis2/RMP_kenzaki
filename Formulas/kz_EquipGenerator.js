/*:ja
 * @plugindesc プラグインコマンドから武器、防具を合成します。
 * @author Souji Kenzaki　(@EYN_Kenzaki)
 *
 * 
 * @help
 * プラグインコマンド
 * 
 * 合成：
 * MergeWeapon [合成目標の武器id] [合成させる武器のid]
 * MergeArmor [合成目標の防具id] [合成させる武器のid]
 * 
 * 各パラメーターがvで始まる場合はその番号の変数を読みます。
 * 
 * 例1：MergeWeapon 4 7 
 * 7番のアイテムのステータスを4番のアイテムに合成させます。
 * 
 * 例2:MergeWeapon v3 v10 
 * 変数10にあるアイテムidのアイテムを、変数3にあるアイテムidのアイテムに合成させます。
 * 
 * 
 * 
 * 消去：
 * ClearWeapon [id] 
 * id番の武器をデフォルトに戻します
 * 
 * ClearArmor [id] 
 * id番の防具をデフォルトに戻します
 *
 * 
 * 
 * 【諸注意】
 * ・仕様上、[合成目標の武器]の名称が空白だった場合は、その武器は[合成させる武器]により『上書き』されます。（初期状態の対処です）
 * ・コピー合成されるのはパラメーター（攻撃力、防御力など）、価額、特徴（同じ特徴があった場合は1個になるわけではなく、2つ併記されている状態と同等になります）、名称（後述）となります。
 * ・名称に際しては、[合成させる武器]の最初か最後に半角の + があった場合、そこに元のアイテムの名前が付けられます。複数は無効で、前にある+の方が優先されます。
 * 　　例：[合成目標の武器]名称: 剣　　[合成させる武器]名称：轟音+      →　合成結果の名称:轟音剣
 *    例：[合成目標の武器]名称: 槍　　[合成させる武器]名称：+轟音+      →　合成結果の名称:槍轟音+
 * 
 */

EquipGenerator = {};

var $dataWeapons_bak = null;
var $dataArmors_bak = null;

(function() {

var _Game_Interpreter_pluginCommand =
Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);        
    if (command === 'MergeWeapon') {
        EquipGenerator.MergeItem(1, args[0], args[1]);
    }
    if (command === 'ClearWeapon') {
        EquipGenerator.clearItem(1, args[0]);
    }
    if (command === 'MergeArmor') {
        EquipGenerator.MergeItem(2, args[0], args[1]);
    }
    if (command === 'ClearArmor') {
        EquipGenerator.clearItem(2, args[0]);
    }
};

EquipGenerator.convertVariables = function(parameter)
{
    if (parameter.startsWith("v"))
    {
        return $gameVariables.value(Number(parameter.substring(1)));
    }
    return Number(parameter);
}

EquipGenerator.MergeItem = function(type, dataTargetId, sourceItem)
{
    var realSourceItemId = this.convertVariables(sourceItem);
    var realDataTargetId = this.convertVariables(dataTargetId);
    var target = {};
    var temp = {};
    if (type == 1)
    {
        target = $dataWeapons;
        temp = $gameSystem.generatedWeapons;
    }
    else
    {
        target = $dataArmors;
        temp = $gameSystem.generatedArmors;
    }

    if (target[realDataTargetId] && target[realDataTargetId].name)
    {
        target[realDataTargetId] = this.ItemFusion(target[realDataTargetId], target[realSourceItemId]);
    }
    else
    {
        var id = target[realDataTargetId].id
        target[realDataTargetId] = target[realSourceItemId];
        target[realDataTargetId].id = id;
    }
    
    temp[realDataTargetId] = target[realDataTargetId]
}

EquipGenerator.ItemFusion = function(targetItem, sourceItem)
{
    var resultItem = JsonEx.makeDeepCopy(targetItem);
    resultItem.price += sourceItem.price;
    resultItem.traits = resultItem.traits.concat(sourceItem.traits);
    for(var i = 0; i < resultItem.params.length; i++)
    {
        resultItem.params[i] += sourceItem.params[i];
    }
    resultItem.name = this.produceItemName(resultItem.name, sourceItem.name);

    return resultItem;
}

EquipGenerator.produceItemName = function(targetName, sourceName)
{
    if (sourceName.startsWith("+"))
    {
        return targetName + sourceName.substring(1);
    }
    else if(sourceName.endsWith("+"))
    {
        return sourceName.substring(0, sourceName.length - 1) + targetName;
    }

    return sourceName;
}

EquipGenerator.clearItem = function(type, id)
{
    var realId = this.convertVariables(id);
    if (Number(type) == 1)
    {
        $gameSystem.generatedWeapons[realId] = null;
        $dataWeapons[realId] = $dataWeapons_bak[realId];
    }
    else if (Number(type) == 2)
    {
        $gameSystem.generatedArmors[Number(id)] = null;
        $dataArmors[realId] = $dataArmors_bak[realId];
    }
}

var kz_DataManager_loadDatabase = DataManager.loadDatabase;
DataManager.loadDatabase = function() {
    kz_DataManager_loadDatabase.call(this);
    $dataWeapons_bak = JsonEx.makeDeepCopy($dataWeapons);
    $dataArmors_bak = JsonEx.makeDeepCopy($dataArmors);
};

EquipGenerator.refreshAll = function()
{
    for (var i = 0; i < $gameSystem.generatedWeapons.length; i++)
    {
        if ($gameSystem.generatedWeapons[i])
        {
            $dataWeapons[i] = $gameSystem.generatedWeapons[i];
        }
    }
    for (var i = 0; i < $gameSystem.generatedArmors.length; i++)
    {
        if ($gameSystem.generatedArmors[i])
        {
            $dataArmors[i] = $gameSystem.generatedArmors[i];
        }
    }
}


var kz_Game_System_prototype_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
    kz_Game_System_prototype_initialize.call(this);
    if (!this.generatedWeapons)
    {
        this.generatedWeapons = [];
    }
    if (!this.generatedArmors)
    {
        this.generatedArmors = [];
    }
};

var kz_DataManager_extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
    kz_DataManager_extractSaveContents.call(this, contents);
    EquipGenerator.refreshAll();
};

})();