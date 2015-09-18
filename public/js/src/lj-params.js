	
	window.LJ = _.merge( window.LJ || {}, 

{

	accessToken:'',
	ui:{
		nearest_event_opacity: '.5',
		artificialDelay: 700,
		minimum_loading_time: 500,
		slideDownInLight:  { opacity: [1, 0], translateY: [0, 10]   },
		slideUpOutLight: { opacity: [0, 1], translateY: [-10, 0]   },
		slideUpOutVeryLight: { opacity: [0, 1], translateY: [-7, 0]   },
		slideLeftInLight:  { opacity: [1, 0], translateX: [0, -10]   },
		slideLeftOutLight:  { opacity: [0, 1], translateX: [-10, 0]   },
        slideLeftInVeryLight:  { opacity: [1, 0], translateX: [0, -7]   },
        slideLeftOutVeryLight:  { opacity: [0, 1], translateX: [-7, 0]   },
        slideRightInLight: { opacity: [1, 0], translateX: [0, 10]   },
		slideRightOutLight: { opacity: [0, 1], translateX: [10, 0]   },
        slideRightInVeryLight: { opacity: [1, 0], translateX: [0, 7]   },
        slideRightOutVeryLight: { opacity: [, 1], translateX: [7, 0]   }
	},
    page_default_title: "Meefore | Home",
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
					params: { cloud_name: "radioreve", 'class': 'rounded', width: 42, height: 42, crop: 'fill', gravity: 'face'}
				}
			},
			preview: {
				hosts: {
					params: { cloud_name: "radioreve", 'class': 'rounded', width: 62, height: 62, crop: 'fill', gravity: 'face'}
				}
			},
			group: {
				params: { cloud_name: "radioreve", 'class': 'rounded', width: 40, height: 40, crop: 'fill', gravity: 'face' }
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
                url: 'http://res.cloudinary.com/radioreve/image/upload/v1442418376/pin_meefore_creation_zrm3hj.png'
            },
            base_active: {
                url: 'http://res.cloudinary.com/radioreve/image/upload/v1442418425/pin_meefore_accepte_onclic_vqqlc6.png'
            },
            pending: {
                url: 'http://res.cloudinary.com/radioreve/image/upload/v1442431311/pin_pending_black.png'
            },
            pending_active: {
                url: 'http://res.cloudinary.com/radioreve/image/upload/v1442418601/marker_points_pink.png'
            },
            accepted: {
                url: 'http://res.cloudinary.com/radioreve/image/upload/v1442418560/marker_chat_black.png'
            },
            accepted_active: {
                url: 'http://res.cloudinary.com/radioreve/image/upload/v1442418507/marker_chat_pink.png'
            },
            party: {
                url: 'http://res.cloudinary.com/radioreve/image/upload/v1442436513/pin_party.png'
            },
            party_active: {
                url:'http://res.cloudinary.com/radioreve/image/upload/v1442436750/pin_party_pinkfail.png'
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
        	params: { cloud_name :"radioreve", html: { 'class': 'mainPicture' }, width: 150 }
        },
    	loaders: {
    		main: {
    			id: 'main_loader',
    			params: { cloud_name :"radioreve", 'class': 'ajax-loader' }
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
		animatingContent: false,
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
                sober: [{
                    "featureType": "administrative.neighborhood",
                    "elementType": "labels",
                    "stylers": [{
                        //"color": "#444444",
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "landscape",
                    "elementType": "all",
                    "stylers": [{
                        "color": "#f2f2f2"
                    }]
                }, {
                    "featureType": "poi",
                    "elementType": "all",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "poi.business",
                    "elementType": "all",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "road",
                    "elementType": "all",
                    "stylers": [{
                        "saturation": -100
                    }, {
                        "lightness": 45
                    }]
                }, {
                    "featureType": "road.highway",
                    "elementType": "all",
                    "stylers":  [{
                        "saturation": -100
                    }, {
                        "lightness": 45
                    }]
                },  {
                    "featureType": "road.highway",
                    "elementType": "labels.icon",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "road.arterial",
                    "elementType": "labels.icon",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "transit",
                    "elementType": "all",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "water",
                    "elementType": "all",
                    "stylers": [{
                        "color": "#b4d4e1"
                    }, {
                        "visibility": "on"
                    }]
                }],
                lunar: [{
                    "stylers": [{
                        "hue": "#ff1a00"
                    }, {
                        "invert_lightness": true
                    }, {
                        "saturation": -100
                    }, {
                        "lightness": 33
                    }, {
                        "gamma": 0.5
                    }]
                }, {
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#2D333C"
                    }]
                }],
                pinkey: [
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
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#f2f2f2"
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
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": 45
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
         "featureType": "road.highway",
        "elementType": "labels.icon",
        "stylers": [{
            "visibility": "off"
        }]
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
        "featureType": "transit",
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
                "color": "#f1dff1"
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