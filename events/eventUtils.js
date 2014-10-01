	
	var buildRoomId = function(eventId, hostId, userId){
		return eventId+'_'+hostId+'-'+userId;
	};

	module.exports = {
		buildRoomId: buildRoomId
	};