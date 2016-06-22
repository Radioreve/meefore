	
	var eventUtils  = require('../../pushevents/eventUtils');
	var _     	    = require('lodash');
	var settings    = require('../../config/settings');
	var nv 			= require('node-validator');
	var Before 	    = require('../../models/BeforeModel');
	var User        = require('../../models/UserModel');

	function check( req, res, next ){

		console.log('Validating change group status');

		var checkReq = nv.isAnyObject()
			.withRequired('before_id'   , nv.isString() )
			.withRequired('main_member' , nv.isString())
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

			// Design choice : each group is uniquely identified by giving one before and one main_member, because
			// no one is allowed to request two times for the same before, to avoid spam behaviors.
			// So we can bypass the need to identify the group by its group_id
			// Possibility : to cancel a request and submit another one with a different person on the future ?
			var target_group = _.find( bfr.groups, function(g){
				return g.members.indexOf( req.sent.main_member ) != -1;
			});

			if( !target_group ){
				return callback({
					message : 'Requesters group not found',
					err_id  : 'ghost_group',
					host_id : req.sent.facebook_id
				});
			}

			req.sent.before       = bfr;
			req.sent.target_group = target_group;

			callback( null, bfr );
				
		});
		
	};



	module.exports = {
		check: check
	};

