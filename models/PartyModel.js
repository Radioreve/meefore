
	var mongoose = require('mongoose');

	var PartySchema = mongoose.Schema({

		'party_name': {
			type: String
		},
		'posted_by': {
			type: String
		},
		'picture': {
			type: Object
		},
		'posted_at': {
			type: Date
		},
		'place': {
			type: Object
		},
		'description': {
			type: String
		},
		'begins_at': {
			type: Date
		},
		'ends_at': {
			type: Date
		},
		'timezone': {
			type: Number
		},
		'link': {
			type: String
		},
		'price': {
			type: String
		},
		'status': {
			type: String
		}

	});

	module.exports = mongoose.model( 'Party', PartySchema );