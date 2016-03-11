var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname));
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	socket.broadcast.emit('user connected');
	socket.on('disconnect', function(){
		io.emit('disconnect');
	});
	socket.on('chat message', function(data){
		socket.broadcast.emit('chat message', data);
	});
	socket.on('chat writing', function(data){
		socket.broadcast.emit('chat writing', data);
	});
});

var PORT = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var IPADDRESS = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

http.listen(PORT, IPADDRESS, function(){
	console.log('listening on 8080');
});
