
	var term    = require('terminal-kit').terminal;
	var Promise = require('bluebird');
	var _       = require('lodash');

	var count   = function( message ){ term.bold.green( message ); }    
	var info    = function( message ){ term( message + '\n' ); }
	var inline  = function( message ){ term( message ); }
	var success = function( message ){ '\t' + term.bold.green( message + '\n' ); }
	var error   = function( message ){ term.bold.red( message + '\n' ); }
	var jsonize = function( json ){  term( '\n' + JSON.stringify( json, null, 4 ) + '\n' ); }

	var countdown = function( text ){
		return new Promise(function( resolve, reject ){

			setTimeout(function(){

				text = text || "Making the api call";

				inline( text + " in ");
				for( var i = 6; i > 0; i-- ){
					(function( i ){

						setTimeout(function(){

							if( i%2 == 0 ){
								count( i/2 + ",");
							} 
							if( i == 1 ){
								count('\n');
								setTimeout(function(){
									resolve();
								}, 500 );
							}

						},  ( 6 - i ) * 500 );

					})( i )
				}

			}, 1000 );
		});
	}

	function randHumanName(){

		var human_names = [
			'leo','jean','max','tarte','ranjith','ben','vass','mike','kim','jibril','adri','yacine',
			'herve','michel','anne','camille','marie','helene','papy','moujo','kingkong','simba','aladdin',
			'obama','trump','hollande','frank','vincent','julien','matthieu','sylvain','david','elias','greg',
			'alexis','alexandre','sandrine','cecile','cindy','leah','chimpah','badoo','tinder','meetic'
		];

		return _.shuffle( human_names )[0];

	}

	module.exports = {
		info: info,
		inline: inline,
		success: success,
		error: error,
		countdown: countdown,
		jsonize : jsonize,
		randHumanName: randHumanName
	}