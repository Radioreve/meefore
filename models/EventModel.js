
	var mongoose = require('mongoose');

	var EventSchema = mongoose.Schema({

		hosts: {
			type: Array
		},
		status: {
			type: String
		},
		begins_at: {
			type: Date
		},
		timezone: {
			type: Number
		},
		created_at: {
			type: Date
		},
		address: {
			type: Object
		},
		groups: {
			type: Array
		},
		geojson: {
			type: Object
		}


	});

	EventSchema.statics.getGroupByMemberId = function( member_id ){

		console.log('Calling static...');
		console.log( this.groups );

		return _.find( this.groups, function(group){
			console.log(group);
			return group.members_facebook_id.indexOf( member_id ) != -1;
		});

	};

	EventSchema.methods.getHostsChannel = function(){

		return this._id + '-hosts';
	};

	EventSchema.methods.getGroupById = function( group_id ){

		return  _.find( this.groups, function(group){ return group.group_id == group_id; });

	},
	EventSchema.methods.makeGroupId = function( members_ids ){

		return ( members_ids.sort(function( e1, e2 ){ return parseInt(e1) - parseInt(e2) })).join('.')

	},
	EventSchema.methods.getGroupIds = function(){

		var group_ids = [];

		this.groups.forEach(function(group){
			var group_id = (group.members_facebook_id.sort(function( e1, e2 ){ return parseInt(e1) - parseInt(e2) })).join('.');
			group_ids.push( group_id );
		});

		return group_ids;
	};

	module.exports = mongoose.model('Events', EventSchema);