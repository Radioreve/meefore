
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
	// Allowed type values :
	//  	text, number, address, phone, email, date, url, imageurl, radio, dropdown, checkboxes, birthday, zip

	var name   = { tag: "NAME"  , type: "text", name: "Name" };
	var fbname = { tag: "FB"    , type: "text", name: "Fb" };
	var age    = { tag: "AGE"   , type: "number", name: "Age" };
	var gender = { tag: "GENDER", type: "radio", name: "Gender", choices: [ "male", "female" ] };
	var job    = { tag: "JOB"   , type: "text", name: "Job" };

	var arr = [];
	arr.push( Mailchimp.createMergeField( name ) );
	arr.push( Mailchimp.createMergeField( fbname ) );
	arr.push( Mailchimp.createMergeField( age ) );
	arr.push( Mailchimp.createMergeField( gender ) );
	arr.push( Mailchimp.createMergeField( job ) );

	Promise.all( arr )
		.then(function( res ){
			res.forEach(function( r ){
				if( r.errors ){
					Mailchimp.errLog( JSON.stringify(r.errors,null,4) );
				} else {
					Mailchimp.infoLog( JSON.stringify(r,null,4) );
				}
			});
		})
		.then(function(){
			return Mailchimp.writeMergeFieldsToFile( __dirname + '/../' );
		})
		// .then(function(){
		// 	return Mailchimp.writeMembersToFile( __dirname + '/../' );
		// })
		.catch( Mailchimp.errLog )





