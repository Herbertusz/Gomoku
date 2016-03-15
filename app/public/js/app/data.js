"use strict";

var G = namespace("HD.Game.Gomoku");

/**
 * Belső adattároló
 * @type {Object}
 */
G.Data = {

	/**
	 * Hátteret tároló canvas (on-the-fly) (cache)
	 * @type {HTMLCanvasElement}
	 */
	cacheCanvas : null,

	/**
	 * Pálya helyzete a canvas-on belül (G.options.canvas és G.options.gridSize alapján)
	 * @type {Object}
	 */
	level : {
		x : null,
		y : null,
		w : null,
		h : null
	},

	/**
	 * Játék azonosítója
	 * @type {Number}
	 */
	gameID : 0,

	/**
	 * Jelenlegi játékszakasz ("init"|"playing"|"end")
	 * @type {String}
	 */
	gameSection : null,

	/**
	 * Jelenlegi játékos azonosítója
	 * @type {Number}
	 */
	currentPlayerID : null,

	/**
	 * Lépések száma
	 * @type {Number}
	 */
	stepNum : 0,

	/**
	 * Játék győztese
	 * @type {Object}
	 * @description szerkezet: {
	 *		playerID : Number,			// játékos azonosító
	 *		sequence : Array[Object]	// kirakott sor (field lista)
	 * }
	 */
	winner : null,

	/**
	 * Időmérők
	 * @type {Object}
	 * @description szerkezet: {
	 *		total : HD.DateTime.Timer,				// teljes idő
	 *		player : [
	 *			<playerID> : HD.DateTime.Timer,		// játékosonkénti játékidő
	 *			...
	 *		]
	 * }
	 */
	timer : {},

	/**
	 * Játékosok adatai
	 * @type {Array}
	 * @description szerkezet: [
	 *		<playerID> : {
	 *			strategy : String,			// "human" vagy egy algoritmus
	 *			name : String,				// megjelenítendő név
	 *			stone : Number,				// kő sorszáma (0: X, 1: O, 2: +)
	 *			stoneColor : String,		// kő színe
	 *			winColor : String,			// kirakott sor színe
	 *			isFirst : Boolean,			// kezdő játékos
	 *			time : Number,				// aktuális lépésidő
	 *			status : String				// jelenlegi állapot ("init"|"play"|"wait"|"end")
	 *		},
	 *		...
	 * ]
	 */
	playerData : [],

	/**
	 * Pálya szerkezete
	 * @type {Array}
	 * @description szerkezet: [
	 *		<rowID> => [
	 *			<colID> => {				// (field objektum)
	 *				fieldID : Number,		// mező azonosító
	 *				rowID : Number,			// oszlop azonosító
	 *				colID : Number,			// sor azonosító
	 *				playerID : null|Number,	// játékos azonosító
	 *				x : Number,				// mező bal felső sarkának x koordinátája
	 *				y : Number,				// mező bal felső sarkának y koordinátája
	 *				w : Number,				// mező szélessége
	 *				h : Number				// mező magassága
	 *			},
	 *			...
	 *		],
	 *		...
	 * ]
	 */
	grid : [],

	/**
	 * Iterátor függvények a fenti változókhoz
	 * @type {Object}
	 */
	Loop : {

		/**
		 * Iteráció megszakítása
		 * @type {Boolean}
		 * @constant
		 */
		BREAK : false,
		/**
		 * Iteráció folytatása
		 * @type {Boolean}
		 * @constant
		 */
		CONTINUE : true,

		/**
		 * Játékos ID-k
		 * @param {Function} [callback] elemeken végrehajtandó függvény
		 * @param {Function} [filter] csak azokra az elemekre fut le amelyekre true az érték
		 * @returns {Number} callback-lefutások száma
		 */
		playerIDs : function(callback, filter){
			callback = HD.Misc.funcParam(callback, function(){});
			filter = HD.Misc.funcParam(filter, function(){ return true; });
			var n, ret, playerID;
			n = 0;
			for (playerID = 0; playerID < G.Data.playerData.length; playerID++){
				if (filter.call(playerID, playerID)){
					ret = callback.call(playerID, playerID);
					n++;
					if (ret === false) break;
				}
			}
			return n;
		},

		/**
		 * Játékosok adatai
		 * @param {Function} [callback] elemeken végrehajtandó függvény
		 * @param {Function} [filter] csak azokra az elemekre fut le amelyekre true az érték
		 * @returns {Number} callback-lefutások száma
		 */
		playerData : function(callback, filter){
			callback = HD.Misc.funcParam(callback, function(){});
			filter = HD.Misc.funcParam(filter, function(){ return true; });
			var n, ret, coll, num = 0;
			this.players(function(playerID){
				coll = G.Data.playerData[playerID];
				for (n = 0; n < coll.length; n++){
					if (filter.call(coll[n], coll[n])){
						ret = callback.call(coll[n], coll[n], n, coll);
						num++;
						if (ret === false) return false;
					}
				}
			});
			return num;
		},

		/**
		 * Mezők
		 * @param {Function} [callback] elemeken végrehajtandó függvény
		 * @param {Function} [filter] csak azokra az elemekre fut le amelyekre true az érték
		 * @returns {Number} callback-lefutások száma
		 */
		fields : function(callback, filter){
			callback = HD.Misc.funcParam(callback, function(){});
			filter = HD.Misc.funcParam(filter, function(){ return true; });
			var n, m, full, ret;
			var rows = G.Data.grid;
			var fields;
			full = 0;
			for (n = 0; n < rows.length; n++){
				fields = rows[n];
				for (m = 0; m < fields.length; m++){
					if (filter.call(fields[m], fields[m])){
						ret = callback.call(fields[m], fields[m], fields[m].fieldID, G.Data.grid);
						full++;
						if (ret === false) break;
					}
				}
				if (ret === false) break;
			}
			return full;
		},

		/**
		 * Üres mezők
		 * @param {Function} [callback] elemeken végrehajtandó függvény
		 * @returns {Number} callback-lefutások száma
		 */
		emptyFields : function(callback){
			return G.Data.Loop.fields(callback, function(field){
				return (field.playerID === null);
			});
		},

		/**
		 * Egyik játékos által elfoglalt mezők
		 * @param {String} playerID játékos azonosító
		 * @param {Function} [callback] elemeken végrehajtandó függvény
		 * @returns {Number} callback-lefutások száma
		 */
		playerFields : function(playerID, callback){
			return G.Data.Loop.fields(callback, function(field){
				return (field.playerID === playerID);
			});
		},

		/**
		 * Egy mezővel sorozatot alkotó mezők bejárása
		 * @param {Object} field mező
		 * @param {String} direction irány ("horizontal"|"vertical"|"diagonal-asc"|"diagonal-desc")
		 * @param {Function} [callback] elemeken végrehajtandó függvény
		 * @returns {Number} callback-lefutások száma
		 */
		neighbouringPlayerFields : function(field, direction, callback){
			callback = HD.Misc.funcParam(callback, function(){});
			var x, y, full, ret;
			var step = function(thisField){
				if (thisField.playerID === field.playerID){
					ret = callback.call(thisField, thisField, thisField.fieldID, G.Data.grid);
					full++;
					return ret;
				}
				else {
					return false;
				}
			};
			full = 0;
			if (direction === "horizontal"){
				for (x = field.colID; x >= 0; x--){
					if (step(G.Data.grid[field.rowID][x]) === false) break;
				}
				for (x = field.colID + 1; x < G.options.gridSize[1]; x++){
					if (step(G.Data.grid[field.rowID][x]) === false) break;
				}
			}
			if (direction === "vertical"){
				for (y = field.rowID; y >= 0; y--){
					if (step(G.Data.grid[y][field.colID]) === false) break;
				}
				for (y = field.rowID + 1; y < G.options.gridSize[0]; y++){
					if (step(G.Data.grid[y][field.colID]) === false) break;
				}
			}
			if (direction === "diagonal-asc"){
				for (x = field.colID, y = field.rowID; x < G.options.gridSize[1] && y >= 0; x++, y--){
					if (step(G.Data.grid[y][x]) === false) break;
				}
				for (x = field.colID - 1, y = field.rowID + 1; x >= 0 && y < G.options.gridSize[0]; x--, y++){
					if (step(G.Data.grid[y][x]) === false) break;
				}
			}
			if (direction === "diagonal-desc"){
				for (x = field.colID, y = field.rowID; x >= 0 && y >= 0; x--, y--){
					if (step(G.Data.grid[y][x]) === false) break;
				}
				for (x = field.colID + 1, y = field.rowID + 1; x < G.options.gridSize[1] && y < G.options.gridSize[0]; x++, y++){
					if (step(G.Data.grid[y][x]) === false) break;
				}
			}
			return full;
		}

	},

	/**
	 * Adatszerkezetek feltöltése
	 */
	preInitObjects : function(){

		var i, j, n, m;
		var relativeCoords, coords, grid;

		// méretek
		relativeCoords = [];
		for (i = 0; i <= G.options.gridSize[0]; i++){
			for (j = 0; j <= G.options.gridSize[1]; j++){
				n = i * (G.options.gridSize[1] + 1) + j;
				relativeCoords[n] = [
					j * (100 / G.options.gridSize[1]),
					i * (100 / G.options.gridSize[0])
				];
			}
		}

		G.Data.level.h = G.game.canvas.height;
		G.Data.level.w = Math.round(G.Data.level.h * (G.options.gridSize[1] / G.options.gridSize[0]));
		G.Data.level.x = (G.game.canvas.width - G.Data.level.w) / 2;
		G.Data.level.y = 0;

		coords = HD.Math.Geometry.getAbsoluteCoords(
			relativeCoords,
			G.Data.level.w,
			G.Data.level.h,
			G.Data.level.x,
			G.Data.level.y
		);

		// mezők
		grid = [];
		for (i = 0, m = 0; i < G.options.gridSize[0]; i++, m++){
			grid[i] = [];
			for (j = 0; j < G.options.gridSize[1]; j++, m++){
				n = i * G.options.gridSize[1] + j;
				grid[i][j] = {
					fieldID : n,
					rowID : i,
					colID : j,
					playerID : null,
					x : coords[m].x,
					y : coords[m].y,
					w : coords[m + 1].x - coords[m].x,
					h : coords[m + G.options.gridSize[1] + 1].y - coords[m].y
				};
			}
		}
		this.grid = grid;

	},

	/**
	 * Objektumok inicializálása (alaphelyzet)
	 * @param {Object} names játékosok nevei
	 */
	initObjects : function(names){

		var playerID;
		for (playerID = 0; playerID < G.options.playerNum; playerID++){
			G.Data.playerData.push({
				strategy : G.options.playerAIs[playerID],
				name : names[playerID],
				stone : G.options.playerStones[playerID],
				stoneColor : G.options.stoneColor[G.options.playerStones[playerID]],
				winColor : G.options.winColor[G.options.playerStones[playerID]],
				isFirst : playerID === G.options.firstPlayerID,
				time : {
					total : 0,
					current : 0
				},
				status : "init"
			});
		}

	},

	/**
	 * Koordináta-sorozatok keresése egy grid soraiban, oszlopaiban és átlóiban
	 * @param {Array} coords koordináták [{colID : Number, rowID : Number}, ...]
	 * @returns {Array} koordináta-sorozatok {row : [[field, ...], ...], ...}
	 * @deprecated exponenciálisan lassul ahogy növekszik a kövek száma
	 */
	getGridSequences : function(coords){

		var n, P, index;
		var sequences = {
			row : [],	// soros minták
			col : [],	// oszlopos minták
			diag1 : [],	// átlós minták (/)
			diag2 : []	// átlós minták (\)
		};
		var objEqual = function(obj1, obj2){
			return JSON.stringify(obj1) === JSON.stringify(obj2);
		};

		// sorok
		index = 0;
		for (n = 0; n < G.options.gridSize[0]; n++){
			G.Data.Loop.fields(function(field){
				if (typeof sequences.row[index] === "undefined"){
					sequences.row[index] = [];
				}
				P = {colID : field.colID, rowID : field.rowID};
				if (HD.Array.indexOf(P, coords, objEqual) > -1){
					sequences.row[index].push(field);
				}
				else {
					if (sequences.row[index].length > 0){
						index++;
					}
				}
			}, function(field){
				return (field.rowID === n);
			});
			if (typeof sequences.row[index] !== "undefined" && sequences.row[index].length > 0){
				index++;
			}
		}
		sequences.row = sequences.row.filter(function(elem){
			return (elem.length > 1);
		});

		// oszlopok
		index = 0;
		for (n = 0; n < G.options.gridSize[1]; n++){
			G.Data.Loop.fields(function(field){
				if (typeof sequences.col[index] === "undefined"){
					sequences.col[index] = [];
				}
				P = {colID : field.colID, rowID : field.rowID};
				if (HD.Array.indexOf(P, coords, objEqual) > -1){
					sequences.col[index].push(field);
				}
				else {
					if (sequences.col[index].length > 0){
						index++;
					}
				}
			}, function(field){
				return (field.colID === n);
			});
			if (typeof sequences.col[index] !== "undefined" && sequences.col[index].length > 0){
				index++;
			}
		}
		sequences.col = sequences.col.filter(function(elem){
			return (elem.length > 1);
		});

		// átlók (/)
		index = 0;
		for (n = 0; n < G.options.gridSize[0] + G.options.gridSize[1]; n++){
			G.Data.Loop.fields(function(field){
				if (typeof sequences.diag1[index] === "undefined"){
					sequences.diag1[index] = [];
				}
				P = {colID : field.colID, rowID : field.rowID};
				if (HD.Array.indexOf(P, coords, objEqual) > -1){
					sequences.diag1[index].push(field);
				}
				else {
					if (sequences.diag1[index].length > 0){
						index++;
					}
				}
			}, function(field){
				return (field.colID + field.rowID === n);
			});
			if (typeof sequences.diag1[index] !== "undefined" && sequences.diag1[index].length > 0){
				index++;
			}
		}
		sequences.diag1 = sequences.diag1.filter(function(elem){
			return (elem.length > 1);
		});

		// átlók (\)
		index = 0;
		for (n = - G.options.gridSize[1]; n < G.options.gridSize[0]; n++){
			G.Data.Loop.fields(function(field){
				if (typeof sequences.diag2[index] === "undefined"){
					sequences.diag2[index] = [];
				}
				P = {colID : field.colID, rowID : field.rowID};
				if (HD.Array.indexOf(P, coords, objEqual) > -1){
					sequences.diag2[index].push(field);
				}
				else {
					if (sequences.diag2[index].length > 0){
						index++;
					}
				}
			}, function(field){
				return (field.colID - field.rowID === n);
			});
			if (typeof sequences.diag2[index] !== "undefined" && sequences.diag2[index].length > 0){
				index++;
			}
		}
		sequences.diag2 = sequences.diag2.filter(function(elem){
			return (elem.length > 1);
		});

		return sequences;

	}

};
