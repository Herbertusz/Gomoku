'use strict';

var ioSession = require('socket.io-express-session');
var Model = require(appRoot + '/app/models/chat.js');

module.exports = function(server, session){

	var io = require('socket.io')(server);
	var connectedUsers = {};
	io.of('/chat').use(ioSession(session));
	io.of('/chat').on('connection', function(socket){
		var session = socket.handshake.session;
		var userId = (session.login && session.login.loginned) ? session.login.userId : null;
		var userName = (session.login && session.login.loginned) ? session.login.userName : null;
		if (userName){
			connectedUsers[socket.id] = userName;
			socket.broadcast.emit('user connected', userName);
			io.of('/chat').emit('online change', connectedUsers);
		}

		socket.on('disconnect', function(){
			var userName = connectedUsers[socket.id];
			delete connectedUsers[socket.id];
			io.of('/chat').emit('online change', connectedUsers);
			io.of('/chat').emit('disconnect', userName);
		});

		socket.on('chat message', function(data){
			socket.broadcast.emit('chat message', data);
			Model.log({
				userId : userId,
				message : data.message,
				time : data.time
			}, function(){});
		});

		socket.on('chat writing', function(data){
			socket.broadcast.emit('chat writing', data);
		});
	});

};
