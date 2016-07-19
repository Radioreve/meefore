
var config = require('./config');

var placeholder_img_id = "placeholder_picture2";
var placeholder_img_vs = "1467901779";
var min_age            = 18;

var settings = {

	api_version: 1,
	app: {
		min_group: 2,
		max_group: 4,
		min_hosts: 2,
		max_hosts: 4,
		min_age  : min_age,
		max_age  : 50,
		max_pic  : 5,
		chat_fetch_count: 20
	},
	facebook: {
		token_lifespan_limit: 20
	},
	default_pictures: [
		{ img_id: placeholder_img_id, img_version: placeholder_img_vs, img_place: 0, is_main: true , hashtag: 'me' },
      	{ img_id: placeholder_img_id, img_version: placeholder_img_vs, img_place: 1, is_main: false, hashtag: 'hot' },
	    { img_id: placeholder_img_id, img_version: placeholder_img_vs, img_place: 2, is_main: false, hashtag: 'friends' },
	    { img_id: placeholder_img_id, img_version: placeholder_img_vs, img_place: 3, is_main: false, hashtag: 'natural' },
	    { img_id: placeholder_img_id, img_version: placeholder_img_vs, img_place: 4, is_main: false, hashtag: 'whatever' }
	],
	default_app_preferences: {

		min_frequency: 7200,
		alerts_push: {},	 
		alerts_phone: {},
		alerts_email: {
			"new_message"    : false,
			"marked_as_host" : false,
			"new_cheers"     : false,
			"new_match"      : false
		},
      	ux: {
	        'auto_login'   : true,
	        'message_seen' : true,
	        'show_gender'  : true,
	        'show_country' : false
      	},
      	subscribed_emails: {
      		// See below, dynamically rendered by the config file 
      	}
	},
	public_properties: {
		users: 
			[
				'facebook_id',
				'facebook_url', 
				'name', 
				'age',
				'job', 
				'location',
				'pictures',
				'gender', 
				'country_code', 
				'signed_up_at', 
				// 'channels',
				'ideal_night'
			],
		befores: []
	},
	placeholder: {
		img_id      : placeholder_img_id,
		img_version : placeholder_img_vs
	},

};
	
	// Setting the mailchimp defaults 
	settings.default_app_preferences.email = settings.default_app_preferences.email || {};
	
	config.mailchimp.interests.forEach(function( interest ){
		settings.default_app_preferences.subscribed_emails[ interest.name ] = interest.default_value;
	});



module.exports = settings;