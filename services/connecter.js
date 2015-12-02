
	var _      = require('lodash');
	var rd     = require('./rd');
	var User   = require('../models/UserModel');
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
		var facebook_id = evt.channel.split('private-')[1];
		if( !facebook_id ){
			res.status(400).end();
			return;
		}

		// Add into redis
		if( evt.name == 'channel_occupied' ){
			rd.sadd('online_users', facebook_id );
		} else { // "channel_vacated"
			rd.srem('online_users', facebook_id );
			User.findOneAndUpdate({
				'facebook_id': facebook_id
			}, {
				'disconnected_at': new Date()
			}, { new: true }, function( err ){
				if( err ) console.log('Error saving disconnected_at property : ' + err );
			});
		}

		res.status(200).end();

	};

	var isUserOnline = function( facebook_id, callback ){

		rd.smembers('online_users', function( err, response ){

			if( err )
				return callback( err, null );

			if( response.indexOf( facebook_id ) == -1 )
				return callback( null, false )

			return callback( null, true );

		});

	};

	module.exports = {
		updateConnectedUsers : updateConnectedUsers,
		isUserOnline         : isUserOnline
	};

