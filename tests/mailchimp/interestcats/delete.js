
	var _ 	     = require('lodash');
	var config   = require('../../../config/config').mailchimp;
	var Promise  = require('bluebird');
	var fs 		 = Promise.promisifyAll( require('fs') );
	var tools 	 = require('../../tools');

	// Mailchimp interface
	var MailchimpInterface = require('../../../services/mc');
	var Mailchimp 		   = new MailchimpInterface( _.extend( {}, config, { list_id: "ace186c18c" } ));


	// Test - Create a new member in the list


	Mailchimp.getInterestCats()
		.then(function( interests ){
			var id = "d4aef9babe"; // interests[0].id;
			Mailchimp.infoLog("Removing interest_category with id " + id );
			return Mailchimp.deleteInterestCat( id );
		})
		.then(function(){
			return Mailchimp.writeInterestCatsToFile( __dirname + '/../' );
		})
		.then( console.log )
		.catch( console.log );






