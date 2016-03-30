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
	 *			id : Number,		// user azonosító
	 *			name : String,		// user login név
	 *			status : String,	// user státusz ("on"|"busy"|"off")
	 *			isIdle : Boolean	// user státusz: "idle"
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

	// Belépés a chat-be
	io.of('/chat').on('connection', function(socket){
		var session = socket.handshake.session;
		var userData = null;
		if (session.login && session.login.loginned){
			// belépett user
			userData = {
				id : session.login.userId,
				name : session.login.userName,
				status : "on",
				isIdle : false
			};
		}
		else{
			// vendég generálása
			// ...
		}
		if (userData){
			// csatlakozás emitter
			connectedUsers[socket.id] = userData;
			socket.broadcast.emit('userConnected', userData);
			io.of('/chat').emit('statusChanged', connectedUsers);
			rooms.forEach(function(roomData){
				if (roomData.userIds.indexOf(userData.id) > -1){
					socket.join(roomData.name);
					io.of('/chat').to(roomData.name).emit('roomJoined', Object.assign(roomData, {joinedUserId : userData.id}));
				}
			});
		}

		// Csatlakozás bontása
		socket.on('disconnect', function(){
			var userData = connectedUsers[socket.id];
			if (userData){
				delete connectedUsers[socket.id];
				roomUpdate('remove', null, userData.id);
				io.of('/chat').emit('statusChanged', connectedUsers);
				io.of('/chat').emit('disconnect', userData);
			}
		});

		// User állapotváltozása
		socket.on('statusChanged', function(updatedConnectedUsers){
			connectedUsers = updatedConnectedUsers;
			socket.broadcast.emit('statusChanged', updatedConnectedUsers);
		});

		// Csatorna létrehozása
		socket.on('roomCreated', function(roomData){
			rooms.push(roomData);
			socket.join(roomData.name);
			socket.broadcast.emit('roomCreated', roomData);
		});

		// Belépés csatornába
		socket.on('roomJoin', function(roomData){
			if (roomData.silent){
				roomUpdate('remove', roomData.roomName, roomData.userId);
			}
			socket.join(roomData.name);
		});

		// Kilépés csatornából
		socket.on('roomLeave', function(data){
			roomUpdate('remove', data.roomName, data.userId);
			if (!data.silent){
				socket.broadcast.emit('roomLeaved', data);
			}
			socket.leave(data.roomName);
		});

		// Hozzáadás csatornához emitter
		socket.on('roomForceJoin', function(data){
			socket.broadcast.emit('roomForceJoined', Object.assign(data, {roomData : rooms[data.roomName]}));
		});

		// Kidobás csatornából emitter
		socket.on('roomForceLeave', function(data){
			socket.broadcast.emit('roomForceLeaved', Object.assign(data, {roomData : rooms[data.roomName]}));
		});

		// Üzenetküldés emitter
		socket.on('sendMessage', function(data){
			socket.broadcast.to(data.roomName).emit('sendMessage', data);
			Model.log({
				userId : userData.id,
				room : data.roomName,
				message : data.message,
				time : data.time
			}, function(){});
		});

		// Üzenetírás emitter
		socket.on('typeMessage', function(data){
			socket.broadcast.to(data.roomName).emit('typeMessage', data);
		});
	});

};
