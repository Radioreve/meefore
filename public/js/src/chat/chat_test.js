
	window.LJ.chat = _.merge( window.LJ.chat || {}, {

		test: {
			messages : [

				'Salut tout le monde',
				'Coucou',
				'Vous allez bien ?',
				'Qui fait quoi ce soir ?',
				'Bon ça me chauffe bien cette histoire ! Qui est partant, à part moi ?? Allerrrr !!',
				'Hmm... je sais pas quoi répondre ahah',
				'Okay...',
				'Merci',
				'^^'

			],
			setup: function(){

				var chat_id  = $('.chat-inview-item.--active').attr('data-chat-id');
				var group_id = $('.chat-inview-item.--active').attr('data-group-id');

				var m = moment();

				var group_object  = LJ.chat.fetched_groups[ group_id ];
				var possible_ids = _.map( _.concat( group_object.members_profiles, group_object.hosts_profiles ), 'facebook_id' );

				var data = {
					sender_id   : _.shuffle( possible_ids )[0],
					message     : _.shuffle( LJ.chat.test.messages )[ 0 ],
					chat_id     : chat_id,
					group_id    : group_id
				}; 

				var call_id = LJ.generateId();
				var chat_line_html = LJ.chat.renderChatLine( data, call_id );

				window.testInsertChat = function(){
					LJ.chat.insertChatLine( chat_id, chat_line_html, call_id );
					LJ.chat.showChatLine( call_id );
				}

				window.testPendifyChatLine = function(){
					LJ.chat.pendifyChatLine( call_id );
				}

				window.testClassifyChatLine = function(){
					LJ.chat.classifyChatLine( call_id );
				}

				window.testRefreshChatJsp = function(){
					LJ.chat.refreshChatJsp( chat_id );
				}

				window.testHorodateChatLine = function(){
					LJ.chat.horodateChatLine( chat_id );
				}

				window.testAddChatLine = function(){

					m.add( _.shuffle( [1,1,1,1,1,3] )[0], 'hour' );

					var data = {
						sender_id   : _.shuffle( possible_ids )[0],
						message     : _.shuffle( LJ.chat.test.messages )[ 0 ],
						chat_id     : chat_id,
						group_id    : group_id,
						sent_at     : m.toISOString()
					}; 

					var call_id = LJ.generateId();

					LJ.chat.addChatLine( data, call_id );
					//LJ.chat.updateChatRow__NewMessage( _.merge(data, { sender: LJ.chat.findChatSender( group_id, data.facebook_id )} ) );
					LJ.chat.pendifyChatLine( call_id );
					LJ.delay(1000).then(function(){
						LJ.chat.dependifyChatLine( call_id );
					});

				}

			}

		}


	});