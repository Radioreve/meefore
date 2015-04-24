
	var _ = require('lodash'),
		User = require('../models/UserModel'),
		pusher = require('./pusher');

	var onlineUsers = {},
		nextwatch_default = 0.1*60*1000, 
		gaptime_default = nextwatch_default * 100;

	var addUser = function( userId, data ){
		onlineUsers[ userId ] = data;
	};

	var accessUser = function( userId ){
		if( !onlineUsers[ userId ] )
			return;
		return onlineUsers[ userId ];
	};

	var removeUser = function( userId ){
		delete onlineUsers[ userId ];
	};

	(function watchThemAll( gaptime ){

		var N = _.keys( onlineUsers ).length;

		_.each( onlineUsers, function( el ){

			if( (new Date() - el.onlineAt ) > gaptime ){
				console.log('Removing one user');
				removeUser( el.userId );
			}

		});

		pusher.trigger('default','refresh-users-conn-states', { onlineUsers: onlineUsers });
		pusher.trigger('admin', 'refresh-users-conn-states', { onlineUsers: onlineUsers });

		var nextwatch = nextwatch_default,
			gaptime = gaptime_default;

		/* Adaptation de la charge */
		if( N > 100 ){
			// Envoyer un sms à la dreamteam et ralentir l'update
			var nextwatch = 10*nextwatch_default;
			var gaptime   = 10*gaptime_default;
		}

		console.log( N + ' users are currently online ');
		setTimeout( function( ){
			watchThemAll(  gaptime );
		}, nextwatch );

	})( gaptime_default );

	module.exports = {
		addUser: addUser,
		accessUser: accessUser,
		removeUser: removeUser
	};
