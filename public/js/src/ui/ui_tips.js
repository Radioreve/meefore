
window.LJ.ui = _.merge( window.LJ.ui || {}, {

	all_tips: [],
	showTip: function( tip_id, opts ){

		var $tip = LJ.ui.getTip( tip_id );
		
		opts.anim ?
			$tip.velocity( opts.anim, { duration: opts.duration }) :
			$tip.hide();
		

	},
	hideTip: function( tip_id ){

		LJ.ui.getTip( tip_id )
			 .hide();

	},
	updateTip: function( tip_id, opts ){
		
		opts = opts || {};
		
		var $tip = LJ.ui.getTip( tip_id );

		if( opts.title ){
			$tip.find('.tip__title').html( opts.title );
		}

		if( opts.body ){
			$tip.find('.tip__body').html( opts.body );
		}

		if( opts.btn ){
			$tip.find('.tip__btn').html( opts.btn );
		}

	},
	renderTip: function( tip_id ){

		return LJ.ui.render([
			'<div class="tip" data-tip-id="'+ tip_id +'">',
				'<div class="tip__title">',
					// Tip title
				'</div>',
				'<div class="tip__body">',
					// Tip body
				'</div>',
				'<div class="tip__btn">',
					// Tip button
				'</div>',
				'<div class="tip__tri"></div>',
			'</div>'
		]);

	},
	addTip: function( tip_html ){

		$( tip_html )
			.hide()
			.appendTo('body');

	},
	getTip: function( tip_id ){

		return $('.tip[data-tip-id="'+ tip_id +'"]');

	},
	removeTip: function( tip_id ){

		LJ.ui.getTip( tip_id ).remove();

	},
	tipAlreadyExists: function( tip_id ){

		return LJ.ui.getTip( tip_id ).length != 0 ? true : false;

	},
	makeTip: function( tip_id, opts ){

		if( LJ.ui.tipAlreadyExists( tip_id ) ){
			return LJ.wlog('The tip already exists');
		}

		var tip_html = LJ.ui.renderTip( tip_id, opts );

		LJ.ui.addTip( tip_html );
		LJ.ui.updateTip( tip_id, opts );

	},
	poseTip: function( $elem, tip_id, position ){

		if( [ "botleft" ].indexOf( position ) == -1 ){
			return LJ.wlog("This position type is not defined");
		}

		var custom_margin = 10;
		var $tip  		  = LJ.ui.getTip( tip_id );

		$tip.addClass('x--'+ position);

		if( position == "botleft" ){

			$tip.css({
				top  : ( $elem.offset().top - $tip.outerHeight( true ) - custom_margin ),
				left : ( $elem.offset().left + $elem.outerWidth() + custom_margin )
			});

		}


	},
	tagTip: function( tip_id, tags ){

		tags = Array.isArray( tags ) ? tags : [ tags ].filter( Boolean );

		LJ.ui.getTip( tip_id ).addClass( _.map( tags, function( t ){ return 'x--' + t; }).join(' ') );

	},
	dataTip: function( tip_id, dataset ){

		dataset = Array.isArray( dataset ) ? dataset : [ dataset ].filter( Boolean );

		dataset.forEach(function( dtset ){
			LJ.ui.getTip( tip_id ).attr('data-' + dtset.key, dtset.val );
		});

	},
	reposeTip: function( $elem, tip_id, position ){
		
		$( window ).on('resize', function(){
			LJ.ui.poseTip( $elem, tip_id, position );
		});

	},
	tipify: function( $elem, tip_id, opts ){

		LJ.ui.makeTip( tip_id, opts );
		LJ.ui.poseTip( $elem, tip_id, opts.position );
		LJ.ui.tagTip( tip_id, opts.tags );
		LJ.ui.dataTip( tip_id, opts.data );
		LJ.ui.reposeTip( $elem, tip_id, opts.position );
		LJ.ui.showTip( tip_id, opts.show );

	}

});