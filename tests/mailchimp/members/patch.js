
	var _ 	     = require('lodash');
	var config   = require('../../../config/config').mailchimp;
	var Promise  = require('bluebird');
	var fs 		 = Promise.promisifyAll( require('fs') );
	var tools 	 = require('../../tools');

	// Mailchimp interface
	var MailchimpInterface = require('../../../services/mc');
	var Mailchimp 		   = new MailchimpInterface( _.extend( {}, config, { list_id: "ace186c18c" } ));


	// Test - Patch a member in the list

	// Default configuration to test 
	var patch = {

		"email_address": "hello@world.com",
	    "id": "4b3cdf9adfc6258a102ab90eb64565ea",
	    "language": "fr",
	    "location": {
	        "latitude": 48.85661400000001,
	        "longitude": 2.3522219000000177
	    },
	    "merge_fields": {
	        "NAME": "Léo",
	        "AGE": 29,
	        "GENDER": "male",
	        "JOB": "Student"
	    },
	    "interests": {
	        "ec4795dc5b": true
	    }

	}

	Mailchimp.updateMember( "4b3cdf9adfc6258a102ab90eb64565ea", patch )
		.then(function(){
			Mailchimp.writeMembersToFile( __dirname + '/../');
		});





