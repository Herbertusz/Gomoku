'use strict';

var express = require('express');
var router = express.Router();
var session = require('express-session');
var multer = require('multer');
var Model = require(appRoot + '/app/models/chat.js');

var storage = multer.diskStorage({
	destination : function(req, file, callback){
		callback(null, appRoot + '/storage');
	},
	filename : function(req, file, callback){
		callback(null, file.fieldname + '-' + Date.now());
	}
});
var upload = multer({storage : storage});

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

router.post('/uploadfile', upload.single(), function(req, res, next){

	;

	/*Model.uploadFile(req.body.roomName, function(messages){
		res.send({
			messages : messages
		});
	});*/

});

module.exports = router;
