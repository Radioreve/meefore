	
	var config          = require('../config/config');
	var settings        = require('../config/settings');
	var User            = require('../models/UserModel');
	var Promise         = require('bluebird');
	var rd 		 	    = require('../services/rd');
	var connecter 	    = require('../middlewares/connecter');
	var config          = require('../config/config');
	var _               = require('lodash');
	var term            = require('terminal-kit').terminal;
	var mandrill        = require('mandrill-api/mandrill');
	var mandrill_client = new mandrill.Mandrill( config.mandrill.api_key );
	var moment 		 	= require('moment');
	
	function alertLog( message ){
		term.bold.yellow( '[Alerter] ' + message + '\n' );
	}

	function handleErr( err, err_ns ){

		err_ns = err_ns || "alerter";

		term.bold.red('Error sending email, err_ns='+ err_ns + '\n' );
		term.bold.red( err + '\n' );
	}


	var supported_in_templates = [ "fr", "us" ];


	// var base_style = "\"background:#eee; padding: 5px 2px; border-radius:2px; display:inline-block;\""
	var text_source = {

		"new_message_subject": {
			"fr": "Nouveaux messages",
			"us": "New messages"
		},
		"new_cheers_subject": {
			"fr": "Nouveau Cheers",
			"us": "New Cheers"
		},
		"new_match_subject": {
			"fr": "Nouveau Match",
			"us": "New Match"
		},
		"marked_as_host_subject": {
			"fr": "Marqué coorganisateur d'un before",
			"us": "Marked co-host of a predrink"
		}

	};

	var getChatAlertedAt = function( chat_id, callback ){

		var ns = 'alerted_at/' + chat_id;
		rd.get( ns, function( err, res ){

			if( err ){
				callback( err, null );
			} else {
				callback( null, res );
			}

		});

	};

	var setChatAlertedAt = function( chat_id, callback ){

		var ns = 'alerted_at/' + chat_id;
		rd.set( ns, Date.now(), function( err ){

			if( err ){
				callback( err, null );
			} else {
				callback( null );
			}

		});

	};

	var setChatAlertedAtExpire = function( chat_id, callback ){

		var one_hour = 3600;
		var one_week = 604800;

		var ns = 'alerted_at/' + chat_id;
		rd.expire( ns, one_week, function( err ){

			if( err ){
				callback( err, null );
			} else {
				callback( null );
			}

		});

	};


	var sendEmail = function( type ){
		return function( req, res, next ){

			var err_ns = "sending_alerts";

			// Dont wait for emails to continue with the request
			next();

			if([ "new_message", "marked_as_host", "new_cheers", "new_match" ].indexOf( type ) == -1 ){
				return alertLog("The type : " + type + " is not recognized as a valid type");
			}

			getUsersToAlert( req, type )
				.then(function( users ){

					alertLog("Sending an email to : " + _.map( users, 'name' ).join(', ') );
					users.forEach(function( user ){
						sendAlertEmail( req, type, user );
					});

				})	
				.catch(function( err ){

					if( err.msg ){
						alertLog( err.msg );
					} else {
						handleErr( err, err_ns );
					}


				});

		}
	};

	function checkChatAlertStatus( chat_id ){
		return new Promise(function( resolve, reject ){

			getChatAlertedAt( chat_id, function( err, alerted_at ){

				if( err ){
					return reject({ err: err });
				}

				if( alerted_at ){

					alerted_at = parseInt( alerted_at ); // moment.js throw "invalid date" if its a string

					alertLog("Chat was alerted at : " + moment( alerted_at ).toISOString() );
					var diff_in_minutes = ( moment( Date.now() ) - moment( alerted_at ) ) / ( 1000 * 60 );

					if( diff_in_minutes < 1 ){
						return reject({ msg: "Alerter was activated less then 1 minute ago, doing nothing" });
					}

				}

				setChatAlertedAt( chat_id, function( err ){
					if( err ) return reject({ err: err });

					setChatAlertedAtExpire( chat_id, function( err ){
						if( err ) return reject({ err: err });

						resolve();

					});

				});
				


			});

		});
	}

	// Make sure that users validate the following conditions :
	// 	- They werent alerted too recently (check that first in case of the chat alert)
	// 	- They are offline ( tap into redis first then into mongo )
	// 	- They want to receive this specific alert
	function getUsersToAlert( req, type ){

		var specific = Promise.resolve();

		if( type == "new_message" ){
			specific = checkChatAlertStatus( req.sent.chat_id );
		}

		return specific

			.then(function(){
				return findUserIds( req, type );
			})

			.then(function( user_ids ){
				alertLog("Users that were found relevant : " + user_ids );
				return filterOnlineUsers( user_ids );
			})

			.then(function( user_ids ){
				alertLog("Users that are offline : " + user_ids );
				return filterRequester( req, user_ids );
			})

			.then(function( user_ids ){
				alertLog("Users that are offline (without sender) : " + user_ids );
				return filterInterestedUsers( user_ids, type );
			});

	}

	// Find all the relevant ids attached on the req.sent object.
	// The place depends on the api signature, hence the different cases
	function findUserIds( req, type ){
		return new Promise(function( resolve, reject ){

			if( type == "new_cheers" ){
				resolve( req.sent.members.concat( req.sent.before.hosts ) );
			}

			if( type == "new_match" ){
				resolve( req.sent.members.concat( req.sent.before.hosts ) );
			}

			if( type == "marked_as_host" ){
				resolve( req.sent.hosts_facebook_id );
			}

			if( type == "new_message" ){

				User.find(
				{
					"channels.chat_id": req.sent.chat_id
				},
				function( err, users ){

					if( err ) return reject( err );
					resolve( _.map( users, 'facebook_id' ) );

				});

			}

		});
	}

	function filterOnlineUsers( user_ids ){
		return connecter.filterOnlineUsers( user_ids )
				.then(function( online_ids ){
					return _.difference( user_ids, online_ids );
				});

	}

	function filterRequester( req, user_ids ){
		return _.filter( user_ids, function( uid ){
			return uid !== req.sent.facebook_id;
		});

	}

	function filterInterestedUsers( user_ids, type ){
		return new Promise(function( resolve, reject ){

			var interested_users = [];

			User.find(
			{
				'facebook_id': { '$in': user_ids } 
			},
			function( err, users ){

				if( err ) return reject( err );

				users.forEach(function( usr ){

					if( !usr.app_preferences.alerts_email[ type ] ){
						return alertLog( usr.name + " doesnt wish to receive "+ type +" alerts" );
					}

					// For some specific alerts, place an additionnal anti-spam filter, to make sure they are
					// not alerted too often.
					if( [ "new_message" ].indexOf( type ) !== -1 ){

						var diff_in_minutes = ( moment() - moment( usr.alerted_at ) ) / ( 1000 * 60 );
						if( diff_in_minutes < settings.min_frequency ){
							return alertLog( usr.name + ' has been mailed too recently ('+ diff_in_minutes +' min)');
						}

					}

					interested_users.push( usr );

				});

				resolve( interested_users );

			});

		});
	}

	function sendAlertEmail( req, type, user ){

		// The language supported (translated in emails) is not necessarily the same
		// as the one supported on the website. 
		var cc = user.country_code;
		if( supported_in_templates.indexOf( cc ) == -1 ){
			cc = "us";
		}

		if( type == "new_message" ){
			return sendAlertEmail__NewMessage({
				cc 		 : cc,
				sender   : req.sent.user,
				receiver : user
			});
		}

		if( type == "new_match" ){
			return sendAlertEmail__NewMatch({
				cc 		 : cc,
				receiver : user
			});
		}

		if( type == "new_cheers" ){
			return sendAlertEmail__NewCheers({
				cc 		 : cc,
				receiver : user
			});
		}

		if( type == "marked_as_host" ){
			return sendAlertEmail__MarkedAsHost({
				cc 		 : cc,
				receiver : user
			});
		}
	}

	var sendAlertEmail__NewMessage = function( opts ){

		var mandrill_opts = {};
		
		mandrill_opts.target           = { email: opts.receiver.contact_email, name: opts.receiver.name };
		mandrill_opts.subject          = text_source[ "new_message_subject" ][ opts.cc ];
		mandrill_opts.template_name    = "new-message-received";
		mandrill_opts.template_content = [];
		mandrill_opts.cc 			   = opts.cc;

		sendAlertEmail__Base( mandrill_opts );

	};

	var sendAlertEmail__NewMatch = function( opts ){

		var mandrill_opts = {};
		
		mandrill_opts.target           = { email: opts.receiver.contact_email, name: opts.receiver.name };
		mandrill_opts.subject          = text_source[ "new_match_subject" ][ opts.cc ];
		mandrill_opts.template_name    = "new-match";
		mandrill_opts.template_content = [];
		mandrill_opts.cc 			   = opts.cc;

		sendAlertEmail__Base( mandrill_opts );
		
	};

	var sendAlertEmail__NewCheers = function( opts ){

		var mandrill_opts = {};
		
		mandrill_opts.target           = { email: opts.receiver.contact_email, name: opts.receiver.name };
		mandrill_opts.subject          = text_source[ "new_cheers_subject" ][ opts.cc ];
		mandrill_opts.template_name    = "new-cheers";
		mandrill_opts.template_content = [];
		mandrill_opts.cc 			   = opts.cc;

		sendAlertEmail__Base( mandrill_opts );

	};

	var sendAlertEmail__MarkedAsHost = function( opts ){

		var mandrill_opts = {};
		
		mandrill_opts.target           = { email: opts.receiver.contact_email, name: opts.receiver.name };
		mandrill_opts.subject          = text_source[ "marked_as_host_subject" ][ opts.cc ];
		mandrill_opts.template_name    = "marked-as-host";
		mandrill_opts.template_content = [];
		mandrill_opts.cc 			   = opts.cc;

		sendAlertEmail__Base( mandrill_opts );			

	};


	var sendAlertEmail__Base = function( opts ){

		var is_prop_ok = true;
		[ 'subject', 'target', 'template_name', 'template_content' ]
		.forEach(function( prop ){
			if( typeof opts[ prop ] == 'undefined' ){
				alertLog("The opts object is missing the key :" + prop );
				is_prop_ok = false;
			}
		});

		if( !is_prop_ok ){
			return
		}

		mandrill_client.messages.sendTemplate({

			"key": config.mandrill.api_key,

			"template_name"    : opts.template_name + '-' opts.cc,
			"template_content" : opts.template_content,

		    "message": {

		        "from_email" : "hello@meefore.com",
		        "from_name"  : "Meefore",

		        "subject"	 : opts.subject,
		        "to"		 : [{

		        	email: opts.target.email,
		        	name : opts.target.name,
		        	type : "to"

		        }],

		        "headers": {
		        	"Reply-To": "team@meefore.com"
		        },

		        "merge_vars": [
		        	{
		        		rcpt: opts.target.email,
		        		vars: [
		        			{
		        				name   : 'username',
		        				content: opts.target.name
		        			},
		        			{
		        				name    : 'cc',
		        				content : opts.cc
		        			}
		        		]
		        	}
		        ]

		    }
		},
		function( res ){
			alertLog( res );
		},
		function( err ){
			term.bold.red( err );
		});

	};


	function makeText( country_code, text_id ){

		return text_source[ text_id ][ country_code ];

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
			alertLog( res );
		},
		function( err ){
			term.bold.red( err );
		});

	};


	module.exports = {

		sendAdminEmail : sendAdminEmail,
		sendEmail      : sendEmail

	};
