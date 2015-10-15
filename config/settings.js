
var settings = {

	api_version: 1,
	app: {
		min_group: 1,
		max_group: 4,
		min_hosts: 1,
		max_hosts: 5,
		min_ambiance: 1,
		max_ambiance: 4,
		mood: 
		[
			{ id: 'happy', display: 'Happy' },
			{ id: 'cheers', display: 'Relax' },
			{ id: 'drunk', display: 'Drunk' },
			{ id: 'chill', display: 'Chill' },
			{ id: 'horney', display: 'Horney' },
			{ id: 'innocent', display: 'Innocent' },
			{ id: 'evil', display: 'Evil' },
		],
		drink:
		[
			{ id: 'water', display: 'H2O' },
			{ id: 'hard', display: 'Hard' },
			{ id: 'shots', display: 'Shots' },
			{ id: 'beer', display: 'Beer' },
			{ id: 'wine', display: 'Wine' }
		],
		agerange_min: 18,
		agerange_max: 35,
		mixity: 
		[
			{ id: 'boys', display: 'Mars', icon_code: 'mars' },
			{ id: 'girls', display: 'Vénus', icon_code: 'venus' },
			{ id: 'mixed', display: 'Mixte', icon_code: 'mix' },
		]
	},
	public_properties: {
		users: 
			[
				'facebook_id',
				'facebook_url', 
				'signup_date', 
				'age', 
				'gender', 
				'job', 
				'name', 
				'drink', 
				'mood',
				'country_code', 
				'pictures',
				'channels'
				//'skills'
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
				img_id      :"placeholder_picture",
				img_version :"1444912756"
			},
	ladder_max_level: 30,
	ladder_base_point: 100,
	ladder_base_coef: 1.5,
	initLadder: function initLadder( options ){ 

		var max_level  = options.max_level,
			base_point = options.base_point,
			base_coef = options.base_coef;

		var skill_ladder = [{ level: 1, min_xp: base_point, max_xp: base_point + base_point*base_coef }];

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
	},
	isFrozenTime: function(){
		var hour = (new Date).getHours();
		return ( hour >= settings.eventsTerminateAt && hour < settings.eventsRestartAt );
	}
};


module.exports = settings;