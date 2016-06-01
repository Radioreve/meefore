
	var moment = require('moment');
	var nv = require('node-validator');
	var st = require('../../config/settings');
	var _  = require('lodash');
	var rg = require('../../config/regex');
	var fb = require('../../middlewares/facebook');


	function check( req, res, next ){

		var checkAuthRequest = nv.isAnyObject()
			.withRequired('token' , nv.isString())

		nv.run( checkAuthRequest, req.sent, function( n, errors ){
			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
					return next();
			}

			checkWithDatabase( req, function( errors ){
				if( errors ){
					req.app_errors = req.app_errors.concat( errors );
				}
				next();
			});
		});
		
	};

	function checkWithDatabase( req, callback ){

		var token = req.sent.token;
		fb.verifyFacebookToken( token, function( err, res ){

			if( err ){
				return callback({
					message : 'An unexpected internal error happened',
					err_id  : 'fb_api_unexpected',
					err     : err
				});
			}

			if( res.error ){
				return callback({
					message   : 'Facebook api returned an error',
					err_id    : 'fb_api_expected',
					res_error : res.error
				});
			}

			if( !res.data.is_valid ){
				return callback({
					message : 'The token is not a valid Facebook token',
					err_id  : 'fb_invalid_token',
					raw_res : res
				});
			}

			if( res.data && res.data.app_id != fb.getAppId() ){
				return callback({
					err_id  : 'fb_wrong_app_id',
					message : 'The token didnt match the meefore app_id'
				});
			}

			if( res.data && moment.unix( res.data.expires_at ) < moment() ){
				return callback({
					err_id     	   : 'fb_token_expired',
					message    	   : 'The token expired',
					expires_at     : res.data.expires_at,
					expires_at_iso : moment.unix( res.data.expires_at ).toISOString() 
				});
			}

			// Expose the facebook id of the current users;
			// At this point the user is authenticated, because he provided a legit token, one he
			// could never have without authenticating via Facebook with username/password.
			// We can safely assume that the user trying to login has the following facebook id : 
			req.sent.facebook_id = res.data.user_id;
			req.sent.expires_at  = moment.unix( res.data.expires_at ).toISOString();

			return callback( null );

		});
		
	}



	module.exports = {
		check: check
	};