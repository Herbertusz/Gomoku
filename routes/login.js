'use strict';

var express = require('express');
var router = express.Router();
var session = require('express-session');
var DB = require('../models/dbconnect');

router.post('/', function(req, res, next){
	var username, password;
	if (req.body.submit){
		username = req.body.username;
		password = req.body.password;

		DB.query("\
			SELECT * FROM `users` WHERE `username` = :username AND `password` = :password AND `active` = 1\
		", {
			username : username,
			password : password
		}, function(error, rows, fields){
			if (error) throw error;
			if (rows.length > 0){
				req.session.login = {
					loginned : true,
					user : username,
					error : null
				};
			}
			else{
				req.session.login.error = 'Nem jó!!!';
			}
			res.redirect('/');
		});
	}
});

module.exports = router;
