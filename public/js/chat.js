$(document).ready(function(){

	var socket = io.connect('/chat');
	var DOM = {
		$online : $('#online .list'),
		$list : $('#list'),
		$message : $('#message'),
		$indicator : $('#indicator')
	};
	var timer = {
		timerID : null,
		interval : 1000,
		event : false,
		message : ''
	};
	var onlineUserNames = [];
	var appendMessage = function(data){
		DOM.$list.append('<li><strong>' + data.name + '</strong>: ' + data.message + '</li>');
		DOM.$list.scrollTop(DOM.$list.height());
	};
	var stopWrite = function(name, message){
		if (message.length > 0){
			DOM.$indicator.html(name + ' szöveget írt be');
		}
		else{
			DOM.$indicator.html('');
		}
	};
	var onlineChange = function(operation, name){
		var i;
		var online = DOM.$online.html().split(', ');
		if (operation === 'add'){
			online.push(name);
		}
		if (operation === 'remove'){
			i = online.indexOf(name);
			if (i > -1){
				online.splice(i, 1);
			}
		}
		DOM.$online.html(online.join(', '));
	};

	DOM.$message.keyup(function(event){
		var data = {
			name : userName,
			message : DOM.$message.val()
		};
		if (event.which !== 13){
			socket.emit('chat writing', data);
		}
		else{
			if (DOM.$message.val().length > 0){
				socket.emit('chat message', data);
				appendMessage(data);
				DOM.$message.val('');
				event.preventDefault();
			}
		}
	});

	socket.on('user connected', function(name){
		DOM.$list.append('<li class="highlighted">' + name + ' csatlakozott!</li>');
	});
	socket.on('disconnect', function(name){
		if (onlineUserNames.indexOf(name) > -1){
			DOM.$list.append('<li class="highlighted">' + name + ' kilépett!</li>');
		}
		else {
			DOM.$list.append('<li class="highlighted">Kapcsolat lezárult!</li>');
		}
	});
	socket.on('online change', function(online){
		onlineUserNames = Object.keys(online).map(function(id){
			return online[id];
		});
		DOM.$online.html(onlineUserNames.join(', '));
	});
	socket.on('chat message', function(data){
		appendMessage(data);
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
