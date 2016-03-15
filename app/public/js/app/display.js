"use strict";

var G = namespace("HD.Game.Gomoku");

/**
 * Canvas-on kívüli megjelenítés
 * @type {Object}
 */
G.Display = {

	/**
	 * Játékoslista HTML template
	 * @type {String}
	 */
	playerListItemTpl : '' +
		'<li class="bar">' +
			'<div class="color"></div>' +
			'<span data-content="playerName" data-player="{playerID}">{playerName}</span>' +
			'<div class="time" data-content="playerTime" data-player="{playerID}">0:00</div>' +
		'</li>' +
	'',

	/**
	 * Kijelzők beállítása játék elején
	 */
	init : function(){

		// játékoslista
		var list = G.Adapter.DOM.getByData("content", "playerList");
		var item;
		G.Data.Loop.playerIDs(function(playerID){
			item = this.playerListItemTpl
				.replace(/\{playerID\}/g, playerID)
				.replace(/\{playerName\}/g, G.Data.playerData[playerID].name);
			list.innerHTML += item;
		}.bind(this));


		// időmérők
		G.Data.timer = {
			total : null,
			player : []
		};
		G.Data.timer.total = HD.DateTime.Timer(1);
		G.Data.timer.total.start(function(){
			G.Adapter.DOM.getByData("content", "totalTime").innerHTML = this.get("M:ss");
		});
		G.Data.Loop.playerIDs(function(playerID){
			G.Data.timer.player[playerID] = HD.DateTime.Timer(1);
		});

		// egyéb kijelzők
		G.Adapter.DOM.getByDataAll("content", "playerName").forEach(function(element){
			var playerID = G.Adapter.DOM.getData(element, "player");
			element.innerHTML = G.Data.playerData[playerID].name;
		});
		G.Adapter.DOM.getByDataAll("content", "playerTime").forEach(function(element){
			var playerID = G.Adapter.DOM.getData(element, "player");
			G.Adapter.DOM.find(element.parentNode, '.color').style.backgroundColor = G.Data.playerData[playerID].stoneColor;
		});

	},

	/**
	 * Kijelzők beállítása játék végén
	 */
	endGame : function(){

		G.Data.timer.total.stop();
		G.Data.Loop.playerIDs(function(playerID){
			G.Data.timer.player[playerID].stop();
		});

	},

	/**
	 * Üzenet kijelzése esemény alapján
	 * @param {String} message üzenet
	 */
	trigger : function(message){
		var box;
		var text = G.Lang.message[message].replace(/\{([^}]+)\}/ig, function(match, p1, offset, string){
			return eval(p1);
		});
		var container = G.Adapter.DOM.get('.messagebox');
		if (text){
			box = G.Adapter.DOM.clone(G.Adapter.DOM.find(container, '.message.cloneable'));
			box.style.opacity = 0;
			box.classList.remove("cloneable");
			box.innerHTML = text;
			container.appendChild(box);
			HD.Math.animate(function(value){
				box.style.opacity = value;
			}, null, 500);
		}
	},

	/**
	 * Kijelzők update-elése
	 */
	showCurrentPlayer : function(){
		var playerID;
		var playerBars = G.Adapter.DOM.getByDataAll("content", "playerTime");
		var currentPlayerBar = G.Adapter.DOM.filter(playerBars, function(){
			return G.Adapter.DOM.getData(this, "player") === G.Data.currentPlayerID;
		});
		G.Data.timer.player[G.Data.currentPlayerID].start(function(){
			currentPlayerBar.innerHTML = this.get("M:ss");
		});
		G.Data.timer.player.forEach(function(timer, playerID){
			if (playerID !== G.Data.currentPlayerID){
				G.Data.timer.player[playerID].pause();
			}
		});
		// egyéb adatok
		G.Adapter.DOM.getByData("content", "currentPlayerName").innerHTML = G.Data.playerData[G.Data.currentPlayerID].name;
		G.Adapter.DOM.getByData("content", "stepNum").innerHTML = G.Data.stepNum;
		// egyéb megjelenítések
		playerBars.forEach(function(element){
			element.parentNode.classList.remove("active");
		});
		currentPlayerBar.parentNode.classList.add("active");
	}

};
