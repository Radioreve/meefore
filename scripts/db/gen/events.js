        var model_path = process.cwd() + '/models';

        var mongoose  = require('mongoose'),
        User          = require( model_path + '/UserModel'),
        EventTemplate = require( model_path + '/EventTemplateModel'),
        config        = require( process.cwd() + '/config/config'),
        request       = require('request'),
        moment        = require('moment'),
        _             = require('lodash'),
        flags         = require('flags');

        flags.defineInteger('n', 1, 'N max events');
        flags.defineInteger('d', 100, 'Delay in ms between requests');
        flags.parse();

		mongoose.connect( config.db[ process.env.NODE_ENV ].uri );

		mongoose.connection.on('error', function( err ){
			console.log('Connection to the database failed : '+err);
		});

		mongoose.connection.on( 'open', function(){
			console.log('Connected to the database! Running operation... : ');

		// Display Command:
		// db.getCollection('events').find({}, {ambiance:1,'hosts.name':1,groups:1,address:1,begins_at:1})

		var agerange_arr = [18, 30];
		var mixity_arr   = ['boys','girls','mixed'];

		// Control params // 
		var max_hosts  	 = 2;
		var max_events 	 = flags.get('n');
        var delay        = flags.get('d');

		function createEvent( ite ){

			if( ite == max_events ){
				console.log(max_events+' events created, exiting...');
				return process.exit();
			}

			User.find({}, function( err, users ){

				if( err || !users ){
					console.log('Error fetching user, aborting...')
					return console.log(err);
				}
				// On prend un user au hasard
				// var user = users[ randomInt(0, users.length-1 )];

                var user = _.find( users, function(el){ return el.facebook_id == "121428001540741" });

					// User needs friends to host event!//
					// if( user.friends.length != 0 ){
                    if( 1 ||  user.facebook_id != "139625316382924" && _.pluck( user.friends, 'facebook_id').indexOf("139625316382924") == -1 ){
                        getAccessToken( user.facebook_id, function( err, token ){

                                // Facebook ids 
                                var hosts_facebook_id = [ user.facebook_id ];
                                    for( var i = 1; i < max_hosts ; i++ ){
                                        var n = randomInt(0, user.friends.length-1);
                                        hosts_facebook_id.push( user.friends[n].facebook_id );
                                    }

                                // Agerange & mixity
                                var agerange = randomInt(18,24) + '-' + randomInt(25,35);
                                var mixity   = mixity_arr[ randomInt(0,2) ];

                                var ambiance = [];
                                for( var i = 0; i < 4; i++) {
                                    ambiance.push( generateWord(5) );  // 5 syllabes max
                                }

                                var begins_at = new moment();

                                var timezone = 120
                                begins_at.utcOffset( timezone )
                                         .hours( randomInt(14,23) )
                                         .minutes( 0 )
                                         .seconds( 0 )
                                         .add( randomInt( 0, 1), 'days' );


                                var google_place = google_places[ randomInt(0, google_places.length - 1 ) ];
                                    // On dégage la place pour éviter les doublons
                                   // _.remove( google_places, function(el){ return el.place_id == google_place.place_id });


                                var address = findAddress( google_place );

                                // google_place = google_places[ randomInt(0, google_places.length - 1 ) ]; 
                                google_place_party = _.find( google_places, function(el){
                                    return el.place_id === "ChIJMQN_lNlx5kcRwdvjSp5HeRw"; 
                                });

                                var party = {
                                    type: "anytype",
                                    address: findAddress( google_place_party )
                                };
                                
                                var url  = 'http://localhost:1234/api/v1/events';

                                var body = {
                                    token             : token,
                                    socket_id         : '133',
                                    timezone          : timezone,
                                    hosts_facebook_id : hosts_facebook_id,
                                    agerange          : agerange,
                                    mixity            : mixity,
                                    ambiance          : ambiance,
                                    begins_at         : begins_at,
                                    party             : party,
                                    address           : address
                                };

                                console.log('Posting this event : \n\t' + JSON.stringify( body, null, 3 ));
                                setTimeout(function(){
                                    request({ method: 'post', url: url, json: body }, function( err, body, response ){

                                        if( err )
                                            return console.log(err);

                                        if( response.errors || response.msg ){
                                            if( response.errors ){
                                                console.log( 'Erreur--' +response.errors[0].message + ',  ' + response.errors[0].parameter );
                                            }
                                            if( response.msg ){
                                                console.log(' Erreur--' +response.msg );
                                            }
                                            return createEvent( ite );
                                        } else {
                                            console.log('Event created by  : ' + user.name + ' !');
                                            return createEvent( ++ite );
                                        }

                                    });
                                }, delay * ite );
                                
                            });

                    } else {
                        // Si ite, ça recommence jusqu'à saturation (plus d'erreurs possibles! nice)
                        // console.log( user.name + ' has no friend, hence cant host!');
                        console.log( user.name + ' isnt allowed to host for test purposes');
                        createEvent( ite );
                    }
            });

        }


            createEvent(0);

        });

       function getAccessToken( facebook_id, callback ){

            request({ method: 'post', url: 'http://localhost:1234/auth/token', json: { api_key: 'meeforever', data: { id: facebook_id }} }, function( err, body, res ){
                
                if( err ){
                    return callback( err, null );
                }
                
                return callback( null, res.token );

            });

        };
	
		function findAddress( google_place ){

			var address = {
				place_id: google_place.place_id,
				lat: parseFloat(google_place.geometry.location.G),
                lng: parseFloat(google_place.geometry.location.K)
			};

			var route 		 = _.find( google_place.address_components, function(el){ return el.types.indexOf('route') != -1 });
			var neighborhood = _.find( google_place.address_components, function(el){ return el.types.indexOf('neighborhood') != -1 });
			var locality 	 = _.find( google_place.address_components, function(el){ return el.types.indexOf('locality') != -1 });

			var place_name = route && route.long_name || neighborhood && neighborhood.long_name || google_place.name || 'Weird';
			var city_name   = locality && locality.long_name || ' - ';

			address.place_name = place_name;
			address.city_name   = city_name;

			return address
		}

		function randomInt(low, high) {
    		return Math.floor(Math.random() * (high - low + 1) + low);
		};

		function generateWord( max_length ){

			var word = '';
			var syllabes = ['le','la','he','sho','bo','ni','lu','mu','po','ui','qu','ea','xq','me','hgz','hf','qp','pu','pe','mq','ah','ue','mdo']

			for( var i = 0; i < randomInt(0, max_length); i ++ ){
				word += syllabes[ randomInt( 0, syllabes.length - 1 ) ];
			}


			return hashtagify( word );

		};

		function hashtagify( str ){
			
			var hashtag_parts = [];
				str.trim().split(/[\s_-]/).forEach(function( el, i ){
					if( i == 0 ){
						hashtag_parts.push( el );
					} else {
						if( el != '') {
							var elm = el[0].toUpperCase() + el.substring(1);
							hashtag_parts.push( elm );
						}
					}
				});
				return hashtag_parts.join('');

		};




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