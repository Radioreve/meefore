
	// Generates a fake activity on meefore, activating users with a "bot" access
	// The activity is supposed to look as real as possible, so the algorithm is mostly
	// "random" based. Every 5 minutes
	
	var _        = require('lodash');
	var User     = require('../models/UserModel');
	var Before   = require('../models/BeforeModel');
	var moment   = require('moment');
	var term     = require('terminal-kit').terminal;
	var hashtags = require('./hashtags');
	var places   = require('./places');
	var request  = require('request');
	var async    = require('async');

	module.exports.scheduleBotsToCreateBefores = scheduleBotsToCreateBefores;

	var closing_bot_hour = 0;
	var closing_top_hour = 11;

	// Represents the probability that a creation of a before occurs
	var low    = 0.05;
	var medium = 0.15;
	var high   = 0.4;
	var nul    = 0;

	var api_url = {

		"dev"    : "http://localhost:1234",
		"staged" : "http://staged.meefore.com",
		"prod"   : "http://www.meefore.com"

	};

	var expected_activity = {

			"14": low,
			"15": low,
			"16": medium,
			"17": high,
			"18": high,
			"19": high,
			"20": high,
			"21": high,
			"22": high,
			"23": high

	};

	var day_multiplier = {
		0: 0.2, // Dimanche
		1: 0.2, // Lundi
		2: 0.2,
		3: 0.2,
		4: 0.4,
		5: 5,
		6: 5
	};


	// Keep track of what bot did what to avoid suspicious duplications on the map
	var hydrated        = false;
	var hashtags_in_use = [];
	var places_in_use   = [];
	var is_closing_time;
	var bot_groups      = { available_bots: [], unavailable_bots: [] };
	var post_data       = {};
	var hourly_activity;
	var bot = {};
	var url = "";
	var now;

	botLog( hashtags.length + " possible hashtags" );
	botLog( places.length + " possible places" );

	// Populates the "*_in_use" arrays when the server is booted, to avoid duplications
	function hydrateHashtagsAndPlaces( callback ){

		botLog("Hydrating hashtags and places values...");
		hydrated = true;

		User.distinct('facebook_id', { 'access': 'bot' }, function( err, distinct_ids ){

			if( err ) return callback( err );

			var tasks = [];

			var common_query = { 'status': 'open', 'hosts': { '$in': distinct_ids } };
			tasks.push(function( done ){
				Before.distinct('hashtags', common_query, function( err, distinct_hashtags ){
					if( err ){
						done( err );
					} else {
						hashtags_in_use = distinct_hashtags;
						done();
					}
				});
			});

			tasks.push(function( done ){
				Before.distinct('address.place_id', common_query, function( err, distinct_place_ids ){
					if( err ){
						done( err );
					} else {
						places_in_use = distinct_place_ids;
						done();
					}
				});
			});

			async.parallel( tasks, function( err ){
				err ? callback( err ) : callback( null );
			});

		});

	}

	function scheduleBotsToCreateBefores( rand_min ){

		now = moment().utcOffset( 120 ); // Paris local time

		is_closing_time = ( now.get('hours') > closing_bot_hour && now.get('hours') < closing_top_hour );

		if( is_closing_time ){
			botLog("Reseting the bot scheduler state");
			return hashtags_in_use = places_in_use = [];
		}

		if( !hydrated && hashtags_in_use.length == 0 && places_in_use.length == 0 ){
			return hydrateHashtagsAndPlaces(function( err ){

				if( err ) return handleErr( "hydrating_hashtags_and_places", err );

				scheduleBotsToCreateBefores( rand_min );

			});
		}

		botLog("Current hour is : " + now.get('hours') );
		botLog("Expected activity is : " + expected_activity[ now.get('hours') ] );
		botLog("Day multiplier is : " + day_multiplier[ now.day() ] );

		hourly_activity = expected_activity[ now.get('hours') ] * day_multiplier[ now.day() ] || 0;
		var rand = Math.random();
		if( rand > hourly_activity ){
			return botLog("Passing the bot activity for this time (" + hourly_activity + " < " + rand +")");
		}


		botLog("Initializing bot activity after " + rand_min + "min...");
		User.find(
		{
			"access": "bot"
		},
		function( err, users ){

			if( err ) return handleErr( "bot_scheduler (UserModel)", err );

			bot_groups = filterUsersThatAreAvailable( users );
			botLog( bot_groups.unavailable_bots.length + "/"+ users.length +" bots are currently hosting" );
			bot = _.shuffle( bot_groups.available_bots )[ 0 ];

			botLog( (hashtags.length - hashtags_in_use.length) + " remaining hashtags" );
			botLog( (places.length - places_in_use.length) + " remaining places" );
			
			if( !bot ){
				return botErr("Unable to find another available bot");
			}

			post_data.api_key           = "meeforever";
			post_data.facebook_id       = bot.facebook_id;
			post_data.timezone          = 120;
			post_data.hosts_facebook_id = getHosts( bot, bot_groups ).filter( Boolean );
			post_data.address           = getAddress();
			post_data.hashtags          = _.uniq( getHashtags() );

			if( post_data.address == null ){
				return botLog("Impossible to come up with a unique address, aborting...");
			}
			if( post_data.hashtags == null ){
				return botLog("Impossible to come up with a unique hashtag list, aborting...");
			}

			url = api_url[ process.env.APP_ENV ] + "/api/v1/befores";
			botLog("Sending the request at url : " + url );
			// botLog("Request object : " + JSON.stringify( post_data, null, 4 ));
			request(
				{	
					url     : url,
					method  : 'post',
					json    : post_data
				}
			, function( err, body, response ){

				if( err ) return handleErr( "bot_scheduler (BeforeModel)", err );

				try {
					response = typeof response == "object" ? response : JSON.parse( response );
				} catch( e ){
					return botLog("Unable to parse the server's response into an object");
				}

				botLog( JSON.stringify( response, null, 4 ) );
				botLog( bot.name + " created a before" );

			});


		});

	}

	function getHosts( bot, bot_groups ){

		var hosts             = [ bot.facebook_id ];
		var available_bot_ids = _.map( bot_groups.available_bots, 'facebook_id' );
		var available_friends = _.difference( available_bot_ids, [ bot.facebook_id ] ); //_.intersection( bot.friends, available_bot_ids );
		var n_other_hosts     = randomInt( 1, 3 );

		// botLog("Available friends = " + available_friends );
		// botLog("Available bot ids = " + available_bot_ids );
		// botLog("N other hosts = " + n_other_hosts );
		n_other_hosts = (n_other_hosts > available_friends.length) ?
						available_friends.length:
						n_other_hosts;
		// botLog("N other hosts (projected) = " + n_other_hosts );

		for( var i=0; i<n_other_hosts; i++ ){
			var j = randomInt( 0, available_friends.length - 1 );
			hosts.push( available_friends[ j ] );
			delete available_friends[ j ];
			available_friends = available_friends.filter( Boolean );
		}

		return hosts;

	}

	function getAddress(){

		var place = {};
		var possible_places = _.filter( places, function( pla ){
			return places_in_use.indexOf( pla.place_id ) == -1;
		});

		if( possible_places.length == 0 ){
			return null;
		}

		place = possible_places[ randomInt( 0, possible_places.length - 1 ) ];
		places_in_use.push( place.place_id );
		return place;

	}

	function getHashtags(){

		var n_hashtags        = randomInt( 2, 5 );
		var selected_hashtags = [];

		var possible_hashtags = _.difference( hashtags, hashtags_in_use );

		if( possible_hashtags.length == 0 ){
			return null;
		}

		if( possible_hashtags.length < n_hashtags ){
			hashtags_in_use = hashtags_in_use.concat( possible_hashtags );
			return possible_hashtags;
		}

		for( var i=0; i< n_hashtags; i++ ){
			var nu_hashtag = possible_hashtags[ randomInt( 0, possible_hashtags.length - 1 ) ];
			hashtags_in_use.push( nu_hashtag );
			selected_hashtags.push( nu_hashtag );
		}

		return selected_hashtags;

	}

	function handleErr( err_ns, err ){

		botErr("Error scheduling bots (" + err_ns + ")");
		botErr( err );
		botLog("\n");
	}

	function botErr( message ){
		term.bold.red( "[Bots] - " + message + "\n" );
	}

	function botLog( message ){
		term.bold.magenta( "[Bots] - " + message + "\n" );
	}


	function filterUsersThatAreAvailable( users ){

		var available_bots = _.filter( users, function( usr ){
			return _.map( usr.befores, "status" ).indexOf( "hosting" ) == -1;
		});

		var unavailable_bots = _.filter( users, function( usr ){
			return _.map( usr.befores, "status" ).indexOf( "hosting" ) != -1;
		});

		return {
			available_bots   : available_bots,
			unavailable_bots : unavailable_bots
		};

	}


	function randomInt(low, high) {
	    return Math.floor(Math.random() * (high - low + 1) + low);
	}


