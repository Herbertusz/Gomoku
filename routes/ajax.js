'use strict';

var express = require('express');
var router = express.Router();
var session = require('express-session');
var Model = require('../models/game');

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
			username : req.session.login ? req.session.login.user : '',
			message : null
		});
	});

});

module.exports = router;
