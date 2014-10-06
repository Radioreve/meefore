
	var User = require('../models/UserModel'),
	    Event = require('../models/EventModel'),
	    eventUtils = require('./eventUtils'),
	    _ = require('lodash');


	var updateProfile = function(data) {

			var userId = data._id;

		    User.findByIdAndUpdate(userId, {
		        name: data.name,
		        description: data.description,
		        age: data.age,
		        status: data.status
		    }, {}, function(err, user) {
		        if (err) { global.sockets[userId].emit('update profile error');  return; }
		            console.log('Emtting event update profile success')
		            global.sockets[userId].emit('update profile success', user);
		        
		    });
	};

	var updatePicture = function(data) {
		   	var userId = data._id,
		        newImgId = data.imgId,
		    	newImgVersion = data.imgVersion;

		    User.findByIdAndUpdate(userId, {
		        imgId: newImgId,
		        imgVersion: newImgVersion
		    }, {}, function(err, user) {
		        if (err) { global.sockets[userId].emit('update picture error');
		        		   return;
		        		}
		            global.sockets[userId].emit('update image success', user );
		             if(user.status === 'hosting'){
		            	Event.findByIdAndUpdate(user.hostedEventId, {
		            		hostImgId: newImgId,
		            		hostImgVersion: newImgVersion
		            	},{}, function(err,event){
		            		if(err){
		            			console.log('Error '+ err); return;
		            		}
		            	});
		            }
		    	 });

		    };

	module.exports = {
	    updateProfile: updateProfile,
	    updatePicture: updatePicture
	};