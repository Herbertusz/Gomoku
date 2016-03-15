"use strict";

var G = namespace("HD.Game.Gomoku");

/**
 * A játék hívó kontextusa (HD.Game)
 * @type {Object}
 */
G.game = null;

/**
 * Nyelvesítés
 * @type {Object}
 */
G.Lang = {
	message : {
		"yourTurn" : "Te következel!",
		"nextPlayer" : "Várakozás {G.Data.playerData[G.Data.currentPlayerID].name} játékos lépésére...",
		"endOfGame" : "Játék vége! Nyertes: {G.Data.playerData[G.Data.winner.playerID].name}",
		"endOfGameDraw" : "Játék vége! Döntetlen",
		"beforeUnload" : "Biztos kilépsz a játékból?"
	},
	error : {
		"formFillNames" : "A saját és gépi játékosok nevének megadása kötelező!"
	}
};

/**
 * Alapbeállítások
 * @type {Object}
 */
G.options = {

	/* GRAFIKAI BEÁLLÍTÁSOK */

	/**
	 * Canvas méretei
	 * @type {Object}
	 */
	canvas : {
		width : 700,
		height : 450
	},

	/**
	 * Játékosok színei
	 * @type {Array}
	 */
	stoneColor : [
		"rgba(255, 0, 0, 1)",
		"rgba(0, 150, 0, 1)",
		"rgba(0, 0, 255, 1)"
	],

	/**
	 * Kirakott sorok színei
	 * @type {Array}
	 */
	winColor : [
		"rgba(255, 200, 200, 1)",
		"rgba(150, 255, 150, 1)",
		"rgba(200, 200, 255, 1)"
	],

	/**
	 * Rácsvonalak színe
	 * @type {String}
	 */
	lineColor : "rgba(0, 0, 255, 1)",

	/**
	 * Rácsvonalak vastagsága
	 * @type {Number}
	 */
	lineWidth : 1,

	/* JÁTÉK BEÁLLÍTÁSOK */

	/**
	 * Pálya mérete [3 - 20, 3 - 30]
	 * @type {Array}
	 * @description szerkezet: [<sorok száma>, <oszlopok száma>]
	 */
	gridSize : [15, 20],

	/**
	 * Nyeréshez szükséges sor (>= 3)
	 * @type {Number}
	 */
	connectNum : 5,

	/**
	 * Játékosok száma
	 * @type {Number}
	 */
	playerNum : 2,

	/**
	 * Játékosok algoritmusai
	 * @type {Array}
	 * @description szerkezet: [
	 *		<playerID> : String		// algoritmus (human: nem gép)
	 *		...
	 * ]
	 */
	playerAIs : [],

	/**
	 * Játékos - kő összerendelés
	 * @type {Array}
	 * @description szerkezet: [
	 *		<playerID> : Number		// pl: 0 : 1  (0-s játékos: 1-es szín és alakzat)
	 *		...
	 * ]
	 */
	playerStones : [],

	/**
	 * Kezdő játékos
	 * @type {Number}
	 */
	firstPlayerID : 0

};

/**
 * Játék futtatása
 * @param {Object} userOptions alapbeállítások felülírása
 */
G.start = function(userOptions){
	var convertedOptions = G.Adapter.Form.optionsConvert(userOptions);
	HD.Game.Canvas2D("#gomoku", function(){
		Object.assign(G.options, convertedOptions);
		G.game = this;
		G.game.canvas.width = G.options.canvas.width;
		G.game.canvas.height = G.options.canvas.height;
		G.Mediator.init({
			Adapter : G.Adapter,
			Geometry : G.Geometry,
			Graphics : G.Graphics,
			Interaction : G.Interaction,
			Gameplay : G.Gameplay,
			Strategy : G.Strategy,
			Display : G.Display
		});
		G.Data.preInitObjects();
		G.Graphics.init();
		G.Data.initObjects(convertedOptions.playerNames);
		G.Display.init();
		G.Interaction.init();
		G.Gameplay.init();
	});
};

/**
 * Objektumok összekapcsolása
 * mediator (illesztő) minta
 * @type {Object}
 */
G.Mediator = {

	/**
	 * Összekapcsolandó objektumok
	 * @type {Object}
	 */
	objects : {},

	/**
	 * Kapcsolatok definiálása
	 * @type {Object}
	 */
	components : {

		/**
		 * Egy kő kirajzolása a pos helyre
		 * @param {Object} pos koordináta
		 * @param {String} playerID játékos azonosító
		 * @returns {undefined}
		 */
		drawStone : function(pos, playerID){
			return this.Graphics.drawStone(pos, playerID);
		},

		/**
		 * Játék indítása
		 * @param {Function} callback
		 */
		startGame : function(callback){
			callback = HD.Misc.funcParam(callback, function(){});
			this.Gameplay.startGame();
			this.Display.showCurrentPlayer();
			this.Adapter.Server.setGame(G.options, callback);
		},

		/**
		 * Játékos váltása
		 * @param {Object} field legutóbb módosított mező
		 * @param {Function} callback
		 * @returns {String} eredmény ("next"|"end")
		 */
		nextPlayer : function(field, callback){
			callback = HD.Misc.funcParam(callback, function(){});
			var ret = this.Gameplay.nextPlayer(field);
			if (ret !== "end"){
				this.Display.showCurrentPlayer();
			}
			this.Adapter.Server.setStep(field.fieldID, callback);
			return ret;
		},

		/**
		 * Játék vége
		 * @param {Function} callback
		 */
		endGame : function(callback){
			this.Graphics.endGame();
			this.Gameplay.endGame();
			this.Display.endGame();
			this.Adapter.Server.endGame(callback);
		},

		/**
		 * Lehetséges interakció meghatározása (jelenlegi játékos)
		 * @returns {String} interakció típusa ("none"|"click")
		 */
		getInteraction : function(){
			return this.Gameplay.getInteraction();
		},

		/**
		 * Üzenet kijelzése esemény alapján
		 * @param {String} message üzenet
		 * @returns {undefined}
		 */
		trigger : function(message){
			return this.Display.trigger(message);
		},

		/**
		 * Algoritmus következő lépésének lefuttatása
		 * @param {String} status az AI meghívási módja ("next"|"end")
		 * @returns {Object} {field : G.Data.field}
		 */
		strategy : function(status){
			return this.Strategy.run(status);
		},

		/**
		 * Algoritmus által meghatározott lépési művelet lefuttatása
		 * @param {Object} field mező
		 * @returns {undefined}
		 */
		strategyAction : function(field){
			return this.Interaction.runAction(field);
		}

	},

	/**
	 * objects feltöltése
	 * @param {Object} objects összekapcsolandó objektumok
	 */
	init : function(objects){
		this.objects = objects;
	},

	/**
	 * Tagfüggvény futtatása
	 * @param {String} event hivatkozás a tagfüggvényre (components-beli elem)
	 * @param {Array} [args=[]] a függvénynek átadandó paraméterek
	 * @returns {mixed} a függvény visszatérési értéke
	 */
	run : function(event, args){
		if (typeof args === "undefined") args = [];
		if (typeof this.components[event] !== "undefined"){
			return this.components[event].apply(this.objects, args);
		}
		else {
			return undefined;
		}
	}

};
