	

	var config = {

		db: {
		  	dev: {
				uri: "mongodb://Radioreve:"+process.env.PW+"@dogen.mongohq.com:10008/meefore-staged"
			},
			stage: {
				uri: "mongodb://Radioreve:"+process.env.PW+"@dogen.mongohq.com:10008/meefore-staged"
			},
			prod: {
				uri: "mongodb://Radioreve:"+process.env.PW+"@dogen.mongohq.com:10021/Meefore-Sandbox"
			}
		}
		, redis: {
			dev: {
				host  : "aws-eu-west-1-portal.1.dblayer.com",
				port : "10576"
			},
			stage: {
				host  : "aws-eu-west-1-portal.1.dblayer.com",
				port : "10576"
			},
			prod: {
				host  : "@aws-eu-west-1-portal.1.dblayer.com",
				port : "10576"
			}
			
		}
		, homepage: {
			dev   : process.cwd()  + '/views/index-dev.html',
			stage : process.cwd()  + '/views/index-stage.html',
			prod  : process.cwd()  + '/views/index-test.live'
		}
		, jwtSecret: "Wenighters"	
		, cloudinary: {
			cloud_name  : "radioreve",
			api_key     : "835413516756943",
			api_secret  : "MMKeDsJlgYDvDdR2wsep0DZRggo"
		}
		, facebook: {
			dev: {
				client_id	  : "1638104993142222",
				client_secret : "303aae46230e0859af0e4bbe235f3ab7"
			},
			stage: {
				client_id 	  : "1638108873141834",
				client_secret : "be00dd6b64d9f8bb10a33e4f76041d7f"
			},
			prod: {
				client_id     : "1509405206012202",
				client_secret : "4525e27d90dcc73f716dae4fa36c6885"
			}
		}
		, pusher: {
			appId     : '108998',
			key       : '8983555fce2089fc3662',
			secret    : 'be48165148813a886ae3'
		}
		, sendgrid: {
			api_user  : 'Radioreve',
			api_key   : 'R4dioreve'
		}
		, mailchimp: {
			api_key   : '1975e0d603d5cb51d2cabd25dfab1d94-us10',
			list_id   : '0e8fd0d396',
			dc	      : 'us10',
			username  : 'methodezela@gmail.com',
			groups: {
				invitations: {
					name  : 'invitations',
					id    : 'bdb7938e4e',
				},
				newsletter: {
					name  : 'newsletter',
					id    : '042add1e79'
				}
			}
		}

	}

	module.exports = config;