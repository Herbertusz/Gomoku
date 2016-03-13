'use strict';

var HD = require(appRoot + '/libs/hd/hd.datetime.js');
var DB = require(appRoot + '/models/dbconnect.js');

var Model = {

	date : HD.DateTime.format('Y-m-d H:i:s'),

	create : function(options, callback){
		var gameId, playerStones, n;
		DB.insert('games', {
			'grid_size_x' : options.gridSize_x,
			'grid_size_y' : options.gridSize_y,
			'connect_num' : options.connectNum,
			'player_num' : options.playerNum,
			'first_player_id' : options.firstPlayerID,
			'winner_player_id' : null,
			'winner_sequence' : '',
			'connected_player_num' : 0,
			'step_num' : 0,
			'time' : 0,
			'finished' : 0,
			'requested' : this.date,
			'created' : this.date
		}, function(error, result){
			if (error) throw error;
			gameId = result.insertId;
			playerStones = options.playerStones.split(',');
			for (n = 0; n < options.playerNum; n++){
				DB.insert('players', {
					'game_id' : gameId,
					'player_id' : n,
					'ai' : options.playerAIs[n],
					'stone' : playerStones[n],
					'name' : (typeof options.playerNames[n] !== "undefined") ? options.playerNames[n] : null
				}, function(error, result){
					if (error) throw error;
				});
			}
			callback.call(this, gameId);
		});
	}

};

module.exports = Model;
