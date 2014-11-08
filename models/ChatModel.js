	
	var mongoose = require('mongoose');

	var ChatSchema = mongoose.Schema({

		event_id:{
			type:String
		},
		host_id:{
			type:String
		},
		asker_id:{
			type:String
		},
		chatLine:{
			type:Array,
			default:[]
		}

	});

	module.exports = mongoose.model('socketchats', ChatSchema);