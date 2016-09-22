
	// Generates a fake activity on meefore, activating users with a "bot" access
	// The activity is supposed to look as real as possible, so the algorithm is mostly
	// "random" based.
	
	var _        = require('lodash');
	var User     = require('../models/UserModel');
	var Before   = require('../models/BeforeModel');
	var moment   = require('moment');
	var term     = require('terminal-kit').terminal;
	var hashtags = require('./hashtags');
	var places   = require('./places');
	var request  = require('request');
	var async    = require('async');
	var print    = require('../services/print')( __dirname.replace( process.cwd()+'/', '' ) + '/bot-scheduler.js' )
	var erh      = require('../services/err');

	module.exports.scheduleBotsToCreateBefores = scheduleBotsToCreateBefores;

	var closing_bot_hour = 0;
	var closing_top_hour = 11;

	// Represents the probability that a creation of a before occurs
	var low    = 0.1;
	var high   = 0.4;
	var nul    = 0;

	var api_url = {

		"dev"    : "http://localhost:1234",
		"staged" : "http://staged.meefore.com",
		"prod"   : "http://www.meefore.com"

	};

	var expected_activity = {

			"14": high,
			"15": high,
			"16": low,
			"17": low,
			"18": high,
			"19": high,
			"20": high,
			"21": high,
			"22": high,
			"23": high

	};

	var day_multiplier = {
		0: 0.3, // Dimanche
		1: 0.3, // Lundi
		2: 0.3,
		3: 0.3,
		4: 0.5,
		5: 7,
		6: 7
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

	print.info( hashtags.length + " possible hashtags" );
	print.info( places.length + " possible places" );

	// Populates the "*_in_use" arrays when the server is booted, to avoid duplications
	function hydrateHashtagsAndPlaces( callback ){

		print.info("Hydrating hashtags and places values...");
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
			print.info("Reseting the bot scheduler state");
			return hashtags_in_use = places_in_use = [];
		}

		if( !hydrated && hashtags_in_use.length == 0 && places_in_use.length == 0 ){
			return hydrateHashtagsAndPlaces(function( err ){

				if( err ) return handleErr( "hydrating_hashtags_and_places", err );

				scheduleBotsToCreateBefores( rand_min );

			});
		}

		print.info("Current hour is : " + now.get('hours') );
		print.info("Expected activity is : " + expected_activity[ now.get('hours') ] );
		print.info("Day multiplier is : " + day_multiplier[ now.day() ] );

		hourly_activity = expected_activity[ now.get('hours') ] * day_multiplier[ now.day() ] || 0;
		var rand = Math.random();
		if( rand > hourly_activity ){
			return print.info("Passing the bot activity for this time (" + hourly_activity + " < " + rand +")");
		}


		print.info("Initializing bot activity after " + rand_min + "min...");
		User.find(
		{
			"access": "bot"
		},
		function( err, users ){

			if( err ) return handleErr( "bot_scheduler (UserModel)", err );

			bot_groups = filterUsersThatAreAvailable( users );
			print.info( bot_groups.unavailable_bots.length + "/"+ users.length +" bots are currently hosting" );
			bot = _.shuffle( bot_groups.available_bots )[ 0 ];

			print.info( (hashtags.length - hashtags_in_use.length) + " remaining hashtags" );
			print.info( (places.length - places_in_use.length) + " remaining places" );
			
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
				return print.warn("Impossible to come up with a unique address, aborting...");
			}
			if( post_data.hashtags == null ){
				return print.warn("Impossible to come up with a unique hashtag list, aborting...");
			}

			url = api_url[ process.env.APP_ENV ] + "/api/v1/befores";
			print.info("Sending the request at url : " + url );
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
					return print.err("Unable to parse the server's response into an object");
				}

				print.info({ response: response }, 'Response body');
				print.info( bot.name + " created a before" );

			});


		});

	}

	function getHosts( bot, bot_groups ){

		var hosts             = [ bot.facebook_id ];
		var available_bot_ids = _.map( bot_groups.available_bots, 'facebook_id' );
		var available_friends = _.difference( available_bot_ids, [ bot.facebook_id ] ); //_.intersection( bot.friends, available_bot_ids );
		var n_other_hosts     = _.shuffle( [ 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3 ] )[ 0 ];

		n_other_hosts = (n_other_hosts > available_friends.length) ?
						available_friends.length:
						n_other_hosts;

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


