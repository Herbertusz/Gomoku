"use strict";

var G = namespace("HD.Game.Gomoku");

/**
 * AI algoritmusok vezérlése
 * @type {Object}
 */
G.Strategy = {

	/**
	 * AI függvények adattárolója (pl előző lefutás eredménye, stb)
	 * @type {Object}
	 * @description szerkezet: {
	 *		<algoritmus> : {		// algoritmus metódus neve
	 *			<adat1> : Mixed		// adatok
	 *			...
	 *		}
	 * }
	 */
	storage : {
		random : {
			lastPlaceField : null
		}
	},

	/**
	 * Algoritmus lefuttatása
	 * @param {String} status az AI meghívási módja ("next"|"end")
	 * @returns {Object} field objektum
	 */
	run : function(status){
		var strategy = G.Data.playerData[G.Data.currentPlayerID].strategy;
		var placeField = null;
		if (status === "next"){
			placeField = this[strategy].call(this.storage[strategy], status);
		}
		G.Mediator.run("strategyAction", [placeField]);
		return placeField;
	},

	/**
	 * Véletlenszerű algoritmus
	 * @returns {Object} field objektum
	 */
	random : function(){
		var emptyFields = [], emptyFieldNum = 0, placeField = null;
		emptyFieldNum = G.Data.Loop.emptyFields(function(field){
			emptyFields.push(field);
		});
		placeField = emptyFields[HD.Math.rand(0, emptyFieldNum - 1)];
		this.lastPlaceField = placeField;	// példa az adattároló használatára
		return placeField;
	}

};
