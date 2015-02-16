

var settings = {

	eventsTerminateAt: 9,  // utiliser pour le cron job
	eventsRestartAt: 14,   // utiliser pour empêcher de créer un event trop tôt
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
		return ( hour >= settings.eventsTerminateAt && hour < settings.eventsRestartAt );
	}


};

module.exports = settings;