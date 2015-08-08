	

	var config = {

		  dev: {
			dbUri: "mongodb://Radioreve:"+process.env.PW+"@dogen.mongohq.com:10008/meefore-staged"
		}
		, prod: {
			dbUri: "mongodb://Radioreve:"+process.env.PW+"@dogen.mongohq.com:10021/Meefore-Sandbox"
		}
		, jwtSecret: "Wenighters"	
		, cloudinary: {
			cloud_name:"radioreve",
			api_key:"835413516756943",
			api_secret:"MMKeDsJlgYDvDdR2wsep0DZRggo"
		}
		, facebook: {
			client_id:"1509405206012202",
			client_secret:"4525e27d90dcc73f716dae4fa36c6885"
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
		, mailchimp: {
			api_key: '1975e0d603d5cb51d2cabd25dfab1d94-us10',
			list_id: '0e8fd0d396',
			dc: 'us10',
			username: 'methodezela@gmail.com',
			groups: {
				invitations: {
					name: 'invitations',
					id: 'bdb7938e4e',
				},
				newsletter: {
					name: 'newsletter',
					id: '042add1e79'
				}
			}
		}

	}

	module.exports = config;