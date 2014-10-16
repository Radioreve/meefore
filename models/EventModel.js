
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
		maxGuest:{
			type:Number,
			default:10
		},
		hostId:{
			type:String
		},
		hostImgId:{
			type:String
		},
		hostImgVersion:{
			type:String
		},
		hostName:{
			type:String
		},
		beginsAt:{
			type:Date
		},
		createdAt:{
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