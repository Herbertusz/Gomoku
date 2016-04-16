"use strict";

var CHAT = window.CHAT || {};

/**
 * Eseménykezelők
 * @type Object
 */
CHAT.Events = {

	/**
	 * Kliens által küldött események kezelése
	 * @type Object
	 */
	Client : {

		/**
		 * Csatorna létrehozása
		 */
		createRoom : function(){
			var $users;
			var roomData = {
				name : "",
				userIds : [CHAT.USER.id],
				starter : CHAT.USER.id
			};
			var $box = CHAT.Util.cloneElement($(CHAT.DOM.cloneBox), $(CHAT.DOM.container));
			$users = $box.find(CHAT.DOM.users);
			$(CHAT.DOM.online).find(CHAT.DOM.selectedUsers).each(function(){
				var userId = Number($(this).val());
				roomData.userIds.push(userId);
			});
			CHAT.Method.generateUserList($users, roomData.userIds);
			roomData.name = 'room-' + roomData.starter.toString() + '-' + Date.now().toString();
			$box.attr("data-room", roomData.name);
			CHAT.socket.emit('roomCreated', roomData);
		},

		/**
		 * Kilépés csatornából
		 * @param {jQuery} $box
		 */
		leaveRoom : function($box){
			var roomName = $box.data("room");
			$box.remove();
			CHAT.socket.emit('roomLeave', {
				userId : CHAT.USER.id,
				roomName : roomName
			});
		},

		/**
		 * User hozzáadása csatornához
		 * @param {jQuery} $add
		 * @param {Number} userId
		 */
		forceJoinRoom : function($add, userId){
			var $box = $add.parents(CHAT.DOM.box);
			var $users = $box.find(CHAT.DOM.users);
			var roomName = $box.data("room");
			var currentUserIds = [];
			$users.find(CHAT.DOM.userItems).filter(':not(.cloneable)').each(function(){
				currentUserIds.push(Number($(this).attr("data-id")));
			});
			if (!$add.hasClass("disabled") && currentUserIds.indexOf(userId) === -1){
				CHAT.Method.generateUserList($users, [userId]);
				CHAT.socket.emit('roomForceJoin', {
					triggerId : CHAT.USER.id,
					userId : userId,
					roomName : roomName
				});
			}
		},

		/**
		 * User kidobása csatornából
		 * @param {jQuery} $close
		 */
		forceLeaveRoom : function($close){
			var $box = $close.parents(CHAT.DOM.box);
			var $user = $close.parents(CHAT.DOM.userItems);
			var roomName = $box.data("room");
			var userId = $user.data("id");
			if (!$close.hasClass("disabled")){
				if (userId === CHAT.USER.id){
					// kilépés
					$box.remove();
					CHAT.socket.emit('roomLeave', {
						userId : CHAT.USER.id,
						roomName : roomName
					});
				}
				else {
					// másik felhasználó kidobása
					$user.remove();
					CHAT.socket.emit('roomForceLeave', {
						triggerId : CHAT.USER.id,
						userId : userId,
						roomName : roomName
					});
				}
			}
		},

		/**
		 * Üzenetküldés
		 * @param {jQuery} $box
		 */
		sendMessage : function($box){
			var $message = $box.find(CHAT.DOM.message);
			var data = {
				id : CHAT.USER.id,
				message : $message.val(),
				time : Math.round(Date.now() / 1000),
				roomName : $box.data("room")
			};
			if (data.message.trim().length > 0){
				CHAT.socket.emit('sendMessage', data);
				CHAT.Method.appendUserMessage($box, data, true);
				$box.find(CHAT.DOM.message).val('');
			}
		},

		/**
		 * Fájlküldés
		 * @param {jQuery} $box
		 * @param {Object} files
		 */
		sendFile : function($box, files){
			var store = CHAT.Config.fileTransfer.store;
			var types = CHAT.Config.fileTransfer.types;
			var extensions = CHAT.Config.fileTransfer.extensions;
			var allowedTypes = CHAT.Config.fileTransfer.allowedTypes;
			var maxSize = CHAT.Config.fileTransfer.maxSize;
			if (!CHAT.Config.fileTransfer.multiple){
				files = [files[0]];
			}
			else{
				files = Array.prototype.slice.call(files);
			}

			files.forEach(function(rawFile){
				let i, errors = [];
				let data = {
					id : CHAT.USER.id,
					fileData : {
						name : rawFile.name,
						size : rawFile.size,
						type : rawFile.type
					},
					file : null,  // base64
					store : store,
					type : '',
					time : Math.round(Date.now() / 1000),
					roomName : $box.data("room")
				};

				if (rawFile.size > maxSize){
					errors.push("size");
				}
				for (i in extensions){
					if (extensions[i].test(rawFile.type)){
						data.type = i;
						break;
					}
				}
				if (allowedTypes.indexOf(data.type) === -1){
					errors.push("type");
				}

				if (errors.length === 0){
					let mainType, element, reader;
					mainType = (data.type === "image") ? "image" : "file";
					element = document.createElement(types[mainType].tag);
					reader = new FileReader();
					reader.onload = (function(data){
						return function(){
							let base64 = reader.result;
							element[types[mainType].attr] = base64;

							if (store === 'base64'){
								// base64 tárolása db-ben
								data.file = base64;
								CHAT.Method.appendFile($box, data, true);
								CHAT.socket.emit('sendFile', data);
							}
							else if (store === 'upload'){
								// fájlfeltöltés, url tárolása db-ben
								let fileData = JSON.stringify(data);
								let xhr = new XMLHttpRequest();
								xhr.open("POST", "/chat/uploadfile");
								xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
								xhr.setRequestHeader('X-File-Data', encodeURIComponent(fileData));
								xhr.setRequestHeader('Content-Type', 'application/octet-stream');
								CHAT.Method.progressbar($box, data, "send", 0, true);
								xhr.upload.onprogress = function(event){
									if (event.lengthComputable){
										let percent = event.loaded / event.total;
										CHAT.Method.progressbar($box, data, "send", Math.round(percent * 100));
									}
								};
								xhr.onload = function(){
									let response = JSON.parse(xhr.responseText);
									data.file = response.filePath;
									CHAT.Method.progressbar($box, data, "send", 100);
									CHAT.Method.appendFile($box, data, true);
									CHAT.socket.emit('sendFile', data);
								};
								xhr.send(rawFile);
							}
							else if (store === 'zip'){
								// tömörített base64 tárolása db-ben
								CHAT.lzma.compress(base64, 1, function(result, error){
									if (error){
										console.log(error);
									}
									else{
										data.file = result;
									}
									CHAT.Method.appendFile($box, data, true);
									CHAT.socket.emit('sendFile', data);
								}, function(percent){
									// TODO: progressbar
								});
							}
						};
					})(data);
					reader.readAsDataURL(rawFile);
				}
				else{
					CHAT.Method.showError($box, errors);
				}
			});
		},

		/**
		 * Gépelés
		 * @param {jQuery} $box
		 */
		typeMessage : function($box){
			var $message = $box.find(CHAT.DOM.message);
			var data = {
				id : CHAT.USER.id,
				message : $message.val(),
				time : Math.round(Date.now() / 1000),
				roomName : $box.data("room")
			};
			CHAT.socket.emit('typeMessage', data);
		},

		/**
		 * Üzenetküldés módjának változtatása
		 * @param {jQuery} $change
		 */
		sendMethod : function($change){
			var $box = $change.parents('.chat');
			if ($change.prop("checked")){
				$box.find(CHAT.DOM.sendButton).hide();
			}
			else {
				$box.find(CHAT.DOM.sendButton).show();
			}
		}

	},

	/**
	 * Szerver által küldött események kezelése
	 * @type Object
	 */
	Server : {

		/**
		 * Belépés a chat-be
		 * @param {type} data
		 */
		userConnected : function(data){
			//CHAT.Method.appendSystemMessage($box, 'connect', data.id);
		},

		/**
		 * Kilépés a chat-ből
		 * @param {type} data
		 */
		disconnect : function(data){
			$(CHAT.DOM.box).filter(':not(.cloneable)').each(function(){
				var $box = $(this);
				if ($box.find(CHAT.DOM.userItems).filter('[data-id="' + data.id + '"]').length > 0){
					CHAT.Method.appendSystemMessage($box, 'leave', data.id);
					$box.find('[data-id="' + data.id + '"]').remove();
				}
			});
		},

		/**
		 * User-ek állapotváltozása
		 * @param {type} connectedUsers
		 */
		statusChanged : function(connectedUsers){
			$(CHAT.DOM.online).data("connectedUsers", connectedUsers);
			CHAT.Method.updateStatuses(connectedUsers);
		},

		/**
		 * Csatorna létrehozása
		 * @param {type} roomData
		 */
		roomCreated : function(roomData){
			var $box, $users;
			if (roomData.userIds.indexOf(CHAT.USER.id) > -1){
				$box = CHAT.Util.cloneElement($(CHAT.DOM.cloneBox), $(CHAT.DOM.container));
				$users = $box.find(CHAT.DOM.users);
				$box.attr("data-room", roomData.name);
				CHAT.Method.generateUserList($users, roomData.userIds);
				CHAT.Method.updateStatuses($(CHAT.DOM.online).data("connectedUsers"));
				CHAT.socket.emit('roomJoin', {roomName : roomData.name});
			}
		},

		/**
		 * Csatornához csatlakozás
		 * @param {type} roomData
		 */
		roomJoined : function(roomData){
			var $box, $users;
			if (roomData.joinedUserId === CHAT.USER.id){
				// Létre kell hozni a dobozt a csatornához
				$box = CHAT.Util.cloneElement($(CHAT.DOM.cloneBox), $(CHAT.DOM.container));
				$users = $box.find(CHAT.DOM.users);
				$box.attr("data-room", roomData.name);
				CHAT.Method.generateUserList($users, roomData.userIds);
				CHAT.Method.updateStatuses($(CHAT.DOM.online).data("connectedUsers"));
				CHAT.Method.fillBox($box, roomData.name);
			}
			else {
				// Csatlakozott a csatornához
				$box = $(CHAT.DOM.box).filter('[data-room="' + roomData.name + '"]');
				$users = $box.find(CHAT.DOM.users);
				CHAT.Method.appendSystemMessage($box, 'join', roomData.joinedUserId);
				CHAT.Method.generateUserList($users, roomData.userIds, true);
			}
		},

		/**
		 * Csatorna elhagyása
		 * @param {Object} extData
		 * @description szerkezet: {
		 * 		userId : Number,
		 * 		roomData : Object
		 * }
		 */
		roomLeaved : function(extData){
			var $box;
			if (extData.roomData){
				$box = $(CHAT.DOM.box).filter('[data-room="' + extData.roomData.name + '"]');
				CHAT.Method.appendSystemMessage($box, 'leave', extData.userId);
				$box.find('[data-id="' + extData.userId + '"]').remove();
			}
		},

		/**
		 * Hozzáadás csatornához
		 * @param {Object} extData
		 * @description szerkezet: {
		 *  	triggerId : Number,
		 * 		userId : Number,
		 * 		roomData : Object
		 * }
		 */
		roomForceJoined : function(extData){
			var $box, $users;
			if (extData.userId === CHAT.USER.id){
				// Létre kell hozni a dobozt a csatornához
				$box = CHAT.Util.cloneElement($(CHAT.DOM.cloneBox), $(CHAT.DOM.container));
				$users = $box.find(CHAT.DOM.users);
				$box.attr("data-room", extData.roomData.name);
				CHAT.Method.generateUserList($users, extData.roomData.userIds);
				CHAT.Method.updateStatuses($(CHAT.DOM.online).data("connectedUsers"));
				CHAT.Method.fillBox($box, extData.roomData.name);
				CHAT.Method.appendSystemMessage($box, 'forcejoinyou', extData.triggerId);
				CHAT.socket.emit('roomJoin', {
					userId : CHAT.USER.id,
					roomName : extData.roomData.name
				});
			}
			else {
				// Csatlakozott a csatornához
				$box = $(CHAT.DOM.box).filter('[data-room="' + extData.roomData.name + '"]');
				$users = $box.find(CHAT.DOM.users);
				CHAT.Method.appendSystemMessage($box, 'forcejoinother', extData.triggerId, extData.userId);
				CHAT.Method.generateUserList($users, extData.roomData.userIds, true);
			}
		},

		/**
		 * Kidobás csatornából
		 * @param {Object} extData
		 * @description szerkezet: {
		 *  	triggerId : Number,
		 * 		userId : Number,
		 * 		roomData : Object
		 * }
		 */
		roomForceLeaved : function(extData){
			var $box = $(CHAT.DOM.box).filter('[data-room="' + extData.roomData.name + '"]');
			if (extData.userId === CHAT.USER.id){
				CHAT.Method.appendSystemMessage($box, 'forceleaveyou', extData.triggerId);
				CHAT.socket.emit('roomLeave', {
					silent : true,
					userId : CHAT.USER.id,
					roomName : extData.roomData.name
				});
				$box.find(CHAT.DOM.message).prop("disabled", true);
				$box.find(CHAT.DOM.userThrow).addClass("disabled");
			}
			else {
				CHAT.Method.appendSystemMessage($box, 'forceleaveother', extData.triggerId, extData.userId);
			}
			$box.find('[data-id="' + extData.userId + '"]').remove();
		},

		/**
		 * Üzenetküldés
		 * @param {Object} data
		 * @description data szerkezete: {
		 *  	id : Number,
		 * 		message : String,
		 * 		time : Number,
		 * 		roomName : String
		 * }
		 */
		sendMessage : function(data){
			var $box = $(CHAT.DOM.box).filter('[data-room="' + data.roomName + '"]');
			if ($box.length === 0) return;
			CHAT.Method.appendUserMessage($box, data);
			CHAT.Method.stopWrite($box, data.id, '');
			window.clearInterval(CHAT.timer.writing.timerID);
			CHAT.timer.writing.timerID = null;
		},

		/**
		 * Fájlküldés
		 * @param {Object} data
		 * @description data szerkezete: {
		 *  	id : Number,
		 * 		fileData : {
		 * 			name : String,
		 *  		size : Number,
		 *  		type : String
		 * 		},
		 * 		file : String,
		 * 		store : String,
		 * 		type : String,
		 * 		time : Number,
		 * 		roomName : String
		 * }
		 */
		sendFile : function(data){
			var $box = $(CHAT.DOM.box).filter('[data-room="' + data.roomName + '"]');
			if ($box.length === 0) return;
			if (data.store === 'base64' || data.store === 'upload'){
				CHAT.Method.appendFile($box, data);
			}
			else if (data.store === 'zip'){
				LZMA.decompress(data.file, function(result, error){
					if (error){
						console.log(error);
					}
					else {
						data.file = result;
						CHAT.Method.appendFile($box, data);
					}
				}, function(percent){
					// TODO: progressbar
				});
			}
			CHAT.Method.stopWrite($box, data.id, '');
			window.clearInterval(CHAT.timer.writing.timerID);
			CHAT.timer.writing.timerID = null;
		},

		fileReceive : function(data){
			var $box = $(CHAT.DOM.box).filter('[data-room="' + data.roomName + '"]');
			if (CHAT.USER.id !== data.userId){
				CHAT.Method.progressbar($box, data, "get", Math.round((data.uploadedSize / data.fileSize) * 100), data.firstSend);
			}
		},

		/**
		 * Üzenetírás
		 * @param {Object} data
		 * @description szerkezet: {
		 *  	id : Number,
		 * 		message : String,
		 * 		time : Number,
		 * 		roomName : String
		 * }
		 */
		typeMessage : function(data){
			var $box = $(CHAT.DOM.box).filter('[data-room="' + data.roomName + '"]');
			var writing = CHAT.timer.writing;
			if ($box.length === 0) return;
			writing.event = true;
			writing.message = data.message;
			if (!writing.timerID){
				CHAT.Method.stillWrite($box, data.id);
				writing.timerID = window.setInterval(function(){
					if (!writing.event){
						CHAT.Method.stopWrite($box, data.id, writing.message);
						window.clearInterval(writing.timerID);
						writing.timerID = null;
					}
					writing.event = false;
				}, writing.interval);
			}
		}

	}

};
