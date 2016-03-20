'use strict';

var ioSession = require('socket.io-express-session');
var Model = require(appRoot + '/app/models/chat.js');

module.exports = function(server, session){

	/**
	 * Chat-be belépett userek
	 * @type Object
	 */
	var connectedUsers = {};

	/**
	 * Futó chat-csatornák
	 * @type Array
	 * @description szerkezet: [
	 *		{
	 *			name : String,		// "room-x-y"; x: létrehozó userId, y: létrehozás timestamp
	 *			userIds : Array,	// csatornába rakott userId-k
	 *			starter : Number	// csatorna létrehozó userId
	 *		},
	 *		...
	 * ]
	 */
	var rooms = [];

	/**
	 * Üres csatornák törlése
	 */
	var roomGarbageCollect = function(){
		;
	};

	var io = require('socket.io')(server);
	io.of('/chat').use(ioSession(session));
	io.of('/chat').on('connection', function(socket){
		// csatlakozás
		var session = socket.handshake.session;
		var userData = null;
		if (session.login && session.login.loginned){
			// belépett user
			userData = {
				id : session.login.userId,
				name : session.login.userName
			};
		}
		else{
			// vendég generálása
			// ...
		}
		if (userData){
			// csatlakozás emitter
			connectedUsers[socket.id] = userData;
			socket.broadcast.emit('user connected', userData);
			io.of('/chat').emit('online change', connectedUsers);
			rooms.forEach(function(roomData){
				if (roomData.userIds.indexOf(userData.id) > -1){
					socket.join(roomData.name);
					socket.broadcast.to(roomData.name).emit('room joined', {
						roomName : roomData.name,
						userId : userData.id
					});
				}
			});
		}

		socket.on('disconnect', function(){
			// csatlakozás bontása emitter
			var userData = connectedUsers[socket.id];
			delete connectedUsers[socket.id];
			roomGarbageCollect();
			io.of('/chat').emit('online change', connectedUsers);
			io.of('/chat').emit('disconnect', userData);
		});

		socket.on('room created', function(roomData){
			// csatorna létrehozása emitter
			rooms.push(roomData);
			socket.join(roomData.name);
			socket.broadcast.emit('room created', roomData);
		});

		socket.on('room join', function(roomData){
			// belépés csatornába emitter
			socket.join(roomData.name);
			/*socket.broadcast.to(roomData.name).emit('room joined', {
				roomName : roomData.name,
				userId : userData.id
			});*/
		});

		socket.on('room leave', function(data){
			// kilépés csatornából emitter
			roomGarbageCollect();
			socket.broadcast.emit('room leaved', data);
			socket.leave(data.roomName);
		});

		socket.on('chat message', function(data){
			// üzenetküldés emitter
			socket.broadcast.to(data.roomName).emit('chat message', data);
			Model.log({
				userId : userData.id,
				room : data.roomName,
				message : data.message,
				time : data.time
			}, function(){});
		});

		socket.on('chat writing', function(data){
			// üzenetírás emitter
			socket.broadcast.to(data.roomName).emit('chat writing', data);
		});
	});

};
