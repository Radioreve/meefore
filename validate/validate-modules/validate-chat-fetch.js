
	var nv   = require('node-validator');
	var rg 	 = require('../../config/regex');
	var User = require('../../models/UserModel');

	function check( req, res, next ){

		var checkFetch = nv.isAnyObject()
		
			.withRequired('chat_id'		, nv.isString() ) // Know which chat to query
			.withRequired('facebook_id' , nv.isString() ) // Know if the user is authorized
			.withOptional('sent_at' 	, nv.isString({ regex: rg.iso_date }) ) // Know where to start fetching messages

		nv.run( checkFetch, req.sent, function( n, errors ){
			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
				return next();
			}

			checkSenderStatus( req, function( errors, author ){
				if( errors ){
					req.app_errors = req.app_errors.concat( errors );
				}
				next();
			});
		});
	};

	function checkSenderStatus( req, callback ){

		var chat_id     = req.sent.chat_id;
		var facebook_id = req.sent.facebook_id;

		User.findOne({ facebook_id: facebook_id }, function( err, user ){

			if( err ){
				return callback({
					err_id: "api_error",
					err: err
				});
			}

			if( !user ){
				return callback({
					err_id: "ghost_user",
					facebook_id: facebook_id
				});
			}

			var channel = user.getChannel( chat_id );
			if( !channel ){
				return callback({
					err_id    : 'ghost_channel',
					message   : 'This channel is not a part of users channels',
					allowed   : user.channels,
					http_code : 403
				});
			}

			// Everything went fine
			return callback( null );

		});


	};	


module.exports = {
	check: check
};