	
	window.LJ = _.merge( window.LJ || {}, 

{
    settings: {
        app: {}
    },
	accessToken:'',
	ui:{
		nearest_event_opacity: '.5',
		artificialDelay: 700,
		minimum_loading_time: 500,

        //Down
		slideDownInLight:  { opacity: [1, 0], translateY: [0, 10]   },
        slideDownInVeryLight:  { opacity: [1, 0], translateY: [0, 7]   },

        //Up
		slideUpOutLight: { opacity: [0, 1], translateY: [-10, 0]   },
		slideUpOutVeryLight: { opacity: [0, 1], translateY: [-7, 0]   },
        slideUpInLight: { opacity: [1, 0], translateY: [0, -10]   },
        slideUpInVeryLight: { opacity: [1, 0], translateY: [0, -7]   },

        //Left
		slideLeftInLight:  { opacity: [1, 0], translateX: [0, -10]   },
		slideLeftOutLight:  { opacity: [0, 1], translateX: [-10, 0]   },
        slideLeftInVeryLight:  { opacity: [1, 0], translateX: [0, -7]   },
        slideLeftOutVeryLight:  { opacity: [0, 1], translateX: [-7, 0]   },

        //Right
        slideRightInLight: { opacity: [1, 0], translateX: [0, 10]   },
		slideRightOutLight: { opacity: [0, 1], translateX: [10, 0]   },
        slideRightInVeryLight: { opacity: [1, 0], translateX: [0, 7]   },
        slideRightOutVeryLight: { opacity: [, 1], translateX: [7, 0]   }
	},
    page_default_title: "Meefore | Home",
    event_markers_intro: [],
    party_markers_intro: [],
    intro: {
        event_data: {
            "__v": 0,
            "begins_at": "2025-11-02T19:30:07.000Z",
            "timezone": 60,
            "created_at": "2015-11-02T12:18:07.000Z",
            "_id": "5637547fff83d96c44fe3aa8",
            "meta": [],
            "groups": [],
            "agerange": "20-26",
            "party": {
                "type": "anytype",
                "address": {
                    "city_name": "Earth",
                    "place_name": "Bastille",
                    "place_id": "ChIJS_r6rAFy5kcRmEpmy97_TnA",
                    "lng": 2.369002000000023,
                    "lat": 48.853082
                }
            },
            "address": {
                "city_name": "Paris",
                "place_name": "Rue du Bac",
                "place_id": "ChIJOQ6CxtVx5kcRd4vbzGeYf_w",
                "lng": 2.3249530000000505,
                "lat": 48.85537069999999
            },
            "type": "before",
            "status": "open",
            "hosts": [
                {
                    "main_picture": {
                        "hashtag": "meerofka",
                        "is_main": true,
                        "img_place": 1,
                        "img_version": "1445890265",
                        "img_id": "55e85819bc81dcecc1601e4d--1"
                    },
                    "channels": {
                        "me": "121428001540741",
                        "public_chan": "app"
                    },
                    "country_code": "us",
                    "mood": "happy",
                    "drink": "shots",
                    "name": "Jennifer Jenr",
                    "job": "",
                    "gender": "female",
                    "age": 18,
                    "signup_date": "2015-09-03T14:24:25.000Z",
                    "facebook_url": "https://www.facebook.com/app_scoped_user_id/121428001540741/",
                    "facebook_id": "jenn"
                },
                {
                    "main_picture": {
                        "hashtag": "classic",
                        "is_main": true,
                        "img_place": 0,
                        "img_version": "1444491565",
                        "img_id": "55e85897bc81dcecc1601e4e--0"
                    },
                    "channels": {
                        "me": "142944122715258",
                        "public_chan": "app"
                    },
                    "country_code": "fr",
                    "mood": "happy",
                    "drink": "water",
                    "name": "Kaitlin Kal",
                    "job": "",
                    "gender": "female",
                    "age": 18,
                    "signup_date": "2015-09-03T14:26:31.000Z",
                    "facebook_url": "https://www.facebook.com/app_scoped_user_id/142944122715258/",
                    "facebook_id": "kait"
                },
                {
                    "main_picture": {
                        "hashtag": "meerofka",
                        "is_main": true,
                        "img_place": 1,
                        "img_version": "1445890096",
                        "img_id": "561ec5f190a94cdc5229a0f5--1"
                    },
                    "channels": {
                        "me": "122537181435106",
                        "public_chan": "app"
                    },
                    "country_code": "fr",
                    "mood": "happy",
                    "drink": "water",
                    "name": "Ben Beaumec",
                    "job": "",
                    "gender": "male",
                    "age": 18,
                    "signup_date": "2015-10-14T21:15:29.000Z",
                    "facebook_url": "https://www.facebook.com/app_scoped_user_id/122537181435106/",
                    "facebook_id": "benb"
                },
                {
                    "main_picture": {
                        "img_id": "5622110750ccf4741d63be8f--0",
                        "img_version": "1445890920",
                        "img_place": 0,
                        "is_main": true,
                        "hashtag": "classic"
                    },
                    "channels": {
                        "me": "139625316382924",
                        "public_chan": "app"
                    },
                    "country_code": "us",
                    "mood": "happy",
                    "drink": "water",
                    "name": "David Dav",
                    "job": "",
                    "gender": "male",
                    "age": 18,
                    "signup_date": "2015-10-17T09:12:39.000Z",
                    "facebook_url": "https://www.facebook.com/app_scoped_user_id/139625316382924/",
                    "facebook_id": "will"
                }
            ]
        },
        party_data: {
            "_id": "5629550f2157aaf81eb43a2c",
            "address" : {
                "city_name" : "Paris",
                "place_name": "Bastille",
                "place_id": "ChIJS_r6rAFy5kcRmEpmy97_TnA",
                "lng": 2.369002000000023,
                "lat": 48.853082
            },
            "attendees" : "280-450",
            "begins_at" : "2014-10-22T20:00:00.923Z",
            "created_at" : "2015-10-22T21:28:47.000Z",
            "ends_at" : "2014-10-23T20:00:00.926Z",
            "hosted_by" : "OMG Nightclub",
            "link" : "http://www.bitoku.com",
            "name" : "The Gamma Party",
            "picture_url" : "http://res.cloudinary.com/radioreve/image/upload/v1445867671/lp1.jpg",
            "status" : "open",
            "timezone" : 120,
            "type" : "school"
        },
        message_data_user_1: {
            name: "Will",
            img_id: "5622110750ccf4741d63be8f--0",
            img_vs: "1445890920",
            facebook_id: "will"
        },
        message_data_user_2: {
            name: "Sandy",
            img_id: "55e85897bc81dcecc1601e4e--0",
            img_vs: "1444491565",
            facebook_id: "sandy"
        },
        events_data: [{
            _id: 'intro_1',
            party: {
                "type": "anytype",
                "address": {
                    "city_name": "Earth",
                    "place_name": "Bastille",
                    "place_id": "ChIJS_r6rAFy5kcRmEpmy97_TnA",
                    "lng": 2.369002000000023,
                    "lat": 48.853082
                }
            },
            address: {
                lat: 48.84726471793433,
                lng: 2.3407745361328125
            }
        }, {
            _id: 'intro_2',
            party: {
                "type": "anytype",
                "address": {
                    "city_name": "Earth",
                    "place_name": "Bastille",
                    "place_id": "ChIJS_r6rAFy5kcRmEpmy97_TnA",
                    "lng": 2.369002000000023,
                    "lat": 48.853082
                }
            },
            address: {
                lat: 48.84189859515306,
                lng: 2.3596572875976562
            }
        }, {
            _id: 'intro_3',
            party: {
                "type": "anytype",
                "address": {
                    "city_name": "Earth",
                    "place_name": "Bastille",
                    "place_id": "ChIJS_r6rAFy5kcRmEpmy97_TnA",
                    "lng": 2.369002000000023,
                    "lat": 48.853082
                }
            },
            address: {
                lat: 48.860931611800865,
                lng: 2.3534774780273438
            }
        }, {
            _id: 'intro_4',
            party: {
                "type": "anytype",
                "address": {
                    "city_name": "Earth",
                    "place_name": "Bastille",
                    "place_id": "ChIJS_r6rAFy5kcRmEpmy97_TnA",
                    "lng": 2.369002000000023,
                    "lat": 48.853082
                }
            }, address: {
                lat: 48.85968932107463,
                lng: 2.3886680603027344
            }
        }, {
            _id: 'intro_5',
            party: {
                "type": "anytype",
                "address": {
                    "city_name": "Earth",
                    "place_name": "Bastille",
                    "place_id": "ChIJS_r6rAFy5kcRmEpmy97_TnA",
                    "lng": 2.369002000000023,
                    "lat": 48.853082
                }
            },
            address: {
                lat: 48.84613505565775,
                lng: 2.377767562866211
            }
        }]
    },
	jsp_api: {},
	cache: {
        events : [],
        users  : []
	},
    bot_profile: {
        name        : "meebot",
        facebook_id : "1337",
        img_id      : "logo_black_on_white",
        img_version : "1438073167"

    },
	cloudinary:{
		uploadParams: { cloud_name:"radioreve", api_key:"835413516756943" },

		/* Image de l'host dans un event */
		displayParamsEventHost: { cloud_name :"radioreve", width: 80, height: 80, crop: 'fill', gravity: 'face', radius: '2' },

        /* Image des askers dans la vue event */
        displayParamsEventAsker: { cloud_name: "radioreve", width:45, height:45, crop:'fill', gravity:'face', radius:'0' },

		/* Image du user dans le header */
		displayParamsHeaderUser: { cloud_name: "radioreve",width: 50,height: 50, crop: 'fill', gravity: 'face', radius: 'max' },

		/* Image zoom lorsqu'on clique sur une photo*/
		displayParamsOverlayUser: { cloud_name: "radioreve", width: 280, height: 280, crop: 'fill', gravity: 'face', radius: 'max' },

        /* Image principale des askers dans vue managemnt */
        displayParamsAskerMain: { cloud_name: "radioreve", width:120, height:120, crop:'fill', gravity:'face', radius:3 },

		/* Image secondaire des askers dans vue management */
        displayParamsAskerThumb: { cloud_name: "radioreve", width:45, height:45, crop:'fill', gravity:'face', radius:'max' },

        /* Image secondaire des askers dans vue management, lorsqu'ils sont refusé */
        displayParamsAskerThumbRefused: { cloud_name: "radioreve", width:45, height:45, crop:'fill', effect:'grayscale', gravity:'face', radius:'max' },
        
		/* Image of friends in profile view */
		profile: {
			me: {
				params: { cloud_name: "radioreve", width: 150, height: 150, crop: 'fill', gravity: 'face' }
			},
			friends: {
				params: { cloud_name: "radioreve", 'class': 'rounded', width: 50, height: 50, crop: 'fill', gravity: 'face' }
			}
		},
		events:
		{
			map: {
				hosts: {
					params: { cloud_name: "radioreve", 'class': 'rounded detailable', width: 42, height: 42, crop: 'fill', gravity: 'face'}
				}
			},
			preview: {
				hosts: {
					params: { cloud_name: "radioreve", 'class': 'rounded detailable', width: 62, height: 62, crop: 'fill', gravity: 'face'}
				}
			},
			group: {
				params: { cloud_name: "radioreve", 'class': 'rounded detailable', width: 40, height: 40, crop: 'fill', gravity: 'face' }
			},
			chat: {
				params: { cloud_name: "radioreve", 'class': 'rounded', width: 30, height: 30, crop: 'fill', gravity: 'face' }
			}
		},
		create: {
			friends: {
				params: { cloud_name: "radioreve", 'class': 'friend-img none rounded', width: 24, height: 24, crop: 'fill', gravity: 'face' }
			}
		},
		search: {
			user: {
				params: { cloud_name: "radioreve", 'class': 'super-centered rounded', width: 40, height: 40, crop: 'fill', gravity: 'face'}
			}
		},
		markers: {
			base: {
                open: {
                    url: 'http://res.cloudinary.com/radioreve/image/upload/v1442418376/marker_dark.png'
                }, full: {
                    url: 'http://res.cloudinary.com/radioreve/image/upload/v1442418376/marker_dark_full.png'
                }
            },
            base_active: {
                open: {
                    url: 'http://res.cloudinary.com/radioreve/image/upload/v1442418425/marker_pink.png'
                }, full: {
                    url: 'http://res.cloudinary.com/radioreve/image/upload/v1442418425/marker_pink_full.png'
                }
            },
            hosting: {
                open: {
                    url: 'http://res.cloudinary.com/radioreve/image/upload/v1443787505/marker_host_dark.png'
                }, full: {
                    url: 'http://res.cloudinary.com/radioreve/image/upload/v1443787505/marker_host_dark_full.png'
                }
            },
            hosting_active: {
                open: {
                    url: 'http://res.cloudinary.com/radioreve/image/upload/v1443787504/marker_host_pink.png'
                }, full: {
                    url: 'http://res.cloudinary.com/radioreve/image/upload/v1443787504/marker_host_pink_full.png'
                }
            },
            pending: {
                open: {
                    url: 'http://res.cloudinary.com/radioreve/image/upload/v1442431311/marker_pending_dark.png'
                }, full: {
                    url: 'http://res.cloudinary.com/radioreve/image/upload/v1442431311/marker_pending_dark_full.png'
                }
            },
            pending_active: {
                open: {
                    url: 'http://res.cloudinary.com/radioreve/image/upload/v1442867837/marker_pending_pink.png'
                }, full: {
                    url: 'http://res.cloudinary.com/radioreve/image/upload/v1442867837/marker_pending_pink_full.png'
                }
            },
            kicked: {
                open: {
                    url: 'http://res.cloudinary.com/radioreve/image/upload/v1442431311/marker_pending_dark.png'
                }, full: {
                    url: 'http://res.cloudinary.com/radioreve/image/upload/v1442431311/marker_pending_dark_full.png'
                }
            },
            kicked_active: {
                open: {
                    url: 'http://res.cloudinary.com/radioreve/image/upload/v1442867837/marker_pending_pink.png'
                }, full: {
                    url: 'http://res.cloudinary.com/radioreve/image/upload/v1442867837/marker_pending_pink_full.png'
                }
            },
            accepted: {
                open: {
                    url: 'http://res.cloudinary.com/radioreve/image/upload/v1442418560/marker_chat_dark.png'
                }, full: {
                    url: 'http://res.cloudinary.com/radioreve/image/upload/v1442418560/marker_chat_dark_full.png'
                }
            },
            accepted_active: {
                open: {
                  url: 'http://res.cloudinary.com/radioreve/image/upload/v1442418507/marker_chat_pink.png'
                }, full: {
                    url: 'http://res.cloudinary.com/radioreve/image/upload/v1442418507/marker_chat_pink_full.png'
                }
            },
            party: {
                url: 'http://res.cloudinary.com/radioreve/image/upload/v1442436513/marker_party_dark.png'
            },
            party_active: {
                url:'http://res.cloudinary.com/radioreve/image/upload/v1442436750/marker_party_pink.png'
            }
		},
        curtain: {
        	main: {
        		params: { cloud_name: "radioreve", 'class': 'modal-main-picture etiquette', width: 300, height: 300, crop: 'fill', gravity: 'face' }
        	},
        	main_active: {
        		params: { cloud_name: "radioreve", 'class': 'modal-main-picture etiquette active', width: 300, height: 300, crop: 'fill', gravity: 'face' }
        	},
        	thumb: {
        		params: { cloud_name: "radioreve", 'class': 'modal-thumb-picture', crop: 'fill', gravity: 'face' }	
        	},
        	thumb_active: {
        		params: { cloud_name: "radioreve", 'class': 'modal-thumb-picture active', crop: 'fill', gravity: 'face' }
        	}
        },
        logo: {
        	black_on_white: {
        		id:'logo_black_on_white'
        	},
        	white_on_black: {
        		id:'logo_white_on_black'
        	}
        },
        placeholder: {
        	id: 'placeholder_picture',
        	params: { version: "1444912756", cloud_name :"radioreve", html: { 'class': 'mainPicture' }, width: 150 }
        },
    	loaders: {
    		main: {
    			id: 'main_loader',
    			params: { cloud_name :"radioreve", 'class': 'ajax-loader' }
    		},
            main_curtain: {
                id: 'main_loader_curtain',
                params: { cloud_name: "radioreve" }
            },
    		mobile: {
    			id: 'mobile_loader',
    			params: { cloud_name :"radioreve", 'class': 'ajax-loader', width: 25 }
    		},
    		bar: {
    			id: 'bar_loader',
    			params: { cloud_name :"radioreve" }
    		},
    		spinner: {
    			id: 'spinner_loader',
    			params: { cloud_name: "radioreve" }
    		},
    		curtain: {
    			id: 'curtain_loader_v4',
    			params: { cloud_name :"radioreve", 'class': 'curtain-loader super-centered', width: 20 }
    		},
            spinner_2: {
                id: 'spinner_loader_2',
                params: { cloud_name: "radioreve" }
            }
    	},
	},
	/* To be dynamically filled on login */
	user:{},
    $eventsToDisplay: $(),
    $main_loader: $(),
    $mobile_loader: $(),
    $chat_loader: $(),
    $curtain_loader: $(),
	state: {
		connected: false,
		fetchingEvents: false,
        fetchingAskers: false,
		freezing_ui: false,
		animatingChat: false,
		toastAdded: false,
		typingMsg: {},
		uploadingImage: false,
		uploadingimg_id:'',
		uploadingimg_version:''
	},
	tpl:{
		toastInfo : '<div class="toast toastInfo" class="none"><span class="toast-icon icon icon-right-open-big">'
					+'</span><span class="toastMsg"></span></div>',
		toastError: '<div class="toast toastError" class="none"><span class="toast-icon icon icon-cancel">'
					+'</span><span class="toastMsg"></span></div>',
		toastSuccess: '<div class="toast toastSuccess" class="none"><span class="toast-icon icon icon-right-open-big">'
					+'</span><span class="toastMsg"></span></div>',
		noResults: '<center id="noResults" class="filtered"><h3>Aucun évènement pour ce choix de filtre </h3></center>',
		noEvents: '<center id="noEvents" class=""><h3>Aucun évènement n\'a encore été proposé. Soyez le premier! </h3></center>'
	},
	tagList: [],
	msgQueue: [],
	locList: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 ],
        $body                 : $('body'), 
		$loginWrap		 	  : $('#loginWrapp'),
		$signupWrap			  : $('#signupWrapp'),
		$resetWrap   	      : $('#resetWrapp'),
		$profileWrap	      : $('#profileWrap'),
		$eventsWrap		      : $('#eventsWrap'),
		$manageEventsWrap     : $('#manageEventsWrap'),
        $askersListWrap       : $('#askersListWrap'),
		$thumbWrap			  : $('#thumbWrap'),
		$loginBtn  	          : $('#login'),
		$signupBtn            : $('#signup'),
		$resetBtn			  : $('#reset'),
		$emailInput           : $('#email'),
		$passwordInput        : $('#pw'),
		$lostPassword         : $('#lost_pw'),
		$emailInputSignup     : $('#emailSignup'),
		$passwordInputSignup  : $('#pwSignup'),
		$passwordCheckInput   : $('#pwCheckSignup'),
		$backToLogin          : $('#b_to_login'),
		$validateBtn          : $('#validate'),
		$locationInput        : $('#location'),
		$loaderWrap 	      : $('.loaderWrap'),
		$createEventWrap	  : $('#createEventWrap'),
		$createEventBtn       : $('#createEventBtn'),
		$contentWrap          : $('#contentWrap'),
		$contactWrap          : $('#contactWrap'),
		$menuWrap             : $('#menuWrap'),
		$eventsListWrap       : $('#eventsListWrap'),
		$logout				  : $('#logout'),
	google: {
        map_center: {
            lat: 48.8566140,
            lng: 2.3522219
        },
		map: {
            style: {
                meemap: [
    {
        "featureType": "administrative",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            },
            {
                "hue": "#ff0000"
            },
            {
                "weight": "0.27"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#444444"
            }
        ]
    },
    {
        "featureType": "administrative.country",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "administrative.locality",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "administrative.neighborhood",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#fffcfd"
            }
        ]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "hue": "#ff0000"
            }
        ]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "landscape.natural.terrain",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "landscape.natural.terrain",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "hue": "#ff0000"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "hue": "#37ff00"
            },
            {
                "lightness": "56"
            }
        ]
    },
    {
        "featureType": "poi.school",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.school",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.sports_complex",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.sports_complex",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": 45
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "hue": "#ff0000"
            },
            {
                "weight": "0.65"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "weight": "0.20"
            },
            {
                "lightness": "82"
            },
            {
                "gamma": "1.19"
            },
            {
                "saturation": "-42"
            },
            {
                "color": "#d59ca6"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            },
            {
                "lightness": "16"
            }
        ]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "weight": "0.4"
            },
            {
                "color": "#dbdbdb"
            },
            {
                "lightness": "10"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit.station",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#bfd9ee"
            },
            {
                "visibility": "on"
            }
        ]
    }
] 

            }
        }
	}

});