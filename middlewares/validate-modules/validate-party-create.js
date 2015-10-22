
	var Party       = require('../../models/PartyModel');
	var nv          = require('node-validator');
	var settings    = require('../../config/settings');


	function check( req, res, next ){

		console.log('Validating party');

		var ISO_Regex = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/;
		var URL_Regex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
		var checkAddress = nv.isAnyObject()

			.withRequired('lat'			, nv.isNumber({ min: -85, max: 85 }))
			.withRequired('lng'			, nv.isNumber({ min: -180, max: 180 }))
			.withRequired('place_id'	, nv.isString() )
			.withRequired('place_name'	, nv.isString() )
			.withRequired('city_name'	, nv.isString() )

		var checkParty = nv.isAnyObject()

			.withRequired('name'          		, nv.isString() )
			.withRequired('hosted_by'			, nv.isString() )
			.withRequired('socket_id'   		, nv.isString() )
			.withRequired('timezone'			, nv.isNumber({ min: -720 , max: 840 })) 
			.withRequired('begins_at'		   	, nv.isString({ regex: ISO_Regex }) )
			.withRequired('ends_at'				, nv.isString({ regex: ISO_Regex }) )
			.withRequired('attendees'			, nv.isString({ regex: /^\d{2,3}-\d{2,3}$/ }) )
			.withRequired('picture_url'			, nv.isString({ regex: URL_Regex   }) )
			.withRequired('link'				, nv.isString({ regex: URL_Regex   }) )
			.withRequired('type' 				, nv.isString({ expected: _.pluck( settings.app.party_types, 'id' )   }))
			.withRequired('address'				, checkAddress  )


		nv.run( checkParty, req.sent, function( n, errors ){

			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
				return next();
			}

			next();

			});

	};


	module.exports = {
		check: check
	};