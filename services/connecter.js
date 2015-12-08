
	var _      = require('lodash');
	var rd     = require('./rd');
	var User   = require('../models/UserModel');
	var config = require('../config/config');

	var updateConnectedUsers = function( req, res ){

		//expected key : e0e801db688ab26d8581
		console.log('Updating connected users...');
		console.log( JSON.stringify( req.sent, null, 4 ) );

		var evts = req.sent.events;

		if( !evts ){
			res.status(200).json({ err: "Request malformed, need to have an 'events' object of type collection"});
			return
		}

		// Check if proper call from pusher
		if( req.headers['x-pusher-key'] != config.pusher[ process.env.NODE_ENV ].key ){
			console.log('Wrong Pusher Key');
			res.status(400).json({ err: "Request failed, wrong api key"});
			return 
		}

		// Check if is an event concerning connection/deconnecton by the presence of
		// private-+facebook_id field a
		var facebook_id = null;
		var name        = null;

		evts.forEach(function( evt ){

			var splitted = evt.channel.split('private-');
			if( splitted.length && splitted.length == 2  ){

				console.log('Private channel found, updating connexion status...');

				facebook_id = evt.channel.split('private-')[1];
				name        = evt.name;
			}

		});

		if( !facebook_id || !name ){
			res.status(400).json({ err: "Request failed, couldn't find facebook_id || name"});
			return 
		}

		// Add into redis
		if( name == 'channel_occupied' ){

			rd.sadd('online_users', facebook_id, function( err ){

			console.log('Update success');
			res.status(200).json({ msg: "Update success" });

			});

		} else { // "channel_vacated"

			rd.srem('online_users', facebook_id );

			User.findOneAndUpdate({
				'facebook_id': facebook_id
			}, {
				'disconnected_at': new Date()
			}, { new: true }, function( err ){
				if( err ){

					res.status(400).json({ msg: "Update failed", err: err });
					console.log('Error saving disconnected_at property : ' + err );

				} else {

					console.log("Update success, user 'disconnected_at' property updated.");
					res.status(200).json({ msg: "Update success, user 'disconnected_at' property updated." });

				}
			});
		}


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

