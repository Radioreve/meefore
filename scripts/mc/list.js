	
	var _       = require('lodash');
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
		

	var users = [];
	mailer.getMailchimpUsers(function( err, res ){

		if( err ){
			console.log( pretty(err) );
		} else {
			res.members.forEach(function( usr ){
				users.push( _.pick( usr, ['id','email_address','status', 'interests'] ))
			});
			console.log( pretty( users ) );
		}
	});
	





