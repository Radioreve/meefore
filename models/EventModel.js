
	var mongoose = require('mongoose');

	var EventSchema = mongoose.Schema({

		name: {
			type: String
		},
		description: {
			type: String
		},
		location: {
			type: Number,
			default: 1
		},
		maxGuest:{
			type: Number,
			default: 10
		},
		hostId: {
			type: String
		},
		hostImgId: {
			type: String
		},
		hostImgVersion: {
			type: String
		},
		hostName: {
			type: String
		},
		beginsAt: {
			type: Date
		},
		createdAt: {
			type: Date
		},
		askersList: {
			type: Array,
			default: []
		},
		state: {
			type: String,
			default: 'open'
		},
		tags: {
			type: Array,
			default: []
		}
	});

	module.exports = mongoose.model('Events', EventSchema);