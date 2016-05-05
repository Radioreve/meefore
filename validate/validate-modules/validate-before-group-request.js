
	var eventUtils  = require('../../pushevents/eventUtils'),
		_     	    = require('lodash'),
		settings    = require('../../config/settings');

	var Before 	    = require('../../models/BeforeModel'),
		User        = require('../../models/UserModel');

	var nv 			= require('node-validator');


	var fb_id_regex = /^\d{10,15}$/;
	var db_id_regex = /^[a-f\d]{24}$/i;

	function check( req, res, next ){

		console.log('Validating request in');

		function isGroupOk( val, onError ){

			if( !val.members || val.members.length < settings.app.min_group || val.members.length > settings.app.max_group ){
				return onError("Group bad length", "members", val.members, {
					err_id: "n_group"
				});
			}

		};

		req.sent.members = _.uniq( req.sent.members );
		
		if( req.sent.members.length == 0 ){
			req.sent.members = null
		};

		var checkGroup = nv.isAnyObject()
		
			.withRequired('facebook_id'			, nv.isString({ regex: fb_id_regex }) )
			.withRequired('before_id' 			, nv.isString({ regex: db_id_regex }) )
			.withCustom( isGroupOk )

 
		nv.run( checkGroup, req.sent, function( n, errors ){

			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
				return next();
			}

			checkWithDatabase( req, function( errors, groups ){

				if( errors ){
					req.app_errors = req.app_errors.concat( errors );
					return next();
				}

				next();

			});
		});
	};

	function checkWithDatabase( req, callback ){

		var members      = req.sent.members;
		var before_id    = req.sent.before_id;
		var group_number = members.length;

		User
		.find({ 'facebook_id': { $in: members }} )
		.lean() // Get rid of the 'mongoose-inherited' prototype properties. Otherwise, too big to pass in websockets..
		.exec( function( err, members_profiles ){

			if( err ){
				return callback({
					message: "api error"
				}, null );
			}

			if( members.length != group_number ){
				return callback({
					message : "Couldn't find " + ( group_number - members_profiles.length ) + " members",
					data    : {
						err_id		: 'ghost_members',
						n_sent  	: group_number,
						n_found 	: members.length,
						missing_ids : _.difference( members, _.map( members_profiles, 'facebook_id' ) )
					}}, null );
			}


			Before.findById( before_id, function( err, bfr ){

				if( err ){
					return callback({
						message: "api error"
					}, null );
				}

				if( !bfr ){
					return callback({
						message   : "Before doesnt seem to exist",
						err_id    : 'ghost_before',
						before_id : before_id
					}, null );
				}

				if( bfr.status != "open" ){
					return callback({
						message : "Before is not open",
						err_id  : "before_not_open",
						status  : bfr.status
					});
				}
					
				var err_data = { already_there: [] };
				members.forEach(function( fb_id ){
					if( bfr.hosts.indexOf( fb_id ) != -1 ){
						err_data.already_there.push({
							member_id : fb_id,
							role      : 'host'
						});
					}
				});

				var groups = bfr.groups;
				groups.forEach(function( other_group ){
					members.forEach(function( fb_id ){
						if( other_group.members.indexOf( fb_id ) != -1 ){
							err_data.already_there.push({
								member_id : fb_id,
								role      : 'user'
							});
						}
					});
				});

				if( err_data.already_there.length != 0 ){
					return callback( _.merge({
						message : "Friends are already in this before, either as host or regular user",
						err_id  : "already_there"
					}, err_data 
					), null );
				}

				console.log('Validation success!');

				// Used to push realtime events
				req.sent.members_profiles = members_profiles;
				req.sent.before = bfr;

				callback( null );
				

			});
		});
		
	};



	module.exports = {
		check: check
	};



		