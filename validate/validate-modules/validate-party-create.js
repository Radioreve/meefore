
	var Party       = require('../../models/PartyModel');
	var Place 		= require('../../models/PlaceModel');
	var nv          = require('node-validator');
	var settings    = require('../../config/settings');
	var moment      = require('moment');


	function check( req, res, next ){

		console.log('Validating party');

		var ISO_Regex   = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/;
		var URL_Regex   = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
		var fb_id_regex = /^\d{10,15}$/;
		var db_id_regex = /^[a-f\d]{24}$/i;

		var checkPicture = nv.isAnyObject()

			.withRequired('img_id' , nv.isString() )
			.withRequired('img_vs' , nv.isString() )

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
			.withRequired('link'				, nv.isString({ regex: URL_Regex }) )
			.withRequired('price' 				, nv.isString() )


		nv.run( checkParty, req.sent, function( n, errors ){

			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
				return next();
			}

			checkWithDatabase( req, function( errors, before_data ){

				if( errors ){
					req.app_errors = req.app_errors.concat( errors );
					return next();
				}

				req.sent.before_data = before_data;
				next();

			});

		});

	};

	// Reject the call if a party the same day at the same place is already in the base
	// or if the place doesnt exist
	function checkWithDatabase( req, callback ){

		var place_id = req.sent.place.address.place_id;

		Party.find({ 'place.address.place_id' : place_id }, function( err, parties ){

			if( err ){
				return callback({ 'err_id': 'db_error', 'err': err });
			}

			var duplicate = false;
			parties.forEach(function( p ){
				if( moment( p.begins_at ).dayOfYear() == moment( req.sent.begins_at ).dayOfYear ){
					duplicate = true;
				} 
			});	

			if( duplicate ){
				return callback({
					'err_id': 'duplicate_party',
					'msg'   : 'A party has already been posted for this date at this place'
				});
			}

			Place.findOne({ 'address.place_id': place_id }, function( err, place ){

				if( err ){
					return callback({ 'err_id': 'db_error', 'err': err });
				}

				if( !place ){
					return callback({
						'err_id'   : 'ghost_place',
						'msg'      : 'No place was found with the place_id',
						'place_id' : place_id
					})
				}

				callback( null );

			});


		});



	}


	module.exports = {
		check: check
	};