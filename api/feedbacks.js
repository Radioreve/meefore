
	var Feedback   = require('../models/FeedbackModel');
	var _   	   = require('lodash');
	var md5 	   = require('blueimp-md5');
	var settings   = require('../config/settings');
	var eventUtils = require('../pushevents/eventUtils');
	var moment	   = require('moment');
	var erh 	   = require('../services/err');


	var createFeedback = function( req, res, next ){

		var err_ns = "creating_feedback";

		var feedback_data = {}

		feedback_data.content     = req.sent.content;
		feedback_data.subject_id  = req.sent.subject_id;
		feedback_data.received_at = new Date();
		feedback_data.sent_by     = req.sent.facebook_id;

		var new_feedback = new Feedback( feedback_data );
		new_feedback.save(function( err, new_feedback ){

			if( err ) return erh.handleDbErr( req, res, err_ns, err, "mongo" );

			req.sent.expose.feedback = new_feedback;
			next();

		});

	};


	module.exports = {
		createFeedback: createFeedback
	};