'use strict';

var HD = require(appRoot + '/libs/hd/hd.datetime.js');
var DB = require(appRoot + '/app/models/dbconnect.js');

var Model = {

	read : function(callback){
		DB.query("\
			SELECT\
				`chat`.*,\
				`users`.`username`\
			FROM\
				`chat`\
				LEFT JOIN `users` ON `chat`.`user_id` = `users`.`id`\
			ORDER BY\
				`chat`.`created` ASC\
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
		DB.insert('chat', {
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
