'use strict';

var ioSession = require('socket.io-express-session');
var Model = require(appRoot + '/app/models/chat.js');
var HD = require(appRoot + '/libs/hd/hd.math.js');

module.exports = function(server, session){

	/**
	 * Chat-be belépett userek
	 * @type Object
	 * @description szerkezet: {
	 *		<socket.id> : {
	 *			id : Number,	// user azonosító
	 *			name : String	// user login név
	 *		},
	 *		...
	 * }
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
	 * Csatornák törlése, melyekben nincs user, vagy csak offline userek vannak
	 * @returns {Array<String>} törölt csatornák azonosítói
	 */
	var roomGarbageCollect = function(){
		var key;
		var deleted = [];
		var onlineUserIds = [];
		for (key in connectedUsers){
			onlineUserIds.push(connectedUsers[key].id);
		}
		rooms.forEach(function(room, index){
			if (room.userIds.length === 0 || HD.Math.Set.intersection(room.userIds, onlineUserIds).length === 0){
				deleted.push(room.name);
				rooms.splice(index, 1);
			}
		});
	};

	/**
	 * Csatorna módosítása
	 * @param {String} operation művelet ("add"|"remove")
	 * @param {String} roomName csatorna azonosító
	 * @param {Number} userId user azonosító
	 */
	var roomUpdate = function(operation, roomName, userId){
		var roomIndex = -1;
		var userIdIndex = -1;
		if (!roomName){
			// összes csatorna
			rooms.forEach(function(room){
				roomUpdate(operation, room.name, userId);
			});
			return;
		}
		roomIndex = rooms.findIndex(function(room){
			return room.name === roomName;
		});
		if (roomIndex > -1){
			if (operation === 'add'){
				userIdIndex = rooms[roomIndex].userIds.indexOf(userId);
				if (userIdIndex === -1){
					rooms[roomIndex].userIds.push(userId);
				}
			}
			else if (operation === 'remove'){
				userIdIndex = rooms[roomIndex].userIds.indexOf(userId);
				if (userIdIndex > -1){
					rooms[roomIndex].userIds.splice(userIdIndex, 1);
				}
				roomGarbageCollect();
			}
		}
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
					io.of('/chat').to(roomData.name).emit('room joined', Object.assign(roomData, {joinedUserId : userData.id}));
				}
			});
		}

		socket.on('disconnect', function(){
			// csatlakozás bontása emitter
			var userData = connectedUsers[socket.id];
			delete connectedUsers[socket.id];
			roomUpdate('remove', null, userData.id);
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
		});

		socket.on('room leave', function(data){
			// kilépés csatornából emitter
			roomUpdate('remove', data.roomName, data.userId);
			if (!data.silent){
				socket.broadcast.emit('room leaved', data);
			}
			socket.leave(data.roomName);
		});

		socket.on('room forceleave', function(data){
			// kidobás csatornából emitter
			socket.broadcast.emit('room forceleaved', data);
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
