
var mongoose = require("mongoose");

var messageSchema = new mongoose.Schema({

	before_id: {
		type: String
	},
	group_id: {
		type: String
	},
	sender_id: {
		type: String
	},
	chat_id: {
		type: String
	},
	sent_at: {
		type: Date
	},
	message: {
		type: String
	},
	type: {
		type: String
	}

});

module.exports = mongoose.model('Messages', messageSchema );