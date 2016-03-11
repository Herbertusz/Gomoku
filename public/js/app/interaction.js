"use strict";

var G = namespace("HD.Game.Gomoku");

/**
 * Interakciós segédfüggvények
 * @type {Object}
 */
G.Interaction = {

	/**
	 * Eseménykezelők csatolása
	 */
	init : function(){
		window.addEventListener("beforeunload", function(event){
			if (G.Data.gameSection === "playing"){
				event.returnValue = G.Lang.message.beforeUnload;
				return G.Lang.message.beforeUnload;
			}
		}, false);
		G.game.canvas.addEventListener("click", function(event){
			this.clickHandler(HD.Site.getMousePosition(event, G.game.canvas));
		}.bind(this), false);
	},

	/**
	 * Click (mouseup) eseménykezelő
	 * @param {Object} pos egér pozíciója
	 */
	clickHandler : function(pos){
		if (G.Mediator.run("getInteraction") === "none") return;
		G.Data.Loop.emptyFields(function(field){
			if (HD.Math.Geometry.isPointInsideRectangle(pos, field)){
				this.runAction(field);
				G.Mediator.run("nextPlayer", [field]);
				return G.Data.Loop.BREAK;
			}
		}.bind(this));
	},

	/**
	 * Esemény lefuttatása
	 * @param {Object} field mező objektum
	 */
	runAction : function(field){
		G.Mediator.run("drawStone", [field, G.Data.currentPlayerID]);
	}

};
