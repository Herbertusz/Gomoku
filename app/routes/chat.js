'use strict';

var express = require('express');
var router = express.Router();
var session = require('express-session');
var fs = require('fs');
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

router.post('/getroommessages', function(req, res, next){

	Model.getRoomMessages(req.body.roomName, function(messages){
		res.send({
			messages : messages
		});
	});

});

router.post('/uploadfile', function(req, res, next){

	if (req.xhr){
		var fileName = Date.now().toString() + '.' + req.header('x-file-name').split('.').pop();
		var fileStream = fs.createWriteStream(appRoot + '/app/public/upload/' + fileName);

		req.on('data', function(data){
			// TODO: szerver-oldali progressbar
			console.log('DATA');
			fileStream.write(data);
		});
		req.on('end', function(){
			res.send({
				filePath : 'upload/' + fileName
			});
		});
	}


});

module.exports = router;
