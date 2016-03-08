
	var _      = require('lodash');
	var async  = require('async');
	var get_ip = require('ipware')().get_ip;

	var rd        = require('../services/rd');
	var pusher    = require('../services/pusher');
	var connecter = require('../services/connecter');
	
	var pushEventsDir = '../pushevents';
	var apiDir        = '../api';
	var mdwDir        = '../middlewares';

	var User = require('../models/UserModel');

	var initEvents     = require( pushEventsDir + '/initEvents'),
		profileEvents  = require( pushEventsDir + '/profileEvents'),
		settingsEvents = require( pushEventsDir + '/settingsEvents'),
		adminEvents    = require( pushEventsDir + '/adminEvents'),
		signEvents     = require( pushEventsDir + '/signEvents');

	var api = {}
	//	api.tests     = require( apiDir + '/tests');
		api.users     = require( apiDir + '/users');
		api.places    = require( apiDir + '/places');
		api.ambiances = require( apiDir + '/ambiances');
		api.events    = require( apiDir + '/events');
		api.parties   = require( apiDir + '/parties');
		api.chats     = require( apiDir + '/chats');

	var mdw = {};
		mdw.auth            = require( mdwDir + '/auth');
		mdw.email           = require( mdwDir + '/email');
		mdw.pop             = require( mdwDir + '/pop');
		mdw.facebook        = require( mdwDir + '/facebook');
		mdw.validate        = require( mdwDir + '/validate');
		mdw.alerts_watcher  = require( mdwDir + '/alerts_watcher');
		mdw.chat_watcher    = require( mdwDir + '/chat_watcher');
		mdw.profile_watcher = require( mdwDir + '/profile_watcher');
		mdw.notifier        = require( mdwDir + '/notifier');
		mdw.meepass         = require( mdwDir + '/meepass');



	module.exports = function( app ) {


		//      All api calls are handled this way : 
		//		
		//	    % app.verb( url ) 
		//		% mdw.auth.authenticate 					% ---> Make sure user authenticated and populates req.facebook_id
		//		% mdw.validate( namespace, [ properties ] ) % ---> Make sure data is properly formatted and action is authorized 
		//		% controller.handler 						% ---> Make the call ( Redis & MongoDB )							
		//



		// Merge all body, query and params property 
		// Subsequent validation modules will look if each property they are looking for
		// is anywhere to be found and properly formatted, in the req.sent object
		app.all('*', function( req, res, next ){
			req.sent = _.merge( 

			    req.body   || {},  
				req.query  || {},
				req.sent   || {}

			);

			next();

		});


		// Api authentication validation
		// All api calls must provid a valid token, which is then decoded.
		// The token is given the client during the authentication process and contains client's ids
		app.all('/api/*',
			mdw.auth.authenticate(['standard']));


		// All non-rest calls to /me endpoints about user profile also need to be authenticated with token
		app.all('/me/*',
			mdw.auth.authenticate(['standard']));


	    // Main page
	    app.get('/home',
	    	function( req, res, next ){

	    		var ip_info = get_ip( req );
	    		next();
	    	},
	    	signEvents.sendHomepage );

	    // Conditions générales
	    app.get('/legals', function( req, res ){
	    	res.sendfile( process.cwd() + '/views/legals.html' );
	    });

	    // Redirection à la page d'accueil
	    app.get('/',
	    	signEvents.redirectToHome);



	    // Provide valid token based on secret key, for api calls
		app.post('/auth/token',
			mdw.auth.makeToken);


		// [@Landing Page ]
		app.post('/landing/contact',
			signEvents.sendContactEmail);

	    // Initialisation | Check if user exists / create profile if not, subscribe to mailchimp
	    app.post('/auth/facebook',
	    	mdw.pop.populateUser({ force_presence: false }),
	    	mdw.email.subscribeMailchimpUser,
	    	mdw.alerts_watcher.setCache,
	    	mdw.profile_watcher.setCache,
	    	signEvents.handleFacebookAuth);

	    // [ @chat ] Make sure a user has authorisation to join a channel
	    app.post('/auth/pusher',
	    	mdw.auth.authenticate(['standard']), // token required for magic to happen
	    	mdw.validate('pusher_auth', ['pusher_auth']),
	    	mdw.auth.authPusherChannel);


	    // Fetch app configuration and user id full profile. Token required
	    app.post('/auth/app',
	    	mdw.auth.authenticate(['standard']),
	    	mdw.facebook.fetchFacebookLongLivedToken('app_id'),
	    	initEvents.fetchUserAndConfiguration);


	    // [ @user ] Update le profile
	    app.post('/me/update-profile',
	    	profileEvents.updateProfile);

	    // [ @user ] Ajoute une photo au profile
	    app.post('/me/update-picture',
	    	profileEvents.updatePicture);

	    // [ @user ] Change les hashtag/photo de profile
	    app.post('/me/update-pictures',
	    	profileEvents.updatePictures);

	    // [ @user ] Ajoute une photo via Facebook api
	    app.post('/me/update-picture-fb',
	    	profileEvents.updatePictureWithUrl);

	    // [ @user ] Va chercher en base de données les users à partir de /me/friends de l'api Facebook
	    app.post('/me/fetch-and-sync-friends',
	    	profileEvents.fetchAndSyncFriends);

	    // [ @user ] va chercher des tags cloudinary signés par le serveur
	    app.post('/me/cloudinary-tags',
	    	profileEvents.fetchCloudinaryTags );

	    // [ @user ] Update contact settings
	    app.post('/me/update-settings-contact',
	    	mdw.pop.populateUser({ force_presence: true }),
	    	mdw.email.updateMailchimpUser,
	    	mdw.alerts_watcher.updateCache,
	    	settingsEvents.updateSettingsContact );

	    // [ @user ] Update ux settings
	    app.post('/me/update-settings-ux',
	    	settingsEvents.updateSettings);

	     // [ @user ] Update ux settings
	    app.post('/me/update-settings-alerts',
	    	mdw.alerts_watcher.updateCache,
	    	settingsEvents.updateSettings);

	    // [ @user ] Update notification settings 
	    app.post('/me/update-settings-mailinglists',
	    	mdw.pop.populateUser({ force_presence: true }),
	    	mdw.email.updateMailchimpUser,
	    	settingsEvents.updateSettings);

	    app.post('/me/delete',
	    	mdw.pop.populateUser({ force_presence: true }),
	    	mdw.email.deleteMailchimpUser,
	    	settingsEvents.deleteProfile );


	    // [ @user ] Utilisé pour afficher le profile d'un utilisateur
	    app.get('/api/v1/users/:user_facebook_id',   //otherwise override with asker facebook_id
	    	mdw.validate('user_fetch', ['user_fetch'] ),
	    	api.users.fetchUserById_Full);

	    // [ @user ] Utilisé dans le Typeahead searchbox client
	    app.get('/api/v1/users',
	    	api.users.fetchUsers);

	    // [ @user ] Renvoie tous les events auxquels participe un user
	    app.get('/api/v1/me/events',
	    	mdw.validate('user_fetch', ['user_fetch'] ),
	    	api.users.fetchUserEvents);

	    // [ @user ] Fetch user informations
	    app.get('/api/v1/me',
	    	api.users.fetchMe);



	    // [ @events ] Fetch un event par son identifiant. 
	    app.get('/api/v1/events/:event_id', 
	    	mdw.validate('fetch_event_by_id', ['event_fetch']),
	    	api.events.fetchEventById );

	    // [ @events ] Update le statut d'un évènement [ 'open', 'suspended' ]
	    app.patch('/api/v1/events/:event_id/status',
	    	mdw.validate('event_status', ['event_status']),
	    	api.events.changeEventStatus );

	    // [ @events ] Génère une nouvelle requête pour participer à un évènement
	    app.patch('/api/v1/events/:event_id/request',
	    	mdw.validate('request_event', ['event_group_request'] ),
	    	mdw.notifier.addNotification('group_request'),
	    	api.events.request );

	    // [ @events ] Renvoie la liste des groupes d'un évènement
	    app.get('/api/v1/events/:event_id/groups',
	    	api.events.fetchGroups );

	    // [ @events ] Change le statut d'un group : [ 'accepted', 'kicked' ]
	    app.patch('/api/v1/events/:event_id/groups/:group_id/status',
	    	mdw.validate('group_status', ['event_group_status']),
	    	mdw.notifier.addNotification('accepted_in'),
	    	api.events.changeGroupStatus );

	    // [ @events ] Renvoie la liste de tous les évènements ! 
	    app.get('/api/v1/events',
	    	api.events.fetchEvents );

	    // [ @events ] Crée un nouvel évènement
	    app.post('/api/v1/events',
	    	mdw.validate('create_event', ['create_event']),
	    	mdw.meepass.updateMeepass('event_created'),
	    	mdw.notifier.addNotification('marked_as_host'),
	    	api.events.createEvent );



	    // [ @chat ] Renvoie l'historique des messages par chat id
	    app.get('/api/v1/chats/:chat_id',
	    	mdw.validate('chat_fetch', ['chat_fetch']),
	    	api.chats.fetchChatMessages );

	    // [ @chat ] Post un nouvau message
	    app.post('/api/v1/chats/:chat_id',
	    	mdw.validate('chat_message', ['chat_message']),
	    	mdw.chat_watcher.watchCache,
	    	mdw.chat_watcher.mailOfflineUsers,
	    	api.chats.addChatMessage );

	    // [ @chat ] Poste le fait qu'un user ai lu un message
	    app.post('/api/v1/chats/:chat_id/readby',
	    	mdw.validate('chat_readby', ['chat_readby']),
	    	api.chats.setReadBy );



	    // [ @parties ] Créer un évènement partenaire
	    app.post('/api/v1/parties',
	    	mdw.auth.authenticate(['admin']),
	    	mdw.validate('create_party', ['create_party']),
	    	api.parties.createParty );

	    // [ @parties ] Fetch all parties
	    app.get('/api/v1/parties',
	    	api.parties.fetchParties );

	    
	    // [ @places ] Fetch all places
	    app.get('/api/v1/places', api.places.fetchPlaces );

	    // [@places ] Create a new place
	    app.post('/api/v1/places',
	    	mdw.validate('create_place', ['create_place']),
	    	api.places.createPlace
	    );


	    app.post('/admin/*',
	    	function( req, res, next ){
	    		if( req.sent.apikey != 'M33fore' ){
	    			return res.status( 403 ).json({ msg: "unauthorized" });
	    		} else {
	    			next();
	    		}
	    	});

	    app.post('/admin/users/online',
	    	function( req, res ){

	    		rd.smembers('online_users', function( err, response ){
	    			var data  = {};
	    			if( err ){
	    				data.err = err;
	    			} else {
	    				data.response = response;
	    			}
	    			res.json( data );
	    		})
	    	});

	    app.post('/admin/users/alerts/reset',
	    	function( req, res ){

	    		User
	    			.find()
	    			.exec(function( err, users ){

	    				if( err || users.length == 0 ){
	    					return res.status(400).json({ msg: "Error occured", err: err, users: users });
	    				}

	    				if( typeof req.sent.min_frequency != 'number' ){
	    					return res.status(400).json({ msg: "Please, provide min_frequency field of type number" });
	    				}

	    				var async_tasks = [];
	    				users.forEach(function( user ){
							

								var facebook_id    = user.facebook_id;
								var email          = user.contact_email;
								var message_unread = user.app_preferences.alerts.message_unread;
								var accepted_in    = user.app_preferences.alerts.accepted_in;

								var hash       = {
									min_frequency  : '7200',
									email          : email,
									message_unread : message_unread,
									accepted_in    : accepted_in
								}

							// (function(hash){

		    					async_tasks.push(function( callback ){

		    						rd.hmset('user_alerts/' + facebook_id, hash, function( err ){
		    							callback();
		    						});

		    					});

							// })( hash );

	    				});
	    				
    					async.parallel( async_tasks, function( err, response ){

	    					if( err ){
	    						return res.status( 400 ).json({ err: err, response: response });
	    					} else {
	    						return res.status( 200 ).json({ res: "success!" });
	    					}
    					});

	    			});

	    	});

	    app.post('/admin/users/alerts/min_frequency',
	    	function( req, res ){

	    		User
	    			.find()
	    			.select('facebook_id')
	    			.exec(function( err, data ){

	    				if( err || data.length == 0 ){
	    					return res.status(400).json({ msg: "Error occured", err: err, data: data });
	    				}

	    				if( typeof req.sent.min_frequency != 'number' ){
	    					return res.status(400).json({ msg: "Please, provide min_frequency field of type number" });
	    				}

	    				var async_tasks = [];
	    				data.forEach(function( o ){

	    					var facebook_id = o.facebook_id;
	    					async_tasks.push(function( callback ){

	    						// (function( facebook_id ){

			    					rd.hgetall('user_alerts/' + facebook_id, function( err, alerts ){

			    						alerts.min_frequency = req.sent.min_frequency;
			    						rd.hmset('user_alerts/' + facebook_id, alerts, function( err ){
			    							console.log('Cache updated for user : ' + facebook_id );
			    							callback();

			    						});

			    					});

			    				// })( facebook_id );

	    					});
	    				});

	    				async.parallel( async_tasks, function( err, response ){

	    					if( err ){
	    						return res.status( 400 ).json({ err: err, response: response });
	    					} else {
	    						return res.status( 200 ).json({ res: "success!" });
	    					}
	    				});

	    			})

	    	});


	   	// [ @WebHooks ] WebHook from Pusher to monitor in realtime online/offline users
	   	// and save disconnected_at property which is used by front end notifications module
	   	app.post('/webhooks/pusher/connection-event',
	   		connecter.updateConnectedUsers );




	   	// [@API Overrides]
	   	app.post('/watcher/terminate-events',
	   		function( req, res ){
	   			if( req.sent.apikey != 'M33fore') return res.status(403).json({ "msg": "unauthorized" });
	   			require( process.cwd() + '/jobs/terminate-events').terminateEvents({
						timezone   : req.sent.timezone,
						target_day : req.sent.target_day  // format 'DD/MM/YYYY'
	   			});
	   			res.json({ "msg":"success" });
	   		});

	   	app.post('/watcher/clear-cache',
	   		function( req, res ){
	   			if( req.sent.apikey != 'M33fore' ) return res.status(403).json({ "msg": "unauthorized" });
		   		mdw.chat_watcher.clearCache({
					min_chat_size    : req.sent.min_chat_size,
					n_keys_to_remove : req.sent.n_keys_to_remove
		   		});
		   		res.json({ "msg": "success" });
	   		});













	    // Test & legacy


	      /* Debug les appels clients */
	    app.post('*', function(req, res, next) {
	        console.log('-> body : ' + JSON.stringify( req.body, null, 4 ));
	        next();
	    });


	    //Rest api tests
	    //app.post('/api/v1/test/:user_id', api.tests.test );
	    app.post('/api/v1/test/validate/:event_id/*');
//	    app.post('/api/v1/test/validate/:event_id/request', mdw.validate('test','event_group_request'), api.tests.testValidate);




	    //Events relatifs aux admins
	    app.post('/fetch-app-data', mdw.auth.authenticate(['admin']), adminEvents.fetchAppData);
	    app.post('/create-event-bot', mdw.auth.authenticate(['admin-bot']), adminEvents.createBotEvent);
	    app.post('/request-participation-in-bot', mdw.auth.authenticate(['admin-bot']), adminEvents.requestParticipationInBot);
	    app.post('/add-event-template', mdw.auth.authenticate(['admin']), adminEvents.addEventTemplate);
	    app.post('/delete-event-template', mdw.auth.authenticate(['admin']), adminEvents.deleteEventTemplate);

	    app.post('/hello', function(req, res) {
	        console.log('Hello test command received!');
	        console.log('Message : ' + req.body.msg);
	    });


	    app.get('/pusher/test', function(req,res){
	    	pusher.trigger('app', 'new test', { hello: "app" } );
	    	res.status(200).end();
	    });

	    app.get('/pusher/test/event/:event_id', function(req,res){
	    	pusher.trigger( req.params.event_id, 'new test event', { hello: "event" } );
	    	res.status(200).end();
	    });

	    app.get('/testme', function(req,res){
	    	var Event = require('../models/EventModel');
	    	Event.find({},function(err, events){

	    		res.json({ 
	    			group_ids: events[0].getGroupIds()
	    		}).end();
	    	});
	    });	 


	};