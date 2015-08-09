
	window.LJ.fn = _.merge( window.LJ.fn || {} ,

	{

		initAdminMode: function(){

			LJ.channels['admin'] = LJ.pusher.subscribe('admin');
			LJ.fn.initAdminInterface();
			LJ.fn.handleAdminDomEvents();
			LJ.fn.fetchAppData();

			LJ.channels['admin'].bind('refresh-users-conn-states-admin', function(data){
				//console.log('Refreshing online users list, from admin init');
				//$('#onlineUsers > div').text( _.keys( data.onlineUsers ).length );
			});

		},
		fetchAppData: function(){

			var eventName = 'fetch-app-data',
				data = {},
				cb = {
					success: LJ.fn.handleFetchAppDataSuccess,
					error: function(xhr){ console.log('Error fetching [admin] mode'); }
				}

			LJ.fn.say( eventName, data, cb ); 

		},
		renderEventTemplate: function( eventTemplate ){

			var html = '<div class="t-event" data-tplid="'+eventTemplate._id+'">'
						   + '<div class="t-name">'+eventTemplate.name+'</div>'
						   + '<div class="t-desc">'+eventTemplate.desc+'</div>'
						   + '<i class="icon icon-cancel"></i>'
						+'</div>'
			return html;

		},
		handleFetchAppDataSuccess: function( data ){	

			/* Rendu des N derniers users inscrits */
			var usersArray = data.lastRegisteredUsers;

			var L = usersArray.length,
				html = '';
			for( var i =0; i < L; i++){
				html += LJ.fn.renderUser( {user: usersArray[i], wrap: 'adminWrap', myClass :'match'});
			} 
			$('#lastRegisteredUsers').html( html );

			/*Rendu des bots*/
			var botsArray = data.bots;

			var L = botsArray.length,
				html = '';
			for( var i =0; i < L; i++){
				html += LJ.fn.renderUser( {user: botsArray[i], wrap: 'botsWrap', myClass : ['match','user-bot'] });
			} 
			$('#bots').html( html );

			/* Rendu des templates */
			var eventTemplates = data.eventTemplates;

			var L = eventTemplates.length,
				html = '';
			for( var i =0; i < L; i++){
				html += '<div class="t-eventwrap"><div class="t-number left">'+(i+1)+'</div>' + LJ.fn.renderEventTemplate( eventTemplates[i] ) + '</div>';
			} 
			$('#templates').html( html );

		},
		handleAdminDomEvents: function(){

			Mousetrap.bind('mod+m', function(e) {
				LJ.fn.toggleAdminPanel();
			});

			$('body').on('click', '#botbarre div.toggleable', function(){
				
				var $self = $(this);


				//--------- Seulement ceux qui ont créé un event -------------//
				if( !$self.hasClass('active') && $self.hasClass('bot-order-event') )
				{
					$self.addClass('active');
					$('.user-bot .createBotEvent:not(.validating-btn)').parents('.user-bot').addClass('filtered');
					return;
				}
				if( $self.hasClass('active') && $self.hasClass('bot-order-event') )
				{
					$self.removeClass('active');
					$('.user-bot .createBotEvent:not(.validating-btn)').parents('.user-bot').removeClass('filtered');
					return;
				}

				//--------- Seulement les hommes -------------//
				if( !$self.hasClass('active') && $self.hasClass('bot-order-male') )
				{	
					$('.bot-order-male, .bot-order-female').removeClass('active');
					$self.addClass('active');
					$('.user-bot[data-usergender="female"]').addClass('filtered');
					$('.user-bot[data-usergender="male"]').removeClass('filtered');
					return;
				}
				if( $self.hasClass('active') && $self.hasClass('bot-order-male') )
				{
					$self.removeClass('active');
					$('.user-bot[data-usergender="female"]').removeClass('filtered');
					return;
				}

				//--------- Seulement les femmes -------------//
				if( !$self.hasClass('active') && $self.hasClass('bot-order-female') )
				{	
					$('.bot-order-male, .bot-order-female').removeClass('active');
					$self.addClass('active');
					$('.user-bot[data-usergender="male"]').addClass('filtered');
					$('.user-bot[data-usergender="female"]').removeClass('filtered');
					return;
				}
				if( $self.hasClass('active') && $self.hasClass('bot-order-female') )
				{
					$self.removeClass('active');
					$('.user-bot[data-usergender="male"]').removeClass('filtered');
					return;
				}
				
			});

			$('body').on('click', '.bot-order-shuffle', function(){

				var $arr = $('.user-bot');
					$arr.each( function( i, el ){ 
						$(el).insertAfter( $( $('.user-bot')[ LJ.fn.randomInt(0, $arr.length - 1 )]) ) 
					});

			});

			$('body').on('click', '#createEventTemplate button', function(){

				console.log('clicked');
				var $self = $(this);
				//if( $self.hasClass('validating-btn') ) return;
				var name = $('.tpl-add-event-name').val(),
					desc = $('.tpl-add-event-desc').val();

				var eventName = 'add-event-template',
					data = { name:name, desc:desc },
					cb = {
						success: function(data){
							LJ.fn.handleServerSuccess("'Le template a été ajouté");
							$('.tpl-add-event-name').val('');
							$('.tpl-add-event-desc').val('')
							var html = '<div class="t-number left">-</div>' + LJ.fn.renderEventTemplate( data );
							$('#templates').prepend( html ) 
						},
						error: function(xhr){
							LJ.fn.handleServerError(xhr);
						}
					}

				LJ.fn.say( eventName, data, cb );

			});

			$('body').on('click', '.t-event .icon-cancel', function(){

				var tplId = $(this).parents('.t-event').data('tplid');
				var cb = { 
					success: function(data){
						LJ.fn.handleServerSuccess(data.msg);
						$('.t-event[data-tplid="'+tplId+'"]').parents('.t-eventwrap').velocity('transition.fadeOut')
															 
					}, error: LJ.fn.handleServerError 
				}
				LJ.fn.say('delete-event-template', { tplId: tplId }, cb );

			});

			$('body').on('click','.createBotEvent',function(){

				var $self = $(this);
				var $papa = $self.parents('.u-item'); 

				var options = {
					userId : $papa.data('userid'),
					img_version : $papa.data('img_version'),
					img_id : $papa.data('img_id'),
					name : $papa.data('username')
				}

				if( $self.hasClass('active') )
				{	
					var userId = $papa.data('userid');
					var eventId = $('.eventItemWrap[data-hostid="'+userId+'"]').data('eventid'); 
					var templateId = $('.eventItemWrap[data-hostid="'+userId+'"]').data('templateid');

					$self.removeClass('validating-btn').removeClass('active');
					LJ.fn.cancelEvent( eventId, userId, templateId );
				}
				else
				{	
					$self.addClass('active');
					LJ.fn.say('create-event-bot', options, 
						{ 
							success: function( data ){
								LJ.fn.handleSuccessDefault();
							},
						    error: function( xhr ){
						    	LJ.fn.toastMsg( JSON.parse( xhr.responseText ).msg, 'error' );
						    	$self.removeClass('validating-btn').removeClass('active');
						    }
						});
				}
			});

			$('body').on('click','.lockBotEvent', function(){

				var $self = $(this);
				var $papa = $self.parents('.u-item'); 
				
				var userId  = $papa.data('userid');
				var eventId =  $('.eventItemWrap[data-hostid="'+userId+'"]').data('eventid');

				var options = {
					hostId : userId,
					eventId : eventId
				}
 
				$self.toggleClass('locked');
				if( ! $self.hasClass('locked') )
					$self.removeClass('validating-btn');
					
				LJ.fn.say('suspend-event', options, 
					{ 
						success: LJ.fn.handleSuccessDefault,
						error:LJ.fn.handleServerError
					});
			});

			$('body').on('click','.addBotToEvent', function(){

				console.log('Adding bot to event...');
				var $self = $(this);
				var $papa = $self.parents('.u-item'); 
				var hostId = $papa.data('userid');
				var eventId =  $('.eventItemWrap[data-hostid="'+hostId+'"]').data('eventid');
				var gender = $self.data('gender');

				var options = {
					eventId: eventId,
					hostId: hostId,
					gender: gender
				};

				var cb = {
					success: function( data ){
						setTimeout(function(){ $('#bots .u-item[data-userid="'+data.hostId+'"]').find('.addBotToEvent').removeClass('validating-btn'); }, 1000 );
					},
					error: LJ.fn.handleServerError
				}

				LJ.fn.say('request-participation-in-bot', options, cb );

			});


		},
		initAdminInterface: function(){

			var liveTrackHTML = '<div id="eventPlaceholders" class="adm-col">'
									+'<div class="col-head wrap">'
										+'<span>Templates</span>'
									+'</div>'
									+'<div id="createEventTemplate" class="col-head wrap">'
										+'<input class="tpl-add-event-name" placeholder="name..."></input>'
										+'<input class="tpl-add-event-desc" placeholder="description..."></input>'
										+'<button class="themeBtn">Ajouter</button>'
									+'</div>'
									+'<div id="templates" class="col-body wrap">'									
										
									+'</div>'
								+'</div>';

			var botsWrapHTML = '<div id="botsWrap" class="adm-col">'
									+'<div class="col-head wrap">'
										+'<span>Bots</span>'
									+'</div>'
									+'<div id="botsBodyWrap" class="col-body">'
									+'<div id="botbarre">'
										+'<div class="bot-order-shuffle"><i class="icon icon-arrows-cw"></i></div>'
										+'<div class="bot-order-event toggleable"><i class="icon icon-glass"></i></div>'
										+'<div class="bot-order-male toggleable"><i class="icon icon-male"></i></div>'
										+'<div class="bot-order-female toggleable"><i class="icon icon-female"></i></div>'
									+'</div>'
									+'<div id="bots">'
										//...
									+'</div>'
								+'</div>';

			var html = '<div id="adminPanel">'
							+ liveTrackHTML
							+ botsWrapHTML;
						+'</div>';


			$('#adminPanelWrap').append( html );

		},
		toggleAdminPanel: function(){

			var $panel = $('#adminPanelWrap');

			if( $panel.css('opacity') == 0 )
				return $panel.velocity('transition.fadeIn', { duration: 150 });

			$panel.velocity('transition.fadeOut', { duration: 150 });
		}


	});
