'use strict';

var HD = require(appRoot + '/libs/hd/hd.datetime.js');
var DB = require(appRoot + '/app/models/dbconnect.js');

var Model = {

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
