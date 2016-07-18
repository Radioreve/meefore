	
	var config          = require('../config/config');
	var User            = require('../models/UserModel');
	var bluebird        = require('bluebird');
	var config          = require('../config/config');
	var _               = require('lodash');
	var term            = require('terminal-kit').term;
	var mandrill        = require('mandrill-api/mandrill');
	var mandrill_client = new mandrill.Mandrill( config.mandrill.api_key );
	
	function handleErr( err, err_ns ){

		err_ns = err_ns || "alerter";

		term.bold.red('Error sending email, err_ns='+ err_ns );
		term.bold.red( err + '\n' );
	}

	var supported = ["fr", "en"];
	// var base_style = "\"background:#eee; padding: 5px 2px; border-radius:2px; display:inline-block;\""
	var text_source = {

		"alert_message_received_subject": {
			"fr": "%sender_name vous a envoyé un message",
			"en": "%sender_name has sent you a message"
		},
		"alert_message_received_body": {
			"fr": [
						"<div><b>Bonjour %receiver_name,</b></div>",
						"<br>",
						"<div>Il y a de l'activité sur une des discussion où vous participez.</div>",
						"<div>Connectez-vous pour accéder à toutes vos <a href=\"http://www.meefore.com\">discussions.</a>.</div>",
						"<br>",
						"<div>A bientôt en soirée,</div>",
						"<div>L'équipe de Meefore</div>"

			].join(''),
			"en": [
						"<div><b>Hi %receiver_name,</b></div>",
						"<br>",
						"<div>There has been activity on one of your discussions since your your connection.</div>",
						"<div>Connect to access all your <a href=\"http://www.meefore.com\">chats</a>.</div>",
						"<br>",
						"<div>See you soon around a drink,</div>",
						"<div>The Meefore team</div>"
			].join('')
		},
		"alert_accepted_in_subject": {
			"fr": "Vous avez un Match !",
			"en": "It's a Match !"
		},
		"alert_accepted_in_body": {
			"fr": [
						"<div><b>Bonjour %receiver_name,</b></div>",
						"<br>",
						"<div>Vous avez un nouveau Match.</div>",
						"<div>Pour engager la discussion, c'est par <a href=\"http://www.meefore.com\">ici</a>.</div>",
						"<br>",
						"<div>A bientôt en soirée,</div>",
						"<div>L'équipe de Meefore</div>"

			].join(''),
			"en": [
						"<div><b>Hi %receiver_name,</b></div>",
						"<br>",
						"<div>You have a new Match.</div>",
						"<div>To chat with people hosting the pregame party, go <a href=\"http://www.meefore.com\">here</a>.</div>",
						"<br>",
						"<div>See you soon around a drink,</div>",
						"<div>The Meefore team</div>"
			].join('')
		},
		"alert_marked_as_host_subject": {
			"fr": "Vous avez été marqué coorganisateur",
			"en": "You have been marked as host"
		},
		"alert_marked_as_host_body": {
			"fr": [
						"<div><b>Bonjour %receiver_name,</b></div>",
						"<br>",
						"<div>%friend_name vous a marqué coorganisateur de son <a href=\"http://www.meefore.com\">before</a></div>",
						"<div>%address, %date</div>",
						"<br>",
						"<div>A bientôt en soirée,</div>",
						"<div>L'équipe de Meefore</div>"

			].join(''),
			"en": [
						"<div><b>Hi %receiver_name,</b></div>",
						"<br>",
						"<div>%friend_name has marked you as host of his <a href=\"http://www.meefore.com\">pregame</a></div>",
						"<div>%address, %date</div>",
						"<br>",
						"<div>See you soon around a drink,</div>",
						"<div>The Meefore team</div>"
			].join('')
		},
		"alert_cheers_received_subject": {
			"fr": "Vous avez reçu un Cheers",
			"en": "You have received a Cheers"
		},
		"alert_cheers_received_body": {
			"fr": [
						"<div><b>Bonjour %receiver_name,</b></div>",
						"<br>",
						"<div>Un groupe a montré de l'intérêt pour votre before en vous envoyant en Cheers.</div>",
						"<div>Pour voir leurs profils, c'est par <a href=\"http://www.meefore.com\">ici</a>.</div>",
						"<br>",
						"<div>A bientôt en soirée,</div>",
						"<div>L'équipe de Meefore</div>"

			].join(''),
			"en": [
						"<div><b>Hi %receiver_name,</b></div>",
						"<br>",
						"<div>A group showed you their interest in your pregame by sending you a Cheers.</div>",
						"<div>To check them out, go <a href=\"http://www.meefore.com\">here</a>.</div>",
						"<br>",
						"<div>See you soon around a drink,</div>",
						"<div>The Meefore team</div>"
			].join('')
		}


	};


	var sendAdminEmail = function( opts ){

		var subject = opts.subject;
		var html 	= opts.html;

		var recipients = [{ email: 'leo@meefore.com', name: 'Léo' }];

		if( process.env.APP_ENV == 'prod' ){
			recipients.push({ email: 'ben@meefore.com', name: 'Ben' });
		}

		mandrill_client.messages.send({

			"key": config.mandrill.api_key,

		    "message": {

		        "from_email" : "watcher@meefore.com",
		        "from_name"  : "MeeforeWatcher",

		        "subject"	 : subject,
		        "html"       : html,
		        "to"		 : recipients

		    }
		},
		function( res ){
			console.log( res );
		},
		function( err ){
			term.bold.red( err );
		});

	};

	var sendAlertEmail = function( type ){
		return function( req, res, next ){

			// Dont wait for emails to continue with the request
			next();

			if( type == "new_message" ){
				filterUsersToAlert()
					.then(function( users ){
						sendAlertEmail__NewMessage();
					});
			}

			if( type == "marked_as_host" ){
				sendAlertEmail__MarkedAsHost();
			}

			if( type == "group_request" ){
				sendAlertEmail__GroupRequest();
			}

			if( type == "accepted_in" ){
				addNotification__AcceptedIn();
			}

		}
	};


	var sendAlertEmail__Base = function( subject, html, targets ){

		targets = Array.isArray( targets ) ? targets : [ targets ];

		var recipients = [];
		targets.forEach(function( target ){
			recipients.push({
				email: target.email,
				name : target.mail,
				type : "to"
			});
		});

		mandrill_client.messages.send({

			"key": config.mandrill.api_key,

		    "message": {

		        "from_email" : "hello@meefore.com",
		        "from_name"  : "Meefore",

		        "subject"	 : subject,
		        "html"       : html,
		        "to"		 : recipients

		    }
		},
		function( res ){
			console.log( res );
		},
		function( err ){
			term.bold.red( err );
		});

	};

	var sendAlertEmail__MessageReceived = function( req, res, next ){

		var err_ns = "sending_alert_message_received";

		receiver_emails = Array.isArray( receiver_emails ) ? receiver_emails : [ receiver_emails ];
		sender_name     = opts.sender_name;

		User.find({ contact_email: receiver_emails }, function( err, users ){

			if( err || !users ){
				return handleErr( err)
			}

			var cc = user.country_code;

			var subject = makeText( cc, "alert_message_received_subject" );
			subject = subject.replace('%sender_name', sender_name );

			var html = makeText( cc, "alert_message_received_body" );
			html = html.replace('%receiver_name', user.name );


			var alert_email = new sendgrid.Email({
				from     : 'no-reply@meefore.com',
				fromname : 'Meefore',
				subject  : subject,
				to       : receiver_email,
				html     : html
			});

			sendAlertEmail__Base( opts );

		});
	};


	var sendAlertEmail__AcceptedIn = function( receiver_emails ){

		var err_ns = "sending_alert_accepted_in";

		receiver_emails = Array.isArray( receiver_emails ) ? receiver_emails : [ receiver_emails ];

		User.find({ contact_email: receiver_emails }, function( err, users ){

			if( err || !user ) return;

			var cc = user.country_code;

			var subject = makeText( cc, "alert_accepted_in_subject" );

			var html = makeText( cc, "alert_accepted_in_body" );
			html = html.replace('%receiver_name', user.name );


			var alert_email = new sendgrid.Email({
				from     : 'no-reply@meefore.com',
				fromname : 'Meefore',
				subject  : subject,
				to       : receiver_email,
				html     : html
			});

			sendgrid.send( alert_email, function( err, res ){
				if( err )
					return console.log(err);
			});

		});

	};

	var sendAlertEmail__MarkedAsHost = function( receiver_emails ){

		var err_ns = "sending_alert_marked_as_host";

		receiver_emails = Array.isArray( receiver_emails ) ? receiver_emails : [ receiver_emails ];

		User.find({ contact_email: receiver_emails })


	}

	var sendAlertEmail__CheersReceived = function( receiver_emails ){

		var err_ns = "sending_alert_cheers_received";

		receiver_emails = Array.isArray( receiver_emails ) ? receiver_emails : [ receiver_emails ];

		User.find({ contact_email: receiver_emails })


	}


	function makeText( country_code, text_id ){

		if( supported.indexOf( country_code ) == -1 ){
			country_code = "en";
		}

		return text_source[ text_id ][ country_code ];

	};

	(function testAllEmails( test ){

		if( !test ) return;

		var send_to = [{ email: "ljayame@gmail.com" }, { email: "leo@blstudio.fr" }];

		sendAlertEmail__Base(
			makeText("fr", "alert_message_received_subject").replace('%sender_name','Frank'),
			makeText("fr", "alert_message_received_body").replace('%receiver_name','Léo'),
			send_to
		);

		sendAlertEmail__Base(
			makeText("fr", "alert_accepted_in_subject"),
			makeText("fr", "alert_accepted_in_body").replace('%receiver_name','Léo'),
			send_to
		);

		sendAlertEmail__Base(
			makeText("fr", "alert_marked_as_host_subject"),
			makeText("fr", "alert_marked_as_host_body")
				.replace('%receiver_name','Léo')
				.replace('%friend_name','Céline')
				.replace('%address', '37 rue du four, 75006 Paris')
				.replace('%date', '26/06/16, 19:00'),
			send_to
		);

		sendAlertEmail__Base(
			makeText("fr", "alert_cheers_received_subject"),
			makeText("fr", "alert_cheers_received_body").replace('%receiver_name','Léo'),
			send_to
		);

	// Set to true to activate tests
	})( false );

	filterUsersToAlert = function(){
		return new Promise(function( resolve, reject ){
			resolve();
		});
	}


	module.exports = {

		sendAdminEmail : sendAdminEmail,
		sendAlertEmail : sendAlertEmail

	};
