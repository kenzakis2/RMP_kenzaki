(function() {

ImageManager.loadAnimePicture = function(filename, hue) {
    return this.loadBitmap('img/animepictures/', filename, hue, true);
};


    var _Game_Interpreter_pluginCommand =
            Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);        
        if (command === 'showAnimatePicture') {
            $gameScreen.showAnimatePicture(args[4], args[5], args[6], args[0], args[1], args[2], args[3]);
        }
    };

var Game_Picture_prototype_initTarget_kz = Game_Picture.prototype.initTarget;
Game_Picture.prototype.initTarget = function() {
    Game_Picture_prototype_initTarget_kz.call(this);
    this._animateFrame = 0;
    this._frameSpacing = 0;
    this._animateRepeat = false;
    this._origName = this._name;
    this._currentFrame = 0;
    this._fSpacingCount = 0;
};

var Game_Picture_prototype_update_kz = Game_Picture.prototype.update;
Game_Picture.prototype.update = function() {
    if (this._animateFrame > 0)
    {
      this.updateAnimateFrames();
    }
    Game_Picture_prototype_update_kz.call(this);
};

Game_Picture.prototype.setUpAnimateFrame = function(totalFrame, repeat, frameSpace) {
    this._animateFrame = Number(totalFrame);
    console.log(this._animateFrame);
    this._animateRepeat = (repeat == 'true');
    console.log(this._animateRepeat);
    this._frameSpacing = Number(frameSpace) ? Number(frameSpace) : 0;
    console.log(this._frameSpacing);
};

function util_fill3_0(n, d) {
    var m = n.toString(10);
    while (m.length < d) {
        m = "0" + m;
    }
    return m;
}

Game_Picture.prototype.updateAnimateFrames = function() {
    this._fSpacingCount++;
    if (this._fSpacingCount > this._frameSpacing)
    {
       this._fSpacingCount = 0;
       if (this._currentFrame > this._animateFrame)
       {
          this._currentFrame = 0;
          if (!this._animateRepeat)
          {
              this._animateFrame = 0;
              this._animateRepeat = false;
              this._frameSpacing = 0;
          }
       }
       this._name = this._origName + '_' + util_fill3_0(this._currentFrame, 3);
       this._currentFrame++;
    }
};

Game_Screen.prototype.showAnimatePicture = function(totalFrame, repeat, frameSpace, pictureId, name, x, y) {
    this.showPicture(pictureId, name, 0, x, y, 30, 30, 255, 0);
    var realPictureId = this.realPictureId(pictureId);
    for (var i = 0; i <= totalFrame; i++)
    {
       ImageManager.loadAnimePicture(name + '_' + util_fill3_0(i, 3))
    }
    var local = this;
    var waiter = setInterval(function(){ //定期的に繰り返されるIntervalイベント登録
    if (ImageManager.isReady())
    {
       local._pictures[realPictureId].setUpAnimateFrame(totalFrame, repeat, frameSpace);
       clearInterval(waiter);  //executeDrawFaceがtrueを返した場合、Interval消去
    }
    }, 100);　//0.1秒間隔
};

var Sprite_Picture_prototype_loadBitmap = Sprite_Picture.prototype.loadBitmap;
Sprite_Picture.prototype.loadBitmap = function() {
    var animated = this.picture()._animateFrame > 0;
    if (animated)
    {
      this.bitmap = ImageManager.loadAnimePicture(this._pictureName);
    }
    else
    {
      Sprite_Picture_prototype_loadBitmap.call(this);
    }
};

})();
