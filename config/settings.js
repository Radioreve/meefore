

var settings = {

	eventsTerminateAt: 16,  // utiliser pour le cron job
	eventsRestartAt: 12,   // utiliser pour empêcher de créer un event trop tôt
	tagList: 
			 [  'afterwork',
				'before',
				'club',
				'apero',
				'apparte',
				'bar',
				'rencontre',
				'erasmus',
				'blackout'
			 ],

	activeEventStates:
			 [
			 	'open',
			 	'suspended'
			 ],
	isFrozenTime: function(){
		var hour = (new Date).getHours();
		return ( hour >= settings.eventsFreezeAt && hour < settings.eventsEndAt );
	}


};

module.exports = settings;