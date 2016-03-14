'use strict';

var path = require('path');
var http = require('http');
var express = require('express');
var favicon = require('serve-favicon');
//var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sessionModule = require('express-session');
var fileStore = require('session-file-store')(sessionModule);
var ioSession = require('socket.io-express-session');

global.appRoot = path.resolve(__dirname);

var routes = [
	['/'      , require('./routes/index') ],
	['/chat'  , require('./routes/chat')  ],
	['/game'  , require('./routes/game')  ],
	['/ajax'  , require('./routes/ajax')  ],
	['/login' , require('./routes/login') ],
	['/logout', require('./routes/logout')]
];

var app = express();

var session = sessionModule({
	secret : "Kh5Cwxpe8wCXNaWJ075g",
	resave : false,
	saveUninitialized : false,
	store : new fileStore({
		path : __dirname + '/tmp'
	})
});

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));
app.use(session);

app.locals.layout = {
	domain : global.DOMAIN,
	menu : [
		{
			text : 'Előszoba',
			url : '/'
		}, {
			text : 'Amőba',
			url : '/game'
		}, {
			text : 'Chat',
			url : '/chat'
		}
	]
};

routes.forEach(function(route){
	app.use(route[0], route[1]);
});

app.use(function(req, res, next){
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// Websocket
var connectedUsers = {};
var server = http.createServer(app);
var io = require('socket.io')(server);
io.of('/chat').use(ioSession(session));
io.of('/chat').on('connection', function(socket){
	var session = socket.handshake.session;
	var userName = (session.login && session.login.loginned) ? session.login.user : null;
	if (userName){
		connectedUsers[socket.id] = userName;
		socket.broadcast.emit('user connected', userName);
		io.of('/chat').emit('online change', connectedUsers);
	}

	socket.on('disconnect', function(){
		var userName = connectedUsers[socket.id];
		delete connectedUsers[socket.id];
		io.of('/chat').emit('online change', connectedUsers);
		io.of('/chat').emit('disconnect', userName);
	});

	socket.on('chat message', function(data){
		socket.broadcast.emit('chat message', data);
	});

	socket.on('chat writing', function(data){
		socket.broadcast.emit('chat writing', data);
	});
});

// Hibakezelők

// development
if (app.get('env') === 'development'){
	app.use(function(err, req, res, next){
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production
app.use(function(err, req, res, next){
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

module.exports = app;
module.exports.httpServer = server;
