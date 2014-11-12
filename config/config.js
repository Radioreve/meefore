	
	var config = function(){

		return {

			db:
			{
				composeUri:"mongodb://radioreve:R4dioreve@kahana.mongohq.com:10063/Testers",
				localUri:"localhost:27017"
			},

			jwtSecret:"R4dioreve",

			cloudinary:
			{
				cloud_name:"radioreve",
				api_key:"835413516756943",
				api_secret:"MMKeDsJlgYDvDdR2wsep0DZRggo"
			}

		}
	};

	module.exports = config();