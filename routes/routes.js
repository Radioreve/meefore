	var _ = require('lodash');

	var pusher = require('../globals/pusher');

	var pushEventsDir = '../pushevents/',
	    apiDir = '../api/';

	var initEvents     = require( pushEventsDir + 'initEvents'),
		profileEvents  = require( pushEventsDir + 'profileEvents'),
		settingsEvents = require( pushEventsDir + 'settingsEvents'),
		adminEvents    = require( pushEventsDir + 'adminEvents'),
		signEvents     = require( pushEventsDir + 'signEvents');

	var api = {}
	//	api.tests     = require( apiDir + 'tests');
		api.users     = require( apiDir + 'users');
		api.events    = require( apiDir + 'events');
		api.places    = require( apiDir + 'places');
		api.ambiances = require( apiDir + 'ambiances');
		api.chats     = require( apiDir + 'chats');

	var mdw = {};
		mdw.auth     = require('../middlewares/auth');
		mdw.email    = require('../middlewares/email');
		mdw.pop      = require('../middlewares/pop');
		mdw.facebook = require('../middlewares/facebook');
		mdw.validate = require('../middlewares/validate');


	module.exports = function( app ) {


		//      All api calls are handled this way : 
		//		
		//	    % app.verb( url ) 
		//		% mdw.auth.authenticate 					% ---> Make sure user authenticated and populates req.facebook_id
		//		% mdw.validate( namespace, [ properties ] ) % ---> Make sure data is properlly formatted and action is authorized 
		//		% controller.handler 						% ---> Make the call ( Redis & MongoDB )							
		//



		// Merge all body, query and params property 
		// Subsequent validation modules will look if each property they are looking for
		// is anywhere to be found and properly formatted
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
	    	signEvents.sendHomepage);


	    // Redirection à la page d'accueil
	    app.get('/',
	    	signEvents.redirectToHome);


	    // Serve early adopter pages
	    app.get('/earlyadopters',
	    	signEvents.sendEarlyAdoptersPage);

	    // Provide valid token based on secret key, for api calls
		app.post('/auth/token',
			mdw.auth.makeToken )

	    // Initialisation | Check if user exists / create profile if not, subscribe to mailchimp
	    app.post('/auth/facebook',
	    	mdw.pop.populateUser({force_presence: false }),
	    	mdw.email.subscribeMailchimpUser,
	    	signEvents.handleFacebookAuth);


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

	    // [ @user ] Update ux settings
	    app.post('/me/update-settings-ux',
	    	settingsEvents.updateSettingsUx);

	    // [ @user ] Update notification settings 
	    app.post('/me/update-settings-mailinglists',
	    	mdw.pop.populateUser({ force_presence: true }),
	    	mdw.email.updateMailchimpUser,
	    	settingsEvents.updateSettingsMailinglists);

	    // [ @user ] Utilisé pour afficher le profile d'un utilisateur
	    app.get('/api/v1/users/:user_facebook_id',   //otherwise override with asker facebook_id
	    	mdw.validate('user_fetch', ['user_fetch'] ),
	    	api.users.fetchUserById);

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
	    	api.events.request );

	    // [ @events ] Renvoie la liste des groupes d'un évènement
	    app.get('/api/v1/events/:event_id/groups',
	    	api.events.fetchGroups );

	    // [ @events ] Change le statut d'un group : [ 'accepted', 'kicked' ]
	    app.patch('/api/v1/events/:event_id/groups/:group_id/status',
	    	mdw.validate('group_status', ['event_group_status']),
	    	api.events.changeGroupStatus );

	    // [ @events ] Renvoie la liste de tous les évènements ! 
	    app.get('/api/v1/events',
	    	api.events.fetchEvents );

	    // [ @events ] Crée un nouvel évènement
	    app.post('/api/v1/events',
	    	mdw.validate('create_event', ['create_event']),
	    	api.events.createEvent );



	    // [ @chat ] Renvoie l'historique des messages par chat id
	    app.get('/api/v1/chats/:chat_id',
	    	mdw.validate('chat_fetch', ['chat_fetch']),
	    	api.chats.fetchChatMessages );

	    // [ @chat ] Post un nouvau message
	    app.post('/api/v1/chats/:chat_id',
	    	mdw.validate('chat_message', ['chat_message']),
	    	api.chats.addChatMessage );

	    // [ @chat ] Poste le fait qu'un user ai lu un message
	    app.post('/api/v1/chats/:chat_id/readby',
	    	mdw.validate('chat_readby', ['chat_readby']),
	    	api.chats.setReadBy );








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



	    //Rest api ambiances
	    app.get('/api/v1/ambiances', api.ambiances.fetchAmbiances);
	    app.post('/api/v1/ambiances', api.ambiances.createAmbiance);

	    //Rest api places
	    app.get('/api/v1/places', api.places.fetchPlaces);
	    app.post('/api/v1/places', api.places.createPlace);



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


	    //Events relatif aux tests
	    app.post('/test/:test_val', mdw.validate('test',['create_event']), function( req, res ){
	    	res.json({ msg: "validaton passed", data: res.event_data });;
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