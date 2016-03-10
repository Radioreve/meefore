	
	var 
		_ = require('lodash'),
		settings = require('../config/settings'),
		Event = require('../models/EventModel'),
		EventTemplate  = require('../models/EventTemplateModel'),
		moment = require('moment');
	

	var minuts = [0,10,15,20,25,30,40,45,50];

	/* Renvoi un entier random entre low et high */
	function randomInt (low, high) {
    	return Math.floor(Math.random() * (high - low + 1) + low);
	}

	function pickEventTemplate( callback ){

		EventTemplate.find({ 'active' : false }, function( err, arr ){

			if( err )
				return callback("Action impossible, voir avec Léo ;-)", null);

			if( arr.length == 0 )
				return callback("Tous les templates sont utilisés", null);
			
			console.log( arr.length + ' templates disponibles ');

			var n = randomInt( 0, arr.length - 1 );
				arr[n].active = true;
				arr[n].save( function( err, template ){
					if( err )
						return callback("Erreur sauvegardant le template", null );
					console.log('Everything went fine');
					return callback( null, arr[n] );
				});

			
		});
	}

	function pickTags(){

		var tagList = _.clone( settings.tagList, true ),
			pickedTags = [];
		for(var i = 0; i < 3; i++ ){
			var val = tagList[ randomInt( 0, tagList.length - 1 ) ];
			pickedTags.push( val );
			_.remove( tagList, function(el){ return el == val ; });
		}
		return pickedTags;

	}
	
	var generateEvent = function( data, callback ){

		pickEventTemplate( function( err, eventTemplate ){

			if( err )
				return callback( err, null );

			if( !eventTemplate )
				return callback( "Aucun template n'a été renvoyé par la fn", null );
			
			var e = {};

				/* Généré au niveau de la création du bot */
				  e.hostId	  	  	= data.userId;
				  e.hostName   	  	= data.name;
				  e.hostimg_id 	  	= data.img_id;
				  e.hostimg_version  = data.img_version;

				/* Générer aléatoirement à partir de la liste pré remplie */
				  e.templateId      = eventTemplate._id;
				  e.name 		  	= eventTemplate.name;
				  e.description 	= eventTemplate.desc;

				/* Générer purement aléatoirement */
				  e.location    	= randomInt(1,20);
				  e.beginsAt		= moment.utc({ hour: randomInt(18,23) , minute: 10 * randomInt(0,5) });
				  e.createdAt		= moment.utc();
				  e.maxGuest        = randomInt(5,9);
				  e.tags            = pickTags();

			return callback( null, e );

		});
	}


	module.exports = {
		generateEvent: generateEvent,
	}
