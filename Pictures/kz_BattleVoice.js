/*:
 * @plugindesc 特定のシチュエーションでボイスを再生する。
 * @author Souji Kenzaki (Special Thanks to MOGHunter for the idea)
 *
 * @param Volume
 * @desc 音量
 * @default 120 
 * 
 * @help
 *   
 * ------------------------------------------------------
 *
 * audio/seの中にoggファイルを用意します。  
 *
 * --------------【アクター、エネミータグ】--------------
 * 
 * <voice_basename:[基本名]>
 * このバトラーに共通するボイスファイル名部分（数値を除いた部分）を設定する。
 * これがないとそのキャラクターの行動時ボイスは一切再生されません。
 * 
 * 以下は各シチュエーションの時ファイル名につく数値の設定タグとなります。
 * タグがないシチュエーションは音声が再生されません。ID数値はボイスの後ろにつく数字であり、
 *  , で区切ることで複数可（毎度ランダムで1つ選ばれます）。
 * マイナス数値が選ばれた場合は再生されません。
 * 
 * <voice_battlestart:[ID数値]>　戦闘開始　
 * （尚バトルイベントにおける０ターン開始のタイミングよりも早い事にご留意ください。
 * 例えバトルイベントでターン０にステートを付与したとしても、このボイスには影響を及ぼせません）
 * 
 * <voice_victory:[ID数値]>　戦闘勝利
 * <voice_escape:[ID数値]>　逃走
 * <voice_defeat:[ID数値]>　敗北
 * <voice_useskill:[ID数値]>　通常攻撃、防御を含むスキル、アイテム使用（後述のスキル側指定がある場合はそちらが優先されます）
 * <voice_counter:[ID数値]>　反撃
 * <voice_reflect:[ID数値]>　反射
 * <voice_actionselect:[ID数値]>　行動選択
 * <voice_damage:[ID数値]>　最大HPの５割以上のダメージを受けた
 * <voice_healed:[ID数値]>　回復を受けた
 *
 * 例：<voice_basename:hiro><voice_battlestart:5>
 *　　 この場合hiro5.oggが戦闘開始時に再生されます。
 * 
 * --------------【クラス、ステート、装備タグ】--------------

 * <voice_offset:[ID数値]>　キャラクターのID数値にこの値だけ加算されます。
 *
 * 例えばアクターのメモに
 * <voice_basename:hiro>
 * <voice_escape:3>
 * と書かれたキャラクターは、普段逃走時にhiro3.oggが再生されますが、
 * <voice_offset:5>
 * のステートが付くとhiro8.oggが再生されるようになります。
 * 
 * --------------【スキルタグ】--------------
 * <voice_index:[ID数値]>
 * このスキルが使用される時は、キャラのvoice_useskillのID数値の代わりに、
 * このタグのID数値が使われます。
 */

