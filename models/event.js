
	var mongoose = require('mongoose');

	var EventSchema = mongoose.Schema({

		name:{
			type:String
		},
		location:{
			type:String
		},
		host_id:{
			type:String
		},
		maxGuests:{
			type:Number
		},
		hour:{
			type:Date
		},
		status:{
			type:String
		},
		created_at:{
			type:Date
		}
	});

	module.exports = mongoose.user('SocketEvents', EventSchema);