
	var eventUtils  = require('../../pushevents/eventUtils'),
		_     	    = require('lodash'),
		settings    = require('../../config/settings');

	var Event 	    = require('../../models/EventModel'),
		User        = require('../../models/UserModel');

	var nv 			= require('node-validator');


	function check( req, res, next ){

		console.log('Validating request in');

		var group = {
			name 				: req.body.name,
			message 			: req.body.message,
			members_facebook_id : req.body.members_facebook_id
		};

		function checkNamePattern( val, onError ){
			if( !/^[a-z0-9\&!-_'?\s\u00C0-\u017F]{1,}$/i.test(val.name) )
				return onError("Name bad pattern", "name", val.name, { err_id: "name_bad_pattern" });

			if( !/^[a-z0-9\&!'?\s\u00C0-\u017F]{4,27}$/i.test(val.name) )
				return onError("Name bad length", "name", val.name, { err_id: "name_bad_length", min: 4, max: 20 });
		};

		function checkMessagePattern( val, onError ){
			if( !/^[a-z0-9\&!?\s\u00C0-\u017F]{1,}$/i.test(val.message) )
				return onError("Message bad pattern", "message", val.message, { err_id: "message_bad_pattern"});

			if( !/^[a-z0-9\&!?\s\u00C0-\u017F]{4,50}$/i.test(val.message) )
				return onError("Message bad length", "message", val.message, { err_id: "message_bad_length", min: 4, max: 50 });
		};

		group.members_facebook_id = _.uniq( group.members_facebook_id );
		if( group.members_facebook_id.length == 0 ){
			group.members_facebook_id = null
		};

		var checkGroup = nv.isObject()
			.withRequired('name', nv.isString())
			.withRequired('message', nv.isString())
			.withRequired('members_facebook_id'	, nv.isArray( nv.isString(), { min: 2, max: 4 }))
			.withCustom( checkNamePattern )
			.withCustom( checkMessagePattern )

 
		nv.run( checkGroup, group, function( n, errors ){

			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
				return next();
			}

			checkWithDatabase( req, function( errors, groups ){

				if( errors ){
					req.app_errors = req.app_errors.concat( errors );
					return next();
				}

				req.groups = groups;
				next();

			});
		});
	};

		function checkWithDatabase( req, callback ){

			var group = req.body;
			var facebook_ids = group.members_facebook_id;
			var group_number = facebook_ids.length;

			User.find({ 'facebook_id': { $in: facebook_ids }}, function( err, members ){

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

				Event.findById( req.event_id, function( err, evt ){

					if( err ) return callback({ message: "api error" }, null );

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

					req.group = group;

					req.users          = members;
					req.group.members  = _.pluckMany( members, settings.public_properties.users );
					req.group.status   = 'pending';
					req.group.group_id = evt.makeGroupId( req.group.members_facebook_id );

					req.groups = evt.groups;
					req.groups.push( req.group );

					callback( null, groups );
					

				});
			});
			
		};



	module.exports = {
		check: check
	};



		