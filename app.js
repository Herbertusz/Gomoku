'use strict';

var http = require('http');
var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sessionModule = require('express-session');
var fileStore = require('session-file-store')(sessionModule);
var ioSession = require('socket.io-express-session');

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
		path : './tmp'
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

routes.forEach(function(route){
	app.use(route[0], route[1]);
});

app.use(function(req, res, next){
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// Websocket
var server = http.createServer(app);
var io = require('socket.io')(server);
io.use(ioSession(session));
io.on('connection', function(socket){
	socket.broadcast.emit('user connected', socket.handshake.session.login.user);
	socket.on('disconnect', function(){
		io.emit('disconnect', socket.handshake.session.login.user);
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
