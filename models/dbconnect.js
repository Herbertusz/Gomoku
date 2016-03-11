'use strict';

var DB = require('../libs/db');

DB.connect({
	host     : process.env.OPENSHIFT_MYSQL_DB_HOST || 'localhost',
	user     : process.env.OPENSHIFT_MYSQL_DB_USERNAME || 'root',
	password : process.env.OPENSHIFT_MYSQL_DB_PASSWORD || '',
	database : process.env.OPENSHIFT_GEAR_NAME || 'gomoku',
	charset  : 'utf8_hungarian_ci'
});

module.exports = DB;
