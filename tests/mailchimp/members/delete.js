
	var _ 	     = require('lodash');
	var config   = require('../../../config/config').mailchimp;
	var Promise  = require('bluebird');
	var fs 		 = Promise.promisifyAll( require('fs') );
	var tools 	 = require('../../tools');

	// Mailchimp interface
	var MailchimpInterface = require('../../../services/mc');
	var Mailchimp 		   = new MailchimpInterface( _.extend( {}, config, { list_id: "ace186c18c" } ));


	// Test - Delete a member from a list

	console.log('Running...');
	
	Mailchimp.getMembers(["id", "email_address"])
		.then(function( members ){
			Mailchimp.warnLog('Deleting member ' + members[0].id + ' (' + members[0].email_address + ')' );
			return Mailchimp.deleteMember( members[0].id );
		})
		.then(function(){
			return Mailchimp.writeMembersToFile( __dirname + '/../' );
		})
		.catch( console.log );


