	
	var buildRoomId = function(eventId, hostId, userId){
		return eventId+'_'+hostId+'-'+userId;
	};

	var raiseError = function(p){

		console.log('Raising error');
		if( p.toServer ){ console.error( p.toServer ); }
		if( p.err ){ console.error( p.err ); }
		if( p.toClient && p.socket ){
			if( typeof(p.socket) == Array ){
				for ( i=0; i<p.socket.length ; i++){
				p.socket[i].emit( 'server error', p.toClient );				
				}
			}else{
				p.socket.emit('server error', p.toClient );
			}
	}

	};

	module.exports = {
		buildRoomId: buildRoomId,
		raiseError: raiseError
	};