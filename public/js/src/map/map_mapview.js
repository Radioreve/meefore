

/*
	Mapview Module 
	---------------
	Deals with the representation of every before on the map
	Leverages Google Maps API to display windows

*/
window.LJ.map = _.merge( window.LJ.map || {}, {


	






	renderEventMapview_User: function( evt ){

		return LJ.fn.renderEventMapview( evt, {
			request_html: '<button  data-lid="e_preview_participate" class="theme-btn btn-requestin mapview-action__btn">Participer</div>'
		});

	},
	renderEventMapview_MemberPending: function( evt ){

		return LJ.fn.renderEventMapview( evt, {
			request_html: '<button  data-lid="e_preview_pending" class="theme-btn btn-jumpto mapview-action__btn">Participer</div>'
		});

	},
	renderEventMapview_MemberAccepted: function( evt ){

		return LJ.fn.renderEventMapview( evt, {
			request_html: '<button  data-lid="e_preview_chat" class="theme-btn btn-jumpto mapview-action__btn">Participer</div>'
		});

	},
	renderEventMapview_Host: function( evt ){

		return LJ.fn.renderEventMapview( evt, {
			request_html: '<button  data-lid="e_preview_manage" class="theme-btn btn-jumpto mapview-action__btn">Participer</div>'
		});

	},
	renderEventMapview: function( evt, opts ){

		//Hosts pictures 
		var hosts_pictures_html = '';

		hosts_pictures_html = '<div class="mapview-hosts">';
		evt.hosts.forEach(function( host ){

		var display_params     = LJ.cloudinary.events.mapview.hosts.params;
		display_params.version = LJ.fn.findMainImage( host ).img_version;

		var img_tag = $.cloudinary.image( LJ.fn.findMainImage( host ).img_id, display_params ).prop('outerHTML');
		var country = '<div class="user-flag mapview-host__flag"><span class="flag-icon flag-icon-' + host.country_code + '"></span></div>';

		hosts_pictures_html += '<div class="mapview-host" data-userid="' + host.facebook_id + '">' 
									+ img_tag + country 
								+'</div>'

		});
		hosts_pictures_html += '</div>';


		// Context
		var context_html = '<div class="mapview-context">';

		// Address
		var address_html = '';
		address_html += '<div class="mapview-address mapview-context__element">'
			+ '<i class="mapview-address__icon icon icon-location mapview-context__icon"></i>'
			+ '<div class="mapview-address__name">'+evt.address.place_name+'</div>'
		+'</div>';

		// Date
		var date = moment( evt.begins_at ).format('DD/MM');
		var hour = moment( evt.begins_at ).format('HH/MM').replace('/', 'H');

		var date_html = ['<div class="mapview-date mapview-context__element">',
			'<i class="icon icon-calendar mapview-context__icon mapview-date__icon"></i>',
			'<div class="mapview-date__day">'+ date +'</div>',
			'<div class="mapview-date__splitter">, </div>',
			'<div class="mapview-date__hour">'+ hour +'</div>',
		'</div>'].join('');


		// Host names
		var hosts_names_html = '<div class="mapview-hostnames mapview-context__element">';
		evt.hosts.forEach(function( host ){ hosts_names_html += '<div class="mapview-hostnames__name">'+ host.name +'</div>'; });
		hosts_names_html += '</div>';

		context_html += address_html;
		context_html += date_html;
		context_html += hosts_names_html;

		context_html += '</div>';


		// Action buttons
		var action_html = ['<div class="mapview-action">',
		opts.request_html,
		'</div>'].join('');

		// Main HTML
		var divider_html = '<div class="mapview__divider--md"></div>';
		var close_html   = '<i class="mapview__close icon icon-minus"></i>';

		var html = '<div class="mapview mapview--event" data-eventid="'+evt._id+'">'
						+ close_html
						+ hosts_pictures_html
						+ divider_html
						+ context_html
						+ divider_html
						+ action_html
				  '</div>';


		return LJ.fn.translateView( html );


	},
	renderPartyMapview_Event: function( party, opts ){

		// Icon party to ambience everyone
		var main_icon_html = [
			'<div class="mapview-main-icon">',
				'<i class="icon icon-glass mapview-main-icon__icon"></i>',
			'</div>'
		].join('');


		// Party context & various informations
		var context_html = '<div class="mapview-context mapview-context--party">';

		// Address
		var address_html = '';
		address_html += '<div class="mapview-address mapview-context__element">'
							+ '<i class="mapview-address__icon icon icon-location mapview-context__icon"></i>'
							+ '<div class="mapview-address__name">'+ party.address.place_name +'</div>'
						+'</div>';


		// Closing context part
		context_html += address_html;
		context_html += '</div>';

		var divider_html = '<div class="mapview__divider--md"></div>';
		var close_html   = '<i class="mapview__close icon icon-minus"></i>';

		var html = '<div class="mapview mapview--party" data-placeid="'+ party.address.place_id +'">'
			+ close_html
			+ context_html
			+ '</div>'

		return LJ.fn.translateView( html );


	},
	renderPartyMapview_Party: function( party ){

		LJ.fn.renderPartyPreview_Event( party );

	},
	renderPartyMapview_Empty: function( party ){

		var context_html = [
			'<div class="mapview-context">',
				'<div class="mapview-address mapview-context__element">',
				'<i class="mapview-address__icon icon icon-location mapview-context__icon"></i>',
				'<div class="mapview-address__name">'+ party.address.place_name +'</div>',
			'</div>',
			'<div class="mapview-emptytext mapview-context__element">',
				'<i class="mapview-emptytext__icon icon icon-star-empty mapview-context__icon"></i>',
				'<div class="mapview-emptytext__name" data-lid="e_mapview_empty_text">...</div>',
				'</div>',
			'</div>'
		].join('');

		var action_html = [
			'<div class="mapview-action">',
				'<div class="theme-btn mapview-action__btn js-create-event" data-lid="e_mapview_first_to_create">...</div>',
			'</div>'
		].join('');

		var divider_html = '<div class="mapview__divider--md"></div>';
		var close_html   = '<i class="mapview__close icon icon-minus"></i>';

		var html = [
			'<div class="mapview mapview-empty mapview--party">',
				close_html,
				context_html,
				divider_html,
				action_html,
			'</div>'
		].join('');

		return LJ.fn.translateView( html );

	}
});