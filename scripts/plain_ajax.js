	
	function sendAjax(){

		var ajax_request = new XMLHttpRequest();
			ajax_request.responseType = "json";

		var url = "/api/me";
			
			ajax_request.onreadystatechange = function(){

				if ( ajax_request.readyState == 1 )
				{
				    console.log('Request has been set up');
					ajax_request.setRequestHeader('X-Skill','1337');
				    
				}
				if ( ajax_request.readyState == 2 )
				{
				    console.log('Request has been sent');
				}
				if ( ajax_request.readyState == 3 )
				{
				    console.log('Request is in process...');
				}
				if ( ajax_request.readyState == 4 )
				{
				    console.log('Request is completed!');
				    var data = JSON.parse( ajax_request );
				    console.log(data);
				}
			};

		ajax_request.open('POST', url, true );
		ajax_request.send({ name: "Léonidas" });

	};