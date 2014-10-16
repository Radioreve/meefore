
	var config = function(){
		return {
			db:{
				mongohq_uri:"mongodb://radioreve:R4dioreve@kahana.mongohq.com:10063/Testers",
				local_uri:"localhost:27017"
			},
			jwtSecret:"R4dioreve",
			mail:{
				user:"phonetrackercp@gmail.com",
				password:"PH0netracker"
			},
			cloudinary:{
				cloud_name:"radioreve",
				api_key:"835413516756943",
				api_secret:"MMKeDsJlgYDvDdR2wsep0DZRggo"
			}
		}
	};

	module.exports = config();