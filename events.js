	
	var User = require('./models/user'),
		cloudinary = require('cloudinary');

	function display(data){
		console.log(JSON.stringify(data,0,4));
	}

	module.exports = function(socket){

		socket.emit('client connected');

		socket.on('update profile', function(data){
			User.findByIdAndUpdate(data._id,{
				name:data.name,
				description:data.description,
				age:data.age
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
			console.log('About to create event : ' + JSON.stringify(e,0,3));
		});



	}//end of exports