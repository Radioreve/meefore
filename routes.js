
	

	module.exports = function(app,passport){

		app.get('/home', function(req,req){
			res.sendfile('index.html');
		});

		app.post('/signup', function(req,res,next){

			passport.authenticate('local-signup',function(err,user,info){
				if(err){
					console.log('error with the database query');	
				}
				if(!user){
					console.log('info : '+info.msg);
	  				res.json(401,{msg:info.msg});
					res.end();
				}
				else{
					console.log('info : '+info.msg);
	  				res.json(200,{msg:info.msg });
					res.end();;
				}
			})(req,res,next);

		});

		app.post('/login', function(req,res,next){

			passport.authenticate('local-login',function(err,user,info){
				if(err){
					console.log('error with the database query');	
				}
				if(!user){
	  				res.json(401,{msg:info.msg});
					res.end();
				}
				else{
					console.log('info : '+info.msg);
	  				res.json(200,{msg:info.msg});
					res.end();;
				}
			})(req,res,next);

		});

	}