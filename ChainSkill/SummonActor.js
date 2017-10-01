//=============================================================================
// BattleSummonActor.js
//=============================================================================

/*:
* @plugindesc 戦闘中にアクターを召喚するプラグイン
* @author Souji Kenzaki
*
* @help 戦闘中にアクターを召喚できるようにするプラグインです。
* 近い事はバトルコマンド「メンバーの入れ替え」でも出来ますが、
* これは動的にパーティーサイズを拡張する事で、パーティーが満員の状態でも召喚を可能にします。
* また、一時的な召喚である事を示す為、戦闘終了で召喚されたキャラクターが消えるようになっています。
*　
* スキルメモ欄タグ：
* <summon_actor:[召喚するアクターのID]>
* ．
* 【仕様及び注意点】
* ・召喚されたアクターは他のパーティーメンバー同様に操作可能です。
* ・同じアクターIDは戦場に1体しか存在できません。召喚技を2度使おうとすると失敗しますし、召喚するアクターIDに既にパーティーに居る者を指定した場合も同様です。
* ・召喚は技の他の効果が全て発揮された後に実行されます。全体バフ等を技に含める場合ご注意ください。
* ・召喚はLv1、装備がない状態で成されます。ステータスを設定する際はこの点をご考慮ください。
* ・召喚されたアクターはHPが0になる、或いは戦闘が終了すると消滅します。この際能力値、バフ等が全てリセットされます。
* ・上記の影響の為、一時的にパーティーを離脱しているキャラクターを召喚するのはお勧めいたしません。そのキャラクターのレベルなどがリセットされるためです。
* ・パーティメンバー最大数を操作するプラグインとは競合する可能性があります。出来るだけこのプラグインを下に置くようにしてください。
*/

(function() {

var kz_Game_Party_prototype_initialize = Game_Party.prototype.initialize;
Game_Party.prototype.initialize = function() {
  kz_Game_Party_prototype_initialize.call(this);
  this._summonMemberCount = 0;
};

var kz_Game_Party_prototype_maxBattleMembers = Game_Party.prototype.maxBattleMembers;
Game_Party.prototype.maxBattleMembers = function() {
  return kz_Game_Party_prototype_maxBattleMembers.call(this) + this._summonMemberCount;
};

Game_Party.prototype.summonActorInBattle = function(actorId)
{
   this.lastSummonResult = 1;
   var target = $gameActors.actor(actorId);
   if (target) {
       if (this._actors.indexOf(actorId) < 0)
       {
           this._actors.splice(this.maxBattleMembers(),0,actorId);
           this._summonMemberCount ++;
           target._summoned = true;
           target.appear();
           SceneManager._scene._spriteset.addLastActorSprite();
           this.lastSummonResult = 2;
       }
   }
}

Game_Party.prototype.removeActorFromBattle = function(actorId)
{
   var target = $gameActors.actor(actorId);
   if (target && this._actors.contains(actorId))
   {
       SceneManager._scene._spriteset.removeLastActorSprite();
       this.removeActor(actorId)
       if (target._summoned)
       {
           this._summonMemberCount --;
           $gameActors.deleteActor(actorId);
       }
   }
}

Game_Party.prototype.removeAllSummons = function()
{
   var targetActorIds = [];
   this._actors.forEach(function(actorId){
       if ($gameActors.actor(actorId)._summoned)
       {
           targetActorIds.push(actorId);
       }
   });

   for (var i = 0; i < targetActorIds.length; i++)
   {
       this.removeActorFromBattle(targetActorIds[i]);
   }
}

//データ量節約とデータリセットを兼ねる
Game_Actors.prototype.deleteActor = function(actorId) {
   if (this._data[actorId]) {
       this._data[actorId] = null;
   }
};

//召喚が死亡した際の処理
var kz_Game_Actor_prototype_refresh = Game_Actor.prototype.refresh;
Game_Actor.prototype.refresh = function() {
   kz_Game_Actor_prototype_refresh.call(this);
   if (this.isDead() && this._summoned)
   {
       $gameParty.removeActorFromBattle(this._actorId)
   }
};

var kz_Game_Action_prototype_apply = Game_Action.prototype.apply;
Game_Action.prototype.apply = function(target) {
  $gameParty.lastSummonResult = 0;
  kz_Game_Action_prototype_apply.call(this, target);
  var summonActorId = this.item().meta.summon_actor;
  if (summonActorId)
  {
      var numActorId = parseInt(summonActorId, 10);
      $gameParty.summonActorInBattle(numActorId);
  }
}

var kz_BattleManager_processVictory = BattleManager.processVictory;
BattleManager.processVictory = function() {
  $gameParty.removeAllSummons();
  kz_BattleManager_processVictory.call(this);
}

Spriteset_Battle.prototype.renewAllActors = function() {
  for (var i = 0; i < this._actorSprites.length; i++) {
      this._battleField.removeChild(this._actorSprites[i]);
  }
  this.createActors();
};

Spriteset_Battle.prototype.addLastActorSprite = function() {
  var newActorSprite = new Sprite_Actor();
  this._actorSprites.push(newActorSprite);
  this._battleField.addChild(newActorSprite)
};

Spriteset_Battle.prototype.removeLastActorSprite = function() {
  var targetActorSprite = this._actorSprites.pop()
  this._battleField.removeChild(targetActorSprite)
};

var kz_Window_BattleLog_prototype_endAction = Window_BattleLog.prototype.endAction;
Window_BattleLog.prototype.endAction = function(subject) {
  this.showSummonResult(subject);
  kz_Window_BattleLog_prototype_endAction.call(this, subject);
};

Window_BattleLog.prototype.showSummonResult = function(subject) {
   if ($gameParty.lastSummonResult == 2)
   {
       this.push('addText', "召喚に成功した");
       $gameParty.lastSummonResult = 0;
   }
   else if ($gameParty.lastSummonResult == 1)
   {
       this.push('addText', "召喚に失敗した");
       $gameParty.lastSummonResult = 0;
   }
};

})();