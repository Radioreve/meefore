
	var User = require('../models/UserModel'),
	    Event = require('../models/EventModel'),
	    eventUtils = require('./eventUtils'),
	    _ = require('lodash'),
	    settings = require('../config/settings');

	var pusher = require('../globals/pusher');


	    var fetchEvents = function( req, res ){

	    	var userId = req.body.userId;

			Event.find({ state: { $in: settings.activeEventStates }}, function( err, myEvents ){

				if( err )
					return eventUtils.raiseError({
						res: res,
						err: err,
						toServer: "Error fetching event",
						toClient: "Error loading recent events..."
					});

				console.log('%d event(s) have been fetched!', myEvents.length );

				var expose = { myEvents: myEvents };

				eventUtils.sendSuccess( res, expose );

			});
	    }; 

	   var fetchUsers = function( req, res ){

	   		User.find({}, function( err, users ){

	   			if( err )
	   				return eventUtils.raiseError({
	   					res: res,
	   					err: err,
	   					toServer: "Error fetching all users",
	   					toClient: "Error loading users..."
	   				});

	   			console.log('%d user(s) have been fetched!', users.length );

	   			var expose = { users: users };

	   			eventUtils.sendSuccess( res, expose );

	   		});
	   }
	  
	    var requestIn = function( req, res ){

	    	var data = req.body;

			var eventId     = data.eventId,
			 	hostId      = data.hostId ,
			 	userId 		= data.userId,
			 	requesterId = data.requesterId;

			if( hostId == userId ) return; /* Test for fun */

		var expose = {};
		var query = { '_id': { $in: [ hostId, userId, requesterId ]}};

		Event.findById( eventId, {}, function( err, myEvent ){

			if( err )
			{
				return console.log('Error finding event...');
			}

			User.find( query, function( err, users ){

				if(err) return console.error('error');

				/* On populate les users en les associant à leurs id respectives */
				for( var i = 0; i< users.length; i++)
				{
					if( users[i]._id == hostId )
						var myHost = users[i];

					if( users[i]._id == requesterId )
						var myRequester = users[i];

					if( users[i]._id == userId )
						var myUser = users[i];

				}

				// Validation des erreurs et conflits potentiels

				// Check si la personne n'est pas déjà dans la liste pour éviter toute incohérence data 
				if(  _.pluck( myEvent.askersList, '_id' ).indexOf( userId ) != -1 )
				{
					expose.alreadyIn = true;
					return eventUtils.sendSuccess( expose, res )
				}

				// Check si l'ami est bien un ami mutuel en cas de masquerade
				if( !_.some( myUser.friendList, { friendId: requesterId, status:'mutual' }) && userId != requesterId )
				{
					return eventUtils.raiseError({
						err: err,
						res: res,
						toServer: "Request failed [3]",
						toClient: "Cette personne n'est pas un ami mutuel!"
					});
				}

				// Check si on est soit même en train d'HOST, ou si notre ami a HOST entre temps (non MAJ de l'UI)
				if( myUser.status === 'hosting' ){
					if( requesterId == userId )
					{
						return eventUtils.raiseError({
							err: err,
							res: res,
							toServer: "Request failed [2a]",
							toClient: "Vous êtes déjà en train d'organiser une soirée!"
						});
					}
					if( requesterId != userId )
					{
						return eventUtils.raiseError({
							err: err,
							res: res,
							toServer: "Request failed [2b]",
							toClient: "Cet ami est en train d'organiser une soirée"
						});
					}

				}

				// Requester response
				expose = {
					eventId: eventId,
					hostId: hostId,
					requesterId: requesterId,
					userId: userId,
					alreadyIn: false,
					asker: myUser
				}

				eventUtils.sendSuccess( res, expose );


				/* Host update */
				myHost.save();

				/* User update : either it's requester or an other */
				myUser.eventsAskedList.push( eventId );
				myUser.save();

				/* Event update */
				var asker = {   _id           : myUser._id.toString(),
								name          : myUser.name,
								description   : myUser.description,
								age           : myUser.age,
								favoriteDrink : myUser.favoriteDrink,
								mood          : myUser.mood,
								signupDate    : myUser.signupDate,
								imgId         : myUser.imgId,
								imgVersion    : myUser.imgVersion,
								friendList    : myUser.friendList 
							};

				myEvent.askersList.push( asker );
				myEvent.save( function( err, myEvent ){
					if( err ) return console.log('ERR-92');

					/* On envoit la notification de succès sur user que si user != requester */
					pusher.trigger( myHost.getChannel(), 'request-participation-in-success', expose );
					if( requesterId != userId )
						pusher.trigger( myUser.getChannel(), 'request-participation-in-success', expose );
				});


			});

		});

	    };

	    var requestOut = function( req, res ){

	    		var data = req.body;

				var eventId 	= data.eventId,
					hostId  	= data.hostId,
					userId  	= data.userId,
					requesterId = data.requesterId,
					asker   	= {};

			    var eventCondition = { _id: eventId },
					eventUpdate    = { $pull: {'askersList': { '_id': userId }}},
					callback = function( err, result ){
						if( err ){
							return eventUtils.raiseError({
								toClient: "Something happened! :o",
								res: res,
								err: err
							});
						 }
				};

				Event.findOneAndUpdate( eventCondition, eventUpdate, {}, callback );

				User.find({ '_id': { $in: [ userId, hostId ]}}, function( err, users ){

					if( err || users.length!=2 )
					{
						return eventUtils.raiseError({
							toClient:"Oups, une erreur s'est produite",
							err:err,
							res:res
						});
					}

					for( var i = 0; i < 2; i++ )
					{
						if( users[i]._id == userId )
							var myUser = users[i];
						if( users[i]._id == hostId )
							var myHost = users[i];
					}

					var expose = {
							userId: userId,
							eventId: eventId,
							hostId: hostId,
							requesterId: requesterId,
							asker: {
								_id           : myUser._id.toString(),
								name          : myUser.name,
								description   : myUser.description,
								age           : myUser.age,
								imgId         : myUser.imgId,
								imgVersion    : myUser.imgVersion
						    }
					};

					myUser.unaskForEvent( eventId )
						  .save( function( err ){

						  	if( err )
						  	{
						  		return eventUtils.raiseError({
						  			toClient:'Error requesting out',
						  			res:res,
						  			err:err
						  		});
						  	}

						eventUtils.sendSuccess( res, expose );
						pusher.trigger( myHost.getChannel(), 'request-participation-out-success', expose );

					  });
				});
		};

	    module.exports = {
	    	fetchEvents: fetchEvents,
	    	fetchUsers: fetchUsers,
	    	requestIn: requestIn,
	    	requestOut: requestOut
	    };