'use strict';

var express = require('express');
var router = express.Router();
var session = require('express-session');
var HD = require(appRoot + '/libs/hd/hd.datetime.js');
var DB = require(appRoot + '/models/dbconnect');

router.get('/', function(req, res, next){
	var message;
	if (!req.session.login){
		req.session.login = {
			loginned : false,
			user : '',
			error : null
		};
	}
	message = req.session.login.error;
	req.session.login.error = null;

	DB.query("\
		SELECT * FROM `games`\
	", function(error, rows, fields){
		if (error) throw error;
		rows.forEach(function(row, i){
			rows[i].created = HD.DateTime.format('Y-m-d H:i:s', Math.floor(Date.parse(row.created) / 1000));
		});
		res.render('layout', {
			page : 'index',
			login : req.session.login ? req.session.login.loginned : false,
			username : req.session.login ? req.session.login.user : '',
			message : message,
			games : rows
		});
	});
});

module.exports = router;
