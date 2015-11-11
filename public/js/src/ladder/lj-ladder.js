
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