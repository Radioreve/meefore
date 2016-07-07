
	var _ 	     = require('lodash');
	var config   = require('../../../config/config').mailchimp;
	var Promise  = require('bluebird');
	var fs 		 = Promise.promisifyAll( require('fs') );

	// Mailchimp interface
	var MailchimpInterface = require('../../../services/mc');
	var Mailchimp 		   = new MailchimpInterface( _.extend( {}, config, { list_id: "ace186c18c" } ));

	Mailchimp.infoLog("member url default : " + Mailchimp._getMemberURL("leo@free.fr") );
	Mailchimp.infoLog("member url default : " + Mailchimp._getMemberURL("alice@free.fr", "light") );
	Mailchimp.infoLog("member url default : " + Mailchimp._getMemberURL("ben@free.fr"), [ "merge_fields" ] );
	Mailchimp.infoLog("member url default : " + Mailchimp._getMemberURL("mike@free.fr", "doesnt exist") );
	Mailchimp.infoLog("member(s) url default : " + Mailchimp._getMembersURL() );
	Mailchimp.infoLog("member(s) url default : " + Mailchimp._getMembersURL("light") );
	Mailchimp.infoLog("member(s) url default : " + Mailchimp._getMembersURL(["merge_fields"]) );
	Mailchimp.infoLog("member(s) url default : " + Mailchimp._getMembersURL("doesnt exist") );