
	var mongoose = require('mongoose');
		require('mongoose-moment')( mongoose );

	var EventSchema = mongoose.Schema({

		hosts: {
			type: Array,
			default: []
		},
		status: {
			type: String,
			default: 'open'
		},
		begins_at: {
			type: Date
		},
		created_at: {
			type: Date
		},
		type: {
			type: String,
			default: 'before'
		},
		address: {
			type: Object,
			default: {}
		},
		ambiance: {
			type: Array,
			default: ['classique']
		},
		agerange: {
			type: String,
			default:''
		},
		mixity: {
			type: String
		},
		groups: {
			type: Array,
			default: []
		},
		scheduled_party: {
			type: Object,
			default: {}
		},
		meta: {
			type: Array,
			default: []
		}




	});

	module.exports = mongoose.model('Events', EventSchema);