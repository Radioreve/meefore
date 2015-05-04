
	var User = require('../models/UserModel'),
	    Event = require('../models/EventModel'),
	    EventTemplate = require('../models/EventTemplateModel'),
	    eventUtils = require('./eventUtils'),
	    _ = require('lodash'),
	    async = require('async'),
	    bots = require('../globals/bots');

	var pusher = require('../globals/pusher');

	var fetchAppData = function( req, res ){	

		console.log('Fetching app data...');

		async.parallel([ fetchLastRegisteredUsers, fetchBots, fetchTemplates ], function( err, result ){
			eventUtils.sendSuccess( res, { lastRegisteredUsers: result[0], bots: result[1], eventTemplates: result[2] });
		});

	};

	function fetchLastRegisteredUsers(callback){
		User.find().limit(10).sort('-signupDate').exec(function(err,lastRegisteredUsers){
			 if(err)
			 	return callback(err);
			 callback(null,lastRegisteredUsers);
			
		});
	}

	function fetchBots(callback){
		User.find({access:'bot'},function(err,bots){
			if(err)
			 	return callback(err);
			 callback(null,bots);
		});
	}

	function fetchTemplates(callback){
		EventTemplate.find({},function(err,templates){
			if(err)
				return callback(err);
			callback(null,templates);
		});
	}

	var createBotEvent = function( req, res ){

		console.log('Creating bot event');
		var eventData = bots.generateEvent( req.body, function( err, eventData ){

			if( err )
				return eventUtils.raiseError({
					res:res,
					toClient:err,
					err:err
				});

			if( !eventData )
				return eventUtils.raiseError({
					res:res,
					toClient:"Aucune donnée n'a été populated",
					err:err
				});			

			var myEvent = new Event( eventData );
			
				myEvent.save( function(err, newEvent){                
		            User.findById( req.body.userId, function( err, user ){

		            	if( err ) 
	                	return eventUtils.raiseError({
	                		res:res,
	                		toClient:"Une erreur s'est produite"
	                	});

		                user.status = 'hosting';
		                user.hostedEventId = newEvent._id;

		                var expose = { myEvent: newEvent };
		                
		                user.save( function(err, user) {
		                    if( !err ){
		                        console.log(user.email + ' is hosting [ as bot ] the event with id : ' + user.hostedEventId);

		                        eventUtils.sendSuccess( res, expose );
		                        pusher.trigger('default', 'create-event-success', expose );
		                    }
		                });
		            });
	            });

		});

		};

	

	var requestParticipationInBot = function( req, res ){

		console.log('Requesting participation [bot]..')
		var eventId = req.body.eventId,
			hostId = req.body.hostId,
			gender  = req.body.gender;

		Event.findById( eventId, function( err1, myEvent ){

			/* Trouve tous les bots du bon sexe qui ne sont pas dans plus de 3 events */
			User.find( {
				'status': 'idle',
				'gender': gender,
				'access': 'bot',
				'eventsAskedList.3': { $exists: false },
				'eventsAskedList': { $ne: eventId } 
			}, function( err2, myBots ){

				if( err1 || err2 || myBots.length == 0 || !myEvent )
					return eventUtils.raiseError({
						err: err1 || err2,
						res:res,
						toClient:"Aucun bot n'est disponible" 
					});

				var myUser = myBots[ eventUtils.randomInt( 0, myBots.length - 1 ) ];
				
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

				myUser.eventsAskedList.push( eventId );
				myEvent.askersList.push( asker );

				myUser.save();
				myEvent.save();

				eventUtils.sendSuccess( res, { hostId: hostId } );

			});

		});

	}

	var addEventTemplate = function( req, res ){

		console.log('Adding event template');
		var name = req.body.name,
			desc = req.body.desc;

		var myTemplate = new EventTemplate({ name:name, desc: desc });
			myTemplate.save( function( err, newTemplate ){
				if( err ){
					return eventUtils.raiseError({
						err:err,
						toClient:"Fail to create placeholder",
						res:res
					});
				}
				console.log('success!');
				eventUtils.sendSuccess( res, newTemplate );
			});

	}

	var deleteEventTemplate = function( req, res ){

		console.log('Deleting event template');
		var tplId = req.body.tplId;

		EventTemplate.remove({ _id: tplId }, function( err ){
			if( err ) 
				return eventUtils.raiseError({
					err:err,
					res:res,
					toClient:"Une erreur s'est produite!"
				});
			return eventUtils.sendSuccess( res, { msg: "L'évent a été supprimé" } );
		});
	}

	 module.exports = {
	 	fetchAppData: fetchAppData,
	 	createBotEvent: createBotEvent,
	 	requestParticipationInBot: requestParticipationInBot,
	 	addEventTemplate: addEventTemplate,
	 	deleteEventTemplate: deleteEventTemplate
	 }