
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		initLadder: function( options ){

			if( typeof( options ) != "object" )
				return LJ.fn.log('Param error, object needed');

			var max_level  = options.max_level,
				base_point = options.base_point,
				coef_point = options.coef_point;

			if( !max_level || !base_point || !coef_point )
				return LJ.fn.log('Param error, missing key');

			var skill_ladder = [];
			for( var i = 1; i <= max_level; i++ ){
				var item = {}
				item.level = i;
				item.min_xp = ( i * base_point ) + Math.pow( base_coef, i-1 ); 
				item.max_xp = ( i * base_point ) + Math.pow( base_coef, i   )
				skill_ladder.push( item );
			}
			return skill_ladder;

		},
		findUserLevel: function(){

			return _.find( LJ.settings.skill_ladder, function(el){ 
				return ( el.min_xp < LJ.user.skill.xp && el.max_xp > LJ.user.skill.xp ) 
			}).level

		},
		setUserXp: function( new_xp ){

			LJ.user.skill.xp = new_xp;
			$('body').trigger('change-user-xp');

		},
		updateUserXp: function(){

			var user_level = LJ.fn.findUserLevel(),
				user_xp = LJ.user.skill.xp,
				ladder_level = LJ.settings.skill_ladder[ user_level - 1 ],
				xp_range = ladder_level.max_xp - ladder_level.min_xp;

			$('.xp-amount').html( user_xp );
			$('.xp-fill').css({ width: ( user_xp - ladder_level.min_xp ) * 100 / xp_range +'%'});

		}

	});



	// Builds a ladder system as an array of ladder items
	// Based on the range of levels necesary, the base points
	// And the coef to determine how hard it is to climb the ladder
	// Each item contains a level and a range of xp
	ladder_max_level: 30,
	ladder_base_point: 100,
	ladder_base_coef: 1.5,

	initLadder: function initLadder( options ){ 

		var options = options || {};

		var max_level  = options.max_level  || this.ladder_max_level,
			base_point = options.base_point || this.ladder_base_point,
			base_coef  = options.base_coef  || this.ladder_base_coef;

		if( !max_level || !base_coef || !base_point )
			return console.log('Missing parameter, max_level: ' + max_level + ', base_point: ' + base_point + ', base_coef: ' + base_coef );

		var skill_ladder = [{ 
			level: 1,
			min_xp: base_point,
			max_xp: base_point + base_point * base_coef 
		}];

		for( var i = 1; i <= max_level; i++ ){

			var item = {}

			item.level = i+1;
			item.min_xp = skill_ladder[i-1].max_xp; 

			var max_xp = ( i * base_point ) + Math.floor( base_point * Math.pow( base_coef, i+1 ) ),
				max_xp_length = ( max_xp + '' ).length,
				rounder = Math.pow( 10, max_xp_length - 3 );

			item.max_xp = Math.floor( max_xp / rounder ) * rounder;

			skill_ladder.push( item );
			
		}

		return skill_ladder;

	}