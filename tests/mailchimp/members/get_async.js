
	var _ 	     = require('lodash');
	var config   = require('../../../config/config').mailchimp;
	var Promise  = require('bluebird');
	var fs 		 = Promise.promisifyAll( require('fs') );
	var tools 	 = require('../../tools');

	// Mailchimp interface
	var MailchimpInterface = require('../../../services/mc');
	var Mailchimp 		   = new MailchimpInterface( _.extend( {}, config, { list_id: "ace186c18c" } ));


	// Test - Get a single member from the list
	
	console.log('Running...');
	
	Mailchimp.getMemberAsync("1f5e627a14e98419e3b8807c0e5a1a4d", function( err, member ){
		console.log( err );
		console.log( member );
	});


