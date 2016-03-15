"use strict";

var G = namespace("HD.Game.Gomoku");
G.Adapter = namespace("HD.Game.Gomoku.Adapter");

/**
 * Játék csatolása a szerverhez (ajax kérések)
 * @type {Object}
 */
G.Adapter.Server = {

	/**
	 * Timeout ID-k
	 * @type {Object}
	 * @description szerkezet: {
	 *		<függvénynév> : TimeoutID,
	 *		...
	 * }
	 */
	timer : {},

	/**
	 * Ajax kérés indítása
	 * @param {Object} options ajax kérés paraméterei
	 */
	ajax : function(options){
		$.ajax(options);
	},

	/**
	 * Várakozás másik felhasználó által kiváltott eseményre
	 * @param {String} func adapter függvény
	 * @param {Object} options ajax kérés paraméterei
	 * @param {Function} callback esemény bekövetkezése utáni callback
	 */
	stream : function(func, options, callback){
		var This = this;
		var interval = 5000;
		this.timer[func] = window.setInterval(function(){
			$.ajax(Object.assign(options, {
				success : function(resp){
					if (resp.stream){
						callback.call(resp);
						window.clearInterval(This.timer[func]);
					}
				}
			}));
		}.bind(this), interval);
	},

	/* AJAX KÉRÉSEK */

	/**
	 * Új játék indítása
	 * @param {Object} formData űrlapon megadott adatok a G.options objektum formátumában
	 * @param {Function} callback ajax callback
	 */
	setGame : function(formData, callback){
		this.ajax({
			type : "POST",
			url : "ajax/setgame",
			data : formData,
			dataType : "json",
			success : function(resp){
				callback(resp);
			}
		});
	},

	/**
	 * Játék adatainak lekérdezése
	 * @param {Function} callback ajax callback
	 */
	getGame : function(callback){
		this.ajax({
			type : "GET",
			url : "ajax/getgame/" + G.Data.gameID,
			dataType : "json",
			success : function(resp){
				callback(resp);
			}
		});
	},

	/**
	 * Csatlakozás
	 * @param {Object} playerData játékos azonosítója és neve
	 * @param {Function} callback ajax callback
	 */
	setConnect : function(playerData, callback){
		this.ajax({
			type : "POST",
			url : "ajax/setconnect",
			data : {
				game_id : G.Data.gameID,
				player_id : playerData.id,
				player_name : playerData.name
			},
			dataType : "json",
			success : function(resp){
				callback(resp);
			}
		});
	},

	/**
	 * Csatlakozás lekérdezése
	 * @param {Function} callback ajax callback
	 */
	getConnect : function(callback){
		this.stream("getConnect", {
			type : "GET",
			url : "ajax/getconnect/" + G.Data.gameID,
			dataType : "json"
		}, callback);
	},

	/**
	 * Saját kő lerakása
	 * @param {Number} fieldID lerakás helye
	 * @param {Function} callback ajax callback
	 */
	setStep : function(fieldID, callback){
		this.ajax({
			type : "POST",
			url : "ajax/setstep",
			data : {
				game_id : G.Data.gameID,
				player_id : G.Data.currentPlayerID,
				field : fieldID
			},
			dataType : "json",
			success : function(resp){
				callback(resp);
			}
		});
	},

	/**
	 * Ellenfél lépésének lekérdezése
	 * @param {Function} callback ajax callback
	 */
	getStep : function(callback){
		this.ajax({
			type : "GET",
			url : "ajax/getstep/" + G.Data.gameID,
			dataType : "json",
			success : function(resp){
				callback(resp);
			}
		});
	},

	/**
	 * Játék vége
	 * @param {Function} callback ajax callback
	 */
	endGame : function(callback){
		this.ajax({
			type : "POST",
			url : "ajax/endgame",
			data : {
				game_id: G.Data.gameID,
				winner_id: G.Data.winner.playerID,
				sequence: G.Data.winner.sequence
			},
			dataType : "json",
			success : function(resp){
				callback(resp);
			}
		});
	}

};
