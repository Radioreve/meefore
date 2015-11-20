
	var mongoose = require('mongoose');

	var PartySchema = mongoose.Schema({

		name: {
			type: String
		},
		hosted_by: {
			type: String
		},
		begins_at: {
			type: Date
		},
		ends_at: {
			type: Date
		},
		created_at: {
			type: Date
		},
		attendees: {
			type: String
		},
		address: {
			type: Object
		},
		timezone: {
			type: Number
		},
		picture_url: {
			type: String
		},
		link: {
			type: String
		},
		type: {
			type: String
		},
		status: {
			type: String
		},
		labels: {
			type: Array
		}

	});

	module.exports = mongoose.model('Party', PartySchema);