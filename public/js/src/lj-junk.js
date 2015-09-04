	
	function testPusher(){
		$.ajax({
			method:'get', url:'/pusher/test'
		});
	};

	function testPusherEvent( event_id ){
		$.ajax({
			method:'get', url:'/pusher/test/event/'+event_id
		});
	};