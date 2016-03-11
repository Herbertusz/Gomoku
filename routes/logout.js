'use strict';

var express = require('express');
var router = express.Router();
var session = require('express-session');

router.get('/', function(req, res, next){
	req.session.login = {
		loginned : false,
		user : '',
		error : null
	};
	res.redirect('/');
});

module.exports = router;
