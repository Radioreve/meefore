	
	var eventUtils  = require('../../pushevents/eventUtils');
	var _     	    = require('lodash');
	var settings    = require('../../config/settings');
	var nv 			= require('node-validator');
	var Before 	    = require('../../models/BeforeModel');
	var User        = require('../../models/UserModel');
	var Message     = require('../../models/MessageModel');

	function check( req, res, next ){

		console.log('Validating change group status');

		var checkReq = nv.isAnyObject()
			.withRequired('before_id'   , nv.isString() )
			.withRequired('cheers_id'	, nv.isString() )
			.withRequired('members'     , nv.isArray() )
			.withRequired('status'      , nv.isString({ expected: ['accepted','kicked'] }) )

		nv.run( checkReq, req.sent, function( n, errors ){

			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
				return next();
			}

			checkWithDatabase( req, function( errors ){

				if( errors ){
					req.app_errors = req.app_errors.concat( errors );
					return next();
				}

			next();

			});
		});
	};

	function checkWithDatabase( req, callback ){

		var before_id = req.sent.before_id;
		var members   = req.sent.members;

		Before.findById( before_id, function( err, bfr ){

			if( err ){
				return callback({
					message: 'api error'
				});
			}

			if( !bfr ){
				return callback({
					message   : 'Before wasnt found',
					err_id    : "ghost_before",
					before_id : before_id
				});
			}

			if( bfr.hosts.indexOf( req.sent.facebook_id ) == -1 ){
				return callback({
					message : 'Requester isnt host',
					err_id  : 'not_hosting',
					host_id : req.sent.facebook_id
				});
			}

			var requesters_team_id = Message.makeTeamId( members );

			var target_group = _.find( bfr.groups, function( g ){
				return requesters_team_id == Message.makeTeamId( g.members );
			});

			console.log('Group members : ' + members.join(',') );
			console.log('Target group found : ' + target_group.members.join(', ') );

			if( !target_group ){
				return callback({
					message : 'Requesters group not found',
					err_id  : 'ghost_group',
					host_id : req.sent.facebook_id
				});
			}

			req.sent.before = bfr;
			req.sent.group  = target_group;

			callback( null, bfr );
				
		});
		
	};


	module.exports = {
		check: check
	};

