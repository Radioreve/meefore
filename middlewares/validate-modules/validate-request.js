
	var eventUtils  = require('../../pushevents/eventUtils'),
		_     	    = require('lodash'),
		settings    = require('../../config/settings');

	var Event 	    = require('../../models/EventModel'),
		User        = require('../../models/UserModel');

	var nv 			= require('node-validator');


	function check( req, res, next ){

		console.log('Validating request in');

		var group = req.body;

		group.members = _.uniq( group.members, function(member){
			return member.facebook_id;
		});


		var checkPicture 				= nv.isObject()
			.withRequired('img_id'		, nv.isString())
			.withRequired('img_version'	, nv.isString())
			.withRequired('img_place'	, nv.isInteger({ min: 0, max: 5 }))
			.withRequired('is_main'		, nv.isBoolean())
			.withRequired('hashtag'		, nv.isString());

		var checkMember  				= nv.isObject()
			.withRequired('facebook_id'	, nv.isString({ regex: /^\d{10,}$/ }))
			.withRequired('age'			, nv.isInteger({ min: 18, max: 78 }))
			.withRequired('name'		, nv.isString({ regex: /^[A-Za-z0-9\s\u00C0-\u017F]{4,20}$/ }))
			.withRequired('gender'		, nv.isString({ expected: ['male','female'] }))
			.withRequired('pictures'	, nv.isArray( checkPicture, { min: 1, max: 5 }))

		var checkGroup   				= nv.isObject()
			.withRequired('name'   		, nv.isString({ regex: /^[A-Za-z0-9\s\u00C0-\u017F]{4,20}$/ }) )
			.withRequired('message'		, nv.isString({ regex: /^[A-Za-z0-9\s\u00C0-\u017F]{4,20}$/ }) )
			.withRequired('members'		, nv.isArray( checkMember, { min: 2, max: 4 }));


		nv.run( checkGroup, group, function( n, errors ){

			if( n != 0 )
				return res.json( errors ).end();

			checkWithDatabase( req, function( errors, groups ){

				if( errors )
					return eventUtils.raiseError( _.merge({ res: res }, errors ));

				req.groups = groups;
				next();

			});
		});
	};

		function checkWithDatabase( req, callback ){

			var group = req.body;
			var facebook_ids = _.pluck( group.members, 'facebook_id');
			var group_number = facebook_ids.length;

			User.find({ 'facebook_id': { $in: facebook_ids }}, function( err, members ){

				if( err ) return callback({ toClient: "api error", }, null );

				if( members.length != group_number )
					return callback({
							toClient: 'Error, couldnt find ' + ( group_number - members.length ) + ' members',
						}, null );

				Event.findById( req.event_id, function( err, evt ){

					if( err ) return callback({ toClient: "api error", }, null );

					if( !evt )
						return callback({
							toClient: "L'évènement n'existe pas",
						}, null );
					
					var double_presence_host, doublon_id;
					group.members.forEach(function( member ){
						if( _.pluck( evt.hosts, 'facebook_id').indexOf( member.facebook_id ) != -1 ){
							double_presence_host = true;
							doublon_id = member.facebook_id;
						}
					});

					if( double_presence_host )
						return callback({
							toClient: "un membre du groupe est déjà présent en tant qu'organisateur",
							errData: { doublon_id: doublon_id }
						}, null );
					
					var double_presence, doublon_id;
					var groups = evt.groups;
						groups.forEach(function( other_group ){
							group.members.forEach(function( member ){
								if( _.pluck( other_group.members, 'facebook_id').indexOf( member.facebook_id ) != -1 ){
									double_presence = true;
									doublon_id = member.facebook_id;
								}
							});
						});

					if( double_presence )
						return callback({
							toClient: "un membre du groupe est déjà inscrit dans un autre groupe",
							errData: { doublon_id: doublon_id }
						}, null );


					console.log('Validation success!');

					req.group = group;

					req.group.members = _.pluckMany( members, settings.public_properties.users );
					req.group.status  = 'pending';

					req.groups = evt.groups;
					req.groups.push( req.group );

					callback( null, groups );
					

				});
			});
			
		};



	module.exports = {
		check: check
	};



		