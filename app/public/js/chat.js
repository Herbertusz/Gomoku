'use strict';

$(document).ready(function(){

	/**
	 * Socket objektum
	 * @type Object
	 */
	var socket = io.connect('http://' + DOMAIN + ':' + WSPORT + '/chat');

	/**
	 * jQuery objektumok és szelektorok
	 * @type Object
	 */
	var DOM = {
		$start : $('.online .start'),
		$online : $('.online'),
		$onlineListItems : $('.online li'),
		allUsers : '.user-select',
		selectedUsers : '.user-select:checked',
		$container : $('.chatcontainer'),
		$cloneBox : $('.chat.cloneable'),
		box : '.chat',
		userItems : '.user-item',
		userThrow : '.throw',
		users : '.users',
		close : '.close',
		list : '.list',
		message : '.message',
		indicator : '.indicator',
		sendButton : '.send',
		sendSwitch : '.send-switch'
	};

	/**
	 * Időméréshez használt változók
	 * @type Object
	 */
	var timer = {
		timerID : null,
		interval : 1000,
		event : false,
		message : ''
	};

	/**
	 * Online user-ek
	 * @type Array
	 */
	var onlineUserIds = [];

	/**
	 *
	 * @param {String} string
	 * @returns {String}
	 */
	var escapeHtml = function(string){
		var str;
		var entityMap = {
			"&" : "&amp;",
			"<" : "&lt;",
			">" : "&gt;",
			'"' : '&quot;',
			"'" : '&#39;',
			"/" : '&#x2F;'
		};
		var str = String(string).replace(/[&<>"'\/]/g, function(s){
			return entityMap[s];
		});
		str = str.replace(/\n/g, '<br />');
		return str;
	};

	/**
	 *
	 * @param {jQuery} $box
	 */
	var scrollToBottom = function($box){
		var height = 0;
		var $list = $box.find(DOM.list);
		$list.find('li').each(function(){
			height += $(this).outerHeight();
		});
		$list.scrollTop(height);
	};

	/**
	 *
	 * @param {jQuery} $box
	 * @param {Object} data
	 * @param {Boolean} [highlighted=false]
	 */
	var appendUserMessage = function($box, data, highlighted){
		highlighted = HD.Misc.funcParam(highlighted, false);
		var time = HD.DateTime.format('H:i:s', data.time);
		var $list = $box.find(DOM.list);
		$list.append('\
			<li>\
				<span>' + time + '</span>\
				<strong class="' + (highlighted ? "self" : "") + '">' + escapeHtml(data.name) + '</strong>:<br />\
				' + escapeHtml(data.message) + '\
			</li>\
		');
		scrollToBottom($box);
	};

	/**
	 *
	 * @param {jQuery} $box
	 * @param {String} type
	 * @param {String} name
	 * @param {String} otherName
	 */
	var appendSystemMessage = function($box, type, name, otherName){
		var $list = $box.find(DOM.list);
		if (type === 'join'){
			$list.append('<li class="highlighted">' + name + ' csatlakozott!</li>');
		}
		else if (type === 'leave'){
			$list.append('<li class="highlighted">' + name + ' kilépett!</li>');
		}
		else if (type === 'forceleaveyou'){
			$list.append('<li class="highlighted">' + name + ' kidobott!</li>');
		}
		else if (type === 'forceleaveother'){
			$list.append('<li class="highlighted">' + name + ' kidobta ' + otherName + ' felhasználót!</li>');
		}
		scrollToBottom($box);
	};

	/**
	 *
	 * @param {jQuery} $box
	 * @param {String} name
	 * @param {String} message
	 */
	var stopWrite = function($box, name, message){
		if (message.length > 0){
			$box.find(DOM.indicator).html(name + ' szöveget írt be');
		}
		else{
			$box.find(DOM.indicator).html('');
		}
	};

	/**
	 *
	 * @param {jQuery} $box
	 * @param {Object} data
	 * @param {jQuery.Event} event
	 */
	var sendMessage = function($box, data, event){
		if (data.message.trim().length > 0){
			socket.emit('chat message', data);
			appendUserMessage($box, data, true);
			$box.find(DOM.message).val('');
			event.preventDefault();
		}
	};

	/**
	 *
	 * @param {jQuery} $elem
	 * @param {String} status
	 */
	var setStatus = function($elem, status){
		var n;
		var $statusElem = $elem.find('.status');
		var statuses = ["on", "busy", "idle", "off", "on-chat", "busy-chat", "idle-chat", "off-chat"];
		for (n = 0; n < statuses.length; n++){
			$statusElem.removeClass(statuses[n]);
		}
		$statusElem.addClass(status);
	};

	/**
	 *
	 * @param {jQuery} $elem
	 * @returns {String}
	 */
	var getStatus = function($elem){
		var n, status;
		var $statusElem = $elem.find('.status');
		var statuses = ["on", "busy", "idle", "off"];
		for (n = 0; n < statuses.length; n++){
			if ($statusElem.hasClass(statuses[n])){
				status = statuses[n];
				break;
			}
		}
		return status;
	};

	/**
	 *
	 * @param {jQuery} $element
	 * @param {jQuery} $insert
	 * @param {Boolean} [prepend=false]
	 * @returns {jQuery}
	 */
	var cloneElement = function($element, $insert, prepend){
		prepend = HD.Misc.funcParam(prepend, false);
		var $clone = $element.clone(true, true);
		if (prepend){
			$clone.prependTo($insert);
		}
		else {
			$clone.appendTo($insert);
		}
		$clone.removeClass("cloneable");
		return $clone;
	};

	/**
	 *
	 * @param {Number} id
	 * @returns {String}
	 */
	var getUserName = function(id){
		var $element = DOM.$online.find(DOM.allUsers).filter('[value="' + id + '"]');
		return $element.data("name");
	};

	/**
	 *
	 * @param {jQuery} $to
	 * @param {Array} userIds
	 * @param {Boolean} [regenerate=false]
	 */
	var generateUserList = function($to, userIds, regenerate){
		regenerate = HD.Misc.funcParam(regenerate, false);
		var $user, $keep;
		if (regenerate){
			$keep = $to.find('.cloneable');
			$to.html('').append($keep);
		}
		DOM.$onlineListItems.each(function(){
			var $user;
			var $this = $(this);
			var currentUserId = $this.data("id");
			if (userIds.indexOf(currentUserId) > -1){
				$user = cloneElement($to.find('.cloneable'), $to, currentUserId === userData.id);
				$user.attr("data-id", currentUserId);
				$user.find('.status').addClass(getStatus($this)).addClass("run");
				$user.find('.name').html(getUserName(currentUserId));
			}
		});
	};

	/**
	 *
	 * @param {jQuery} $box
	 * @param {String} roomName
	 * @param {Function} [callback]
	 */
	var fillBox = function($box, roomName, callback){
		callback = HD.Misc.funcParam(callback, function(){});
		$.ajax({
			type : "POST",
			url : "/chat/getroommessages",
			data : {
				roomName : roomName
			},
			dataType : "json",
			success : function(resp){
				resp.messages.forEach(function(msgData){
					var timestamp = (new Date(msgData.created.replace(/ /g, 'T'))).getTime() / 1000;
					appendUserMessage($box, {
						name : msgData.username,
						time : timestamp,
						message : msgData.message
					});
				});
				callback();
			}
		});
	};

	// Csatorna létrehozása
	DOM.$start.click(function(){
		var $users;
		var roomData = {
			name : "",
			userIds : [userData.id],
			starter : userData.id
		};
		var $box = cloneElement(DOM.$cloneBox, DOM.$container);
		$users = $box.find(DOM.users);
		DOM.$online.find(DOM.selectedUsers).each(function(){
			var $this = $(this);
			var userId = Number($this.val());
			$this.prop("checked", false);
			roomData.userIds.push(userId);
		});
		generateUserList($users, roomData.userIds);
		roomData.name = 'room-' + roomData.starter.toString() + '-' + Date.now().toString();
		$box.attr("data-room", roomData.name);
		socket.emit('room created', roomData);
	});

	// Kilépés csatornából
	$(DOM.box).find(DOM.close).click(function(){
		var $box = $(this).parents(DOM.box);
		var roomName = $box.data("room");
		$box.remove();
		socket.emit('room leave', {
			userId : userData.id,
			roomName : roomName
		});
	});

	// User kidobása csatornából
	$(DOM.box).find(DOM.userThrow).click(function(){
		var $close = $(this);
		var $box = $close.parents(DOM.box);
		var $user = $close.parents(DOM.userItems);
		var roomName = $box.data("room");
		var userId = $user.data("id");
		if (!$close.hasClass("disabled")){
			if (userId === userData.id){
				$box.remove();
				socket.emit('room leave', {
					userId : userData.id,
					roomName : roomName
				});
			}
			else {
				$user.remove();
				socket.emit('room forceleave', {
					triggerId : userData.id,
					userId : userId,
					roomName : roomName
				});
			}
		}
	});

	// Üzenetküldés indítása ENTER leütésére
	$(DOM.box).find(DOM.message).keydown(function(event){
		var $box = $(this).parents('.chat');
		var $message = $(this);
		var data = {
			id : userData.id,
			name : userData.name,
			message : $message.val(),
			time : Math.round(Date.now() / 1000),
			roomName : $box.data("room")
		};
		if (event.which === HD.Misc.keys.ENTER){
			if (!event.shiftKey && $box.find(DOM.sendSwitch).prop("checked")){
				sendMessage($box, data, event);
			}
		}
		else{
			socket.emit('chat writing', data);
		}
	});

	// Üzenetküldés indítása gombnyomásra
	$(DOM.box).find(DOM.sendButton).click(function(event){
		var $box = $(this).parents('.chat');
		var $message = $box.find(DOM.message);
		var data = {
			id : userData.id,
			name : userData.name,
			message : $message.val(),
			time : Math.round(Date.now() / 1000),
			roomName : $box.data("room")
		};
		sendMessage($box, data, event);
	});

	// Üzenetküldés módja
	$(DOM.box).find(DOM.sendSwitch).change(function(){
		var $box = $(this).parents('.chat');
		if ($(this).prop("checked")){
			$box.find(DOM.sendButton).hide();
		}
		else {
			$box.find(DOM.sendButton).show();
		}
	});

	// Belépés a chat-be
	socket.on('user connected', function(data){
		//appendSystemMessage($box, 'connect', data.name);
	});

	// Kilépés a chat-ből
	socket.on('disconnect', function(data){
		$(DOM.box).filter(':not(.cloneable)').each(function(){
			var $box = $(this);
			if ($box.find(DOM.userItems).filter('[data-id="' + data.id + '"]').length > 0){
				appendSystemMessage($box, 'leave', getUserName(data.id));
				$box.find('[data-id="' + data.id + '"]').remove();
			}
		});
	});

	// User-ek állapotváltozása
	socket.on('online change', function(online){
		onlineUserIds = Object.keys(online).map(function(socketId){
			return online[socketId].id;
		});
		DOM.$onlineListItems.each(function(){
			var $this = $(this);
			if (onlineUserIds.indexOf($this.data("id")) > -1){
				setStatus($this, "on");
			}
			else{
				setStatus($this, "off");
			}
		});
	});

	// Csatorna létrehozása
	socket.on('room created', function(roomData){
		var $box, $users;
		if (roomData.userIds.indexOf(userData.id) > -1){
			$box = cloneElement(DOM.$cloneBox, DOM.$container);
			$users = $box.find(DOM.users);
			generateUserList($users, roomData.userIds);
			$box.attr("data-room", roomData.name);
			socket.emit('room join', roomData);
		}
	});

	// Csatorna elhagyása
	socket.on('room leaved', function(data){
		var $box = $(DOM.box).filter('[data-room="' + data.roomName + '"]');
		appendSystemMessage($box, 'leave', getUserName(data.userId));
		$box.find('[data-id="' + data.userId + '"]').remove();
	});

	// Kidobás csatornából
	socket.on('room forceleaved', function(data){
		var $box = $(DOM.box).filter('[data-room="' + data.roomName + '"]');
		var $users = $box.find(DOM.users);
		if (data.userId === userData.id){
			appendSystemMessage($box, 'forceleaveyou', getUserName(data.triggerId));
			socket.emit('room leave', {
				silent : true,
				userId : userData.id,
				roomName : data.roomName
			});
			$box.find(DOM.message).prop("disabled", true);
			$box.find(DOM.userThrow).addClass("disabled");
		}
		else {
			appendSystemMessage($box, 'forceleaveother', getUserName(data.triggerId), getUserName(data.userId));
		}
		$box.find('[data-id="' + data.userId + '"]').remove();
	});

	// Csatornához csatlakozás
	socket.on('room joined', function(roomData){
		var $box, $users;
		if (roomData.joinedUserId === userData.id){
			// Létre kell hozni a dobozt a csatornához
			$box = cloneElement(DOM.$cloneBox, DOM.$container);
			$users = $box.find(DOM.users);
			generateUserList($users, roomData.userIds);
			$box.attr("data-room", roomData.name);
			fillBox($box, roomData.name);
		}
		else {
			// Csatlakozott a csatornához
			$box = $(DOM.box).filter('[data-room="' + roomData.name + '"]');
			$users = $box.find(DOM.users);
			appendSystemMessage($box, 'join', getUserName(roomData.joinedUserId));
			generateUserList($users, roomData.userIds, true);
		}
	});

	// Üzenetküldés
	socket.on('chat message', function(data){
		var $box = $(DOM.box).filter('[data-room="' + data.roomName + '"]');
		if ($box.length === 0) return;
		appendUserMessage($box, data);
		stopWrite($box, data.name, '');
		window.clearInterval(timer.timerID);
		timer.timerID = null;
	});

	// Üzenetírás
	socket.on('chat writing', function(data){
		var $box = $(DOM.box).filter('[data-room="' + data.roomName + '"]');
		if ($box.length === 0) return;
		timer.event = true;
		timer.message = data.message;
		if (!timer.timerID){
			$box.find(DOM.indicator).html(data.name + ' éppen ír...');
			timer.timerID = window.setInterval(function(){
				if (!timer.event){
					stopWrite($box, data.name, timer.message);
					window.clearInterval(timer.timerID);
					timer.timerID = null;
				}
				timer.event = false;
			}, timer.interval);
		}
	});

});
