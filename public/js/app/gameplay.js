"use strict";

var G = namespace("HD.Game.Gomoku");

/**
 * Játékmenet kezelése
 * @type {Object}
 */
G.Gameplay = {

	/**
	 * Játékmenet indítása
	 */
	init : function(){
		G.Data.gameSection = "init";
		G.Data.currentPlayerID = G.options.firstPlayerID;
		G.Mediator.run("startGame");
	},

	/**
	 * Lehetséges interakció meghatározása (jelenlegi játékos)
	 * @returns {String} interakció típusa ("none"|"click")
	 */
	getInteraction : function(){
		return HD.Misc.switching(G.Data.playerData[G.Data.currentPlayerID].status, {
			"init" : "none",
			"play" : "click",
			"wait" : "none",
			"end"  : "none"
		});
	},

	/**
	 * Következő játékszakasz beállítása
	 * @param {Object} [lastField=null] a legutóbb lerakott kő helye
	 */
	gameNextSection : function(lastField){
		lastField = HD.Misc.funcParam(lastField, null);
		if (G.Data.gameSection === "init"){
			G.Data.gameSection = "playing";
		}
		else if (G.Data.gameSection === "playing"){
			if (this.isEndGame(lastField)){
				G.Data.gameSection = "end";
			}
		}
		return G.Data.gameSection;
	},

	/**
	 * Játék indítása
	 */
	startGame : function(){
		var field;
		G.Data.Loop.playerIDs(function(playerID){
			G.Data.playerData[playerID].status = "wait";
		});
		G.Data.playerData[G.options.firstPlayerID].status = "play";
		this.gameNextSection();
		G.Mediator.run("trigger", ["nextPlayer"]);
		if (G.Data.playerData[G.Data.currentPlayerID].strategy !== "human"){
			field = G.Mediator.run("strategy", ["next"]);
			this.nextPlayer(field);
		}
	},

	/**
	 * Játék leállítása
	 */
	endGame : function(){
		var field;
		G.Data.Loop.playerIDs(function(playerID){
			G.Data.playerData[playerID].status = "end";
		});
		if (G.Data.winner){
			G.Mediator.run("trigger", ["endOfGame"]);
		}
		else {
			G.Mediator.run("trigger", ["endOfGameDraw"]);
		}
	},

	/**
	 * Játékos váltása
	 * @param {Object} field mező amire követ rakott
	 * @returns {String} eredmény ("next"|"end")
	 */
	nextPlayer : function(field){

		var action;
		var prevPlayerId = G.Data.currentPlayerID;

		// következő játékos
		G.Data.Loop.playerIDs(function(playerID){
			G.Data.playerData[playerID].status = "wait";
		});
		G.Data.playerData.some(function(playerData, playerID){
			if (playerID === G.Data.currentPlayerID){
				G.Data.currentPlayerID = (playerID + 1) % G.Data.playerData.length;
				G.Data.playerData[G.Data.currentPlayerID].status = "play";
				return true;
			}
		});

		// egyéb módosítások
		field.playerID = prevPlayerId;
		G.Data.stepNum++;
		if (this.gameNextSection(field) !== "end"){
			G.Mediator.run("trigger", ["nextPlayer"]);
			if (G.Data.playerData[G.Data.currentPlayerID].strategy !== "human"){
				field = G.Mediator.run("strategy", ["next"]);
				this.nextPlayer(field);
			}
			return "next";
		}
		else {
			G.Mediator.run("endGame");
			return "end";
		}

	},

	/**
	 * Vége van-e a játéknak
	 * @param {Object} lastField a legutóbb lerakott kő helye
	 * @returns {Boolean} true: vége
	 */
	isEndGame : function(lastField){
		var isEnd = false;
		var directions = ["horizontal", "vertical", "diagonal-asc", "diagonal-desc"];
		var sequence, sequenceLength, n;
		if (G.Data.Loop.emptyFields() === 0){
			isEnd = true;
		}
		else if (!lastField){
			isEnd = false;
		}
		else {
			for (n = 0; n < directions.length; n++){
				sequence = [];
				sequenceLength = G.Data.Loop.neighbouringPlayerFields(lastField, directions[n], function(field){
					sequence.push(field);
				});
				if (sequenceLength >= G.options.connectNum){
					G.Data.winner = {
						playerID : lastField.playerID,
						sequence : sequence
					};
					isEnd = true;
					break;
				}
			}
		}
		return isEnd;
	}

};
