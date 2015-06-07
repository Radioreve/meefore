	

	var config = {

		dev: {
			dbUri: "mongodb://Radioreve:"+process.env.PW+"@dogen.mongohq.com:10008/meefore-staged"
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
			appId:'114856',
			key:'9d9e7859b349d1abe8b2',
			secret:'281887cb54b67a43ae40'
		}
		, sendgrid: {
			api_user: 'Radioreve',
			api_key: 'R4dioreve'
		}

	}

	module.exports = config;