
		var mongoose = require("mongoose"),
        _ = require('lodash');

var eventTemplateSchema = new mongoose.Schema({

	name:{
		type:String
	},
	desc:{
		type:String
	},
	active:{
		type:Boolean,
		default:false
	}

});

module.exports = mongoose.model('eventTemplates', eventTemplateSchema )