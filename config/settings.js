

var settings = {

	eventsFreezeAt: 9,
	eventsEndAt: 10,

	tagList: 
			 [  'afterwork',
				'before',
				'club',
				'apero',
				'cameltoe',
				'apparte',
				'bar',
				'rencontre',
				'vodka',
				'erasmus',
				'firsttime'
			 ],

	activeEventStates:
			 [
			 	'open',
			 	'suspended',
			 	'full',
			 	'frozen'
			 ],
	isFrozenTime: function(){
		var hour = (new Date).getHours();
		return ( hour >= settings.eventsFreezeAt && hour < settings.eventsEndAt );
	}


};

module.exports = settings;