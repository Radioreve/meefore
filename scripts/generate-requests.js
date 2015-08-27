
	var mongoose = require('mongoose'),
		User = require('../models/UserModel'),
		Event = require('../models/EventModel'),
		EventTemplate = require('../models/EventTemplateModel'),
		config = require('../config/config'),
		request = require('request'),
		_ = require('lodash'),
		flags = require('flags');

        flags.defineInteger('n', 1, 'N max requests');
        flags.parse();

		// Control params // 
		var max_hosts  	 	= 2;
		var max_requests 	= flags.get('n');
		var max_group_size	= 3;
		var app_events      = [];


		mongoose.connect( config.db[ process.env.NODE_ENV ].uri );

		mongoose.connection.on('error', function(err){
			console.log('Connection to the database failed : '+err);
		});

		mongoose.connection.on( 'open', function(){
			console.log('Connected to the database! Running operation... : ');

			// Display Command:
			// db.getCollection('events').find({}, {ambiance:1,'hosts.name':1,groups:1,address:1,begins_at:1})


			Event.find({}, function( err, events ){

				if( err || !events ){
					console.log('Error fetching events, aborting...')
					console.log(err);
					return process.exit();
				}

				requestEvents(0, events);

			});
		
		});

		function requestEvents( ite, app_events ){

			var app_events = app_events;
			if( ite == max_requests ){
				console.log(max_requests+'  request done, exiting...');
				return process.exit();
			}
			User.find({}, function( err, users ){

				if( err || !users ){
					console.log('Error fetching user, aborting...')
					console.log(err);
					return process.exit();
				}
				// On prend un user au hasard
				var user = users[ randomInt(0, users.length-1 )];

					// User needs friends to host event!//
					if( user.friends.length != 0 ){

						var event_id = app_events[ randomInt(0, app_events.length-1) ]._id;

						var group_members = [ user.facebook_id ];
						for( var i = 0; i < max_group_size-1; i++ ){
							var friend = user.friends[ randomInt(0, user.friends.length-1) ];
							group_members.push( friend.facebook_id );
						}

						var group_members = group_members;
						var group_message = generateWord( 10 );
						var group_name    = generateWord( 5 );

						var group = {
							socket_id: '1111.12324',
							name: group_name,
							members_facebook_id: group_members,
							message: group_message
						};

						var url  = 'http://localhost:1234/api/v1/events/'+event_id+'/request';
						var body = group;

						request({ method: 'patch', url: url, json: body }, function( err, body, response ){

							if( err )
								return console.log(err);

							if( response.errors ){
								console.log( response.errors[0].message  );
								requestEvents( ite, app_events )
							} else {
								console.log('Participation requested by  : ' + user.name + ' !');
								requestEvents( ++ite, app_events );
							}

						});
						
					} else {
						// Si ite, ça recommence jusqu'à saturation (plus d'erreurs possibles! nice)
						console.log( user.name + ' has no friend, hence cant request in!');
						requestEvents( ite, app_events );
					}
			});

		}
	
		

		function randomInt(low, high) {
    		return Math.floor(Math.random() * (high - low + 1) + low);
		};

		function generateWord( max_length ){

			var word = '';
			var syllabes = ['le','la','he','sho','bo','ni','lu','mu','po','ui','qu','ea','xq','me','hgz','hf','qp','pu','pe','mq','ah','ue','mdo']

			for( var i = 0; i < max_length; i ++ ){
				word += syllabes[ randomInt( 0, syllabes.length - 1 ) ];
			}

			return word;

		};

