	
	var tools    = require('../../tools');
	var _ 	     = require('lodash');
	var config   = require('../../../config/config').mailchimp;
	var Promise  = require('bluebird');
	var fs 		 = Promise.promisifyAll( require('fs') );
	var term     = require('terminal-kit').terminal;

	// Mailchimp interface
	var MailchimpInterface = require('../../../services/mc');
	var Mailchimp 		   = new MailchimpInterface( _.extend( {}, config, { list_id: "ace186c18c" } ));


	/* Full test of the Mailchimp interface

		-> Create a new member
		-> Get him and verify he exists
		-> Patch him 
		-> Get him and verify the update worked
		-> Delete him
		-> Get him and make sure he disappeared */

	var id 			  = null;
	var email_address = tools.randHumanName() + '@mailchimp.com';

	var signup_data   = {

		email_address: email_address,
		merge_fields : {
			"NAME": "Adr",
			"AGE": 22,
			"JOB": "Etudiant",
			"GENDER": "male"
		}

	};

	var soft_patch = {

		merge_fields : {
			"GENDER": "female",
			"AGE": 25
		}

	}

	var hard_patch = {

		email_address: "new@mail.fr",
		merge_fields : {
			"JOB": "surfer"
		}

	}


	tools.countdown("Starting Mailchimp interface full test suite.")
		.then(function(){
			return tools.success("Let's go ->\n");
		})
		// Subscribing a new member
		.then(function(){
			return tools.countdown("Subscribing new member with email " + email_address )
		})
		.then(function(){
			return Mailchimp.createMember( signup_data );
		})
		.then(function( member ){
			id = member.id;
			return testMemberCreated( member );
		})


		// Requesting the member
		.then(function(){
			return tools.countdown("Making sure member exists and looks ok");
		})
		.then(function(){
			return Mailchimp.getMember( id );
		})
		.then(function( member ){
			return testMemberFetched( member );
		
		})

		// Patching the new member with custom informations
		.then(function(){
			return tools.countdown("Patching the user with basic informations");
		})
		.then(function(){
			return Mailchimp.updateMember( id, soft_patch );
		})
		.then(function( member ){
			return testMemberPatched( member );
		
		})

		
		// Patching the new member with new email
		.then(function(){
			return tools.countdown("Patching now the user with a new email");
		})
		.then(function(){
			return Mailchimp.updateMember( id, hard_patch );
		})
		.then(function( member ){
			console.log('Updating the reference id from ' + id + ' to ' + member.id );
			id = member.id
			return testMemberPatchedEmail( member );
		
		})

		// Deleting the member
		.then(function(){
			return tools.countdown("Deleting the member with id : " + id );
		})
		.then(function(){
			return Mailchimp.deleteMember( id );
		})
		.then(function( member ){
			return testMemberDeleted( member );
		
		})

		.catch(function( err ){

			tools.error("Fatal");
			tools.error( JSON.stringify( err, null, 4 ) );

		})

		.finally(function(){

			Mailchimp.writeMembersToFile( __dirname + '/../' )
				.then(function(){
					process.exit(1);
				});

		});



	function testMemberCreated( member ){

		var ns = "testMemberCreated";

		if( !member ){
			return Promise.reject({ ns: ns, message: "Member doesnt exist", member: member });
		}

		if( member.email_address != email_address ){
			return Promise.reject({ ns: ns, message: "Email addresses dont match (or doesnt exist)", member: member });
		}

		if( !member.id ){
			return Promise.reject({ ns: ns, message: "Member doesnt have an 'id' field", member: member });
		}

		tools.success("Success! Member has been created and looks okay.\n");
		return Promise.resolve();


	}

	function testMemberFetched( member ){

		var ns = "testMemberFetched";

		if( !member ){
			return Promise.reject({ ns: ns, message: "Member doesnt exist", member: member });
		}

		if( member.email_address != email_address ){
			return Promise.reject({ ns: ns, message: "Email addresses dont match (or doesnt exist)", member: member });
		}

		if( member.id != id ){
			return Promise.reject({ ns: ns, message: "Member id doesnt match (or doesnt exist)", member: member });
		}

		tools.success("Success again! Member has been fetched and looks as expected.\n");
		return Promise.resolve();


	}

	function testMemberPatched( member ){

		var ns = "testMemberPatched";

		if( !member ){
			return Promise.reject({ ns: ns, message: "Member doesnt exist", member: member });
		}

		if( member.email_address != email_address ){
			return Promise.reject({ ns: ns, message: "Email addresses dont match (or doesnt exist)", member: member });
		}

		if( member.id != id ){
			return Promise.reject({ ns: ns, message: "Member id doesnt match (or doesnt exist)", member: member });
		}

		if( member.merge_fields && (member.merge_fields.GENDER != soft_patch.merge_fields.GENDER || member.merge_fields.AGE != soft_patch.merge_fields.AGE ) ){
			return Promise.reject({ ns: ns, message: "Patch didnt apply, GENDER and/or AGE are not equal to what they should be "});
		}

		console.log( JSON.stringify(member.merge_fields, null, 4 ) );

		tools.success("Success again! Member has been patched and looks as expected.\n");
		return Promise.resolve();

	}

	function testMemberPatchedEmail( member ){

		var ns = "testMemberPatchedEmail";

		if( !member ){
			return Promise.reject({ ns: ns, message: "Member doesnt exist", member: member });
		}

		if( member.email_address == email_address ){
			return Promise.reject({ ns: ns, message: "Email addresses match whereas they should not! ", member: member });
		}

		if( member.email_address != hard_patch.email_address ){
			return Promise.reject({ ns: ns, message: "Email address is not equal to the new one!", member: member });
		}

		if( member.merge_fields.JOB != hard_patch.merge_fields.JOB ){
			return Promise.reject({ ns: ns, message: "New values patched at the same time wasnt applied", member: member });
		}

		if( member.merge_fields && (member.merge_fields.GENDER != soft_patch.merge_fields.GENDER || member.merge_fields.AGE != soft_patch.merge_fields.AGE )){
			return Promise.reject({ ns: ns, message: "Previous patch (merge_fields) didnt stick."});
		}

		console.log( JSON.stringify(member.merge_fields, null, 4 ) );

		tools.success("Success again! Member has changed his email, kept all params and added new one all at the same time. \n");
		return Promise.resolve();

	}

	function testMemberDeleted( member ){

		var ns = "testMemberDeleted";

		if( member ){
			return Promise.reject({ ns: ns, message: "Member should be 'null'", member: member });
		}

		tools.success("Final success! Member has been deleted and his informations are sent back.\n");
		return Promise.resolved

	}


