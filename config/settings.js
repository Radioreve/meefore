
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
	profileRowsList: 
			[
				{
					"name":"drink",
					"display":"Ton verre",
					"place":"1",
					"values": [ 
								{ "id":"water", "display":"eau"},
								{ "id":"soft", "display":"soft"},
								{ "id":"hard", "display":"hard"},
								{ "id":"shots", "display":"shots"},
								{ "id":"wine", "display":"vin"},
								{ "id":"beer", "display":"bière"},
							  ]
				},
				{
					"name":"mood",
					"display":"Humeur du jour",
					"place":"0",
					"values": [ 
								{ "id":"whatever", "display":"whatever"},
								{ "id":"tired", "display":"fatigué"},
								{ "id":"drunk", "display":"ivre"},
								{ "id":"happy", "display":"happy"},
								{ "id":"fail", "display":"phail"},
								{ "id":"fired", "display":"bouillant"},
							  ]
				}
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
			 	'open',
			 	'suspended'
			 ],
	isFrozenTime: function(){
		var hour = (new Date).getHours();
		return ( hour >= settings.eventsTerminateAt && hour < settings.eventsRestartAt );
	}
};


module.exports = settings;