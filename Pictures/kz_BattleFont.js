/*:
 * @plugindesc 戦闘中のポップアップ（ダメージ数値など）を画像ではなく文字で表現する為のプラグインです。
 * @author Souji Kenzaki
 *
 * @param Miss Text
 * @desc 攻撃がミスした場合のポップアップテキストです
 * @default Miss
 *
 * @param HPdmg Color
 * @desc HPダメージを受けた際のポップアップ色です
 * @default #ff3600
 *
 * @param HPHeal Color
 * @desc HP回復を受けた際のポップアップ色です
 * @default #ff3600
 * 
 * @param MPdmg Color
 * @desc MPダメージを受けた際のポップアップ色です
 * @default #31569a
 *
 * @param MPHeal Color
 * @desc MP回復を受けた際のポップアップ色です
 * @default #31569a
 *
 * @param Miss Color
 * @desc 攻撃がミスした際のポップアップ色です
 * @default #ffffff
 *
 * @param Font Name
 * @desc ポップアップのフォント名です
 * @default GameFont
 * 
 * @param Font Size
 * @desc ポップアップのフォントサイズです
 * @default 20
 * 
 * @param Font Overhead
 * @desc アウトラインつきの特殊なフォント用の調整パラメーター。フォントが切れたりする際は数値を増やしてください。
 * @default 0
 *
 * @help
 *
 * 
 */

BattleFontEngine = {};


(function() {
var parameters = PluginManager.parameters('kz_BattleFont');
    
BattleFontEngine._missText = parameters['Miss Text'];

BattleFontEngine._fontColors = [parameters['HPdmg Color'], parameters['HPHeal Color'],parameters['MPdmg Color'],parameters['MPHeal Color'],parameters['Miss Color']];

BattleFontEngine._fontName = parameters['Font Name'] || 'GameFont';

BattleFontEngine._fontSize = Number(parameters['Font Size']) || 20;

BattleFontEngine._fontOverhead = Number(parameters['Font Overhead']) || 0;


//-----------------------Overrides from Original Sprite_Damage---------------------------
kz_Sprite_Damage_prototype_setup = Sprite_Damage.prototype.setup;
Sprite_Damage.prototype.setup = function(target) {
    //後の為のresultCopy. YEPが存在する場合はそれによって上書きされる事前提
    this._result = JsonEx.makeDeepCopy(target.result());
    kz_Sprite_Damage_prototype_setup.call(this, target);
};

Sprite_Damage.prototype.createMiss = function() {
    var text = BattleFontEngine._missText;

    var font = BattleFontEngine._fontName;
    var color = BattleFontEngine._fontColors[4];
    var size = BattleFontEngine._fontSize;
    this.processValueString(text, font, color, size);
};

Sprite_Damage.prototype.createDigits = function(baseRow, value) {
    var string = Math.abs(value).toString();
    var row = baseRow + (value < 0 ? 1 : 0);

    var font = BattleFontEngine._fontName;
    var color = BattleFontEngine._fontColors[row];
    var size = BattleFontEngine._fontSize;
    this.processValueString(string, font, color, size);
};


//-----------------------New Functions---------------------------
Sprite_Damage.prototype.processValueString = function(valueString, font, color, size) {
    var testBitmap = new Bitmap(100,100);
    for (var i = 0; i < valueString.length; i++) {
        var n = valueString[i];
        testBitmap.clear();
        testBitmap.fontFace = font;
        testBitmap.fontSize = size;
        var width = testBitmap.measureTextWidth(n);

        var sprite = this.createChildSpriteText(n, font, color, size, width, BattleFontEngine._fontOverhead);
        sprite.x = (i - (valueString.length - 1) / 2) * sprite.width + BattleFontEngine._fontOverhead * 2;
        sprite.dy = -i;
    }
}

Sprite_Damage.prototype.createChildSpriteText = function(text, font, color, size, width, overhead) {
    var sprite = new Sprite();
    sprite.bitmap= new Bitmap(width + overhead * 2, size)
    sprite.bitmap.clear();
    sprite.bitmap.fontFace = font;
    sprite.bitmap.textColor = color;
    sprite.bitmap.fontSize = size;
    sprite.bitmap.drawText(text, overhead, 0, width + overhead * 2, size, 'center');
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 1;
    sprite.y = -40;
    sprite.ry = sprite.y;
    this.addChild(sprite);
    return sprite;
};

})();
