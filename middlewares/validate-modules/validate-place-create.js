
	var Place       = require('../../models/PlaceModel');
	var settings    = require('../../config/settings');
	var nv          = require('node-validator');
	var rg 			= require('../../config/regex');


	function check( req, res, next ){

		console.log('Validating place');

		var checkAddress = nv.isAnyObject()

			.withRequired('lat'			, nv.isNumber({ min: -85, max: 85 }))
			.withRequired('lng'			, nv.isNumber({ min: -180, max: 180 }))
			// .withRequired('zipcode'		, nv.isString() )
			.withRequired('place_id'	, nv.isString() );

		var checkPlace = nv.isAnyObject()

			.withRequired('name'          		, nv.isString() )
			.withRequired('address'				, checkAddress  )
			.withRequired('capacity'			, nv.isString({ regex: /^\d{2,3}-\d{2,3}$/ }) )
			.withRequired('link'				, nv.isString({ regex: rg.url   }) )
			.withRequired('type' 				, nv.isString({ expected: _.pluck( settings.app.place_types, 'id' )  }));


		nv.run( checkPlace, req.sent, function( n, errors ){

			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
				return next();
			}

			checkWithDatabase( req, function( err ){

				if( err ){
					req.app_errors = req.app_errors.concat( err );
					return next();
				}

				next();

			});

			});

	};

	var checkWithDatabase = function( req, callback ){

		Place.find({
			'address.place_id': req.sent.address.place_id
		}, function( err, places ){

			if( err ) return callback({ toClient: "api error", }, null );

			if( !places || places.length != 0 ){
				return callback({
					message : "Place already exists",
					data    : {
						err_id : "place_already_there",
						place  : places[0],
					}}, null );
			}

			return callback( null );

		});

	}


	module.exports = {
		check: check
	};