
function sleep(ms,cb,p2){setTimeout(function(){cb(p2);},ms)}
function look(json){ return JSON.stringify(json, null, '\t'); }
window.csl = function(msg){
	delog(msg);
};

window.LJ.fn = _.merge( window.LJ.fn || {}, 

{

		init: function(o){

				if( o.debug )
					LJ.state.debug = true;
			
				// Landing page animation 
				this.initAppBoot();

				// Ajax setup 
				this.initAjaxSetup();				

				// Bind UI action with the proper handler 
				this.handleDomEvents();

				// Gif loader and placeholder 
				this.initStaticImages();

				// Init Pusher Connexion via public chan 
				this.initPusherConnection();

				// Augment lodash 
				this.initAugmentations();

				// Typeahead pluggin 
				this.initTypeahead();

				// Country detection
				this.initCountry();		


		},
		initCountry: function(){

			moment.locale('fr');

		},
		initTypeahead: function(){

			LJ.fn.initTypeaheadUsers();

		},
		initAugmentations: function(){

			/* La base! */
			_.mixin({
			    pluckMany: function() {
			        var array = arguments[0],
			            propertiesToPluck = _.rest(arguments, 1);
			        return _.map(array, function(item) {
			            return _.partial(_.pick, item).apply(null, propertiesToPluck);
			        });
				}
			});

		},
		initAjaxSetup: function(){

			$.ajaxSetup({
				error: function( xhr ){
					LJ.fn.handleServerError( xhr );
				},
				complete: function(){
					setTimeout( function(){
						LJ.fn.hideLoaders();
					}, LJ.ui.artificialDelay );
				}
			})

		},
		handleDomEvents: function(){

			LJ.fn.handleDomEvents_Globals();
			LJ.fn.handleDomEvents_Landing();
			LJ.fn.handleDomEvents_Navbar();
			LJ.fn.handleDomEvents_Profile();
			LJ.fn.handleDomEvents_Create();
			LJ.fn.handleDomEvents_Search();
			LJ.fn.handleDomEvents_Settings();

		},
		initPusherConnection: function(){

			LJ.pusher = new Pusher('9d9e7859b349d1abe8b2');

			LJ.pusher.connection.bind('state_change', function( states ) {
				csl('Pusher state is noww : ' + states.current );

				if( (states.current == 'connecting') && LJ.state.connected  )
					LJ.fn.toastMsg("La connexion a été interrompue", 'success', true);
				
				if( states.current == 'disconnected' )				
					LJ.fn.toastMsg("Vous avez été déconnecté.", 'error', true);
				
				if( states.current == 'unavailable' )
					LJ.fn.toastMsg("Le service n'est pas disponible actuellement, essayez de relancer l'application ", 'error', true);
				
				if( states.current == 'connected' && LJ.state.connected )
					LJ.fn.say('auth/app', { userId: LJ.user._id }, { success: LJ.fn.handleFetchUserAndConfigurationSuccess });

			});

			LJ.pusher.connection.bind('connected', function() {
				csl('Pusher connexion is initialized');
			});

			LJ.pusher.connection.bind('disconnected', function(){
				alert('hey');
			});


		},
		initStaticImages: function(){

			LJ.$main_loader = $.cloudinary.image( LJ.cloudinary.loaders.main.id, LJ.cloudinary.loaders.main.params );
			LJ.$main_loader.appendTo( $('.loaderWrap') );

			LJ.$mobile_loader = $.cloudinary.image( LJ.cloudinary.loaders.mobile.id, LJ.cloudinary.loaders.mobile.params );
			LJ.$mobile_loader.appendTo( $('.m-loaderWrap'));

			LJ.$bar_loader = $.cloudinary.image( LJ.cloudinary.loaders.bar.id, LJ.cloudinary.loaders.bar.params );
			/* Dynamically cloned and appended */

			LJ.$spinner_loader = $.cloudinary.image( LJ.cloudinary.loaders.spinner.id, LJ.cloudinary.loaders.spinner.params );
			/* Dynamically cloned and appended */

			LJ.$curtain_loader = $.cloudinary.image( LJ.cloudinary.loaders.curtain.id, LJ.cloudinary.loaders.curtain.params );
			/* Dynamically cloned and appended */
			

		},
		fetchAndSyncFriends: function( callback ){

			LJ.fn.GraphAPI('/me/friends', function( res ){

				var fb_friends = res.data;

				var fb_friends_ids = _.pluck( res.data, 'id' );
				var data = { userId: LJ.user._id, fb_friends_ids: fb_friends_ids };

				$.ajax({
					method:'post',
					url:'/me/fetch-and-sync-friends',
					data: data,
					success: function( data ){
						callback( null, data );
					},
					error: function( xhr ){
						callback( JSON.parse( xhr ).responseText, null);
					}
				});

			});

		},
        initLayout: function( settings ){

        	/* Mise à jour dynamique des filters */
        	$('.mood-wrap').html( LJ.fn.renderMoodInProfile( LJ.settings.app.mood ));
        	$('.drink-wrap').html( LJ.fn.renderDrinkInProfile( LJ.settings.app.drink ));
        	$('.filter-mixity').html( LJ.fn.renderMixityInFilters( LJ.settings.app.mixity ));
        	$('.filter-agerange').html( LJ.fn.renderAgerangeInFilters( LJ.settings.app.agerange ));
        	$('#no').html('').append( LJ.tpl.noResults );


    		/* Profile View */
			//$('.row-subheader').find('span').text( LJ.user._id );
			$('.row-name').find('input').val( LJ.user.name );
			$('.row-age').find('input').val( LJ.user.age );
			$('.row-motto').find('input').val( LJ.user.motto );
			$('.row-job').find('input').val( LJ.user.job );
			$('.drink[data-selectid="'+LJ.user.drink+'"]').addClass('selected');
			$('.mood[data-selectid="'+LJ.user.mood+'"]').addClass('selected');

			/* Settings View */
			_.keys( LJ.user.app_preferences ).forEach( function( key ){
				_.keys( LJ.user.app_preferences[ key ] ).forEach( function( sub_key ){
					var value = LJ.user.app_preferences[ key ][ sub_key ];
					$('.row-select.' + sub_key + '[data-selectid="'+value+'"]').addClass('selected');
				});
			});


			/* Mise à jour des images placeholders */
			$('.picture-wrap').html( LJ.fn.renderProfilePicturesWraps );
			var $placeholder = $.cloudinary.image( LJ.cloudinary.placeholder.id, LJ.cloudinary.placeholder.params );
				$('.picture').prepend( $placeholder );

			/* Update de toutes les images */
			for( var i = 0; i < LJ.user.pictures.length; i++){
				LJ.user.pictures[i].scope = ['profile'];
				LJ.fn.replaceImage( LJ.user.pictures[i] );
			}

			LJ.fn.displayPictureHashtags();

			/* ThumbHeader View */
			LJ.$thumbWrap.find( 'h2#thumbName' ).text( LJ.user.name );
			var d = LJ.cloudinary.displayParamsHeaderUser;

			var mainImg = LJ.fn.findMainImage();
				d.version = mainImg.img_version;

			var imgTag = $.cloudinary.image( mainImg.img_id, d );
				imgTag.addClass('left');

			LJ.$thumbWrap.find('.imgWrap').html('').append( imgTag );

			/* Settings View */
			$('#newsletter').prop( 'checked', LJ.user.newsletter );
			$('#currentEmail').val( LJ.user.email );


        	/* Initialisation du friendspanel */
        	$('#friendsWrap').jScrollPane();
        	LJ.state.jspAPI['#friendsWrap'] = $('#friendsWrap').data('jsp');

    		/* L'user était déjà connecté */
			if( LJ.state.connected )
				return LJ.fn.toastMsg('Vous avez été reconnecté', 'success');
				
			LJ.state.connected = true;

			$('.menu-item-active').removeClass('menu-item-active');

			var $landingView;
			if( LJ.user.status == 'idle' ){
				$landingView = '#eventsWrap';
				$('#management').addClass('filtered');
	            $('#events').addClass('menu-item-active')
	            			.find('span').velocity({ opacity: [1,0], translateY: [0, -5] });
			}

			if( LJ.user.status == 'hosting' ){
				$landingView = '#manageEventsWrap';
				$('#create').addClass('filtered');
	            $('#management').addClass('menu-item-active')
	            			.find('span').velocity({ opacity: [1,0], translateY: [0, -5] });
	            LJ.fn.fetchAskers();
			}

			if( LJ.user.status == 'new' ){
				$landingView = '#profileWrap';
				$('#management').addClass('filtered');
	            $('#profile').addClass('menu-item-active')
	            			.find('span').velocity({ opacity: [1,0], translateY: [0, -5] });

			}
			function during_cb(){	

				/* Landing Page View */				
				$('#facebook_connect').remove();
				$('#logo-hero').remove();
        		$('.hero-img').remove();
				$('#landingWrap').remove();
				$('body > header').removeClass('none');
				$('body').css({'background':'none'});
        		$('#mainWrap').css({'background':'url(/img/crossword.png)'});	
        		$('.auto-login-msg').velocity('transition.fadeOut');

			};		

			function after_cb(){

				$('#thumbWrap').velocity('transition.slideUpIn',{duration:1000});
				$('.menu-item').velocity({ opacity: [1, 0] }, {
					display:'inline-block',
					duration: 800,
					complete: function(){

						$('.menu-item').each( function( i, el ){
							$(el).append('<span class="bubble filtered"></span>')
						});

						if( LJ.user.status == 'new' )
							LJ.fn.initTour();

						if( LJ.user.friends.length == 0 )
					 		LJ.fn.toastMsg("Aucun de vos amis Facebook n'est sur meefore. Invitez-en !","info");
				
					}
				});
			};

            LJ.fn.displayContent( $landingView, {
            	 during_cb: during_cb,
            	 after_cb: after_cb,
            	 mode:'curtain',
            	 myWayIn: 'transition.slideDownIn',
            	 myWayOut: 'transition.slideUpOut',
            	 prev:'revealed'
            });

        },
		handleFetchUserAndConfigurationSuccess: function( data ){

			delog('Fetching user and config success');

			LJ.user = data.user;
			LJ.settings = data.settings;

			/* Register to Pusher based on users channels */
			LJ.fn.subscribeToChannels( data.user );

			/* Pusher events handlers | functions come from other modules*/
			LJ.fn.initChannelListeners();
			
			/* Set all app ui elements specific to user session */
			LJ.fn.initLayout( data.settings );

			/* Je sais plus trop cette fonction me soule! */
			LJ.fn.setLocalStoragePreferences();

			/* Init cloudinary fileupload with inputs */
			LJ.fn.initCloudinary( data.cloudinary_tags );

			/* Display Google Map upon which to render event markers */
			LJ.fn.initMap();

			/* Update friends based on facebook activity on each connection */
			LJ.fn.fetchAndSyncFriends( LJ.fn.handleFetchAndSyncFriends );

			/* Fetch and display all events on map and on preview/inview */
			LJ.fn.fetchEvents( LJ.fn.handleFetchEvents );

			/* Convenience, out of tests */
			LJ.fn.api('get','users', function( err, users ){ LJ.cache.users = users; });

			/* Admin scripts. Every com is secured serverside */	
			if( LJ.user.access.indexOf('admin') != -1 )
				LJ.fn.initAdminMode();
			
		},
        subscribeToChannels: function( user ){
        	
        	_.keys( user.channels ).forEach(function( channel_key ){
        		LJ.pusher_channels[ channel_key ] = LJ.pusher.subscribe( LJ.user.channels[ channel_key ]);
        	});
        	
        },
        initChannelListeners: function(){


        }

}); //end LJ

