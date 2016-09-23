
	var _     	    = require('lodash');
	var settings    = require('../../config/settings');
	var Before 	    = require('../../models/BeforeModel');
	var User        = require('../../models/UserModel');
	var nv 			= require('node-validator');
	var rg 			= require('../../config/regex');
	var print 	    = require('../../services/print')( __dirname.replace( process.cwd()+'/', '' ) + '/validate-before-group-request.js' );

	function check( req, res, next ){

		print.info( req, 'Validating request in');

		function isGroupOk( val, onError ){

			if( !val.members || val.members.length < settings.app.min_group || val.members.length > settings.app.max_group ){
				return onError("Group bad length", "members", val.members );
			}

		};

		req.sent.members = _.uniq( req.sent.members );

		var checkGroup = nv.isAnyObject()
		
			.withRequired('facebook_id'	, nv.isString({ regex: rg.fb_id }) )
			.withRequired('before_id' 	, nv.isString({ regex: rg.db_id }) )
			.withRequired('members'  	, nv.isArray() )
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
		.lean() // Get rid of the all not own properties. Otherwise, too big for the wire (http, pusher)
		.exec( function( err, members_profiles ){

			if( err ){
				return callback({
					message: "api error"
				}, null );
			}

			if( members.length != group_number ){
				return callback({
					message: "Unable to retrieve " + ( group_number - members_profiles.length ) + " members",
					err_id: 'ghost_users',
					meta: {
						n_sent  	: group_number,
						n_found 	: members.length,
						missing_ids : _.difference( members, _.map( members_profiles, 'facebook_id' ) )
					}
				});
			}


			Before
				.findById( before_id )
				.lean()
				.exec(function( err, bfr ){

				if( err ){
					return callback({
						message: "api error"
					}, null );
				}

				if( !bfr ){
					return callback({
						message   : "Before doesnt seem to exist",
						err_id    : 'ghost_before',
						meta: {
							before_id : before_id
						}
					});
				}

				if( bfr.status != "open" ){
					return callback({
						message : "Before is not open",
						err_id  : "before_not_open",
						meta: {
							before_id: before_id,
							status: bfr.status
						}
					});
				}
					
				var meta = {
					already_there: []
				};

				members.forEach(function( fb_id ){
					if( bfr.hosts.indexOf( fb_id ) != -1 ){
						meta.already_there.push({
							member_id: fb_id,
							role: 'host'
						});
					}
				});

				var groups = bfr.groups;
				groups.forEach(function( other_group ){
					members.forEach(function( fb_id ){
						if( other_group.members.indexOf( fb_id ) != -1 ){
							meta.already_there.push({
								member_id: fb_id,
								role: 'user'
							});
						}
					});
				});

				if( meta.already_there.length != 0 ){
					return callback({
						message: "Friends are already in this before, either as host or regular user",
						err_id: "already_there",
						meta: meta
					});
				}

				console.log('Validation success!');

				// Used to push realtime events
				req.sent.members_profiles = members_profiles;
				req.sent.before = bfr;

				callback();
				

			});
		});
		
	};



	module.exports = {
		check: check
	};



		