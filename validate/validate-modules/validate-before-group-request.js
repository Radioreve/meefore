
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

			var group        = req.sent;
			var facebook_ids = group.members;
			var group_number = facebook_ids.length;
			var before_id    = req.sent.before_id;

			User.find({ 'facebook_id': { $in: facebook_ids }} ).lean().exec( function( err, members ){

				console.log( eventUtils.oSize( members ) )

				if( err ) return callback({ message: "api error" }, null );

				if( members.length != group_number ){
					return callback({
						message : "Couldn't find " + ( group_number - members.length ) + " members",
						data    : {
							err_id		: 'ghost_members',
							n_sent  	: group_number,
							n_found 	: members.length,
							missing_ids : _.difference( facebook_ids, members )
						}}, null );
				}


				Before.findById( before_id, function( err, bfr ){

					if( err ) return callback({ message: "api error" }, null );

					if( bfr.status != "open" ){
						return callback({
							message : "Before is not open",
							err_id  : "before_not_open",
							status  : bfr.status
						});
					}
					

					if( !bfr ){
						return callback({
							message   : "Before doesnt seem to exist",
							err_id    : 'ghost_before',
							before_id : before_id
						}, null );
					}
						
					var err_data = { already_there: [] };
					group.members.forEach(function( fb_id ){
						if( _.pluck( bfr.hosts, 'facebook_id').indexOf( fb_id ) != -1 ){
							err_data.already_there.push({ member_id: fb_id, role: 'host' });
						}
					});

					var groups = bfr.groups;
						groups.forEach(function( other_group ){
							group.members.forEach(function( fb_id ){
								if( other_group.members.indexOf( fb_id ) != -1 ){
									err_data.already_there.push({ member_id: fb_id, role: 'attendee' });
								}
							});
						});

					if( err_data.already_there.length != 0 ){
						return callback( _.merge({
							message : "Friends are already in this before",
							err_id: "already_there"
						}, err_data 
						), null );
					}


					console.log('Validation success!');

					User.findOne({ 'facebook_id': req.sent.facebook_id }, function( err, user ){

						if( err ) return callback({ 'err_id': 'db_error' });

						req.sent.new_group = {
							status              : "pending",
							name                : user.name + " & co",
							group_id 			: bfr.makeGroupId( req.sent.members ),
							members 		    : req.sent.members,
							main_member 		: user.facebook_id
						};

						// Used to push realtime events
						req.sent.members_profiles = members;
						req.sent.before = bfr;

						// Used to save in database
						req.sent.groups = bfr.groups;
						req.sent.groups.push( req.sent.new_group );
						req.sent.hosts = bfr.hosts;

						callback( null );
					
					});

				});
			});
			
		};



	module.exports = {
		check: check
	};



		