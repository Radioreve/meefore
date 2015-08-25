	
	
	function validateFacebookId( req, res, next ){

		var facebook_id = ( req.body && req.body.facebook_id ) || ( req.params && req.params.facebook_id );

		if( !facebook_id )
			return eventUtils.raiseError({ res: res,
				toClient: "Presence error - Empty body" });

		if( typeof( facebook_id ) != 'string' )
			return eventUtils.raiseError({ res: res,
				toClient: "Type error - facebook_id must be string, " + typeof(facebook_id) + ' was sent.' });

		if( !/^\d{10,}$/.test( facebook_id ) )
			return eventUtils.raiseError({ res: res,
				toClient: "Value error - facebook_id must be >10digit integer" });

		req.facebook_id = facebook_id;
		next();
	}

	module.exports = {
		validateFacebookId: validateFacebookId
	};