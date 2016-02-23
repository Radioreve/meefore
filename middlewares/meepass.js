//meepass.js
	var _ = require('lodash');

	var User = require('../models/UserModel');


	var bounty = {
		"event_created": 5
	}


	function displayError( err, raw ){

		if( err ){
			console.log('Error updating meepass count : ' + err );
		} else {
			console.log( raw.n + ' users received meepass');
		}

	}


	var updateMeepass = function( reason ){	


		return function( req, res, next ){

			req.sent.reason = reason;
			
			// Credit meepasses on all hosts
			if( reason == "event_created" ){
				return addMeepass_EventCreated
			}

			// Remove one meepass from the sender
			if( reason == "meepass_sent" ){
				return removeMeepass_MeepassSent
			}

		}

	};


	function addMeepass_EventCreated( req, res, next ){

		var facebook_ids   = req.sent.hosts_facebook_id;
		var meepass_to_add = bounty[ req.sent.reason ];

		var query = { 
			facebook_id: { $in: facebook_ids }
		};
		var update = {
			"$inc": { "n_meepass": meepass_to_add }
		};
		var options = {
			multi: true
		};
		
		User.exec( query, update, options, displayError );

		next();

	}




	// function removeMeepass_MeepassSent( req, res, next ){




	// }

	module.exports = {
		updateMeepass: updateMeepass
	};