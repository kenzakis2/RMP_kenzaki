
/*:
 * @plugindesc 一部のアニメを背後に表示する
 * @author Souji Kenzaki
 *
 * @param Back Anime Id
 * @desc キャラクターより後ろに表示するアニメのID
 * @type number[]
 * @default []
 *
 * @help
 */
(function () {
    var parameters = PluginManager.parameters('kz_BackAnime');
    var backAnimeIds = parameters['Back Anime Id'];


    var kz_Sprite_Base_prototype_startAnimation = Sprite_Base.prototype.startAnimation;
    Sprite_Base.prototype.startAnimation = function (animation, mirror, delay) {
        if (backAnimeIds.indexOf(animation.id) >= 0) {
            var sprite = new Sprite_Animation();
            sprite.setup(this._effectTarget, animation, mirror, delay);
            var index = this.findFirstBattlerIndex();
            console.log(index);
            sprite.z = 0; //YEP対応
            this.parent.addChildAt(sprite, index);
            this._animationSprites.push(sprite);
        }
        else {
            kz_Sprite_Base_prototype_startAnimation.call(this, animation, mirror, delay);
        }
    };

    Sprite_Base.prototype.findFirstBattlerIndex = function () {
        var package_children = this.parent.children;
        for (var i = 0; i < package_children.length; i++) {
            if (package_children[i] instanceof Sprite_Battler || package_children[i] instanceof Sprite_Character) {
                return i;
            }
        }
        return 0;
    }
})();