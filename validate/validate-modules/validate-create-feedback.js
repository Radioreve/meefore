
	var nv   = require('node-validator');
	var st 	 = require('../../config/settings');
	var rg   = require('../../config/regex');

	function check( req, res, next ){

		var checkFeedback = nv.isAnyObject()
		
			.withRequired('subject_id'	, nv.isString({ regex: rg.makeRegExpFromArray( st.feedback_ids ) }) ) 
			.withRequired('content' 	, nv.isString({ regex: /^(.|\n){10,1000}$/i}) )
			.withRequired('facebook_id' , nv.isString() ) 

		nv.run( checkFeedback, req.sent, function( n, errors ){
			if( n != 0 ){
				req.app_errors = req.app_errors.concat( errors );
				return next();
			}
				
			next();

		});
	};


module.exports = {
	check: check
};