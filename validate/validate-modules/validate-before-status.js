	
	var _     	    = require('lodash');
	var nv 			= require('node-validator');
	var settings    = require('../../config/settings');
	var Before 	    = require('../../models/BeforeModel');
	var User        = require('../../models/UserModel');
	var print 	    = require('../../services/print')( __dirname.replace( process.cwd()+'/', '' ) + '/validate-before-status.js' );


	function check( req, res, next ){

		print.info( req, 'Validating change before status');

		var checkReq = nv.isAnyObject()
			.withRequired('status'   , nv.isString({ expected: ['open','suspended','canceled'] }))
			.withRequired('before_id', nv.isString());
 
		nv.run( checkReq, req.sent, function( n, errors ){

			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
				return next();
			}

			checkWithDatabase( req, function( errors, before ){
				if( errors ){
					req.app_errors = req.app_errors.concat( errors );
					return next();
				}

				req.sent.before = before;
				next();

			});
		});
	};

		function checkWithDatabase( req, callback ){

			var facebook_id = req.sent.facebook_id;
			var before_id	= req.sent.before_id;

			User.findOne({ facebook_id: facebook_id }, function( err, user ){

				if( err ) return callback({ message: "api error" }, null );

				if( !user ){
						return callback({
							message		: "Couldnt find the user",
							data: {
								err_id		: "ghost_user",
								facebook_id	: facebook_id
							}
						}, null );
					}

				req.sent.requester = user;

				Before.findById( before_id, function( err, before ){

					if( err ) return callback({ message: "api error" }, null );

					if( !before ){
						return callback({
							message		: "Couldnt find the before",
							data: {
								err_id		: "ghost_before",
								before_id	: before_id
							}
						}, null );
					}

					if( before.hosts.indexOf( facebook_id ) == -1 ){
						return callback({
							message		: "Unauthorized action!",
							parameter	: "facebook_id",
							data: {
								err_id 		: "unauthorized",
								facebook_id : facebook_id,
								authorized  : before.hosts,
								before_id 	: req.before_id
							}
						}, null );
					}

					callback( null, before );
						
				});
			
			});
		};



	module.exports = {
		check: check
	};



		