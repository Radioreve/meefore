
	window.LJ.login = _.merge( window.LJ.login || {}, {

		test: {
			connectWithVictoriale: function(){

				var facebook_id  = '102066130199795';
				var access_token = 'EAAXR2Qo4lc4BABby1DAySZBKZAaZCD0rSi8ws3gAUophZBlE44caraH0f8b7xpaNRyyktrP3qTHOCWrXFJCPZAfJAGqLd95wtCVGu8Oyjb856ngW8CGimIlWTVPHx79xHiW2XG6aUOJtvuoFN2VlqbGTj8LMPGccVLDUMwvtkkAZDZD';

				LJ.login.data.access_token = access_token;
				LJ.start( access_token );

			},
			connectWithAngelah: function(){

				var facebook_id  = '108070099597465';
				var access_token = 'EAAXR2Qo4lc4BAAZAEOY8l0oC1c6boimu40zIPMqUoKHZA3sNUgtmtPTBZBVK5k7igp3kKsl3hmXXZAqb9aUXwF60hssZBPTwGSzDKHdnn1FK1afENoWNejPD1RdhK0LxibZCyZBXnnS9fDBZBDd3dhFvAuVQNLpueCg7D11bW2JPAwZDZD';

				LJ.login.data.access_token = access_token;
				LJ.start( access_token );

			}
		}

	});