	
	var buildRoomId = function(eventId, hostId, userId){
		return eventId+'_'+hostId+'-'+userId;
	};

	var raiseError = function(p){

		console.log('Raising error');
		if( p.toServer ){ console.error( p.toServer ); }
		if( p.err ){ console.error( p.err ); }
		if( p.toClient && p.socket ){ p.socket.emit( 'server error', p.toClient ); }

	};

	module.exports = {
		buildRoomId: buildRoomId,
		raiseError: raiseError
	};