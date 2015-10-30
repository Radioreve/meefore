
	var _      = require('lodash');
	var rd     = require('./rd');
	var Users  = require('../models/UserModel');
	var config = require('../config/config');

	var updateConnectedUsers = function( req, res ){

		//expected key : f9e4bf4e8f1e0342ca27

		var evt = req.sent.events[0];

		if( !evt ){
			res.status(400).end();
			return console.error('Cannot read event (empty) ');
		}

		// Check if proper call from pusher
		if( req.headers['x-pusher-key'] != config.pusher[ process.env.node_env ].key ){
			res.status(400).end();
			return console.log('Error, cant access with that api_key');
		}

		// Check if is an event concerning connection/deconnecton by the presence of
		// private-+facebookid field a
		var user_id = evt.channel.split('private-')[1];
		if( !user_id ){
			res.status(400).end();
			return;
		}

		// Add into redis
		if( evt.name == 'channel_occupied' ){
			rd.sadd('connected_users', user_id );
		} else { // "channel_vacated"
			rd.srem('connected_users', user_id );
		}

		res.status(200).end();

	};

	module.exports = {
		updateConnectedUsers: updateConnectedUsers
	};

