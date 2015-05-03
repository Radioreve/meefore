
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
				'Léo du bon marché',
				'Mike de Moutain Hike',
				'Guitou du Chateauroux',
				'Louis de Rivoli'
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