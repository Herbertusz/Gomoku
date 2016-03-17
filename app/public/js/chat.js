'use strict';

$(document).ready(function(){

	var socket = io.connect('http://' + DOMAIN + ':' + WSPORT + '/chat');
	var DOM = {
		$start : $('.online .start'),
		$onlines : $('.online li'),
		$users : $('.chat .users'),
		$close : $('.chat .close'),
		$list : $('.chat .list'),
		$message : $('.chat .message'),
		$indicator : $('.chat .indicator'),
		$sendbutton : $('.chat .send'),
		$sendswitch : $('.chat .send-switch')
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
		str = str.replace("\n", '<br />');
		return str;
	};
	var scrollToBottom = function(){
		var height = 0;
		DOM.$list.find('li').each(function(){
			height += $(this).outerHeight();
		});
		DOM.$list.scrollTop(height);
	};
	var appendUserMessage = function(data, highlighted){
		highlighted = HD.Misc.funcParam(highlighted, false);
		var time = HD.DateTime.format('Y.m.d. H:i:s', data.time);
		DOM.$list.append('\
			<li>\
				<span>' + time + '</span>\
				<strong class="' + (highlighted ? "self" : "") + '">' + escapeHtml(data.name) + '</strong>:<br />\
				' + escapeHtml(data.message) + '\
			</li>\
		');
		scrollToBottom();
	};
	var appendSystemMessage = function(type, name){
		if (type === 'connect'){
			DOM.$list.append('<li class="highlighted">' + name + ' csatlakozott!</li>');
		}
		else if (type === 'disconnect'){
			if (typeof name === "undefined"){
				DOM.$list.append('<li class="highlighted">Kapcsolat lezárult!</li>');
			}
			else {
				DOM.$list.append('<li class="highlighted">' + name + ' kilépett!</li>');
			}
		}
		scrollToBottom();
	};
	var stopWrite = function(name, message){
		if (message.length > 0){
			DOM.$indicator.html(name + ' szöveget írt be');
		}
		else{
			DOM.$indicator.html('');
		}
	};
	var sendMessage = function(data, event){
		if (data.message.trim().length > 0){
			socket.emit('chat message', data);
			appendUserMessage(data, true);
			DOM.$message.val('');
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

	scrollToBottom();

	DOM.$message.keyup(function(event){
		var data = {
			id : userData.id,
			name : userData.name,
			message : DOM.$message.val(),
			time : Math.round(Date.now() / 1000)
		};
		if (event.which === HD.Misc.keys.ENTER){
			if (!event.shiftKey && DOM.$sendswitch.prop("checked")){
				sendMessage(data, event);
			}
		}
		else{
			socket.emit('chat writing', data);
		}
	});
	DOM.$sendbutton.click(function(event){
		var data = {
			id : userData.id,
			name : userData.name,
			message : DOM.$message.val(),
			time : Math.round(Date.now() / 1000)
		};
		sendMessage(data, event);
	});
	DOM.$sendswitch.change(function(){
		if ($(this).prop("checked")){
			DOM.$sendbutton.hide();
		}
		else {
			DOM.$sendbutton.show();
		}
	});

	socket.on('user connected', function(data){
		appendSystemMessage('connect', data.name);
	});
	socket.on('disconnect', function(data){
		appendSystemMessage('disconnect', data.name);
	});
	socket.on('online change', function(online){
		onlineUserIds = Object.keys(online).map(function(socketId){
			return online[socketId].id;
		});
		DOM.$onlines.each(function(){
			var $this = $(this);
			if (onlineUserIds.indexOf($this.data("id")) > -1){
				setStatus($this, "on");
			}
			else{
				setStatus($this, "off");
			}
		});
	});
	socket.on('chat message', function(data){
		appendUserMessage(data);
		stopWrite(data.name, '');
		window.clearInterval(timer.timerID);
		timer.timerID = null;
	});
	socket.on('chat writing', function(data){
		timer.event = true;
		timer.message = data.message;
		if (!timer.timerID){
			DOM.$indicator.html(data.name + ' éppen ír...');
			timer.timerID = window.setInterval(function(){
				if (!timer.event){
					stopWrite(data.name, timer.message);
					window.clearInterval(timer.timerID);
					timer.timerID = null;
				}
				timer.event = false;
			}, timer.interval);
		}
	});

});
