
	var _     	   = require('lodash');
	var rd     	   = require('../services//rd');
	var print      = require('../services/print')( __dirname.replace( process.cwd()+'/', '' ) + '/connecter.js' );
	var erh 	   = require('../services/err');
	var User   	   = require('../models/UserModel');
	var config 	   = require('../config/config');
	var Promise    = require('bluebird');
	var eventUtils = require('../pushevents/eventUtils');


	var updateConnectedUsers = function( req, res, next ){

		//expected key : e0e801db688ab26d8581

		var err_ns = "updating_connected_users";

		var evts = req.sent.events;

		if( !evts ){
			return erh.handleBackErr( req, res, {
				source: "pusher",
				err_ns: err_ns,
				msg: "Request malformed, need to have an 'events' object of type collection"
			});
		}

		// Check if proper call from pusher
		if( req.headers['x-pusher-key'] != config.pusher[ process.env.APP_ENV ].key ){
			return erh.handleBackErr( req, res, {
				source: "pusher",
				err_ns: err_ns,
				err_id: "wrong_api_key",
				msg: "The api key contained in the header x-pusher-key did not match the expected app key"
			});
		}

		// Check if is an event concerning connection/deconnecton by the presence of
		// "private-facebook-id=10204294092049" 
		var name          = null;
		var facebook_id   = null;
		var webhook_event = null;

		evts.forEach(function( evt ){

			var splitted = evt.channel.split('private-facebook-id=');
			if( splitted.length && splitted.length == 2  ){

				facebook_id   = splitted[ 1 ];
				webhook_event = evt.name;
			}

		});

		if( !webhook_event ){
			return erh.handleBackErr( req, res, {
				source: "pusher",
				err_ns: err_ns,
				msg: "Request failed, couldn't find webhook_event"
			});

		}

		if( !facebook_id ){
			print.warn("The facebook_id wasnt find, unable to add to connected users list");
			return res.status( 200 ).end();
		}

		// Add into redis
		if( webhook_event == 'channel_occupied' ){

			rd.sadd('online_users', facebook_id, function( err ){

				if( err ) return erh.handleDbErr( res, res, err_ns, err, "redis" );

				res.status( 200 ).json({
					msg: "Update success"
				});

			});

		} else { // "channel_vacated"

			rd.srem('online_users', facebook_id );

			User.findOneAndUpdate({
				'facebook_id': facebook_id
			}, {
				'disconnected_at': new Date()
			}, { new: true }, function( err ){

				if( err ) return erh.handleDbErr( req, res, err_ns, err, "mongo" );

				print.info( req, "Update success, user 'disconnected_at' property updated.");
				res.status( 200 ).json({
					msg: "Request has completes successfully"
				});

				
			});
		}


	};

	var getUserStatus = function( facebook_id, callback ){

		rd.smembers('online_users', function( err, response ){

			if( err ) return callback( err, null );

			if( response.indexOf( facebook_id ) != -1 ){
				callback( null, "online" );

			} else {
				callback( null, "offline" );
			}

		});

	};

	var getOnlineUsers = function( req, res, next ){

		var err_ns = "getting_online_users";

		rd.smembers('online_users', function( err, response ){

			if( err ) return erh.handleDbErr( req, res, err_ns, err, "redis" );

			req.sent.online_users = response;
			next();

		});
	};

	var filterOnlineUsers = function( user_ids ){
		return new Promise(function( resolve, reject ){

			rd.smembers('online_users', function( err, online_users ){

				if( err ) return reject( err );

				var filtered_ids = _.filter( user_ids, function( user_id ){
					return online_users.indexOf( user_id ) !== -1;
				});

				return resolve( filtered_ids );

			});

		});
	};



	module.exports = {
		updateConnectedUsers : updateConnectedUsers,
		getUserStatus        : getUserStatus,
		getOnlineUsers 		 : getOnlineUsers,
		filterOnlineUsers    : filterOnlineUsers
	};

