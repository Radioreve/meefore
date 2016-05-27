
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
	},
	seen_by: {
		type: Array
	}

});

module.exports = mongoose.model( 'Messages', messageSchema );