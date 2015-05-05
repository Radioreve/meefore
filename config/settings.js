
var settings = {

	eventsTerminateAt: 3,  // utiliser pour le cron job
	eventsRestartAt: 4,   // utiliser pour empêcher de créer un event trop tôt
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
				'peace',
				'erasmus',
				'electro',
				'latino'
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
				"Ils m'appelaient mousse"
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