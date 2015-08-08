
	var mongoose = require('mongoose');

	var PlaceSchema = new mongoose.Schema({

		name: {
			type: String,
			default: null
		},
		address: {
			type: String,
			default: null
		},
		type: {
			type: String,
			default: null
		}

	});

	module.exports = mongoose.model( 'Places', PlaceSchema );