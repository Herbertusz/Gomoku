"use strict";

HD.Canvas = namespace("HD.Canvas");
var G = namespace("HD.Game.Gomoku");

/**
 * Grafikai függvények
 * @type {Object}
 */
G.Graphics = {

	/**
	 * Rétegek kirajzolása (alaphelyzet)
	 */
	init : function(){
		G.layers = {};
		G.layers.level = HD.Canvas.Layer();	// pálya rétege
		G.layers.play = HD.Canvas.Layer();	// kövek rétege
		G.layerset = HD.Canvas.Layerset(G.game.canvas, G.layers.level, G.layers.play);
		G.layers.level.draw(function(){
			G.Graphics.drawGrid();
		});
	},

	/**
	 * Grid kirajzolása
	 */
	drawGrid : function(){

		var ctx, grid;

		if (!G.Data.cacheCanvas){

			// rajzolás cacheCanvas-ra
			G.Data.cacheCanvas = document.createElement("canvas");
			G.Data.cacheCanvas.width = G.game.canvas.width;
			G.Data.cacheCanvas.height = G.game.canvas.height;
			ctx = G.Data.cacheCanvas.getContext("2d");
			grid = G.Data.grid;

			// vonalak rajzolása
			ctx.strokeStyle = G.options.lineColor;
			ctx.lineWidth = G.options.lineWidth;
			ctx.beginPath();
			grid.forEach(function(row){
				// vízszintes vonalak
				if (row[0].rowID > 0){
					if (G.options.lineWidth % 2 === 1 && row[0].y % 1 === 0){
						row[0].y += 0.5;
						row[row.length - 1].y += 0.5;
					}
					ctx.moveTo(row[0].x, row[0].y);
					ctx.lineTo(row[row.length - 1].x + row[row.length - 1].w, row[row.length - 1].y);
				}
			});
			grid[0].forEach(function(field){
				// függőleges vonalak
				if (field.colID > 0){
					if (G.options.lineWidth % 2 === 1 && field.x % 1 === 0){
						field.x += 0.5;
						grid[grid.length - 1][field.colID].x += 0.5;
					}
					ctx.moveTo(field.x, field.y);
					ctx.lineTo(grid[grid.length - 1][field.colID].x, grid[grid.length - 1][field.colID].y + grid[grid.length - 1][field.colID].h);
				}
			});
			ctx.stroke();
		}

		G.game.ctx.drawImage(G.Data.cacheCanvas, 0, 0);

	},

	/**
	 * Egy kő kirajzolása a pos helyre
	 * @param {Object} pos koordináta és méret (bal felső sarok) {x : Number, y : Number, w : Number, h : Number}
	 * @param {Number} playerID játékos azonosító
	 */
	drawStone : function(pos, playerID){
		G.layers.play.draw(function(){
			this.drawStoneByPlayer[G.Data.playerData[playerID].stone].call(this, pos);
		}.bind(this));
	},

	/**
	 * Kő kirajzolása játékosonként
	 * @type {Array}
	 */
	drawStoneByPlayer : [

		/**
		 * "X" játékos
		 * @param {Object} pos {x : Number, y : Number, w : Number, h : Number}
		 */
		function(pos){
			var ctx = G.game.ctx;
			var corrH = Math.round(G.Data.level.w / G.options.gridSize[1] / 4);
			var corrV = Math.round(G.Data.level.h / G.options.gridSize[0] / 4);
			ctx.strokeStyle = G.options.stoneColor[0];
			ctx.lineWidth = Math.floor(corrH / 2);
			ctx.beginPath();
			ctx.moveTo(pos.x + corrH, pos.y + corrV);
			ctx.lineTo(pos.x + pos.w - corrH, pos.y + pos.h - corrV);
			ctx.moveTo(pos.x + pos.w - corrH, pos.y + corrV);
			ctx.lineTo(pos.x + corrH, pos.y + pos.h - corrV);
			ctx.stroke();
		},

		/**
		 * "O" játékos
		 * @param {Object} pos {x : Number, y : Number, w : Number, h : Number}
		 */
		function(pos){
			var ctx = G.game.ctx;
			var corr = Math.round((G.Data.level.w / G.options.gridSize[1] + G.Data.level.h / G.options.gridSize[0]) / 8);
			ctx.strokeStyle = G.options.stoneColor[1];
			ctx.lineWidth = Math.floor(corr / 2);
			ctx.beginPath();
			ctx.arc(pos.x + pos.w / 2, pos.y + pos.h / 2, pos.w / 2 - corr, 0, Math.PI * 2, true);
			ctx.stroke();
		},

		/**
		 * "+" játékos
		 * @param {Object} pos {x : Number, y : Number, w : Number, h : Number}
		 */
		function(pos){
			var ctx = G.game.ctx;
			var corrH = Math.round(G.Data.level.w / G.options.gridSize[1] / 5);
			var corrV = Math.round(G.Data.level.h / G.options.gridSize[0] / 5);
			ctx.strokeStyle = G.options.stoneColor[2];
			ctx.lineWidth = Math.floor(corrH * 0.8);
			ctx.beginPath();
			ctx.moveTo(pos.x + corrH, pos.y + pos.h / 2);
			ctx.lineTo(pos.x + pos.w - corrH, pos.y + pos.h / 2);
			ctx.moveTo(pos.x + pos.w / 2, pos.y + corrV);
			ctx.lineTo(pos.x + pos.w / 2, pos.y + pos.h - corrV);
			ctx.stroke();
		}

	],

	/**
	 * Mező kiemelése (háttérszínnel)
	 * @param {Object} field mező objektum
	 * @param {String} color szín
	 */
	repaintField : function(field, color){
		G.layers.level.draw(function(){
			var lw = G.options.lineWidth;
			var ctx = G.game.ctx;
			ctx.fillStyle = color;
			ctx.fillRect(field.x + lw, field.y + lw, field.w -  2 * lw, field.h - 2 * lw);
		});
	},

	/**
	 * Játék végének grafikai megjelenítése
	 */
	endGame : function(){
		if (G.Data.winner){
			G.Data.winner.sequence.forEach(function(field){
				this.repaintField(field, G.Data.playerData[G.Data.winner.playerID].winColor);
			}.bind(this));
		}
	}

};
