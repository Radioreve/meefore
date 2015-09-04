
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
			LJ.fn.handleDomEvents_UI();
			LJ.fn.handleDomEvents_Profile();
			LJ.fn.handleDomEvents_Search();
			LJ.fn.handleDomEvents_Settings();

      LJ.fn.handleDomEventsChat();
      LJ.fn.handleDomEventsCreate();
      LJ.fn.handleDomEventsFilters();
      LJ.fn.handleDomEventsGroups();
      LJ.fn.handleDomEventsPreview();
      LJ.fn.handleDomEventsTabview();
      LJ.fn.handleDomEventsMap();
      LJ.fn.handleDomEventsSettings();

		},
		initPusherConnection: function(){

			console.log( window.pusher_app_id );
			LJ.pusher = new Pusher( window.pusher_app_id, {
				encrypted: true
			});

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

				var fb_friends_ids = _.pluck( fb_friends, 'id' );
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

			/* Set all app ui elements specific to user session */
			LJ.fn.initLayout( data.settings );

			/* Je sais plus trop cette fonction me soule! */
			LJ.fn.setLocalStoragePreferences();

			/* Init cloudinary fileupload with inputs */
			LJ.fn.initCloudinary( data.cloudinary_tags );

			/* Display Google Map upon which to render event markers */
			LJ.fn.initMap();
			LJ.fn.refreshMap();
			
			/* Update friends based on facebook activity on each connection */
			LJ.fn.fetchAndSyncFriends( LJ.fn.handleFetchAndSyncFriends );

			/* Fetch and display all events on map */
			LJ.fn.fetchEvents( LJ.fn.handleFetchEvents );

			/* Fetch and display my events on map */
			LJ.fn.fetchMyEvents( LJ.fn.handleFetchMyEvents );

			/* Convenience, out of tests */
			LJ.fn.api('get','users', function( err, users ){ LJ.cache.users = users; });

			/* Admin scripts. Every com is secured serverside */	
			if( LJ.user.access.indexOf('admin') != -1 )
				LJ.fn.initAdminMode();
			
		},
        subscribeToChannels: function( user ){
        	
          //registering default channels (me and public);
        	LJ.subscribed_channels = {};
        	_.keys( user.channels ).forEach(function( channel_key ){
        		LJ.subscribed_channels[ channel_key ] = LJ.pusher.subscribe( LJ.user.channels[ channel_key ]);
        	});

        LJ.subscribed_channels.public_chan.bind('new event created', LJ.fn.pushNewEvent );
        LJ.subscribed_channels.public_chan.bind('new event status' , LJ.fn.pushNewEventStatus );
        LJ.subscribed_channels.public_chan.bind('new test', LJ.fn.pushNewTest );

        }

}); //end LJ

