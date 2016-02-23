
	var _ = require('lodash');



	var updateMeepass = function( action_type ){

		return function( req, res, next ){

			// Credit meepasses on all hosts
			if( action_type == "create_event" ){

			}

			// Remove one meepass from the sender
			if( action_type == "send" ){

			}

		}

	};


	module.exports = {
		updateMeepass: updateMeepass
	};