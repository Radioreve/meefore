
	var mongoose = require('mongoose');

	var PlaceSchema = new mongoose.Schema({

		name: {
			type: String
		},
		address: {
			type: Object,
			default: {
				place_id: 'not_found',
				lat     : 'not_found',
				lng     : 'not_found',
				zipcode : 'not_found'
			}
		},
		type: {
			type: String
		},
		picture: {
			img_id: "",
			img_vs: ""
		},
		capacity: {
			type: String
		},
		selectivity: {
			type: String
		},
		contact: {
			type: Object
		},
		pricing: {
			type: Object
		},
		access: {
			type: Array,
			default: ['standard']
		}



	});

	module.exports = mongoose.model( 'Places', PlaceSchema );