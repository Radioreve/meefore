
var settings = {

	api_version: 1,
	app: {
		min_group: 1,
		max_group: 4,
		min_hosts: 1,
		max_hosts: 5,
		min_ambiance: 1,
		max_ambiance: 5,
		mood: 
		[
			{ id: 'happy', display: 'Happy' },
			{ id: 'drunk', display: 'Drunk' },
			{ id: 'fire', display: 'Fired' },
			{ id: 'horney', display: 'Horney' },
			{ id: 'whatever', display: 'Whatever' }
		],
		drink:
		[
			{ id: 'water', display: 'H2O' },
			{ id: 'hard', display: 'Hard' },
			{ id: 'shots', display: 'Shots' },
			{ id: 'beer', display: 'Beer' },
			{ id: 'wine', display: 'Wine' }
		],
		agerange: 
		[
			{ id: 'whatever', display: 'Whatever', icon_code: 'thumbs-up-alt' },
			{ id: '1825', display: '18-25', icon_code: 'college' },
			{ id: '2530', display: '25-30', icon_code: 'bar' },
			{ id: '30+', display: '30+', icon_code: 'cafe' }
		],
		mixity: 
		[
			{ id: 'whatever', display: 'Whatever', icon_code: 'thumbs-up-alt' },
			{ id: 'boys', display: 'Des gars', icon_code: 'male-1' },
			{ id: 'girls', display: 'Des filles', icon_code: 'female-1' },
			{ id: 'mixed', display: 'Mixte', icon_code: 'users' }
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
				'motto', 
				'name', 
				'drink', 
				'mood', 
				'pictures'
				//'skills'
			],
		events: []
	},

	suggestion_list: {
		motto:
		[
			"Liberté, Egalité, Ebriété !",
			"Nouveau sur Paris, souvent chaud le vendredi",
			"Asian with attitude",
			"Sans alcool la fête est plus molle",
			"Avant je m'ennuyais en soirée. Mais ça c'était avant",
			"Prenez moi comme je suis (sic)",
			"Etudiant(e) en médecine",
			"Etudiant(e) en école de com'",
			"On a conscience avant, on prend conscience après",
			"Grand mère sait faire de la bonne D",
			"Ils m'appelaient mousse",
			"Delphine de porte dauphine",
			"Boubakar du Dakar",
			"Stoi le manque d'inspi",
			"Marjorie. C'est pas grave.",
			"C'est pas parcequ'il y a un gardien qu'on peut pas marquer de but..."
		]
	},
	activeEventStates:
			 [
			 	"open",
			 	"suspended"
			 ],
	placeholder: 
			{
				img_id:"placeholder_picture",
				img_version:"1407342805"
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