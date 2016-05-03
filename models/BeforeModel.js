
	var mongoose = require('mongoose');

	var BeforeSchema = mongoose.Schema({

		hosts: {
			type: Array
		},
		main_host: {
			type: String
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


	BeforeSchema.methods.getHostsChannel = function(){

		return this._id + '-hosts';
	};

	BeforeSchema.methods.getGroupById = function( group_id ){

		return  _.find( this.groups, function(group){ return group.group_id == group_id; });

	};

	BeforeSchema.methods.makeGroupId = function( members_ids ){

		return ( members_ids.sort(function( e1, e2 ){ return parseInt(e1) - parseInt(e2) })).join('.')

	};

	BeforeSchema.methods.makeChatId = function( members ){

		var arr = this.hosts.concat( members ).sort(function( s1, s2 ){
			return parseInt(s1) = parseInt(s2);
		});

		return this._id + '-' + arr.join('-');


	};

	BeforeSchema.methods.getGroupIds = function(){

		var group_ids = [];

		this.groups.forEach(function(group){

			var group_id_prefix = "GR_";
			var group_id = (group.members_facebook_id.sort(function( e1, e2 ){ return parseInt(e1) - parseInt(e2) })).join('.');
			group_ids.push( group_id );
		});

		return group_ids;
	};

	module.exports = mongoose.model('Befores', BeforeSchema);