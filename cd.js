	
	var tools = require('./tests/tools');
	

		tools.countdown()
		.then(function(){
			tools.success("Step 1 completed successfully");
			tools.info("Entering step 2...");
		})
		.then( tools.countdown )
		.then(function(){
			tools.error("Step 2 crashed!");
		})