$('document').ready(function(){
		

		/* Recursive initialisation of FB pluggin*/
		var initFB = function(time){
			if( typeof(FB) === 'undefined' ) return sleep(time, initFB )
			FB.init({
					    appId      : '1509405206012202',
					    xfbml      : true,  // parse social plugins on this page
					    version    : 'v2.1' // use version 2.1
				});
			LJ.fn.init({ debug: true });
			csl('Application ready!');
		}

		initFB(300);

});


function delog(msg){
	if( LJ.state.debug )
		console.log(msg);
}



window.dumdata = [
  {
    "_id": "55aa651dd00913bc0a5b9eed",
    "index": 0,
    "guid": "8c2a16ea-1eb6-4fb4-a2a8-0cf3815cae43",
    "isActive": true,
    "picture": "http://placehold.it/32x32",
    "age": 26,
    "name": "Fannie Cain",
    "gender": "female",
    "email": "fanniecain@telequiet.com",
    "registered": "2014-02-20T07:16:14 -01:00",
    "latitude": 79.631695,
    "longitude": -13.765706,
    "tags": [
      "qui",
      "est",
      "culpa",
      "non",
      "cillum",
      "aliquip",
      "laboris"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Rene Reed"
      },
      {
        "id": 1,
        "name": "Francine Banks"
      },
      {
        "id": 2,
        "name": "Susan Strong"
      }
    ],
    "greeting": "Hello, Fannie Cain! You have 4 unread messages.",
    "favoriteFruit": "apple"
  },
  {
    "_id": "55aa651dadb7755339c32793",
    "index": 1,
    "guid": "e93dee0b-d865-4c70-86e1-4a0600e95cc0",
    "isActive": true,
    "picture": "http://placehold.it/32x32",
    "age": 40,
    "name": "Bauer Bird",
    "gender": "male",
    "email": "bauerbird@telequiet.com",
    "registered": "2014-11-02T13:09:28 -01:00",
    "latitude": 83.599981,
    "longitude": 127.370264,
    "tags": [
      "est",
      "velit",
      "in",
      "veniam",
      "labore",
      "laborum",
      "voluptate"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Stark Wiley"
      },
      {
        "id": 1,
        "name": "Bonnie George"
      },
      {
        "id": 2,
        "name": "Higgins Shepard"
      }
    ],
    "greeting": "Hello, Bauer Bird! You have 1 unread messages.",
    "favoriteFruit": "banana"
  },
  {
    "_id": "55aa651df3ddc578abf5b576",
    "index": 2,
    "guid": "65ff1b0f-127f-4549-900b-7bf61cf9f683",
    "isActive": false,
    "picture": "http://placehold.it/32x32",
    "age": 21,
    "name": "Tessa Anthony",
    "gender": "female",
    "email": "tessaanthony@telequiet.com",
    "registered": "2015-06-12T13:19:33 -02:00",
    "latitude": -83.109766,
    "longitude": -90.599844,
    "tags": [
      "dolor",
      "et",
      "voluptate",
      "ut",
      "ipsum",
      "ut",
      "exercitation"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Thelma Wagner"
      },
      {
        "id": 1,
        "name": "Denise Barrera"
      },
      {
        "id": 2,
        "name": "Alexander David"
      }
    ],
    "greeting": "Hello, Tessa Anthony! You have 1 unread messages.",
    "favoriteFruit": "banana"
  },
  {
    "_id": "55aa651daa2c00a661e298be",
    "index": 3,
    "guid": "008c2b0a-9aff-4767-8a2b-b0f6935ac7e5",
    "isActive": false,
    "picture": "http://placehold.it/32x32",
    "age": 20,
    "name": "Renee Henry",
    "gender": "female",
    "email": "reneehenry@telequiet.com",
    "registered": "2014-07-13T04:19:49 -02:00",
    "latitude": -82.359818,
    "longitude": -110.960972,
    "tags": [
      "mollit",
      "nostrud",
      "ullamco",
      "ad",
      "sit",
      "eu",
      "sit"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Rosario Freeman"
      },
      {
        "id": 1,
        "name": "Blevins Carroll"
      },
      {
        "id": 2,
        "name": "Elinor Norton"
      }
    ],
    "greeting": "Hello, Renee Henry! You have 8 unread messages.",
    "favoriteFruit": "apple"
  }
]




window.dum_places = [
	{
		id: '1',
		name:'Le barilleur',
		address: 'blabla',
		tag: 'bar'
	},
	{
		id: '2',
		name:'Le Duplexe',
		address: 'blabla',
		tag: 'nightclub'
	},
	{
		id: '3',
		name:'Le Violondingue',
		address: 'blabla',
		tag: 'bar dansant'
	},
	{
		id: '4',
		name:'Le Rex Club',
		address: 'blabla',
		tag: 'nightclub'
	},
	{
		id: '5',
		name:'O\'Sullivans',
		address: 'blabla',
		tag: 'bar'
	}
];