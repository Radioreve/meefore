
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
		api.befores    = require( apiDir + '/befores');
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
		mdw.users_watcher 	  = require( mdwDir + '/users_watcher');
		mdw.realtime 		  = require( mdwDir + '/realtime');

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
			console.log(req.sent);
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
	    	signEvents.sendHomepage);

	    // Conditions générales
	    app.get('/legals', function( req, res ){
	    	res.sendfile( process.cwd() + '/views/legals.html' );
	    });

	    // Redirection à la page d'accueil
	    app.get('/',
	    	signEvents.redirectToHome);


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
	    	mdw.facebook.fetchFacebookLongLivedToken,
	    	mdw.mailchimp_watcher.subscribeMailchimpUser,
	    	mdw.alerts_watcher.setCache,
	    	mdw.realtime.setChannels,
	    	signEvents.handleFacebookAuth
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
	    app.post('/me/update-profile',
	    	mdw.validate('update_profile_base'),
			mdw.profile_watcher.updateCache('base'),
	    	profileEvents.updateProfile,
	    	mdw.realtime.updateLocationChannel
	    );

	    // [ @user ] Ajoute une photo au profile
	    app.post('/me/update-picture-client',
	    	mdw.validate('update_picture_client'),
	    	mdw.pop.populateUser(),
	    	profileEvents.updatePicture,
	    	mdw.profile_watcher.updateCache('picture_upload')
	    );

	    // [ @user ] Change les hashtag/photo de profile
	    app.post('/me/update-pictures',
	    	mdw.validate('update_pictures'),
			mdw.pop.populateUser(),
			mdw.profile_watcher.updateCache('picture_mainify'),
	    	profileEvents.updatePictures
	    );

	    // [ @user ] Ajoute une photo via Facebook api
	    app.post('/me/update-picture-url',
	    	mdw.validate('upload_picture_url'),
	    	mdw.pop.populateUser(),
	    	profileEvents.uploadPictureWithUrl,
	    	mdw.profile_watcher.updateCache('picture_upload')
	    );

	    // [ @user ] Va chercher en base de données les users à partir de /me/friends de l'api Facebook
	    app.get('/me/friends',
	    	profileEvents.fetchFriends 
	    );
	    
	    app.post('/me/friends',
	    	profileEvents.syncFriends
	    );

	    // [ @user ] va chercher des tags cloudinary signés par le serveur
	    app.get('/me/cloudinary-tags',
	    	profileEvents.fetchCloudinaryTags
	    );

	    // [ @user ] Update contact settings
	    app.post('/me/update-settings-contact',
	    	mdw.pop.populateUser(),
	    	mdw.mailchimp_watcher.updateMailchimpUser,
	    	mdw.alerts_watcher.updateCache,
	    	settingsEvents.updateSettingsContact
	    );

	    // [ @user ] Update ux settings
	    app.post('/me/update-settings-ux',
	    	settingsEvents.updateSettings
	    );

	     // [ @user ] Update ux settings
	    app.post('/me/update-settings-alerts',
	    	mdw.alerts_watcher.updateCache,
	    	settingsEvents.updateSettings
	    );

	    // [ @user ] Update notification settings 
	    app.post('/me/update-settings-mailinglists',
	    	mdw.pop.populateUser(),
	    	mdw.mailchimp_watcher.updateMailchimpUser,
	    	settingsEvents.updateSettings
	    );

	    app.post('/me/delete',
	    	mdw.pop.populateUser(),
	    	mdw.mailchimp_watcher.deleteMailchimpUser,
	    	settingsEvents.deleteProfile
	    );

	    // Coupons, code & sponsorship
		app.post('/me/invite-code',
			mdw.validate('invite_code'),
			profileEvents.updateInviteCode
		);





	    app.get('/api/v1/all',
	    	api.users.fetchUsersAll
	    );

	    app.get('/api/v1/users.countries',
	    	api.users.fetchDistinctCountries
	    );

	    app.get('/api/v1/users/:facebook_id/*', 
	    	setParam('facebook_id')
	    );

	    // [ @user ] Utilisé pour afficher le profile d'un utilisateur
	    app.get('/api/v1/users/:facebook_id/full',   //otherwise override with asker facebook_id
	    	mdw.validate('user_fetch'),
	    	api.users.fetchUserById_Full
	    );

	     // [ @user ] Utilisé pour afficher le profile d'un utilisateur
	    app.get('/api/v1/users/:facebook_id/core',   //otherwise override with asker facebook_id
	    	mdw.validate('user_fetch'),
	    	api.users.fetchUserById_Core
	    );

	    // [ @user ] Utilisé dans le Typeahead searchbox client
	    app.get('/api/v1/users?name',
	    	api.users.fetchUsers
	    );

	     app.post('/api/v1/users.more',
	    	mdw.validate('users_fetch_more'),
	     	mdw.users_watcher.fetchUserCount,
	    	api.users.fetchMoreUsers
	    );

	    app.post('/tapi/v1/users.more',
	    	mdw.validate('users_fetch_more'),
	    	mdw.users_watcher.fetchUserCount,
	    	api.users.fetchMoreUsers
	    );

	    // [ @user ] Renvoie tous les befores auxquels participe un user
	    app.get('/api/v1/me/befores',
	    	mdw.validate('user_fetch'),
	    	api.users.fetchUserEvents
	    );

	    // [ @user ] Fetch user informations
	    app.get('/api/v1/me',
	    	api.users.fetchMe
	    );


	    app.get('/api/v1/users/:facebook_id/shared',
	    	api.users.fetchUserShared
	    );

	    app.get('/api/v1/users/:facebook_id/meepass',
	    	api.users.fetchUserMeepass
	    );


	    app.get('/api/v1/users/:facebook_id/mailchimp-status',
	    	mdw.pop.populateUser(),
	    	api.users.getMailchimpStatus
	    );


	    // [ @befores ] Update le statut d'un évènement [ 'open', 'suspended' ]
	    app.post('/api/v1/befores/:before_id/status',
	    	mdw.validate('before_status'),
	    	api.befores.changeBeforeStatus,
	    	mdw.realtime.pushNewBeforeStatus
	    );

	    // [ @befores ] Génère une nouvelle requête pour participer à un évènement
	    app.post('/api/v1/befores/:before_id/request',
	    	mdw.validate('before_group_request' ),
	    	mdw.notifier.addNotification('group_request'),
	    	api.befores.request
	    );

	    // [ @befores ] Renvoie la liste des groupes d'un évènement
	    app.get('/api/v1/befores/:before_id/groups',
	    	api.befores.fetchGroups
	    );

	    // [ @befores ] Change le statut d'un group : [ 'accepted', 'kicked' ]
	    app.post('/api/v1/befores/:before_id/groups/:group_id/status',
	    	mdw.validate('before_group_status'),
	    	mdw.notifier.addNotification('accepted_in'),
	    	api.befores.changeGroupStatus
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
	    	mdw.notifier.addNotification('marked_as_host'),
	    	mdw.realtime.pushNewBefore
	    );

	     // [ @befores ] Fetch un before par son identifiant. 
	    app.get('/api/v1/befores/:before_id', 
	    	mdw.validate('before_fetch'),
	    	api.befores.fetchBeforeById
	    );




	    // [ @chat ] Renvoie l'historique des messages par chat id
	    app.get('/api/v1/chats/:chat_id',
	    	mdw.validate('chat_fetch'),
	    	api.chats.fetchChatMessages
	    );

	    // [ @chat ] Post un nouvau message
	    app.post('/api/v1/chats/:chat_id',
	    	mdw.validate('chat_message'),
	    	mdw.chat_watcher.watchCache,
	    	mdw.chat_watcher.mailOfflineUsers,
	    	api.chats.addChatMessage
	    );

	    // [ @chat ] Poste le fait qu'un user ai lu un message
	    app.post('/api/v1/chats/:chat_id/readby',
	    	mdw.validate('chat_readby'),
	    	api.chats.setReadBy
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

		app.post('/api/v1/admin/credit_meepass',
			mdw.auth.authenticate(['root','admin']),
			mdw.meepass.updateMeepass('admin_credit')
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
	   		mdw.users_watcher.updateConnectedUsers );



	   	// [@API Overrides]
	   	app.post('/jobs/terminate-befores',
	   		function( req, res ){
	   			if( req.sent.apikey != 'M33fore') return res.status(403).json({ "msg": "unauthorized" });
	   			require( process.cwd() + '/jobs/terminate-befores').terminateBefores({
						timezone   : req.sent.timezone,
						target_day : req.sent.target_day  // format 'DD/MM/YYYY'
	   			});
	   			res.json({ "msg":"success" });
	   		});

	   	app.post('/jobs/clear-cache',
	   		function( req, res ){
	   			if( req.sent.apikey != 'M33fore' ) return res.status(403).json({ "msg": "unauthorized" });
		   		mdw.chat_watcher.clearCache({
					min_chat_size    : req.sent.min_chat_size,
					n_keys_to_remove : req.sent.n_keys_to_remove
		   		});
		   		res.json({ "msg": "success" });
	   		});


	   	app.all('*', mdw.expose.sendResponse );

	    // Test & legacy


	      /* Debug les appels clients */
	    app.post('*', function(req, res, next) {
	        console.log('-> body : ' + JSON.stringify( req.body, null, 4 ));
	        next();
	    });



	};