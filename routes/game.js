'use strict';

var express = require('express');
var router = express.Router();
var session = require('express-session');
//var nodemailer = require('nodemailer');
var HD = require(appRoot + '/libs/hd/hd.datetime.js');
var DB = require(appRoot + '/models/dbconnect');

router.get('/', function(req, res, next){

	/*
	// E-mail küldés
	var transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'norbqcd@gmail.com',
			pass: 'AszittedHerbertusz89'
		}
	});
	transporter.sendMail({
		from: 'info@localhost',
		to: 'horv.norbert@gmail.com',
		subject: 'Teszt',
		text: 'Teszt szöveg...'
	}, function(error, info){
		if (error) return console.log(error);
		console.log('Elment: ' + info.response);
	});
	*/

	DB.query("\
		SELECT * FROM `games`\
	", function(error, rows, fields){
		if (error) throw error;
		rows.forEach(function(row, i){
			rows[i].created = HD.DateTime.format('Y-m-d H:i:s', Math.floor(Date.parse(row.created) / 1000));
		});
		res.render('layout', {
			page : 'game',
			login : req.session.login ? req.session.login.loginned : false,
			username : req.session.login ? req.session.login.user : '',
			message : null
		});
	});
});

module.exports = router;
