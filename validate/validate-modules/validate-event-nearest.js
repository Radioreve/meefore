
	var nv = require('node-validator');
	var _  = require('lodash');

	var checkLatLng = nv.isAnyObject()

		.withRequired('lat'			, nv.isNumber({ min: -85, max: 85 }))
		.withRequired('lng'			, nv.isNumber({ min: -180, max: 180 }))

	var checkRequest = nv.isAnyObject()

		.withRequired('facebook_id' 	, nv.isString())
		.withRequired('latlng'			, checkLatLng)
		.withOptional('max_distance'	, nv.isNumber())

	function check( req, res, next ){

		console.log('Checking the request');
		nv.run( checkRequest, req.sent, function( n, errors ){
			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
					return next();
			}

			// Probably needed because the upper check converts the type into string
			// We want numbers for the database query
			req.sent.latlng.lat   = parseFloat( req.sent.latlng.lat );
			req.sent.latlng.lng   = parseFloat( req.sent.latlng.lng );
			req.sent.max_distance = parseFloat( req.sent.max_distance );

			next();

		});

	};

	module.exports = {
		check: check
	};