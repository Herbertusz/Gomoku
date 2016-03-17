'use strict';

var express = require('express');
var router = express.Router();
var session = require('express-session');
var Model = require(appRoot + '/app/models/chat.js');

router.get('/', function(req, res, next){

	Model.getUsers(function(users){
		res.render('layout', {
			page : 'chat',
			users : users,
			login : req.session.login ? req.session.login.loginned : false,
			userId : req.session.login ? req.session.login.userId : null,
			userName : req.session.login ? req.session.login.userName : '',
			loginMessage : null
		});
	});

});

module.exports = router;
