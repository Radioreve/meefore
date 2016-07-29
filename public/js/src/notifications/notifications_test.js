
window.LJ.notifications = _.merge( window.LJ.notifications || {}, {

	test: {

		init: function(){

			LJ.notifications.fetchAndAddNotifications({
				notifications: _.cloneDeep( LJ.notifications.test.makeFakeNotifications() ) // override for test purposes
			});

		},
		markOutdatedNotifications: function(){

			LJ.user.notifications = LJ.notifications.test.makeFakeNotifications();
			LJ.notifications.test.shuffleBeforeIds();
			LJ.notifications.refreshNotifications();

		},
		shuffleBeforeIds: function(){

			var L = LJ.user.notifications.length;

			LJ.user.notifications.forEach(function( n ){
				n.before_id = "bfr-" + LJ.randomInt( 1, L );
			});

		},
		groupByBeforeId: function(){

			LJ.notifications.test.shuffleBeforeIds();

		},	
		// Returns id of Ben & Léo
		getAdminIds: function(){

			return _.shuffle( [ "10205618910126551", "10152931836919063" ] );

		},
		getRandomFriendIds: function( n ){

			n = n || 2;
			return _.shuffle( _.map( LJ.friends.fetched_friends, 'facebook_id' ) ).slice( 0, n );

		},
		makeFakeNotifications: function(){

			var random_friends_1 = LJ.notifications.test.getRandomFriendIds( 1 );
			var random_friends_2 = LJ.notifications.test.getRandomFriendIds( 2 );
			var random_friends_3 = LJ.notifications.test.getRandomFriendIds( 3 );

			return [

				{

					"notification_id" : "1",
					"type"			  : "accepted_in_members",
					"happened_at"     : moment().subtract( '10', 'seconds' ).toISOString(),
					"seen_at" 		  : null,
					"clicked_at"      : null,
					"before_id" 	  : "before_1",

					"hosts" 		  : LJ.notifications.test.getAdminIds(),
					"initiated_by"	  : LJ.notifications.test.getAdminIds()[ 0 ],
					"members" 		  : [ LJ.user.facebook_id ].concat( random_friends_1 )

				},
				{

					"notification_id" : "2",
					"type"			  : "accepted_in_hosts",
					"happened_at"     : moment().subtract( '10', 'minutes' ).toISOString(),
					"seen_at" 		  : null,
					"clicked_at"      : null,
					"before_id" 	  : "before_2",

					"hosts" 		  : [ LJ.user.facebook_id ].concat( random_friends_2 ),
					"initiated_by"	  : random_friends_2[ 0 ],
					"members" 		  : LJ.notifications.test.getAdminIds(),

				},
				{

					"notification_id" : "3",
					"type"			  : "marked_as_host",
					"happened_at"     : moment().subtract( '155', 'minutes' ).toISOString(),
					"seen_at" 		  : moment().subtract( '155', 'minutes' ).toISOString(),
					"clicked_at"      : moment().subtract( '153', 'minutes' ).toISOString(),
					"before_id" 	  : "before_3",

					"main_host" 	  : random_friends_3[ 0 ],
					"hosts" 		  : [ LJ.user.facebook_id ].concat( random_friends_3 ),
					"begins_at"	      : moment().add('28','hours').toISOString(),
					"address" 		  : "37 rue du Four, 75006 Paris"

				},
				{

					"notification_id" : "4",
					"type"			  : "group_request_members",
					"happened_at"     : moment().subtract( '29', 'hours' ).toISOString(),
					"seen_at" 		  : moment().subtract( '28', 'hours' ).toISOString(),
					"clicked_at"      : moment().subtract( '27', 'hours' ).toISOString(),
					"before_id" 	  : "before_4",

					"hosts" 		  : LJ.notifications.test.getAdminIds(),
					"main_member"     : random_friends_1[ 0 ],
					"initiated_by"	  : LJ.notifications.test.getAdminIds()[ 0 ],
					"members" 		  : [ LJ.user.facebook_id ].concat( random_friends_1 )

				},
				{

					"notification_id" : "5",
					"type"			  : "group_request_hosts",
					"happened_at"     : moment().subtract( '33', 'hours' ).toISOString(),
					"seen_at" 		  : moment().subtract( '32', 'hours' ).toISOString(),
					"clicked_at"      : moment().subtract( '31', 'hours' ).toISOString(),
					"before_id" 	  : "before_3",

					"hosts" 		  : [ LJ.user.facebook_id ].concat( random_friends_1 ),
					"initiated_by"	  : LJ.user.facebook_id,
					"members" 		  : LJ.notifications.test.getAdminIds()

				},
				{

					"notification_id" : "6",
					"type"			  : "before_canceled",
					"happened_at"     : moment().subtract( '50', 'hours' ).toISOString(),
					"seen_at" 		  : moment().subtract( '49', 'hours' ).toISOString(),
					"clicked_at"      : moment().subtract( '48', 'hours' ).toISOString(),
					"before_id" 	  : "before_3",

					"initiated_by"	  : LJ.notifications.test.getAdminIds()[ 0 ],
					"address" 		  : "37 rue des Pamplemousses, 75002 Paris",

				}

			]
		}

	}

});