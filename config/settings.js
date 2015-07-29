
var settings = {

	eventsTerminateAt: 1,  // utiliser pour le cron job
	eventsRestartAt: 9,   // utiliser pour empêcher de créer un event trop tôt
	tagList: 
			 [  
			 	'afterwork',
				'club',
				'apero',
				'blackout',
				'bar',
				'apparte',
				'rock',
				'rencontre',
				'erasmus'
			 ],
	profileDescList:
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

			],
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