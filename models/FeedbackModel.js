
	var mongoose = require('mongoose');

	var FeedbackSchema = mongoose.Schema({

		"received_at": {
			type: Date
		},
		"sent_by": {
			type: String
		},
		"subject_id": {
			type: String
		},
		"content": {
			type: String
		}

	});


	module.exports = mongoose.model( 'Feedbacks', FeedbackSchema );