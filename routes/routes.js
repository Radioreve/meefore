
	var _      = require('lodash');
	var async  = require('async');
	var get_ip = require('ipware')().get_ip;

	var rd        = require('../services/rd');
	var pusher    = require('../services/pusher');
	
	var pushEventsDir = '../pushevents';
	var apiDir        = '../api';
	var mdwDir        = '../middlewares';

	var User = require('../models/UserModel');

	var profileEvents  = require( pushEventsDir + '/profileEvents'),
		settingsEvents = require( pushEventsDir + '/settingsEvents'),
		signEvents     = require( pushEventsDir + '/signEvents');

	var api = {}
	//	api.tests     = require( apiDir + '/tests');
		api.users     = require( apiDir + '/users');
		api.places    = require( apiDir + '/places');
		api.befores   = require( apiDir + '/befores');
		api.parties   = require( apiDir + '/parties');
		api.chats     = require( apiDir + '/chats');

	var mdw = {};
		mdw.expose 			  = require( mdwDir + '/expose');
		mdw.auth              = require( mdwDir + '/auth');
		mdw.mailchimp_watcher = require( mdwDir + '/mailchimp_watcher');
		mdw.pop               = require( mdwDir + '/pop');
		mdw.facebook          = require( mdwDir + '/facebook');
		mdw.profile_watcher   = require( mdwDir + '/profile_watcher');
		mdw.alerts_watcher    = require( mdwDir + '/alerts_watcher');
		mdw.chat_watcher      = require( mdwDir + '/chat_watcher');
		mdw.notifier          = require( mdwDir + '/notifier');
		mdw.meepass           = require( mdwDir + '/meepass');
		mdw.connecter 		  = require( mdwDir + '/connecter');
		mdw.realtime 		  = require( mdwDir + '/realtime');
		mdw.cached			  = require( mdwDir + '/cached');

		mdw.validate          = require('../validate/validate');

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
			req.sent.expose = {};
			
			next();

		});


		function setParam( params ){

			var params = Array.isArray(params) ? params : [params];
			return function( req, res, next ){
				params.forEach(function( para ){
					req.sent[ para ] = req.params[ para ];
				});
				next();
			}

		}

		// Setup the values in the req.sent object, to allow a more RESTish way of calling the services for the client
		// Each middleware can consume the params, and client can just add it to the url and not to the raw body!
		app.all('/api/v1/users/:user_id*',  setParam('user_id') );
	    app.all('/api/v1/chats/:chat_id*', setParam('chat_id') );
		app.all('/test/api/v1/chats/:chat_id*', setParam('chat_id') );
		app.all('/api/v1/befores/:before_id*', setParam('before_id') );
		app.all('/api/v1/befores/:before_id/groups/:group_id*', setParam(['before_id', 'group_id']) );


		// Api authentication validation
		// All api calls must provid a valid token, which is then decoded.
		// The token is given the client during the authentication process and contains client's ids
		app.all('/api/*',
			mdw.auth.authenticate(['standard'])
		);


	    // Main page
	    app.get('/home',
	    	function( req, res, next ){

	    		var ip_info = get_ip( req );
	    		next();
	    	},
	    	signEvents.sendHomepage);

	    // Conditions générales
	    app.get('/legals', function( req, res ){
	    	res.sendfile( process.cwd() + '/views/legals.html' );
	    });

	    // Redirection à la page d'accueil
	    app.get('/',
	    	signEvents.redirectToHome
	    );


	    // Provide valid token based on secret key, for api calls
		app.post('/auth/token',
			mdw.auth.makeToken
		);


		// [@Landing Page ]
		app.post('/landing/contact',
			signEvents.sendContactEmail
		);

	    // Initialisation | Check if user exists / create profile if not, subscribe to mailchimp
	    app.post('/auth/facebook',
	    	mdw.validate('auth_facebook'),
	    	mdw.pop.populateUser({ force_presence: false }),
	    	mdw.facebook.updateFacebookToken,
	    	mdw.mailchimp_watcher.subscribeMailchimpUser,
	    	signEvents.handleFacebookAuth,
	    	mdw.realtime.setChannels,
	    	mdw.realtime.setLastSentAtInChannels,
	    	mdw.facebook.fetchAndSyncFriends,
	    	mdw.alerts_watcher.setCache,
	    	mdw.profile_watcher.setCache
	    );

	    // Création d'un bot
	    app.post('/auth/facebot',
	    	mdw.alerts_watcher.setCache,
	    	signEvents.handleFacebookAuth
	    );

	    // [ @chat ] Make sure a user has authorisation to join a channel
	    app.post('/auth/pusher',
	    	mdw.auth.authenticate(['standard']), // token required for magic to happen
	    	mdw.validate('pusher_auth'),
	    	mdw.auth.authPusherChannel
	    );


	    // [ @user ] Update le profile
	    app.post('/api/v1/users/:user_id/update-profile',
	    	mdw.validate('myself'),
	    	mdw.validate('update_profile_base'),
			mdw.profile_watcher.updateCache('base'),
	    	profileEvents.updateProfile,
	    	mdw.realtime.updateLocationChannel
	    );

	    // [ @user ] Ajoute une photo au profile
	    app.post('/api/v1/users/:user_id/update-picture-client',
	    	mdw.validate('myself'),
	    	mdw.validate('update_picture_client'),
	    	mdw.pop.populateUser(),
	    	profileEvents.updatePicture,
	    	mdw.profile_watcher.updateCache('picture_upload')
	    );

	    // [ @user ] Change les hashtag/photo de profile
	    app.post('/api/v1/users/:user_id/update-pictures',
	    	mdw.validate('myself'),
	    	mdw.validate('update_pictures'),
			mdw.pop.populateUser(),
			mdw.profile_watcher.updateCache('picture_mainify'),
	    	profileEvents.updatePictures
	    );

	    // [ @user ] Ajoute une photo via Facebook api
	    app.post('/api/v1/users/:user_id/update-picture-url',
	    	mdw.validate('myself'),
	    	mdw.validate('upload_picture_url'),
	    	mdw.pop.populateUser(),
	    	profileEvents.uploadPictureWithUrl,
	    	mdw.profile_watcher.updateCache('picture_upload')
	    );

	    // [ @user ] Va chercher en base de données les users à partir de /api/v1/users/:user_id/friends de l'api Facebook
	    app.get('/api/v1/users/:user_id/friends',
	    	mdw.validate('myself'),
	    	profileEvents.fetchFriends 
	    );
	    
	    app.post('/api/v1/users/:user_id/friends',
	    	mdw.validate('myself'),
	    	profileEvents.syncFriends
	    );

	    // [ @user ] va chercher des tags cloudinary signés par le serveur
	    app.get('/api/v1/users/:user_id/cloudinary-tags',
	    	mdw.validate('myself'),
	    	profileEvents.fetchCloudinaryTags
	    );

	    // [ @user ] Update contact settings
	    app.post('/api/v1/users/:user_id/update-settings-contact',
	    	mdw.validate('myself'),
	    	mdw.pop.populateUser(),
	    	mdw.mailchimp_watcher.updateMailchimpUser,
	    	mdw.alerts_watcher.updateCache,
	    	settingsEvents.updateSettingsContact
	    );

	    // [ @user ] Update ux settings
	    app.post('/api/v1/users/:user_id/update-settings-ux',
	    	mdw.validate('myself'),
	    	settingsEvents.updateSettings
	    );

	     // [ @user ] Update ux settings
	    app.post('/api/v1/users/:user_id/update-settings-alerts',
	    	mdw.validate('myself'),
	    	mdw.alerts_watcher.updateCache,
	    	settingsEvents.updateSettings
	    );

	    // [ @user ] Update notification settings 
	    app.post('/api/v1/users/:user_id/update-settings-mailinglists',
	    	mdw.validate('myself'),
	    	mdw.pop.populateUser(),
	    	mdw.mailchimp_watcher.updateMailchimpUser,
	    	settingsEvents.updateSettings
	    );

	    app.post('/api/v1/users/:user_id/delete',
	    	mdw.validate('myself'),
	    	mdw.pop.populateUser(),
	    	mdw.mailchimp_watcher.deleteMailchimpUser,
	    	settingsEvents.deleteProfile
	    );

	    // Coupons, code & sponsorship
		app.post('/api/v1/users/:user_id/invite-code',
			mdw.validate('myself'),
			mdw.validate('invite_code'),
			profileEvents.updateInviteCode
		);

		app.get('/api/v1/users/online',
			mdw.connecter.getOnlineUsers,
			api.users.fetchOnlineUsers
		);




	    app.get('/api/v1/all',
	    	api.users.fetchUsersAll
	    );

	    app.get('/api/v1/users.countries',
	    	api.users.fetchDistinctCountries
	    );

	    app.get('/api/v1/users/:user_id/self',
	    	mdw.validate('myself'),
	    	api.users.fetchMe
	    );

	    // [ @user ] Utilisé pour afficher le profile d'un utilisateur
	    app.get('/api/v1/users/:user_id/full', 
	    	api.users.fetchUserById_Full
	    );

	     // [ @user ] Utilisé pour afficher le profile d'un utilisateur
	    app.get('/api/v1/users/:user_id/core', 
	    	mdw.validate('user_fetch'),
	    	api.users.fetchUserById_Core
	    );

	    // [ @user ] Utilisé dans le Typeahead searchbox client
	    app.get('/api/v1/users?name',
	    	api.users.fetchUsers
	    );

	    app.post('/api/v1/users.more',
	    	mdw.validate('users_fetch_more'),
	     	api.users.fetchUserCount,
	    	api.users.fetchMoreUsers
	    );

	    app.post('/api/v1/users/:user_id/channels',
	    	mdw.validate('myself'),
	    	api.users.fetchMoreChannels
	    );


	    // [ @user ] Renvoie tous les befores auxquels participe un user
	    app.get('/api/v1/api/v1/users/:user_id/befores',
	    	mdw.validate('myself'),
	    	mdw.validate('user_fetch'),
	    	api.users.fetchUserEvents
	    );

	    // [ @user ] Fetch user informations
	    app.get('/api/v1/me',
	    	api.users.fetchMe
	    );


	    app.get('/api/v1/users/:user_id/shared',
	    	mdw.validate('myself'),
	    	api.users.fetchUserShared
	    );

	    app.get('/api/v1/users/:user_id/meepass',
	    	mdw.validate('myself'),
	    	api.users.fetchUserMeepass
	    );


	    app.get('/api/v1/users/:user_id/mailchimp-status',
	    	mdw.validate('myself'),
	    	mdw.pop.populateUser(),
	    	api.users.getMailchimpStatus
	    );


	    // [ @befores ] Update le statut d'un évènement [ 'open', 'suspended' ]
	    app.post('/api/v1/befores/:before_id/status',
	    	mdw.validate('before_status'),
	    	api.befores.changeBeforeStatus,
	    	mdw.notifier.addNotification('before_status'),
	    	mdw.realtime.pushNewBeforeStatus
	    );

	    // [ @befores ] Génère une nouvelle requête pour participer à un évènement
	    app.post('/api/v1/befores/:before_id/request',
	    	mdw.validate('before_group_request' ),
	    	api.befores.request,
	    	mdw.notifier.addNotification('group_request'),
	    	mdw.realtime.updateChannelsRequest,
	    	mdw.realtime.pushNewRequest
	    );

	    // [ @befores ] Renvoie la liste des groupes d'un évènement
	    app.get('/api/v1/befores/:before_id/groups',
	    	api.befores.fetchGroups
	    );

	    // [ @befores ] Change le statut d'un group : [ 'accepted', 'kicked' ]
	    app.post('/api/v1/befores/:before_id/groups/:group_id/status',
	    	mdw.validate('before_group_status'),
	    	api.befores.changeGroupStatus,
	    	api.befores.resetBeforeSeenAt,
	    	mdw.cached.cacheGroupStatus,
	    	mdw.notifier.addNotification('accepted_in'),
	    	mdw.realtime.pushNewGroupStatus
	    );

	    // [ @befores ] Renvoie la liste des befores les plus proches
	    app.get('/api/v1/befores.nearest',
	    	mdw.validate('before_nearest'),
	    	api.befores.fetchNearestBefores
	    );

	    // [ @befores ] Crée un nouvel évènement
	    app.post('/api/v1/befores',
	    	mdw.validate('create_before'),
	    	mdw.meepass.updateMeepass('before_created'),
	    	api.befores.createBefore,
	    	mdw.cached.cacheBeforeHosts,
	    	mdw.notifier.addNotification('marked_as_host'),
	    	mdw.realtime.pushNewBefore
	    );

	     // [ @befores ] Fetch un before par son identifiant. 
	    app.get('/api/v1/befores/:before_id', 
	    	mdw.validate('before_fetch'),
	    	api.befores.fetchBeforeById
	    );

	    app.post('/api/v1/befores/:before_id/seen_at',
	    	api.befores.updateBeforeSeenAt
	    );

	    // [ @chat ] Renvoie l'historique des messages par chat id (MongoDB)
	    app.get('/api/v1/chats/:chat_id',
	    	mdw.validate('chat_fetch'),
	    	api.chats.fetchChatMessages
	    );

	    // [ @chat ] Post un nouvau message
	    app.post('/api/v1/chats/:chat_id',
	    	mdw.validate('chat_message'),
	    	// mdw.chat_watcher.mailOfflineUsers,
	    	api.chats.addChatMessage,
	    	mdw.realtime.pushNewChatMessage
	    );

	    app.post('/api/v1/chats/:chat_id/seen_by',
	    	mdw.pop.populateUser(),
	    	mdw.validate('chat_seen_by'),
	    	api.chats.setMessageSeenBy,
	    	mdw.realtime.pushNewChatSeenBy
	    );


	    // [ @spotted and shared ] Repérés et partagés un profil
	    app.post('/api/v1/share',
			mdw.validate('shared'),
			profileEvents.updateShared
		);
	    ///[ @spottd and shared]


	    // Begin meepass

		app.post('/api/v1/send_meepass',
			mdw.validate('send_meepass'),
			mdw.meepass.updateMeepass('meepass_sent'),
			profileEvents.updateMeepass
		);

		// End meepass


	    // [ @parties ] Créer un évènement partenaire
	    app.post('/api/v1/parties',
	    	mdw.auth.authenticate(['admin']),
	    	mdw.validate('create_party'),
	    	api.parties.createParty
	    );

	    // [ @parties ] Fetch all parties
	    app.get('/api/v1/parties',
	    	api.parties.fetchParties
	    );

	    
	    // [ @places ] Fetch all places
	    app.get('/api/v1/places', api.places.fetchPlaces );

	    // [@places ] Create a new place
	    app.post('/api/v1/places',
	    	mdw.validate('create_place'),
	    	api.places.createPlace
	    );


	    app.all('/admin/*',
	    	function( req, res, next ){
	    		if( req.sent.api_key != 'M33fore' ){
	    			return res.status( 403 ).json({ msg: "unauthorized" });
	    		} else {
	    			next();
	    		}
	    	});

	    app.post('/admin/credit_meepass',
			mdw.auth.authenticate(['admin']),
			mdw.meepass.updateMeepass('admin_credit')
		);

	    app.post('/admin/users/alerts/reset',
	    	function( req, res ){

	    		User
	    			.find()
	    			.exec(function( err, users ){

	    				if( err ){
	    					return res.status( 400 ).json({
	    						msg: "Error occured", err: err, users: users
	    					});
	    				}

	    				if( typeof req.sent.min_frequency != 'number' ){
	    					return res.status( 400 ).json({
	    						msg: "Please, provide min_frequency field of type number"
	    					});
	    				}

	    				var async_tasks = [];
	    				users.forEach(function( user ){

	    					async_tasks.push(function( callback ){

	    						rd.hmset('user_alerts/' + facebook_id, { min_frequency: req.sent.min_frequency }, function( err ){
	    							callback();
	    						});

	    					});


	    				});
	    				
    					async.parallel( async_tasks, function( err, response ){

	    					if( err ){
	    						return res.status( 400 ).json({
	    							err: err, response: response
	    						});
	    					} else {
	    						return res.status( 200 ).json({
	    							res: "success!"
	    						});
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

	    // Test functions
	    app.get('/users/:user_id/channels',
	    	setParam('user_id'),
	    	function( req, res, next ){

	    		var facebook_id  = req.params["user_id"];
	    		var channel_name = req.sent.name; 

	    		User.findOne({ facebook_id: facebook_id }, function( err, user ){

	    			req.sent.expose.err = err;
	    			req.sent.expose.channel_item = user.getChannel( channel_name );
	    			next();

	    		});
	    	}
	    );

	    // Get all the befores for a particular user, by using each user's own befores
	    // property (which contails all the before's _ids the user has going on)
	    app.get('/users/:user_id/befores.id',
	    	setParam('user_id'),
	    	function( req, res, next ){

	    		var facebook_id  = req.params["user_id"];

	    		User.findOne({ facebook_id: facebook_id }, function( err, user ){
	    			user.findBeforesByIds(function( err, befores ){
						req.sent.expose.err        = err;
						req.sent.expose.n_befores  = befores.length;
						req.sent.expose.before_ids = _.map( befores, '_id' );
						req.sent.expose.befores    = befores;
		    			next();
	    			});
	    		});
	    	}
	    );

	    // Get all the befores for a particular user, but checking the presence of its id
	    // in either the hosts or the group.members fields
	    app.get('/users/:user_id/befores.presence',
	    	setParam('user_id'),
	    	function( req, res, next ){

	    		var facebook_id  = req.params["user_id"];

	    		User.findOne({ facebook_id: facebook_id }, function( err, user ){
	    			user.findBeforesByPresence(function( err, befores ){
						req.sent.expose.err        = err;
						req.sent.expose.n_befores  = befores.length;
						req.sent.expose.before_ids = _.map( befores, '_id' );
						req.sent.expose.befores    = befores;
		    			next();
	    			});
	    		});
	    	}
	    );

	    app.post('/befores/:before_id/seen_at',
	    	setParam('before_id'),
	    	api.befores.updateBeforeSeenAt
	    );

	    app.post('/befores/:before_id/reset_seen_at/:facebook_id',
	    	setParam(['before_id', 'facebook_id']),
	    	api.befores.resetBeforeSeenAt
	    );

	    app.post('/auth/facebook/generate-app-token-local', // use the app_token shortcut
	    	function( req, res, next ){

	    		mdw.facebook.generateAppToken(function( err, res ){
	    			req.sent.expose.err = err;
	    			req.sent.expose.res = res;
	    			next();
	    		});
	    	}
	    );

	    app.post('/auth/facebook/generate-app-token-fetch', // ask facebook graph api for a true app_token
	    	function( req, res, next ){

	    		mdw.facebook.generateAppToken(function( err, res ){
	    			req.sent.expose.err = err;
	    			req.sent.expose.res = res;
	    			next();
	    		}, "fetch" );
	    	}
	    );

	    app.post('/auth/facebook/verify-token',
	    	function( req, res, next ){

	    		var token = req.sent.token;

	    		mdw.facebook.verifyFacebookToken( token, function( err, res ){
	    			req.sent.expose.err = err;
	    			req.sent.expose.res = res;
	    			next();
	    		});
	    	}
	    );

	    app.post('/auth/facebook/update-token',
	    	function( req, res, next ){

	    		var token = req.sent.token;

	    		mdw.facebook.fetchLongLivedToken( token, function( err, res ){
	    			req.sent.expose.err = err;
	    			req.sent.expose.res = res;
	    			next();
	    		});
	    	}
	    );

	    app.post('/auth/facebook/validate',
	    	mdw.validate('auth_facebook'),
	    	mdw.pop.populateUser({ force_presence: false }),
	    	mdw.facebook.updateFacebookToken
	    );

	   	// [ @WebHooks ] WebHook from Pusher to monitor in realtime online/offline users
	   	// and save disconnected_at property which is used by front end notifications module
	    app.post('/webhooks/pusher/connection-event',
	    	mdw.connecter.updateConnectedUsers
	    );


	   	// [@API Overrides]
	   	app.post('/jobs/terminate-befores',
	   		function( req, res ){

	   			if( req.sent.api_key != 'M33fore'){
	   				return res.status( 403 ).json({
	   					"msg": "unauthorized"
	   				});
	   			}

	   			require( process.cwd() + '/jobs/terminate-befores').terminateBefores({
						timezone   : req.sent.timezone,
						target_day : req.sent.target_day  // format 'DD/MM/YYYY'
	   			});

	   			res.json({
	   				"msg":"success" 
	   			});

	   		});


	   	app.all('*', mdw.expose.sendResponse );

	    // Test & legacy


	      /* Debug les appels clients */
	    app.post('*', function(req, res, next) {
	        console.log('-> body : ' + JSON.stringify( req.body, null, 4 ));
	        next();
	    });



	};