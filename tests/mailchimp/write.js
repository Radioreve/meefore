
	var _ 	     = require('lodash');
	var config   = require('../../config/config').mailchimp;
	var Promise  = require('bluebird');
	var fs 		 = Promise.promisifyAll( require('fs') );

	// Mailchimp interface
	var MailchimpInterface = require('../../services/mc');
	var Mailchimp 		   = new MailchimpInterface( _.extend( {}, config, { list_id: "ace186c18c" } ));


	// Test - Get all members of a given list
	
	console.log('Running...');

	var p1 = Mailchimp.writeMembersToFile( __dirname )
	var p2 = Mailchimp.writeMergeFieldsToFile( __dirname );
	// var p3 = Mailchimp.writeInterestCatsToFile( __dirname );
	// var p4 = Mailchimp.writeInterestsToFile( __dirname );

	Promise.all([ p1, p2 ])
		.then( Mailchimp.infoLog )
		.catch( Mailchimp.errLog );

