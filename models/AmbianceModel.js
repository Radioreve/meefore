
	var mongoose = require('mongoose');

	var AmbianceSchema = new mongoose.Schema({

		name: {
			type: String,
			default: null
		},
		type: {
			type: String,
			default: null
		},
		description: {
			type: String,
			default: null
		}

	});

	module.exports = mongoose.model( 'Ambiances', AmbianceSchema );