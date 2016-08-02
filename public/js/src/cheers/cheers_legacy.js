
	window.LJ.cheers = _.merge( window.LJ.cheers || {}, {

		legacy: {

			activateCheers: function( link ){

				var $seg = $('.menu-section.x--cheers').find('.segment__part[data-link="'+ link +'"]');

				if( $seg.hasClass('x--active') ){
					return LJ.wlog('Already activated');
				}

				$seg.siblings().removeClass('x--active');
				$seg.addClass('x--active');

				LJ.cheers.filterCheersItems( link );

			},
			filterCheersItems: function( link ){

				$('.cheers').children().css({ display: 'none' });
				$('.cheers [data-link="' + link + '"]').css({ display: 'flex' });

			},
			getActiveCheersType: function(){

				return $('.menu-section.x--cheers').find('.segment__part.x--active').attr('data-link');

			},
			renderCheersBackRow: function( members_profiles ){

				var pictures = [];
				members_profiles.forEach(function( u ){
					pictures.push({ img_id: u.img_id, img_vs: u.img_vs });
				});
				var pictures  = LJ.pictures.makeRosaceHtml( pictures, 'chat-inview' );
				var user_rows = LJ.renderUserRows( members_profiles );

				var cheers_back_html = LJ.chat.renderChatInviewHeader(); // Borrow it to the chat module

				return LJ.ui.render([

					'<div class="cheers-back">',
						cheers_back_html,
						'<div class="cheers-back-pictures">',
				        	pictures, 
				        '</div>',
						'<div class="cheers-back-groupname">',
							'<div class="cheers-back-groupname__h1">',
								'<span data-lid="cheers_back_groupname"></span>',
							'</div>',
						'</div>',
				        '<div class="cheers-back-users">',
				        	user_rows,
				        '</div>',
				        '<div class="cheers-back-actions">',
				        	'<button class="x--round-icon js-validate">',
				        		'<i class="icon icon-meedrink"></i>',
				        		'<span data-lid="chat_inview_validate"></span>',
				        	'</button>',
				        '</div>',
					'</div>'

				]);

			},
			renderCheersBackHeaderIcon: function(){

				return [
					'<div class="chat-inview__icon x--previous js-close-cheers-back x--round-icon">',
						'<i class="icon icon-arrow-left-rounded"></div>',
					'</div>'
				].join('');

			},
			setCheersBackHeader: function( cheers_item ){
				
				var $chat_header = $('.cheers-back').find('.chat-inview-header');
				// Replace icons
				$chat_header.find('.chat-inview__icon').remove();
				$chat_header.append( LJ.cheers.renderCheersBackHeaderIcon() );

				var formatted_date = LJ.text('chatinview_date', moment(cheers_item.begins_at) );
				$chat_header.find('.chat-inview-title__h1').html( '<span class="x--date">'+ formatted_date +'</span>' );
				$chat_header.find('.chat-inview-title__h2').html( '<span class="x--place">'+ cheers_item.place_name +'</span>' );

			}
			
		}


	});