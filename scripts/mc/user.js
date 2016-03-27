	
	var _       = require('lodash');
	var request = require('request');
	var config  = require('../../config/config');
	var mailer  = require('../../services/mailer');

	function pretty( json ){
		console.log( JSON.stringify( json, null, 3 ));
	};

	var mailchimp_id = '61905d77a3c88fc5eabea420a670fe4f';

	mailer.getMailchimpUser( mailchimp_id, function( err, res ){

		if( err ){
			console.log( pretty(err) );
		} else {
			console.log( pretty(res) );
		}
	});
	





