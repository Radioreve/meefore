	

	var config = {

		dev: {
			dbUri: "localhost:27017"
		}
		, prod: {
			dbUri: "mongodb://Radioreve:"+process.env.PW+"@dogen.mongohq.com:10021/Meefore-Sandbox"
		}
		, jwtSecret:"Wenighters"	
		, cloudinary: {
			cloud_name:"radioreve",
			api_key:"835413516756943",
			api_secret:"MMKeDsJlgYDvDdR2wsep0DZRggo"
		}
		, facebook: {
			clientID:"1509405206012202",
			clientSecret:"4525e27d90dcc73f716dae4fa36c6885"
		}
		, pusher: {
			appId:'108998',
			key:'caff28cb575ee61ffa3f',
			secret:'9f861589e40f5789dac7'
		}
		, sendgrid: {
			api_user: 'Radioreve',
			api_key: 'R4dioreve'
		}

	}

	module.exports = config;