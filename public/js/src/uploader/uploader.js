
	window.LJ.uploader = _.merge( window.LJ.uploader || {}, {

		init: function(){
			return LJ.promise(function( resolve, reject ){
				LJ.log('Init uploader');
				resolve();
			});
			
		}

	});