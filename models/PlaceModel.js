
	var mongoose = require('mongoose');

	var PlaceSchema = new mongoose.Schema({

		place_name: {
			type: String
		},

		address: {
			type: Object
		}


	});

	module.exports = mongoose.model( 'Places', PlaceSchema );