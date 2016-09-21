
	var _      = require('lodash');
	
	var pushEventsDir = '../pushevents';
	var apiDir        = '../api';
	var mdwDir        = '../middlewares';

	var profileEvents  = require( pushEventsDir + '/profileEvents'),
		signEvents     = require( pushEventsDir + '/signEvents');

	var api = {}
		api.users     = require( apiDir + '/users');
		api.befores   = require( apiDir + '/befores');
		api.chats     = require( apiDir + '/chats');
		api.feedbacks = require( apiDir + '/feedbacks' );

	var mdw = {};
		mdw.expose 			  = require( mdwDir + '/expose');
		mdw.auth              = require( mdwDir + '/auth');
		mdw.mailchimp         = require( mdwDir + '/mailchimp');
		mdw.pop               = require( mdwDir + '/pop');
		mdw.log 			  = require( mdwDir + '/log' );
		mdw.facebook          = require( mdwDir + '/facebook');
		mdw.profile_watcher   = require( mdwDir + '/profile_watcher');
		mdw.notifier          = require( mdwDir + '/notifier');
		mdw.alerter    		  = require( mdwDir + '/alerter');
		mdw.meepass           = require( mdwDir + '/meepass');
		mdw.connecter 		  = require( mdwDir + '/connecter');
		mdw.realtime 		  = require( mdwDir + '/realtime');
		mdw.onboarding 	      = require( mdwDir + '/onboarding');

		mdw.validate          = require('../validate/validate');

		mdw.stop = function( req, res, next ){
			require('terminal-kit').terminal.bold.red('Paused\n');
		}

	module.exports = function( app ) {

		// Setting up convenience stuff (merging all params into a single req.sent object, ... ), and loggin
		require('./setup')( app );

		// Admin routes
		require('./admin')( app );

		// Test routes
		require('./test')( app );

		// Routes relative to webhooks
		require('./webhooks')( app );


		// Api authentication validation
		// All api calls must provid a valid token, which is then decoded.
		// The token is given the client during the authentication process and contains client's ids
		app.all('/api/*',
			mdw.auth.authenticate(['standard']),
			// Make sure all requests are logged with the user's facebook_id extracted from the token
			mdw.log.addContext("request"),
			mdw.log.addContext("auth")
		);


		// Static routes (entry point for serving the app);
		require('./static')( app );


	    // Main entry point
	    // Performs both the signup and the login 
	    // Some middlewares are blocking and some are not
	    app.post('/auth/facebook',

	    	// Validate the form of the request (dont hit db for nothing)
	    	mdw.validate('auth_facebook'),
	    	// Fetch the user, but dont generate error if isnt found (could be signup)
	    	mdw.pop.populateUser({ force_presence: false }),
	    	// Update the Facebook token that has been sent if needed, from short to long
	    	mdw.facebook.updateFacebookToken,
	    	// Signup/Login logic 
	    	signEvents.handleFacebookAuth,
	    	// Update dynamically the profile with channel informations for realtime actions
	    	mdw.realtime.setChannels,
	    	// Update dynamically a parameter that allow to retrieve chats by activity for one user
	    	mdw.realtime.setLastSentAtInChannels,
	    	// Synchronise all his friends with Facebook at each connexion
	    	mdw.facebook.fetchAndSyncFriends,
	    	// Set cache basic info in Redis for max perf during fetch profile (short version)
	    	mdw.profile_watcher.updateCachedProfile,
	    	// Remove out-dated notifications from the profile
	    	mdw.notifier.clearNotifications,
	    	// Check if some notifications are needed
	    	mdw.notifier.addNotification('inscription_success'),
	    	// mdw.notifier.addNotification('new_friends'),
	    	// Always ensure the user is subscribed at mailchimp
	    	mdw.mailchimp.api("ensure_subscription"),
	    	// Make sure user is up to date with new onboarding content
	    	mdw.onboarding.setOnboardings,
	    	// Send a nice welcome email
	    	mdw.alerter.sendEmail("welcome"),
	    	// Set the user status to "idle"
	    	api.users.updateUserStatus("idle")
	    );


	    // Création d'un bot
	    app.post('/auth/facebot',
	    	signEvents.handleFacebookAuth
	    );

	    // [ @chat ] Make sure a user has authorisation to join a channel
	    app.post('/auth/pusher',
	    	mdw.auth.authenticate(['standard']), // token required for magic to happen
	    	mdw.validate('pusher_auth'),
	    	mdw.auth.authPusherChannel
	    );


	    // [ @user ] Update le profil
	    app.post('/api/v1/users/:user_id/update-profile',
	    	mdw.validate('myself'),
	    	mdw.validate('update_profile_base'),
			mdw.pop.populateUser(),
	    	profileEvents.updateProfile,
			mdw.profile_watcher.updateCachedProfile,
	    	mdw.realtime.updateLocationChannel,
	    	mdw.mailchimp.api("update_member")
	    );

	    // [ @user ] Ajoute une photo au profil
	    app.post('/api/v1/users/:user_id/update-picture-client',
	    	mdw.validate('myself'),
	    	mdw.validate('update_picture_client'),
	    	mdw.pop.populateUser(),
	    	profileEvents.updatePicture,
	    	mdw.profile_watcher.updateCachedProfile
	    );

	    // [ @user ] Change les hashtag/photo de profil
	    app.post('/api/v1/users/:user_id/update-pictures',
	    	mdw.validate('myself'),
	    	mdw.validate('update_pictures'),
			mdw.pop.populateUser(),
	    	profileEvents.updatePictures,
			mdw.profile_watcher.updateCachedProfile
	    );

	    // [ @user ] Ajoute une photo via Facebook api
	    app.post('/api/v1/users/:user_id/update-picture-url',
	    	mdw.validate('myself'),
	    	mdw.validate('upload_picture_url'),
	    	mdw.pop.populateUser(),
	    	profileEvents.uploadPictureWithUrl,
	    	mdw.profile_watcher.updateCachedProfile
	    );

	    // [ @user ] Va chercher en base de données les users à partir de /api/v1/users/:user_id/friends de l'api Facebook
	    app.get('/api/v1/users/:user_id/friends',
	    	mdw.validate('myself'),
	    	api.users.fetchFriends 
	    );
	    
	    app.patch('/api/v1/users/:user_id',
	    	mdw.validate('myself'),
	    	mdw.pop.populateUser(),
	    	mdw.validate('patch_user'),
	    	mdw.mailchimp.api("update_member"),
	    	api.users.updateUser
	    );

	    // [ @user ] va chercher des tags cloudinary signés par le serveur
	    app.get('/api/v1/users/:user_id/cloudinary-tags',
	    	mdw.validate('myself'),
	    	profileEvents.fetchCloudinaryTags
	    );

	    // [ @user ] Goodbye my friend...
	    app.post('/api/v1/users/:user_id/delete',
	    	mdw.validate('myself'),
	    	mdw.pop.populateUser(),
	    	mdw.mailchimp.api("delete_member"),
	    	api.users.deleteUser,
	    	mdw.alerter.sendEmail("delete_account")
	    );

	 //    // Coupons, code & sponsorship
		// app.post('/api/v1/users/:user_id/invite-code',
		// 	mdw.validate('myself'),
		// 	mdw.validate('invite_code'),
		// 	profileEvents.updateInviteCode
		// );

		app.get('/api/v1/users/online',
			mdw.connecter.getOnlineUsers,
			api.users.fetchOnlineUsers
		);

		app.post('/api/v1/users/:user_id/notifications/seen_at',
			mdw.validate('myself'),
			mdw.pop.populateUser({ force_presence: true }),
			api.users.updateNotificationsSeenAt
		);

		app.post('/api/v1/users/:user_id/notifications/clicked_at',
			mdw.validate('myself'),
			mdw.pop.populateUser({ force_presence: true }),
			api.users.updateNotificationsClickedAt
		);

		app.get('/api/v1/users/:user_id/cheers',
			mdw.validate('myself'),
			mdw.pop.populateUser({ force_presence: true }),
			api.users.fetchUserCheers
		);

		app.get('/api/v1/users/:user_id/notifications',
			mdw.validate('myself'),
			mdw.pop.populateUser({ force_presence: true }),
			api.users.fetchUserNotifications
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

	    app.patch('/api/v1/users/:user_id/onboarding',
	    	mdw.validate('myself'),
	    	mdw.validate('check_onboarding'),
	    	api.users.updateOnboarding
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
	    	mdw.realtime.updateChannelsRequest,
	    	mdw.notifier.addNotification('group_request'),
	    	mdw.realtime.pushNewRequest,
	    	mdw.alerter.sendEmail("new_cheers")
	    );

	    // [ @befores ] Renvoie la liste des groupes d'un évènement
	    app.get('/api/v1/befores/:before_id/groups',
	    	api.befores.fetchGroups
	    );

	    // [ @befores ] Change le statut d'un group : [ 'accepted', 'kicked' ]
	    app.post('/api/v1/befores/:before_id/groups',
	    	mdw.validate('before_group_status'),
	    	api.befores.changeGroupStatus,
	    	mdw.notifier.addNotification('group_status'),
	    	mdw.realtime.updateChannelsGroup,
	    	mdw.realtime.pushNewGroupStatus,
	    	mdw.alerter.sendEmail("new_match")
	    );

	    // [ @befores ] Renvoie la liste des befores les plus proches
	    app.get('/api/v1/befores.nearest',
	    	mdw.validate('before_nearest'),
	    	api.befores.fetchNearestBefores
	    );

	    // [ @befores ] Crée un nouvel évènement
	    app.post('/api/v1/befores',
	    	mdw.validate('create_before'),
	    	// mdw.meepass.updateMeepass('before_created'),
	    	api.befores.createBefore,
	    	mdw.notifier.addNotification('marked_as_host'),
	    	mdw.realtime.pushNewBefore,
	    	mdw.alerter.sendEmail("marked_as_host")
	    );

	     // [ @befores ] Fetch un before par son identifiant. 
	    app.get('/api/v1/befores/:before_id', 
	    	mdw.validate('before_fetch'),
	    	api.befores.fetchBeforeById
	    );

	    // [ @chat ] Renvoie l'historique des messages par chat id (MongoDB)
	    app.get('/api/v1/chats/:chat_id',
	    	mdw.validate('chat_fetch'),
	    	api.chats.fetchChatMessages
	    );

	    // [ @chat ] Post un nouvau message
	    app.post('/api/v1/chats/:chat_id',
	    	mdw.pop.populateUser({ force_presence: true }),
	    	mdw.validate('chat_message'),
	    	api.chats.addChatMessage,
	    	mdw.realtime.pushNewChatMessage,
	    	mdw.alerter.sendEmail("new_message")
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



		// [ @feedbacks ] 
		app.post('/api/v1/feedbacks', 
			mdw.validate('create_feedback'),
			mdw.alerter.sendEmail("new_feedback"),
			api.feedbacks.createFeedback
		);



	   	app.all('*', mdw.expose.sendResponse );




	};