
	var request = require('request');
	var config  = require('../config/config');

	function pretty( json ){
		console.log( JSON.stringify( json, null, 3 ));
	};


	function subscribeToMailchimp( options, callback ){

	var api_key  = options.api_key,
		username = options.username,
		dc       = options.dc,
		list_id  = options.list_id,
		user     = options.user;

	var url = 'https://'+username+':'+api_key+'@' + dc + '.api.mailchimp.com/3.0/lists/' + list_id + '/members';

	request.post({ url: url, body: user, json: true }, function( err, res, body ){
		console.log(err);
		console.log(res);
		if( err )
			return callback( err, null )
		callback( null, body );
	});
	
	};


	console.log('Subscribing');
	var mailer = require('./../globals/mailer');
	mailer.subscribeToMailchimp({
					api_key: config.mailchimp.api_key,
					username: config.mailchimp.username,
					dc: config.mailchimp.dc,
					list_id: config.mailchimp.list_id,
					user: {
						email_address: "karen_drymyky_amelie@tfbnw.net",
						status: "subscribed",
						merge_fields: {
							FNAME: 'Karen'
						}
					}
				}, function( err, chimp_user ){
					console.log('Callback');
					if(err) return console.log(err);
					console.log( chimp_user );
				});




