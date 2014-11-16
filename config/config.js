	

	var config = {

			dev: {
				dbUri: "localhost:27017"
			},
			prod: {
				dbUri: "mongodb://radioreve:"+process.env.PW+"@kahana.mongohq.com:10063/Testers"
			},
			jwtSecret:"Wenighters",

			cloudinary:
			{
				cloud_name:"radioreve",
				api_key:"835413516756943",
				api_secret:"MMKeDsJlgYDvDdR2wsep0DZRggo"
			}

		}

	module.exports = config;