	
	function update__profile( meepass ){

		// Obsolete
		- Remove "experience"
		- Remove "skills"
		- Remove "mood"
		- Remove "drink"

		// Repérés & partagés
		+ Add "n_meepasses" @Number, default to 0, +5 per each before created. Middleware meepass manager ?
		+ Add "spotted" @Array of facebook_id
		+ Add "shared" @Array of facebook_id
		+ Add "ideal_night"

		// Parrainage
		+ Add "invite_code" @String
		+ Add "sponsor"	@String facebook_id
		+ Add "sponsees" @Array of facebook_id


	}

	function meepass( meepass ){

		- Créer un middleware de validation pour être sûr que n_meepass > 1

		- middlewares/meepass.js

		- Le middleware expose une unique fonction avec un "action__type" (updateMeepasses?)
		- Il est de sa responsabilité de faire mapper un "action__type" avec 
			- soit un incrément de "n_meepass"
			- soit un décrément de "n_meepass"
		ainsi que de connaitre le nombre associé.
		- Le nombre associé est définit dans un paramètre en début de middleware
		- Implémentation fonction low level qui incrémente/décremente les meepasses 


		var meepass_actions = {
			"create" : "5"
			"send": '-1'
		}

		function creditMeepasses( facebook_ids, opts ){
			n = 
			- pour chaque facebook_id, incrémente le nombre de meepass de n
		}

		function decreditMeepasses( facebook_ids )(
			)

		

	}
	


	function repérés( meepass ){

		- Changer les 


	}


	function partagés( meepass ){

		- Changer les 

	}



	function create__event( meepass ){

		- Changer les 

	}

	function request( meepass ){

		- Changer les 

	}



	function create__party( meepass ){

		- Changer les 

	}



	function invite__code( meepass ){

		- Changer les 

	}



	function chat__hosts__switch__context(){


	}

	function cache_basic_profil(){

		- Implémenter une route shortcut (redis) pour avoir accès très rapidement au nom/job/age/main_picture des users

	}

