
	var eventUtils  = require('../../pushevents/eventUtils'),
		_     	    = require('lodash'),
		settings    = require('../../config/settings');

	var Event 	    = require('../../models/EventModel'),
		User        = require('../../models/UserModel');

	var nv 			= require('node-validator');


	function check( req, res, next ){

		console.log('Validating request in');

		function checkNamePattern( val, onError ){
			if( !/^[a-z0-9\&!-_'?\s\u00C0-\u017F]{1,}$/i.test( val.name ) )
				return onError("Name bad pattern", "name", val.name, { err_id: "name_bad_pattern" });

			if( !/^[a-z0-9\&!'?\s\u00C0-\u017F]{4,27}$/i.test( val.name ) )
				return onError("Name bad length", "name", val.name, { err_id: "name_bad_length", min: 4, max: 20 });
		};

		function checkMessagePattern( val, onError ){
			if( !/^[a-z0-9\&!?\s\u00C0-\u017F]{1,}$/i.test( val.message ) )
				return onError("Message bad pattern", "message", val.message, { err_id: "message_bad_pattern"});

			if( !/^[a-z0-9\&!?\s\u00C0-\u017F]{4,50}$/i.test( val.message ) )
				return onError("Message bad length", "message", val.message, { err_id: "message_bad_length", min: 4, max: 50 });
		};

		req.sent.members_facebook_id = _.uniq( req.sent.members_facebook_id );
		
		if( req.sent.members_facebook_id.length == 0 ){
			req.sent.members_facebook_id = null
		};

		var checkGroup = nv.isAnyObject()
		
			.withRequired('name'               , nv.isString())
			.withRequired('message'            , nv.isString())
			.withRequired('members_facebook_id', nv.isArray( nv.isString(), { min: 2, max: 4 }))
			.withRequired('socket_id'          , nv.isString() )
			.withCustom( checkNamePattern )
			.withCustom( checkMessagePattern )

 
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
			var facebook_ids = group.members_facebook_id;
			var group_number = facebook_ids.length;
			var event_id     = req.sent.event_id;

			User.find({ 'facebook_id': { $in: facebook_ids }} ).lean().exec( function( err, members ){

				console.log( eventUtils.oSize( members ) )

				if( err ) return callback({ message: "api error" }, null );

				if( members.length != group_number )
					return callback({
					message : "Couldn't find " + ( group_number - members.length ) + " members",
					data    : {
						err_id		: 'ghost_members',
						n_sent  	: group_number,
						n_found 	: members.length,
						missing_ids : _.difference( facebook_ids, _.pluck( members, 'facebook_id' ) )
					}}, null );

				Event.findById( event_id, function( err, evt ){


					if( err ) return callback({ message: "api error" }, null );

					if( evt.status != "open" )
						return callback({
							message 	: "Event is not open",
							data : {
								err_id : "event_not_open",
								status : evt.status
							}
						});


					if( !evt )
						return callback({
							message : "Event doesnt seem to exist",
							}, null );
						
					var err_data = { already_there: [] };
					group.members_facebook_id.forEach(function( fb_id ){
						if( _.pluck( evt.hosts, 'facebook_id').indexOf( fb_id ) != -1 ){
							err_data.already_there.push({ id: fb_id, role: 'host' });
						}
					});

					var groups = evt.groups;
						groups.forEach(function( other_group ){
							group.members_facebook_id.forEach(function( fb_id ){
								if( _.pluck( other_group.members, 'facebook_id').indexOf( fb_id ) != -1 ){
									err_data.already_there.push({ id: fb_id, role: 'attendee' });
								}
							});
						});

					if( err_data.already_there.length != 0 )
						return callback({
							message : "Friends are already in this event",
							data    : _.merge( err_data, { err_id: "already_there" })
						}, null );


					console.log('Validation success!');

					req.sent.new_group = {
						status              : "pending",
						name                : req.sent.name,
						message             : req.sent.message,
						group_id 			: evt.makeGroupId( req.sent.members_facebook_id ),
						members             :  _.pluckMany( members, settings.public_properties.users ),
						members_facebook_id : req.sent.members_facebook_id
					};

					// Only store the main_picture to optimize size and code clarity
					req.sent.new_group.members.forEach(function( member ){

						var main_picture = _.find( member.pictures, function( pic ){
							return pic.is_main = true;
						});

						delete member.pictures;
						member.main_picture = main_picture;

					});

					// Update les groups de l'event, rdy to save
					req.sent.groups = evt.groups;
					req.sent.groups.push( req.sent.new_group );

					callback( null );
					

				});
			});
			
		};



	module.exports = {
		check: check
	};



		