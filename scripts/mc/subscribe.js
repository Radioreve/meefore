
	var request = require('request');
	var config  = require('../../config/config');
	var mailer  = require('../../services/mailer');

	function pretty( json ){
		console.log( JSON.stringify( json, null, 3 ));
	};

	var options = {};

	function yn_to_bool( yn ){
			if(yn =='yes') return true;
			return false;;
		};
		

	var interests = {};
	config.mailchimp.groups.forEach(function( interest_object ){
		interests[ interest_object.id ] = yn_to_bool( interest_object.init_value );
	});

	options.interests = interests;
	mailer.subscribeUserAtMailchimp( 'honkie@gmail.com', options, function( err, res ){

		if( err ){
			console.log( pretty(err) );
		} else {
			console.log( pretty(res) );
		}
	});
	





