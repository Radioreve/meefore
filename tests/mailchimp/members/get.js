
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
	
	Mailchimp.getMember("1e660360674cc11abd5647bcd88bc078")
		.then( console.log )
		.catch( console.log );


