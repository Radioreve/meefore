
	var User = require('../models/UserModel'),
	    Event = require('../models/EventModel'),
	    eventUtils = require('./eventUtils'),
	    _ = require('lodash');


	var updateProfile = function(data) {
		    User.findByIdAndUpdate(data._id, {
		        name: data.name,
		        description: data.description,
		        age: data.age,
		        status: data.status
		    }, {}, function(err, user) {
		        if (err) {
		            global.socket.emit('update profile error');
		        } else {
		            console.log('Emtting event update profile success')
		            global.socket.emit('update profile success', user);
		        }
		    });
	};

	var updatePicture = function(data) {
		    var newImg = {
		        id: data.imgId,
		        version: data.imgVersion
		    };

		    User.findByIdAndUpdate(data._id, {
		        img: newImg
		    }, {}, function(err, user) {
		        if (err) {
		            console.log('err : ' + err);
		            socket.emit('update picture error');
		        } else {
		            console.log('img up success');
		            socket.emit('update image success', {
		                user: user
		            });
		        }
		    });
	};

	module.exports = {
	    updateProfile: updateProfile,
	    updatePicture: updatePicture
	};