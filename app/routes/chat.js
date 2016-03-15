'use strict';

var express = require('express');
var router = express.Router();
var session = require('express-session');

router.get('/', function(req, res, next){

	res.render('layout', {
		page : 'chat',
		login : req.session.login ? req.session.login.loginned : false,
		userId : req.session.login ? req.session.login.userId : null,
		userName : req.session.login ? req.session.login.userName : '',
		message : null
	});

});

module.exports = router;
