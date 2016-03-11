/*!
 * Gomoku v1.0.0 alpha
 * Copyright (c) 2016.03.11.
 */

'use strict';

var app = require('../app');
//var debug = require('debug')('nodeapp:server');
var http = require('http');

// Port lekérdezése és tárolása az Express-ben
var PORT = normalizePort(process.env.OPENSHIFT_NODEJS_PORT || '3000');
var IPADDRESS = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
app.set('port', PORT);

// Port figyelése
app.httpServer.listen(PORT, IPADDRESS, function(){
	console.log('Listening on ' + PORT);
});

/**
 * Normalize a port into a number, string, or false
 * @param {Number} val port
 * @returns {Boolean|Number}
 */
function normalizePort(val){
	var port = parseInt(val, 10);

	if (isNaN(port)){
		// named pipe
		return val;
	}

	if (port >= 0){
		// port number
		return port;
	}

	return false;
}
