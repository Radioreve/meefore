
	var mongoose = require("mongoose"),
	settings     = require('../config/settings'),
	bcrypt       = require("bcrypt-nodejs"),
	_            = require('lodash');

var messageSchema = new mongoose.Schema({

	chat_id: {
		type: String
	},
	sent_at: {
		type: Date
	},
	author: {
		type: Object
	},
	message: {
		type: String
	}


});

module.exports = mongoose.model('Messages', messageSchema );