$('document').ready(function(){
		

		/* Recursive initialisation of FB pluggin*/
		var initFB = function(time){
			if( typeof(FB) === 'undefined' ) return sleep(time, initFB )
			FB.init({
					    appId  	   : window.facebook_app_id,
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

var google_places = [

			{
    "place_id": "ChIJHcrWXNdx5kcRssJewNDrBRM",
    "geometry": {
        "location": {
            "G": 48.8526266,
            "K": 2.332816600000001
        }
    },
    "address_components": [
        {
            "long_name": "Rue du Four",
            "short_name": "Rue du Four",
            "types": [
                "route"
            ]
        },
        {
            "long_name": "Paris",
            "short_name": "Paris",
            "types": [
                "locality",
                "political"
            ]
        },
        {
            "long_name": "Paris",
            "short_name": "75",
            "types": [
                "administrative_area_level_2",
                "political"
            ]
        },
        {
            "long_name": "Île-de-France",
            "short_name": "IDF",
            "types": [
                "administrative_area_level_1",
                "political"
            ]
        },
        {
            "long_name": "France",
            "short_name": "FR",
            "types": [
                "country",
                "political"
            ]
        },
        {
            "long_name": "75006",
            "short_name": "75006",
            "types": [
                "postal_code"
            ]
        }
    ]
},
{
    "place_id": "ChIJMQN_lNlx5kcRwdvjSp5HeRw",
    "geometry": {
        "location": {
            "G": 48.8523123,
            "K": 2.334496100000024
        }
    },
    "address_components": [
        {
            "long_name": "Rue Princesse",
            "short_name": "Rue Princesse",
            "types": [
                "route"
            ]
        },
        {
            "long_name": "Paris",
            "short_name": "Paris",
            "types": [
                "locality",
                "political"
            ]
        },
        {
            "long_name": "Paris",
            "short_name": "75",
            "types": [
                "administrative_area_level_2",
                "political"
            ]
        },
        {
            "long_name": "Île-de-France",
            "short_name": "IDF",
            "types": [
                "administrative_area_level_1",
                "political"
            ]
        },
        {
            "long_name": "France",
            "short_name": "FR",
            "types": [
                "country",
                "political"
            ]
        },
        {
            "long_name": "75006",
            "short_name": "75006",
            "types": [
                "postal_code"
            ]
        }
    ]
},
{
    "place_id": "ChIJeY1zJctv5kcRmQRo7bqo_9w",
    "geometry": {
        "location": {
            "G": 48.87439939999999,
            "K": 2.3227203000000145
        }
    },
    "address_components": [
        {
            "long_name": "Boulevard Haussmann",
            "short_name": "Boulevard Haussmann",
            "types": [
                "route"
            ]
        },
        {
            "long_name": "Paris",
            "short_name": "Paris",
            "types": [
                "locality",
                "political"
            ]
        },
        {
            "long_name": "Paris",
            "short_name": "75",
            "types": [
                "administrative_area_level_2",
                "political"
            ]
        },
        {
            "long_name": "Île-de-France",
            "short_name": "IDF",
            "types": [
                "administrative_area_level_1",
                "political"
            ]
        },
        {
            "long_name": "France",
            "short_name": "FR",
            "types": [
                "country",
                "political"
            ]
        }
    ]
},
{
    "place_id": "ChIJpwykDdtx5kcR_eC7_rndRnc",
    "geometry": {
        "location": {
            "G": 48.84985959999999,
            "K": 2.338692100000003
        },
        "viewport": {
            "Ia": {
                "G": 48.84032209999999,
                "j": 48.852885
            },
            "Ca": {
                "j": 2.3322670000000016,
                "G": 2.342500100000052
            }
        }
    },
    "address_components": [
        {
            "long_name": "Odéon",
            "short_name": "Odéon",
            "types": [
                "neighborhood",
                "political"
            ]
        },
        {
            "long_name": "6e arrondissement",
            "short_name": "6e Arrondissement",
            "types": [
                "sublocality_level_1",
                "sublocality",
                "political"
            ]
        },
        {
            "long_name": "Paris",
            "short_name": "Paris",
            "types": [
                "locality",
                "political"
            ]
        },
        {
            "long_name": "Paris",
            "short_name": "75",
            "types": [
                "administrative_area_level_2",
                "political"
            ]
        },
        {
            "long_name": "Île-de-France",
            "short_name": "IDF",
            "types": [
                "administrative_area_level_1",
                "political"
            ]
        },
        {
            "long_name": "France",
            "short_name": "FR",
            "types": [
                "country",
                "political"
            ]
        }
    ]
},
{
    "place_id": "ChIJS_r6rAFy5kcRmEpmy97_TnA",
    "geometry": {
        "location": {
            "G": 48.853082,
            "K": 2.369002000000023
        }
    },
    "name":"Bastille",
    "address_components": [
        {
            "long_name": "France",
            "short_name": "FR",
            "types": [
                "country",
                "political"
            ]
        }
    ]
},
{
    "place_id": "ChIJHbrByclt5kcRn-ZGU8KjU_g",
    "geometry": {
        "location": {
            "G": 48.893849,
            "K": 2.390260000000012
        }
    },
    "address_components": [
        {
            "long_name": "211",
            "short_name": "211",
            "types": [
                "street_number"
            ]
        },
        {
            "long_name": "Avenue Jean Jaurès",
            "short_name": "Avenue Jean Jaurès",
            "types": [
                "route"
            ]
        },
        {
            "long_name": "Paris",
            "short_name": "Paris",
            "types": [
                "locality",
                "political"
            ]
        },
        {
            "long_name": "Paris",
            "short_name": "75",
            "types": [
                "administrative_area_level_2",
                "political"
            ]
        },
        {
            "long_name": "Île-de-France",
            "short_name": "IDF",
            "types": [
                "administrative_area_level_1",
                "political"
            ]
        },
        {
            "long_name": "France",
            "short_name": "FR",
            "types": [
                "country",
                "political"
            ]
        },
        {
            "long_name": "75019",
            "short_name": "75019",
            "types": [
                "postal_code"
            ]
        }
    ]
},
{
    "place_id": "ChIJOT-zhv1x5kcRL1VMROKC10U",
    "geometry": {
        "location": {
            "G": 48.855646,
            "K": 2.358804999999961
        }
    },
    "address_components": [
        {
            "long_name": "5",
            "short_name": "5",
            "types": [
                "street_number"
            ]
        },
        {
            "long_name": "Rue de Rivoli",
            "short_name": "Rue de Rivoli",
            "types": [
                "route"
            ]
        },
        {
            "long_name": "Paris",
            "short_name": "Paris",
            "types": [
                "locality",
                "political"
            ]
        },
        {
            "long_name": "France",
            "short_name": "FR",
            "types": [
                "country",
                "political"
            ]
        },
        {
            "long_name": "75004",
            "short_name": "75004",
            "types": [
                "postal_code"
            ]
        }
    ]
},
{
    "place_id": "ChIJDYQ94pVx5kcRbJ7IgfX0R-M",
    "geometry": {
        "location": {
            "G": 48.831161,
            "K": 2.343385000000012
        }
    },
    "address_components": [
        {
            "long_name": "France",
            "short_name": "FR",
            "types": [
                "country",
                "political"
            ]
        }
    ]
},
{
    "place_id": "ChIJRXxvdOxv5kcRxV7Y0Lb_Rzg",
    "geometry": {
        "location": {
            "G": 48.87323139999999,
            "K": 2.2946494999999913
        }
    },
    "address_components": [
        {
            "long_name": "Place Charles de Gaulle",
            "short_name": "Place Charles de Gaulle",
            "types": [
                "route"
            ]
        },
        {
            "long_name": "Paris",
            "short_name": "Paris",
            "types": [
                "locality",
                "political"
            ]
        },
        {
            "long_name": "Paris",
            "short_name": "75",
            "types": [
                "administrative_area_level_2",
                "political"
            ]
        },
        {
            "long_name": "Île-de-France",
            "short_name": "IDF",
            "types": [
                "administrative_area_level_1",
                "political"
            ]
        },
        {
            "long_name": "France",
            "short_name": "FR",
            "types": [
                "country",
                "political"
            ]
        }
    ]
},
{
    "place_id": "ChIJHbxOxY1x5kcRnpd3rjQUhos",
    "geometry": {
        "location": {
            "G": 48.830816,
            "K": 2.355389999999943
        }
    },
    "name": "Place d'Italie",
    "address_components": [
        {
            "long_name": "France",
            "short_name": "FR",
            "types": [
                "country",
                "political"
            ]
        }
    ]
},
{
    "place_id": "ChIJYRNhwB1u5kcR6nGuFaBU8j0",
    "geometry": {
        "location": {
            "G": 48.857494,
            "K": 2.351791999999932
        }
    },
    "name":"Hôtel de Ville",
    "address_components": [
        {
            "long_name": "France",
            "short_name": "FR",
            "types": [
                "country",
                "political"
            ]
        }
    ]
},
{
    "place_id": "ChIJ1fXA1ERu5kcRcIbgA4VK1H0",
    "geometry": {
        "location": {
            "G": 48.8867148,
            "K": 2.3388895000000502
        },
        "viewport": {
            "Ia": {
                "G": 48.8824973,
                "j": 48.8899191
            },
            "Ca": {
                "j": 2.327685400000064,
                "G": 2.3481130999999777
            }
        }
    },
    "address_components": [
        {
            "long_name": "Montmartre",
            "short_name": "Montmartre",
            "types": [
                "neighborhood",
                "political"
            ]
        },
        {
            "long_name": "18e Arrondissement",
            "short_name": "18e Arrondissement",
            "types": [
                "sublocality_level_1",
                "sublocality",
                "political"
            ]
        },
        {
            "long_name": "Paris",
            "short_name": "Paris",
            "types": [
                "locality",
                "political"
            ]
        },
        {
            "long_name": "Paris",
            "short_name": "75",
            "types": [
                "administrative_area_level_2",
                "political"
            ]
        },
        {
            "long_name": "Île-de-France",
            "short_name": "IDF",
            "types": [
                "administrative_area_level_1",
                "political"
            ]
        },
        {
            "long_name": "France",
            "short_name": "FR",
            "types": [
                "country",
                "political"
            ]
        },
        {
            "long_name": "75018",
            "short_name": "75018",
            "types": [
                "postal_code"
            ]
        }
    ]
},
{
    "place_id": "ChIJmT1JK6Rx5kcRPyHmfYws-xA",
    "geometry": {
        "location": {
            "G": 48.8215,
            "K": 2.3333599999999706
        }
    },
    "name":"Montsouris",
    "address_components": [
        {
            "long_name": "France",
            "short_name": "FR",
            "types": [
                "country",
                "political"
            ]
        }
    ]
},
{
    "place_id": "ChIJeZSvNDFu5kcRzGO0qYla4ow",
    "geometry": {
        "location": {
            "G": 48.8717109,
            "K": 2.3305685000000267
        }
    },
    "address_components": [
        {
            "long_name": "Rue Scribe",
            "short_name": "Rue Scribe",
            "types": [
                "route"
            ]
        },
        {
            "long_name": "Paris",
            "short_name": "Paris",
            "types": [
                "locality",
                "political"
            ]
        },
        {
            "long_name": "Paris",
            "short_name": "75",
            "types": [
                "administrative_area_level_2",
                "political"
            ]
        },
        {
            "long_name": "Île-de-France",
            "short_name": "IDF",
            "types": [
                "administrative_area_level_1",
                "political"
            ]
        },
        {
            "long_name": "France",
            "short_name": "FR",
            "types": [
                "country",
                "political"
            ]
        },
        {
            "long_name": "75009",
            "short_name": "75009",
            "types": [
                "postal_code"
            ]
        }
    ]
},
{
    "place_id": "ChIJyWPpag5y5kcRTlTrXVMUpLk",
    "geometry": {
        "location": {
            "G": 48.8467518,
            "K": 2.3817410000000336
        }
    },
    "address_components": [
        {
            "long_name": "Boulevard Diderot",
            "short_name": "Boulevard Diderot",
            "types": [
                "route"
            ]
        },
        {
            "long_name": "Paris",
            "short_name": "Paris",
            "types": [
                "locality",
                "political"
            ]
        },
        {
            "long_name": "Paris",
            "short_name": "75",
            "types": [
                "administrative_area_level_2",
                "political"
            ]
        },
        {
            "long_name": "Île-de-France",
            "short_name": "IDF",
            "types": [
                "administrative_area_level_1",
                "political"
            ]
        },
        {
            "long_name": "France",
            "short_name": "FR",
            "types": [
                "country",
                "political"
            ]
        },
        {
            "long_name": "75012",
            "short_name": "75012",
            "types": [
                "postal_code"
            ]
        }
    ]
},
{
    "place_id": "ChIJM0qPpvdt5kcR2kSeETMDz_Y",
    "geometry": {
        "location": {
            "G": 48.8576375,
            "K": 2.380338100000017
        }
    },
    "address_components": [
        {
            "long_name": "Boulevard Voltaire",
            "short_name": "Boulevard Voltaire",
            "types": [
                "route"
            ]
        },
        {
            "long_name": "Paris",
            "short_name": "Paris",
            "types": [
                "locality",
                "political"
            ]
        },
        {
            "long_name": "Paris",
            "short_name": "75",
            "types": [
                "administrative_area_level_2",
                "political"
            ]
        },
        {
            "long_name": "Île-de-France",
            "short_name": "IDF",
            "types": [
                "administrative_area_level_1",
                "political"
            ]
        },
        {
            "long_name": "France",
            "short_name": "FR",
            "types": [
                "country",
                "political"
            ]
        },
        {
            "long_name": "75011",
            "short_name": "75011",
            "types": [
                "postal_code"
            ]
        }
    ]
},
{
    "place_id": "ChIJ_1dbg_9w5kcRcD2LaMOCCwQ",
    "geometry": {
        "location": {
            "G": 48.816363,
            "K": 2.3173839999999473
        },
        "viewport": {
            "Ia": {
                "G": 48.809588,
                "j": 48.822288
            },
            "Ca": {
                "j": 2.30007999999998,
                "G": 2.332443000000012
            }
        }
    },
    "address_components": [
        {
            "long_name": "Montrouge",
            "short_name": "Montrouge",
            "types": [
                "locality",
                "political"
            ]
        },
        {
            "long_name": "Hauts-de-Seine",
            "short_name": "92",
            "types": [
                "administrative_area_level_2",
                "political"
            ]
        },
        {
            "long_name": "Île-de-France",
            "short_name": "IDF",
            "types": [
                "administrative_area_level_1",
                "political"
            ]
        },
        {
            "long_name": "France",
            "short_name": "FR",
            "types": [
                "country",
                "political"
            ]
        }
    ]
},
{
    "place_id": "ChIJW3Vm7Mdx5kcRkEScBoLkxck",
    "geometry": {
        "location": {
            "G": 48.8372728,
            "K": 2.3353872999999794
        },
        "viewport": {
            "Ia": {
                "G": 48.831789,
                "j": 48.8436171
            },
            "Ca": {
                "j": 2.321454000000017,
                "G": 2.342012000000068
            }
        }
    },
    "address_components": [
        {
            "long_name": "Montparnasse",
            "short_name": "Montparnasse",
            "types": [
                "neighborhood",
                "political"
            ]
        },
        {
            "long_name": "14e Arrondissement",
            "short_name": "14e Arrondissement",
            "types": [
                "sublocality_level_1",
                "sublocality",
                "political"
            ]
        },
        {
            "long_name": "Paris",
            "short_name": "Paris",
            "types": [
                "locality",
                "political"
            ]
        },
        {
            "long_name": "Paris",
            "short_name": "75",
            "types": [
                "administrative_area_level_2",
                "political"
            ]
        },
        {
            "long_name": "Île-de-France",
            "short_name": "IDF",
            "types": [
                "administrative_area_level_1",
                "political"
            ]
        },
        {
            "long_name": "France",
            "short_name": "FR",
            "types": [
                "country",
                "political"
            ]
        }
    ]
}

		];