
	var _ 	     = require('lodash');
	var config   = require('../../../config/config').mailchimp;
	var Promise  = require('bluebird');
	var fs 		 = Promise.promisifyAll( require('fs') );
	var tools 	 = require('../../tools');

	// Mailchimp interface
	var MailchimpInterface = require('../../../services/mc');
	var Mailchimp 		   = new MailchimpInterface( _.extend( {}, config, { list_id: "ace186c18c" } ));


	// Test - Create a new member in the list

	// Default configuration to test 
	var ig_1 = {
		title: "Subscribed"
	};

	var p1 = Mailchimp.createInterestCat( ig_1 );

	Promise.all([ p1 ])
		.then( Mailchimp.infoLog )
		.then(function(){
			return Mailchimp.writeInterestCatsToFile( __dirname + '/../' );
		})
		.then(function(){
			return Mailchimp.writeMembersToFile( __dirname + '/../' );
		})
		.catch( Mailchimp.errLog )



