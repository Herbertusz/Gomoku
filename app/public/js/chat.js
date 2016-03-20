'use strict';

$(document).ready(function(){

	var socket = io.connect('http://' + DOMAIN + ':' + WSPORT + '/chat');
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
		users : '.users',
		close : '.close',
		list : '.list',
		message : '.message',
		indicator : '.indicator',
		sendButton : '.send',
		sendSwitch : '.send-switch'
	};
	var timer = {
		timerID : null,
		interval : 1000,
		event : false,
		message : ''
	};
	var onlineUserIds = [];

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
	var scrollToBottom = function($box){
		var height = 0;
		var $list = $box.find(DOM.list);
		$list.find('li').each(function(){
			height += $(this).outerHeight();
		});
		$list.scrollTop(height);
	};
	var appendUserMessage = function($box, data, highlighted){
		highlighted = HD.Misc.funcParam(highlighted, false);
		var time = HD.DateTime.format('Y.m.d. H:i:s', data.time);
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
	var appendSystemMessage = function($box, type, name){
		var $list = $box.find(DOM.list);
		if (type === 'join'){
			$list.append('<li class="highlighted">' + name + ' csatlakozott!</li>');
		}
		else if (type === 'leave'){
			$list.append('<li class="highlighted">' + name + ' kilépett!</li>');
		}
		scrollToBottom($box);
	};
	var stopWrite = function($box, name, message){
		if (message.length > 0){
			$box.find(DOM.indicator).html(name + ' szöveget írt be');
		}
		else{
			$box.find(DOM.indicator).html('');
		}
	};
	var sendMessage = function($box, data, event){
		if (data.message.trim().length > 0){
			socket.emit('chat message', data);
			appendUserMessage($box, data, true);
			$box.find(DOM.message).val('');
			event.preventDefault();
		}
	};
	var setStatus = function($elem, status){
		var n;
		var $statusElem = $elem.find('.status');
		var statuses = ["on", "busy", "idle", "off", "on-chat", "busy-chat", "idle-chat", "off-chat"];
		for (n = 0; n < statuses.length; n++){
			$statusElem.removeClass(statuses[n]);
		}
		$statusElem.addClass(status);
	};
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
	var getUserName = function(id){
		var $element = DOM.$online.find(DOM.allUsers).filter('[value="' + id + '"]');
		return $element.data("name");
	};
	var generateUserList = function($to, userIds){
		var $user;
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

	//scrollToBottom($(DOM.box));

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

	$(DOM.box).find(DOM.close).click(function(){
		var $box = $(this).parents(DOM.box);
		var roomName = $box.data("room");
		$box.remove();
		socket.emit('room leave', {
			triggerBy : userData.id,
			userId : userData.id,
			roomName : roomName
		});
	});

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

	$(DOM.box).find(DOM.sendSwitch).change(function(){
		var $box = $(this).parents('.chat');
		if ($(this).prop("checked")){
			$box.find(DOM.sendButton).hide();
		}
		else {
			$box.find(DOM.sendButton).show();
		}
	});

	socket.on('user connected', function(data){
		//appendSystemMessage('connect', data.name);
	});
	socket.on('disconnect', function(data){
		$(DOM.box).filter(':not(.cloneable)').each(function(){
			var $box = $(this);
			if ($box.find(DOM.userItems).filter('[data-id="' + data.id + '"]').length > 0){
				appendSystemMessage($box, 'leave', getUserName(data.id));
				$box.find('[data-id="' + data.id + '"]').remove();
			}
		});
	});
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
	socket.on('room leaved', function(data){
		var $box = $(DOM.box).filter('[data-room="' + data.roomName + '"]');
		appendSystemMessage($box, 'leave', getUserName(data.userId));
		$box.find('[data-id="' + data.userId + '"]').remove();
	});
	socket.on('room joined', function(roomData, user){
		var $box = $(DOM.box).filter('[data-room="' + roomData.name + '"]');
		appendSystemMessage($box, 'join', getUserName(user.id));
		// ...
	});
	socket.on('chat message', function(data){
		var $box = $(DOM.box).filter('[data-room="' + data.roomName + '"]');
		if ($box.length === 0) return;
		appendUserMessage($box, data);
		stopWrite($box, data.name, '');
		window.clearInterval(timer.timerID);
		timer.timerID = null;
	});
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
