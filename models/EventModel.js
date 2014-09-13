
	var mongoose = require('mongoose');

	var EventSchema = mongoose.Schema({

		name:{
			type:String
		},
		description:{
			type:String
		},
		location:{
			type:String,
			default:'Paris 75001'
		},
		host_id:{
			type:String
		},
		host_img_id:{
			type:String
		},
		host_img_version:{
			type:String
		},
		host_name:{
			type:String
		},
		begins_at:{
			type:Date
		},
		created_at:{
			type:Date
		},
		askersList:{
			type:Array,
			default:[]
		},
		state:{
			type:String,
			default:'open'
		}
	});

	module.exports = mongoose.model('SocketEvents', EventSchema);