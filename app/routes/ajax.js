'use strict';

var express = require('express');
var router = express.Router();
var session = require('express-session');
var Model = require(appRoot + '/app/models/game.js');

router.get('/setgame', function(req, res, next){
	Model.create({
		gridSize_x : '20',
		gridSize_y : '15',
		connectNum : '5',
		playerNum : '2',
		firstPlayerID : '0',
		playerStones : '0,1,2',
		playerAIs : ['human', 'random'],
		playerNames : ['Hörb', 'Gép']
	}, function(gameId){
		res.render('layout', {
			page : 'game',
			login : req.session.login ? req.session.login.loginned : false,
			userId : req.session.login ? req.session.login.userId : null,
			userName : req.session.login ? req.session.login.userName : '',
			message : null
		});
	});

});

module.exports = router;
