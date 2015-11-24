
	var mongoose = require('mongoose');

	var PlaceSchema = new mongoose.Schema({

		name: {
			type: String
		},
		created_at: {
			type: Date
		},
		address: {
			type: Object,
			default: {
				place_id: 'not_found',
				lat     : 'not_found',
				lng     : 'not_found'
			}
		},
		link: {
			type: String
		},
		type: {
			type: String
		},
		capacity: {
			type: String
		},
		// selectivity: undefined,
		// picture: undefined,
		// contact: undefined,
		// pricing: undefined,
		access: {
			type: Array,
			default: ['standard']
		}



	});

	module.exports = mongoose.model( 'Places', PlaceSchema );