//=============================================================================
// sharedStat.js
//=============================================================================

/*:ja
 * @plugindesc HP/MP/TPをPT内で共有させるプラグイン
 * @author 剣崎宗二
 *
 * @help 
 * プラグインコマンドで有効化します。
 * SharedStat [パラメーター名] [数値、或いはoff]
 * 最終パラメータがoffの場合は通常のシステムに戻ります。
 * 数値の場合はそのパラメーターの最大値及び現在値がその数値となります。
 * 
 * 使用例：
 * SharedStat hp 300
 * 共有HPを300に設定します。
 * 
 * SharedStat mp off
 * MPの共有を解除します。
 *
 */
(function () {
    var _Game_Interpreter_pluginCommand =
        Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'SharedStat') {
            var target = args[1] != 'off';
            switch (args[0]) {
                case 'hp':
                    $gameSystem.useSharedHp = target;
                    if (!isNaN(Number(args[1]))) {
                        $gameSystem.sharedHp = Number(args[1]);
                        $gameSystem.sharedMhp = Number(args[1]);
                    }
                    break;
                case 'mp':
                    $gameSystem.useSharedMp = target;
                    if (!isNaN(Number(args[1]))) {
                        $gameSystem.sharedMp = Number(args[1]);
                        $gameSystem.sharedMmp = Number(args[1]);
                    }
                    break;
                case 'tp':
                    $gameSystem.useSharedTp = target;
                    if (!isNaN(Number(args[1]))) {
                        $gameSystem.sharedTp = Number(args[1]);
                    }
                    break;
            }
        }
    };
})();

Object.defineProperties(Game_BattlerBase.prototype, {
    _hp: {
        get: function () {
            if ($gameSystem.useSharedHp && this.isActor()) {
                return $gameSystem.sharedHp;
            }
            else {
                console.log("get:" + this._trueHp);
                return this._trueHp;
            }
        },
        set: function (val) {
            if ($gameSystem.useSharedHp && this.isActor()) {
                $gameSystem.sharedHp = val;
            }
            else {
                console.log("set:" + val);
                this._trueHp = val;
            }
        }, configurable: true
    },

    mhp: {
        get: function () {
            if ($gameSystem.useSharedHp && this.isActor()) {
                return $gameSystem.sharedMhp;
            }
            else {
                return this.param(0);
            }
        }, configurable: true
    },

    _mp: {
        get: function () {
            if ($gameSystem.useSharedMp && this.isActor()) {
                return $gameSystem.sharedMp;
            }
            else {
                return this._trueMp;
            }
        },
        set: function (val) {
            if ($gameSystem.useSharedMp && this.isActor()) {
                $gameSystem.sharedMp = val;
            }
            else {
                this._trueMp = val;
            }
        }, configurable: true
    },

    mmp: {
        get: function () {
            if ($gameSystem.useSharedMp && this.isActor()) {
                return $gameSystem.sharedMmp;
            }
            else {
                return this.param(1);
            }
        }, configurable: true
    },

    _tp: {
        get: function () {
            if ($gameSystem.useSharedTp && this.isActor()) {
                return $gameSystem.sharedTp;
            }
            else {
                return this._trueTp;
            }
        },
        set: function (val) {
            if ($gameSystem.useSharedTp && this.isActor()) {
                $gameSystem.sharedTp = val;
            }
            else {
                this._trueTp = val;
            }
        }, configurable: true
    },
});