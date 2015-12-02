
	var mongoose = require('mongoose');
	var _ = require('lodash');
	var express = require('express');
	var app = express();
	var server = require('http').createServer( app );

	var bodyParser = require('body-parser');

	app.use( bodyParser.json() );
	app.use( express.static( __dirname ) );

	var LotoSchema = new mongoose.Schema({

		"annee_numero_de_tirage"                  : Number,
		"jour_de_tirage"                          : String,
		"date_de_tirage"                          : String,
		"date_de_forclusion"                      : String,
		"boule_1"                                 : Number,
		"boule_2"                                 : Number,
		"boule_3"                                 : Number,
		"boule_4"                                 : Number,
		"boule_5"                                 : Number,
		"numero_chance"                           : Number,
		"combinaison_gagnante_en_ordre_croissant" : String,
		"nombre_de_gagnant_au_rang1"              : Number,
		"rapport_du_rang1"                        : Number,
		"nombre_de_gagnant_au_rang2"              : Number,
		"rapport_du_rang2"                        : String,
		"nombre_de_gagnant_au_rang3"              : Number,
		"rapport_du_rang3"                        : String,
		"nombre_de_gagnant_au_rang4"              : Number,
		"rapport_du_rang4"                        : String,
		"nombre_de_gagnant_au_rang5"              : Number,
		"rapport_du_rang5"                        : String,
		"nombre_de_gagnant_au_rang6"              : Number,
		"rapport_du_rang6"                        : Number,
		"numero_jokerplus"                        : String,
		"devise"                                  : String

	});
	
	var LotoModel = mongoose.model('lotodatas', LotoSchema );

	mongoose.connect('mongodb://Radioreve:R4dioreve@dogen.mongohq.com:10008/meefore-staged');

	mongoose.connection.on( 'open', function(){
		console.log('Connected to MongoDB');
		
			// var lototest = new LotoModel();

			// 	lototest.boule_1 = 5;

			// 	lototest.save();

		app.get('/data', function( req, res ){



			LotoModel.find({}, { "boule_1" :1, "boule_2" :1,"boule_3" :1,"boule_4" :1,"boule_5" :1}, function( err, loto ){
				if( err ) return console.log(err);
				res.json({ data: loto });
			});

		});



	});

	mongoose.connection.on('error', function(err){
		console.log('Connection to the database failed : '+err);
	});


	app.get('/home', function( req, res ){

		res.sendfile( __dirname + '/loto.html' );

	});




	server.listen( 1234, function(){
		console.log('Logo app listening on 1234...');
	});
		
	