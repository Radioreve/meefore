
	var _ = require('lodash'),
		User = require('../models/UserModel'),
		pusher = require('./pusher');

	var onlineUsers = {},
		nextwatch_default = 0.5*60*1000, // 15 minutes
		gaptime_default = nextwatch_default * 20;

	var addUser = function( userId, data ){
		onlineUsers[ userId ] = data;
	};

	var accessUser = function( userId ){

		if( !onlineUsers[ userId ] )
		{
			User.findById( userId, function( err, user ){
				if( err ) return console.log( err );

				var d = new Date();
				onlineUsers[ userId ] = {
					userId: userId,
					channel: user.getChannel(),
					onlineAt: d
				};
				
			});
		}
		return onlineUsers[ userId ];
	};

	var removeUser = function( userId ){
		delete onlineUsers[ userId ];
	};

	(function watchThemAll( gaptime ){

			console.log('Updating who is connected...');
			var N = _.keys( onlineUsers ).length;

			_.each( onlineUsers, function( el ){

				if( (new Date() - el.onlineAt ) > gaptime ){
					removeUser( el.userId );
				}

			});

			pusher.trigger('default','refresh-users-conn-states', { onlineUsers: onlineUsers });

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
