'use strict';

var ioSession = require('socket.io-express-session');
var Model = require(appRoot + '/app/models/chat.js');

module.exports = function(server, session){

	var io = require('socket.io')(server);
	var connectedUsers = {};
	io.of('/chat').use(ioSession(session));
	io.of('/chat').on('connection', function(socket){
		var session = socket.handshake.session;
		var userData = null;
		if (session.login && session.login.loginned){
			userData = {
				id : session.login.userId,
				name : session.login.userName
			};
		}
		if (userData){
			connectedUsers[socket.id] = userData;
			socket.broadcast.emit('user connected', userData);
			io.of('/chat').emit('online change', connectedUsers);
		}

		socket.on('disconnect', function(){
			var userData = connectedUsers[socket.id];
			delete connectedUsers[socket.id];
			io.of('/chat').emit('online change', connectedUsers);
			io.of('/chat').emit('disconnect', userData);
		});

		socket.on('chat message', function(data){
			socket.broadcast.emit('chat message', data);
			Model.log({
				userId : userData.id,
				message : data.message,
				time : data.time
			}, function(){});
		});

		socket.on('chat writing', function(data){
			socket.broadcast.emit('chat writing', data);
		});
	});

};
