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
				var $this = $(this);
				var userId = Number($this.val());
				$this.prop("checked", false);
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
			var $user = $add.parents(CHAT.DOM.userItems);
			var roomName = $box.data("room");
			if (!$add.hasClass("disabled")){
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
					$box.remove();
					CHAT.socket.emit('roomLeave', {
						userId : CHAT.USER.id,
						roomName : roomName
					});
				}
				else {
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
				name : CHAT.USER.name,
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
		 * Gépelés
		 * @param {jQuery} $box
		 */
		typeMessage : function($box){
			var $message = $box.find(CHAT.DOM.message);
			var data = {
				id : CHAT.USER.id,
				name : CHAT.USER.name,
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
			//CHAT.Method.appendSystemMessage($box, 'connect', data.name);
		},

		/**
		 * Kilépés a chat-ből
		 * @param {type} data
		 */
		disconnect : function(data){
			$(CHAT.DOM.box).filter(':not(.cloneable)').each(function(){
				var $box = $(this);
				if ($box.find(CHAT.DOM.userItems).filter('[data-id="' + data.id + '"]').length > 0){
					CHAT.Method.appendSystemMessage($box, 'leave', CHAT.Method.getUserName(data.id));
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
				CHAT.socket.emit('roomJoin', roomData);
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
				CHAT.Method.appendSystemMessage($box, 'join', CHAT.Method.getUserName(roomData.joinedUserId));
				CHAT.Method.generateUserList($users, roomData.userIds, true);
			}
		},

		/**
		 * Csatorna elhagyása
		 * @param {type} data
		 */
		roomLeaved : function(data){
			var $box = $(CHAT.DOM.box).filter('[data-room="' + data.roomName + '"]');
			CHAT.Method.appendSystemMessage($box, 'leave', CHAT.Method.getUserName(data.userId));
			$box.find('[data-id="' + data.userId + '"]').remove();
		},

		/**
		 * Hozzáadás csatornához
		 * @param {type} data
		 */
		roomForceJoined : function(data){
			var $box, $users;
			if (data.userId === CHAT.USER.id){
				// Létre kell hozni a dobozt a csatornához
				$box = CHAT.Util.cloneElement($(CHAT.DOM.cloneBox), $(CHAT.DOM.container));
				$users = $box.find(CHAT.DOM.users);
				$box.attr("data-room", data.roomName);
				CHAT.Method.generateUserList($users, data.roomData.userIds);
				CHAT.Method.updateStatuses($(CHAT.DOM.online).data("connectedUsers"));
				CHAT.Method.fillBox($box, data.roomName);
				CHAT.Method.appendSystemMessage($box, 'forcejoinyou', CHAT.Method.getUserName(data.triggerId));
				// TODO: itt roomData adatformátumot kéne átadni
				CHAT.socket.emit('roomJoin', {
					silent : true,
					userId : CHAT.USER.id,
					roomName : data.roomName
				});
			}
			else {
				// Csatlakozott a csatornához
				$box = $(CHAT.DOM.box).filter('[data-room="' + data.roomName + '"]');
				$users = $box.find(CHAT.DOM.users);
				CHAT.Method.appendSystemMessage(
					$box, 'forcejoinother', CHAT.Method.getUserName(data.triggerId), CHAT.Method.getUserName(data.userId)
				);
				CHAT.Method.generateUserList($users, data.roomData.userIds, true);
			}
		},

		/**
		 * Kidobás csatornából
		 * @param {type} data
		 */
		roomForceLeaved : function(data){
			var $box = $(CHAT.DOM.box).filter('[data-room="' + data.roomName + '"]');
			var $users = $box.find(CHAT.DOM.users);
			if (data.userId === CHAT.USER.id){
				CHAT.Method.appendSystemMessage($box, 'forceleaveyou', CHAT.Method.getUserName(data.triggerId));
				CHAT.socket.emit('roomLeave', {
					silent : true,
					userId : CHAT.USER.id,
					roomName : data.roomName
				});
				$box.find(CHAT.DOM.message).prop("disabled", true);
				$box.find(CHAT.DOM.userThrow).addClass("disabled");
			}
			else {
				CHAT.Method.appendSystemMessage(
					$box, 'forceleaveother', CHAT.Method.getUserName(data.triggerId), CHAT.Method.getUserName(data.userId)
				);
			}
			$box.find('[data-id="' + data.userId + '"]').remove();
		},

		/**
		 * Üzenetküldés
		 * @param {type} data
		 */
		sendMessage : function(data){
			var $box = $(CHAT.DOM.box).filter('[data-room="' + data.roomName + '"]');
			if ($box.length === 0) return;
			CHAT.Method.appendUserMessage($box, data);
			CHAT.Method.stopWrite($box, data.name, '');
			window.clearInterval(CHAT.timer.writing.timerID);
			CHAT.timer.writing.timerID = null;
		},

		/**
		 * Üzenetírás
		 * @param {type} data
		 */
		typeMessage : function(data){
			var $box = $(CHAT.DOM.box).filter('[data-room="' + data.roomName + '"]');
			var writing = CHAT.timer.writing;
			if ($box.length === 0) return;
			writing.event = true;
			writing.message = data.message;
			if (!writing.timerID){
				$box.find(CHAT.DOM.indicator).html(data.name + ' éppen ír...');
				writing.timerID = window.setInterval(function(){
					if (!writing.event){
						CHAT.Method.stopWrite($box, data.name, writing.message);
						window.clearInterval(writing.timerID);
						writing.timerID = null;
					}
					writing.event = false;
				}, writing.interval);
			}
		}

	}

};
