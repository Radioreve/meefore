
var mongoose = require("mongoose");
var md5 	 = require("blueimp-md5");

var messageSchema = new mongoose.Schema({

	before_id: {
		type: String
	},
	group_id: {
		type: String
	},
	sender_id: {
		type: String
	},
	chat_id: {
		type: String
	},
	sent_at: {
		type: Date
	},
	message: {
		type: String
	},
	type: {
		type: String
	},
	seen_by: {
		type: Array
	}

});

messageSchema.statics.sortIds = function( ids ){

	if( !Array.isArray( ids ) ){
		throw "Message model cant sort ids, not array passed in";
	}
	
	return ids.sort(function( i1, i2 ){
		return parseInt( i1 ) - parseInt( i2 );
	});

}

messageSchema.statics.makeChatId = function( before_id, hosts, members ){
		
	var sorted_hosts   = this.sortIds( hosts ).join('-');
	var sorted_members = this.sortIds( members ).join('-');

	var payload 	   = [ before_id, sorted_hosts, sorted_members ].join('__');

	return md5( payload );

}

messageSchema.statics.makeTeamId = function( members ){

	var sorted_members = this.sortIds( members ).join('-');
	var payload 	   = sorted_members;

	return md5( payload );

}

module.exports = mongoose.model( 'Messages', messageSchema );