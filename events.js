	
	var User = require('./models/UserModel'),
		Event = require('./models/EventModel'),
		cloudinary = require('cloudinary');

	function display(data){
		console.log(JSON.stringify(data,0,4));
	}

	module.exports = function(socket){

		socket.emit('client connected');

		socket.on('disconnect', function(){
			socket.disconnect();
			console.log('Client has left the stream');
		});

		socket.on('test',function(){
			console.log('client connected');
		})

		socket.on('update profile', function(data){
			User.findByIdAndUpdate(data._id,{
				name:data.name,
				description:data.description,
				age:data.age,
				phone:data.phone,
				status:data.status
			},{},function(err,user){
				
				if(err){socket.emit('update profile error');}
				else{
					console.log('Emtting event update profile success')
					socket.emit('update profile success', {user:user});
				}
				display(user);
			});	
		});



		socket.on('update picture', function(data){
						var newImg = {id:data.img_id,version:data.img_version};
					User.findByIdAndUpdate(data._id,{
						img:newImg
					},{}, function(err,user){
						if(err){console.log('err : '+err); socket.emit('update picture error');}
						else{
							console.log('img up success');
							socket.emit('update image success', {user:user});
							display(user);
						}	
					});
		});

		socket.on('create event', function(e){

			var begins_at = new Date();
				begins_at.setHours(parseInt(e.hour));
				begins_at.setMinutes(parseInt(e.min));
				begins_at.setSeconds(0);

			var newEvent = new Event(e);
				newEvent.created_at = new Date();
				newEvent.begins_at = begins_at;

				User.findById(e.host_id,{},function(err,user){
					if(err){console.log('err '+err);}
					else{
					  if(user.status==='hosting'){
					  	socket.emit('create event error',{msg:"Can't host multiple events"});
					  }
					  else{
					  	newEvent.save(function(err,event){
						 if(!err){
							console.log('Event created');
							socket.emit('create event success');
							var newEventId = event._id;
							user.status = 'hosting';
							user.hostedEventId = event._id;
							user.save(function(err,user){
								if(!err){
									console.log(user.local.email+' is hosting event with id : '+user.eventHostedIt);
								}
							});

						 }
					    });
					  }
					}
				});
		});

		socket.on('fetch events', function(){
			console.log('Fetching all events');

			Event.find({}, function(err,events){
				if(err){console.log(err); return;}
					socket.emit('fetch events success', events);
			});
		});

		socket.on('fetch askers', function(data){
			console.log('Fetching all askers');
			Event.findById(data.eventId,{},function(err,myEvent){
				if(err){console.log('error finding event based on host_id');}
				else{
					console.log(myEvent);
					var askersList = myEvent.askersList;
					socket.emit('fetch askers success', askersList);
				}
			});
		});

		socket.on('request participation',function(data){
			Event.findById(data.eventId,{},function(err,myEvent){

					User.findById(data.userInfos._id,{},function(err,user){
						if(err){
							console.log('Error finding user : '+err);
						}
						else{
							user.eventsAskedList.push(myEvent._id);
							user.save(function(err,user){
								if(err){
									console.log("Error updating User Model : "+err);
								}else{
									var o = {
										id:user._id,
										name:user.name,
										phone:user.phone,
										description:user.description,
										age:user.age,
										img_id:user.img.id,
										img_version:user.img.version,
										msg:data.msg
									};
									myEvent.askersList.push(o)
									myEvent.save(function(err,myEvent){
										if(!err){
											console.log('Array augmented');
											socket.broadcast.emit('event asked in', {eventAskedIn:myEvent});
											socket.emit('request participation success');
										}else{
											console.log("Error updating Event Model: "+err);
										}
									});
								}
							});
						}
					});	
			});
		});



	}//end of exports