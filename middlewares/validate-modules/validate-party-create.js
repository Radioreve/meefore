
	var Party       = require('../../models/PartyModel');
	var Place 		= require('../../models/PlaceModel');
	var nv          = require('node-validator');
	var settings    = require('../../config/settings');


	function check( req, res, next ){

		console.log('Validating party');

		var ISO_Regex   = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/;
		var URL_Regex   = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
		var fb_id_regex = /^\d{10,15}$/;
		var db_id_regex = /^[a-f\d]{24}$/i;

		var checkAddress = nv.isAnyObject()

			.withRequired('lat'			, nv.isNumber({ min: -85, max: 85 }))
			.withRequired('lng'			, nv.isNumber({ min: -180, max: 180 }))
			.withRequired('place_id'	, nv.isString() )
			.withRequired('place_name'	, nv.isString() )
			.withRequired('city_name'	, nv.isString() )

		var checkPlace = nv.isAnyObject()

			.withRequired('place_name' 	, nv.isString() )
			.withRequired('address'		, checkAddress );

		var checkParty = nv.isAnyObject()

			.withRequired('socket_id'   		, nv.isString() )
			.withRequired('party_name'          , nv.isString() )
			.withRequired('posted_by' 			, nv.isString({ regex: fb_id_regex }) )
			.withRequired('picture'				, checkPicture )
			.withRequired('place' 				, nv.checkPlace )
			.withRequired('description'			, nv.isString() )
			.withRequired('begins_at'		   	, nv.isString({ regex: ISO_Regex }) )
			.withRequired('ends_at'				, nv.isString({ regex: ISO_Regex }) )
			.withRequired('timezone'			, nv.isNumber({ min: -720 , max: 840 })) 
			.withRequired('link'				, nv.isString({ regex: URL_Regex   }) )
			.withRequired('price' 				, nv.isString() )


		nv.run( checkParty, req.sent, function( n, errors ){

			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
				return next();
			}

			checkWithDatabase( req, function( errors, event_data ){

				if( errors ){
					req.app_errors = req.app_errors.concat( errors );
					return next();
				}

				req.sent.event_data = event_data;
				next();

			});

		});

	};


	function checkWithDatabase( req, callback ){



	}


	module.exports = {
		check: check
	};