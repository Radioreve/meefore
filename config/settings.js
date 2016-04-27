
var config = require('./config');

var placeholder_img_id = "placeholder_picture";
var placeholder_img_vs = "1458583061";
var min_age = 18;

var settings = {

	api_version: 1,
	app: {
		min_group: 2,
		max_group: 4,
		min_hosts: 2,
		max_hosts: 4,
		min_age  : min_age,
		max_age  : 50,
		max_pic  : 5
	},
	default_profile_values: {
		name: 'Meename',
		age: min_age, 
		img_id: placeholder_img_id,
		img_vs: placeholder_img_vs,
		job: 'Meelover'
	},
	default_pictures: [
		{ img_id: placeholder_img_id, img_version: placeholder_img_vs, img_place: 0, is_main: true , hashtag: 'me' },
      	{ img_id: placeholder_img_id, img_version: placeholder_img_vs, img_place: 1, is_main: false, hashtag: 'hot' },
	    { img_id: placeholder_img_id, img_version: placeholder_img_vs, img_place: 2, is_main: false, hashtag: 'friends' },
	    { img_id: placeholder_img_id, img_version: placeholder_img_vs, img_place: 3, is_main: false, hashtag: 'natural' },
	    { img_id: placeholder_img_id, img_version: placeholder_img_vs, img_place: 4, is_main: false, hashtag: 'whatever' }
	],
	default_app_preferences: {
      	alerts: {
	        'new_message_received': 'yes',
	        'accepted_in' : 'yes',
	        'min_frequency': '7200' // 1 hour
      	},
      	ux: {
	        'auto_login': 'no',
	        'message_readby': 'yes',
	        'show_gender': 'no',
	        'show_country': 'yes'
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
				'signup_date', 
				'channels',
				'ideal_night'
			],
		events: []
	},
	activeEventStates:
			 [
			 	"open",
			 	"suspended"
			 ],
	placeholder: 
			{
				img_id      : placeholder_img_id,
				img_version : placeholder_img_vs
			},

	// Builds a ladder system as an array of ladder items
	// Based on the range of levels necesary, the base points
	// And the coef to determine how hard it is to climb the ladder
	// Each item contains a level and a range of xp
	ladder_max_level: 30,
	ladder_base_point: 100,
	ladder_base_coef: 1.5,

	initLadder: function initLadder( options ){ 

		var options = options || {};

		var max_level  = options.max_level  || this.ladder_max_level,
			base_point = options.base_point || this.ladder_base_point,
			base_coef  = options.base_coef  || this.ladder_base_coef;

		if( !max_level || !base_coef || !base_point )
			return console.log('Missing parameter, max_level: ' + max_level + ', base_point: ' + base_point + ', base_coef: ' + base_coef );

		var skill_ladder = [{ 
			level: 1,
			min_xp: base_point,
			max_xp: base_point + base_point * base_coef 
		}];

		for( var i = 1; i <= max_level; i++ ){

			var item = {}

			item.level = i+1;
			item.min_xp = skill_ladder[i-1].max_xp; 

			var max_xp = ( i * base_point ) + Math.floor( base_point * Math.pow( base_coef, i+1 ) ),
				max_xp_length = ( max_xp + '' ).length,
				rounder = Math.pow( 10, max_xp_length - 3 );

			item.max_xp = Math.floor( max_xp / rounder ) * rounder;

			skill_ladder.push( item );
			
		}

		return skill_ladder;

	}
};
	
	// Setting the mailchimp defaults 
	settings.default_app_preferences.email = settings.default_app_preferences.email || {};
	
	config.mailchimp.groups.forEach(function( group_object ){
		settings.default_app_preferences.email[ group_object.name ] = group_object.init_value;
	});



module.exports = settings;