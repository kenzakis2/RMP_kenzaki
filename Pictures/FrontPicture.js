/*:
 * @plugindesc ウィンドウより前にピクチャを表示、削除できるようになります。
 * 
 * @author Kenzaki Souji
 *
 * @help
 * プラグインコマンドから以下のコマンドを使って、ウィンドウより前にピクチャを表示、削除できるようになります。
 *
 * 設置：　FrontPicture show [id] [pictureフォルダ内画像名] [x] [y];
 *
 * 使用例； 画像"some.png"をx=50 y=60に表示
 * FrontPicture show 1 some 50 60;
 *
 * 削除：　FrontPicture remove [id]
 */

var $frontPictures = [];

(function() {
    var pluginName = 'FrontPicture';

var parameters = PluginManager.parameters(pluginName);
    var _Game_Interpreter_pluginCommand =
            Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);       
        if (command === pluginName) {
            switch (args[0]) {
            case 'show':
                SceneManager._scene.showPictureUpperLayer(args[1], args[2], args[3], args[4]);
                break;
            case 'remove':
                SceneManager._scene.removePictureUpperLayer(args[1]);
                break;
            }
        }
    };

var kz_Scene_Base_prototype_createWindowLayer = Scene_Base.prototype.createWindowLayer;
Scene_Base.prototype.createWindowLayer = function() {
    kz_Scene_Base_prototype_createWindowLayer.call(this);

    var container = new Sprite();
    var width = Graphics.boxWidth;
    var height = Graphics.boxHeight;
    var x = (Graphics.width - width) / 2;
    var y = (Graphics.height - height) / 2;
    container.setFrame(x, y, width, height);
    this._upperPictureLayer = container;
    this.addChild(container);
};


Scene_Base.prototype.showPictureUpperLayer = function(id, bitmap, x, y)
{
    var pic = new Sprite();
    pic.bitmap = ImageManager.loadPicture(bitmap);
　　　　pic.x = x;
    pic.y = y;
    if ($frontPictures[id])
    {
       this._upperPictureLayer.removeChild($frontPictures[id]); 
    }
    this._upperPictureLayer.addChild(pic);
    $frontPictures[id] = pic;
}

Scene_Base.prototype.removePictureUpperLayer = function(id)
{
    this._upperPictureLayer.removeChild($frontPictures[id]);
    $frontPictures[id] = null; 
}

})();