(function () {

    var parameters = PluginManager.parameters('kz_BattleVoice');
    var v_volume = Number(parameters['Volume'] || 100);

    function selectRandom(strArray) {
        var array = strArray.split(",");
        var index = Math.randomInt(array.length)
        return array[index];
    };

    //=============================================================================
    // 設定関連
    //=============================================================================	

    SoundManager.playVoice = function (fileName) {
        var se = {};
        se.name = fileName;
        se.pitch = 100;
        se.volume = v_volume;
        AudioManager.playSe(se);
    };

    Game_Battler.prototype.playVoice = function(situation)
    {
        var fileName = this.voiceFileName(situation);
        if (fileName) {
            SoundManager.playVoice(fileName);
        }
    }

    Game_Battler.prototype.voiceFileName = function (situation) {
    };

    Game_Battler.prototype.skillVoiceId = function (skillId) {
        var id = parseInt(skillId);
        return parseInt($dataSkills[id].meta.voice_index)
    };

    //キャラクター固有のシチュID＋ステート補正
    Game_Battler.prototype.sharedVoiceId = function (a, situation) {
        var baseIndex = -1;
        var copy = situation;

        if (situation.indexOf("useskill") == 0) {
            //強制的にスキル側のIDをロード
            baseIndex = this.skillVoiceId(situation.split("_")[1]);
            copy = situation.split("_")[0];
        }
        //技専用がなくシチュエーションある場合
        if (a.meta["voice_" + copy] && baseIndex < 0) {
            baseIndex = parseInt(selectRandom(a.meta["voice_" + copy]));
        }
        if (baseIndex) {
            this.states().forEach(function (e) {
                if (e.meta.voice_offset) {
                    baseIndex += parseInt(e.meta.voice_offset);
                }
            }, this);
            return baseIndex;
        }
        return -1;
    };


    //アクターなのでsharedVoiceIdに加えクラス、装備補正
    Game_Actor.prototype.voiceFileName = function (situation) {
        var a = this.actor();
        var baseName = a.meta["voice_basename"];
        var baseIndex = this.sharedVoiceId(a, situation);
        if (baseName && (baseIndex >= 0)) {
            this.equips().forEach(function (e) {
                if (e.meta.voice_offset) {
                    baseIndex += parseInt(e.meta.voice_offset);
                }
            }, this);

            if (this.currentClass().meta.voice_offset) {
                baseIndex += parseInt(this.currentClass().meta.voice_offset);
            }
            return baseName.concat(baseIndex);
        }
        return null;
    };

    //エネミーはsharedVoiceIdそのまま
    Game_Enemy.prototype.voiceFileName = function (situation) {
        var a = this.enemy();
        var baseName = a.meta["voice_basename"];
        var baseIndex = this.sharedVoiceId(a, situation);
        if (baseName && (baseIndex >= 0)) {
            return baseName.concat(baseIndex);
        }
        return null;
    };



    //=============================================================================
    // 実働関連
    //=============================================================================	

    BattleManager.randomActor = function () {
        var index = Math.randomInt($gameParty.aliveMembers().length);
        return $gameParty.aliveMembers()[index];
    };

    BattleManager.randomEnemy = function () {
        var index = Math.randomInt($gameTroop.aliveMembers().length);
        return $gameTroop.aliveMembers()[index];
    };

    var kz_BattleManager_startBattle = BattleManager.startBattle;
    BattleManager.startBattle = function () {
        kz_BattleManager_startBattle.call(this);
        var actor = this.randomActor();
        if (actor) {
            actor.playVoice("battlestart");
        };
    };

    var BattleManager_processVictory = BattleManager.processVictory;
    BattleManager.processVictory = function () {
        var actor = this.randomActor();
        if (actor) {
            actor.playVoice("victory");
        };
        BattleManager_processVictory.call(this);
    };

    var kz_BattleManager_processEscape = BattleManager.processEscape;
    BattleManager.processEscape = function () {
        var actor = this.randomActor();
        if (actor) {
            actor.playVoice("escape");
        };
        kz_BattleManager_processEscape.call(this);
    };

    var kz_BattleManager_processDefeat = BattleManager.processDefeat;
    BattleManager.processDefeat = function () {
        var actor = this.randomActor();
        if (actor) {
            actor.playVoice("defeat");
        };
        kz_BattleManager_processDefeat.call(this);
    };

    var kz_Game_Battler_prototype_performActionStart = Game_Battler.prototype.performActionStart;
    Game_Battler.prototype.performActionStart = function (action) {
        if (action && action.item()) {
            action.subject().playVoice("useskill_" + action.item().id);
        };
        kz_Game_Battler_prototype_performActionStart.call(this, action);
    };

    var kz_Game_Battler_prototype_performCounter = Game_Battler.prototype.performCounter;
    Game_Battler.prototype.performCounter = function () {
        kz_Game_Battler_prototype_performCounter.call(this);
        this.playVoice("counter");
    };

    var kz_Game_Battler_prototype_performReflection = kz_Game_Battler_prototype_performReflection;
    Game_Battler.prototype.performReflection = function () {
        kz_Game_Battler_prototype_performReflection.call(this);
        this.playVoice("reflect");
    };

    var kz_Scene_Battle_prototype_startActorCommandSelection = Scene_Battle.prototype.startActorCommandSelection;
    Scene_Battle.prototype.startActorCommandSelection = function () {
        BattleManager.actor().playVoice("actionselect");
        kz_Scene_Battle_prototype_startActorCommandSelection.call(this);
    };

    var kz_Window_BattleLog_prototype_displayHpDamage = Window_BattleLog.prototype.displayHpDamage;
    Window_BattleLog.prototype.displayHpDamage = function (target) {
        if (target.result().hpAffected) {
            if (target.result().hpDamage > target.mhp * 0.5) {
                target.playVoice("damage");
            }
            if (target.result().hpDamage < 0) {
                target.playVoice("healed");
            }
        }
        kz_Window_BattleLog_prototype_displayHpDamage.call(this, target);
    };
})();