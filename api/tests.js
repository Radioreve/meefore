
	var User = require('../models/UserModel'),
		Event = require('../models/EventModel'),
		_ = require('lodash'),
		eventUtils = require('../pushevents/eventUtils');


	var test = function( req, res ){

		var userId = req.params.user_id;

		User.find({ $or: [{ _id: userId },{ facebook_id: { $in: ['1426304224365916'] } }]}, function( err, user ){
			if( err ) 
				return res.json({ msg: "Erreur de type err", err: err });
			if( user.length == 0 ) 
				return res.json({ msg: "Erreur de type []", user: user });
			return res.json({ msg: "Success", err: err, user: user });
		});

	};	


	var testValidate = function( req, res ){


		return res.json({ msg: "Has passed" }).end();

	};

	module.exports = {
		test: test,
		testValidate: testValidate
	};