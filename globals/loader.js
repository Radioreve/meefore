
	var Ambiance = require('../models/AmbianceModel'),
		_  	     = require('lodash'),
		settings = require('../config/settings');


	var origins = {

		'ambiances': {
			type: 'mongodb',
			model: Ambiance
		}
	};

	var loadSettings = function( load_array ){

		load_array.forEach( function( to_load ){

			if( origins[ to_load ].type == 'mongodb' )
				origins[ to_load ].model.find( {}, function( err, items ){
					if( err ) return console.log( 'Error loading : ' + to_load );
					settings[ to_load ] = items;
				});

		});

	};

	module.exports = {
		loadSettings: loadSettings
	};