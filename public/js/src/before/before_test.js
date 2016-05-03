window.LJ.before = _.merge( window.LJ.before || {}, {

		test: {
				iso_dates: [
					"2016-05-22T22:30:48.1234Z",
					"2016-05-22T21:30:22.1234Z",
					"2016-05-23T19:35:43.1234Z",
					"2016-05-25T18:30:45.1234Z",
					"2016-05-24T16:20:25.1234Z",
					"2016-05-27T22:32:45.1234Z",
					"2016-05-27T22:45:15.1234Z",
					"2016-05-27T20:30:42.1234Z",
					"2016-05-28T16:20:25.1234Z",
					"2016-05-29T21:32:41.1234Z",
					"2016-05-30T22:25:11.1234Z",
					"2016-05-30T20:10:12.1234Z"
			],
			before_data: {

				hosts_facebook_id: ["152108635187978","149685995430834"],
				address: {
					lat: "48.8526266",
					lng: "2.332816600000001",
					place_id: "ChIJHcrWXNdx5kcRssJewNDrBRM",
					place_name: "Rue du Four, 75006 Paris, France"
				},
				begins_at: "2016-04-27T09:21:11.519Z",
				timezone: 120

			},
			readAndCreateBefore: function( param ){

				var req = {};

				req.hosts_facebook_id = _.shuffle( LJ.user.friends ).slice(0,2).concat( LJ.user.facebook_id );
				req.address   		  = _.shuffle( LJ.map.test.places )[0];
				req.begins_at		  = _.shuffle( LJ.before.test.iso_dates )[0];
				req.timezone 		  = 120;

				if( param && req[ param ] ){
					delete req[ param ];
				}

				return LJ.api.createBefore( req );

			},
			handleCreateBefore: function(){

				LJ.log('Handling create before...');

				var ux_done    = LJ.before.startCreateBefore();
				var be_created = LJ.before.test.readAndCreateBefore();

				LJ.Promise.all([ be_created, ux_done ]).then(function( res ){
					return LJ.before.endCreateBefore( res[0] );

				})
				.catch(function( e ){
					LJ.wlog(e.err);
					LJ.before.handleCreateBeforeError(e.err);

				});

			},
			handleCreateBefore__MissingHosts: function(){

				LJ.log('Handling create before...');

				var ux_done    = LJ.before.startCreateBefore();
				var be_created = LJ.before.test.readAndCreateBefore('hosts_facebook_id');

				LJ.Promise.all([ be_created, ux_done ]).then(function( res ){
					return LJ.before.endCreateBefore( res[0] );

				})
				.catch(function( e ){
					LJ.before.handleCreateBeforeError(e);

				});
			},
			handleCreateBefore__MissingLocation: function(){

				LJ.log('Handling create before...');

				var ux_done    = LJ.before.startCreateBefore();
				var be_created = LJ.before.test.readAndCreateBefore('address');

				LJ.Promise.all([ be_created, ux_done ]).then(function( res ){
					return LJ.before.endCreateBefore( res[0] );

				})
				.catch(function( e ){
					LJ.before.handleCreateBeforeError(e);

				});
			},
			handleCreateBefore__MissingDate: function(){

				LJ.log('Handling create before...');

				var ux_done    = LJ.before.startCreateBefore();
				var be_created = LJ.before.test.readAndCreateBefore('begins_at');

				LJ.Promise.all([ be_created, ux_done ]).then(function( res ){
					return LJ.before.endCreateBefore( res[0] );

				})
				.catch(function( e ){
					LJ.before.handleCreateBeforeError(e);

				});
			}
		}

	});
