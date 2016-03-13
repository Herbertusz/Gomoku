'use strict';

var express = require('express');
var router = express.Router();
var session = require('express-session');

router.get('/', function(req, res, next){

	res.render('layout', {
		page : 'chat',
		login : req.session.login ? req.session.login.loginned : false,
		username : req.session.login ? req.session.login.user : '',
		message : null
	});

});

module.exports = router;
