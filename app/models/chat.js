'use strict';

var HD = require(appRoot + '/libs/hd/hd.datetime.js');
var DB = require(appRoot + '/app/models/dbconnect.js');

var Model = {

	getUsers : function(callback){
		DB.query("\
			SELECT\
				*\
			FROM\
				`chat_users`\
			WHERE\
				`active` = 1\
			ORDER BY\
				`username` ASC\
		", function(error, rows, fields){
			if (error) throw error;
			rows.forEach(function(row, i){
				rows[i].created = HD.DateTime.format('Y.m.d. H:i:s', Math.floor(Date.parse(row.created) / 1000));
			});
			callback.call(this, rows);
		});
	},

	getMessages : function(callback){
		DB.query("\
			SELECT\
				`cm`.*,\
				`cu`.`username`\
			FROM\
				`chat_messages` `cm`\
				LEFT JOIN `chat_users` `cu` ON `cm`.`user_id` = `cu`.`id`\
			ORDER BY\
				`cm`.`created` ASC\
		", function(error, rows, fields){
			if (error) throw error;
			rows.forEach(function(row, i){
				rows[i].created = HD.DateTime.format('Y.m.d. H:i:s', Math.floor(Date.parse(row.created) / 1000));
			});
			callback.call(this, rows);
		});
	},

	log : function(data, callback){
		var messageId;
		DB.insert('chat_messages', {
			'user_id' : data.userId,
			'message' : data.message,
			'created' : HD.DateTime.format('Y-m-d H:i:s', data.time)
		}, function(error, result){
			if (error) throw error;
			messageId = result.insertId;
			callback.call(this, messageId);
		});
	}

};

module.exports = Model;
