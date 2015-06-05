
	window.LJ.fn = _.merge( window.LJ.fn || {}, 

		{

		renderEvents: function( arr, max ){

			var html =''; 
			    max = max || arr.length;

            if( max == 0 )
            {   
                $('#noResults').addClass('filtered');
                return '<h3 id="noEvents">Aucun évènement à afficher pour le moment.</h3>'
            }
			for( var i=0; i < max; i++ ){

				html += LJ.fn.renderEvent( arr[i] ); 

			}
			return html;

		},
        renderAskersMain: function(arr,max){

                var html =''; 
                var arr = LJ.myAskers;
                var max = max || arr.length;

                for( var i=0; i < max ; i++ ){ 
                if( i < max )
                {	
                	if(i == 0){
                		html += LJ.fn.renderAskerMain( arr[i], 'active' );
                	}else
                	{
                	html += LJ.fn.renderAskerMain( arr[i] ); 
                	}
                }

                }
                return html;

        },
        renderChatWrap: function( chatId ){

            var liveTypeImgHTML = LJ.$cLoaderTpl.prop('outerHTML');

        	return '<div class="chatWrap chat-asker none" data-chatid="'+chatId+'">'
                            +'<div class="chatLineWrap"></div>'    
                            +'<div class="chatInputWrap">'
                            +'<div class="liveTypeWrap">'
                                +'<span >En train d\'écrire...</span>'
                                + liveTypeImgHTML
                            +'</div>'
                            +  '<input type="text" value="" placeholder="Can I come with my friends ?">'
                            +  '<input type="submit" value="">'
                            +'</div>'
                           +'</div>';

        },
        renderEventTags: function( tags ){

        	var eventTags = '<div class="tag-row">',
				L = tags.length;

				for ( var i=0; i<L; i++ )
				{
					eventTags += '<div class="tag tag-'+tags[i]+'">' + LJ.fn.matchTagName( tags[i] ) + '</div>';
				}
				eventTags +='</div>';

				return eventTags;

        },
        renderEventButton: function( eventId, hostId, eventState ){

            if( hostId == LJ.user._id )
            {
                return '<div class="askInWrap"><button class="themeBtnToggle themeBtnToggleHost">Management</button></div>';
            }

            if( LJ.user.eventsAskedList.indexOf( eventId ) > -1 )
            {
                return '<div class="askInWrap">\
                           <button class="themeBtnToggle askIn asked"> Annuler </button> \
                           <div class="chatIconWrap"><i class="icon icon-chat"/><span class="bubble filtered"></span></div>\
                           <div class="friendAddIconWrap"><i class="icon icon-user-add"/></div>\
                        </div>';
            }

            if( eventState == 'suspended' )
            {
                return '<div class="askInWrap">\
                           <button class="themeBtnToggle askIn idle">L\'évènement est complet</button> \
                           <div class="chatIconWrap none"><i class="icon icon-chat"/><span class="bubble filtered"></span></div>\
                           <div class="friendAddIconWrap none"><i class="icon icon-user-add"/></div>\
                        </div>';
            }

            /* Default */
                return '<div class="askInWrap">\
                           <button class="themeBtnToggle askIn idle"> Je veux y aller </button> \
                           <div class="chatIconWrap none"><i class="icon icon-chat"/><span class="bubble filtered"></span></div>\
                           <div class="friendAddIconWrap none"><i class="icon icon-user-add"/></div>\
                        </div>';

			
        },
        renderHostImg: function( hostImgId, hostImgVersion ){

        	var d = LJ.cloudinary.displayParamsEventHost;
				d.version = hostImgVersion;


			var imgTag = $.cloudinary.image( hostImgId, d )
						  .addClass('zoomable')
						  .attr('data-imgid', hostImgId )
						  .attr('data-imgversion', hostImgVersion );

			var imgTagHTML = imgTag.prop('outerHTML');

			return imgTagHTML
        },
        renderAskerInEvent: function( imgId, o ){

        	var $img = $.cloudinary.image( imgId, LJ.cloudinary.displayParamsEventAsker );
        		$img.attr('data-imgid', imgId)
        			.addClass('zoomable');
 
        	if( o ){ 
	        	if( o.dataList.length > 0 )
	        	{
	        		for( var i = 0; i < o.dataList.length ; i++ ){
	        			$img.attr('data-'+o.dataList[i].dataName, o.dataList[i].dataValue );
	        		}
	        	}
        		
        	}

        	return $img;

        },
        renderAskersInEvent: function( askersList, maxGuest ){

        	var L = askersList.length,
        	    html='';
        	
        	for ( i = 0; i < L ; i++ )
        	{ 
        		var o = { classList: ['hello'], dataList: [] };
	        	var d = LJ.cloudinary.displayParamsEventAsker;

        		if( i < L )
        		{
	        		var imgId        = askersList[i].imgId;
	        			d.imgVersion = askersList[i].imgVersion;
	        			o.classList = ['askedInThumb'];
	        			o.dataList   = [ { dataName: 'userid', dataValue:  askersList[i]._id } ];

        		}else //On affiche via placeholder le nb de places restantes.
        		{     
                    /* Deprecated
        			var imgId = LJ.cloudinary.placeholder_id;
        				o.classList = ['askedInRemaining'];
                    */
        		}

        		html += LJ.fn.renderAskerInEvent( imgId, o ).prop('outerHTML');
        	}
        		
        		return html
        },
		renderEvent: function( e ){

			var eventId        = e._id,
				hostId         = e.hostId,
				hostImgId      = e.hostImgId,
				hostImgVersion = e.hostImgVersion,
				tags           = e.tags;

			var imgTagHTML   = LJ.fn.renderHostImg( hostImgId, hostImgVersion ),
			    button       = LJ.fn.renderEventButton( e._id, hostId, e.state ),
				eventTags    = LJ.fn.renderEventTags( tags ),
            	chatWrap     = LJ.fn.renderChatWrap( hostId ),
            	askersThumbs = LJ.fn.renderAskersInEvent( e.askersList, e.maxGuest );

			var html = '<div class="eventItemWrap" '
						+ 'data-eventid="'+e._id+'" '
                        + 'data-templateid="'+e.templateId+'"'
						+ 'data-hostid="'+e.hostId+'" '
                        + 'data-hostname="'+e.hostName+'" '
						+ 'data-location="'+e.location+'"'
						+ 'data-eventstate="'+e.state+'">'
						+'<div class="eventItemLayer">'
						+ '<div class="headWrap">' 
						   + '<div class="e-image left">'+ imgTagHTML +'</div>'
						     + '<div class="e-hour e-weak">'+ LJ.fn.matchDateHHMM( e.beginsAt ) +'</div>'
						   + '<div class="e-guests right">'
						     + '<span class="guestsWrap">'
                               +'<span>Ils veulent y aller</span>'
						       + '<i class="icon icon-users"></i>'
						       + '<span class="nbAskers"> '+ e.askersList.length +'</span>'
						     + '</span>'
						   + '</div>'
                           + '<div class="e-hostName">'+e.hostName+'</div>'
						+ '</div>'
						+ '<div class="askedInWrap">'
						+ askersThumbs
						+ '</div>'
						+ '<div class="bodyWrap">'
							+ '<div class="e-location">'
							  + '<span>'+ LJ.fn.matchLocation( e.location ) +'</span>'
							+ '</div>'
							   + '<div class="e-name">'+ e.name +' </div>'
							   + '<div class="e-desc">' + e.description + '</div>'
							   + eventTags
							+ '</div>'
						+ button
                        + chatWrap
						+ '</div></div>';
			return html;
		},
		matchTagName: function(tagClass){

			if( tagClass == 'apparte' ) return 'appart\'';
			if( tagClass == 'apero' ) return 'apéro';
			if( tagClass == 'nuitblanche' ) return 'nuit blanche';
			if( tagClass == 'firsttime' ) return 'première fois';

			return tagClass
		},
		matchLocation: function( loc ){

            if( loc == 1 )
                return '1er';

            return loc + 'ème';

		},
		matchDateHHMM: function( d ){

            var offset = (new Date()).getTimezoneOffset(),
                date = moment( d ).add( offset, 'minutes' );

	    	return date.format('HH')+'H'+date.format('mm');

		},
		matchDateDDMMYY: function(d){
			return moment(d).format('DD/MM/YYYY')			
		},
		renderAskerPlaceholder: function(){

			var asker = {

				id: "placeholder",
				imgId: LJ.cloudinary.placeholder_id,
				name:"White",
				age: 25,
				description:""

			}

			return LJ.fn.renderAskerMain( asker );

		},
        renderAskerMain: function( a, className ){

        	className = className || '';

            var d = LJ.cloudinary.displayParamsAskerMain;
            	d.version = a.imgVersion; // Ne fonctionne pas car le param 'a' provient de la base qui est pas MAJ

            var imgTag = $.cloudinary.image( a.imgId, d );
            	imgTag.addClass('zoomable')
            		  .attr('data-imgid', a.imgId)
            		  .attr('data-imgversion', a.imgVersion);

            var liveTypeImgHTML = LJ.$cLoaderTpl.prop('outerHTML');

            var imgTagHTML = imgTag.prop('outerHTML');

            var chatId = a._id;

            var chatWrap = '<div class="chatWrap chat-host none" data-chatid="'+chatId+'">'
                            +'<div class="chatLineWrap"></div>'    
                            +'<div class="chatInputWrap">'
                            +'<div class="liveTypeWrap">'
                                +'<span >En train d\'écrire...</span>'
                                + liveTypeImgHTML
                            +'</div>'
                            +  '<input type="text" value="" placeholder="Are you alone ?">'
                            +  '<input type="submit" value="">'
                            +'</div>'
                            +'<div class="closeChat"><i class="icon icon-cancel"></i></div>'
                           +'</div>';

            var html =  '<div class="a-item '+className+'" data-userid="'+a._id+'">'
                           +'<div class="a-picture">'
                             + imgTagHTML
                           +'<div class="a-birth">Membre depuis le ' + LJ.fn.matchDateDDMMYY( a.signupDate ) + '</div>'
                           +'</div>'
	                           +'<div class="a-body">'
	                             +'<div class="a-name"><span class="label">Nom</span>'+a.name+'</div>'
                                 +'<div class="a-desc"><span class="label">Desc</span>'+a.description+'</div>'
	                             +'<div class="a-age"><span class="label">Age</span>'+a.age+' ans'+'</div>'
	                             +'<div class="a-desc"><span class="label">Humeur</span><div>'+a.mood+'</div></div>'
	                             +'<div class="a-desc"><span class="label">Verre</span><div>'+a.favoriteDrink+'</div></div>'
                           +'</div>'
	                             +'<div class="a-btn">'
	                             	 +'<button class="themeBtnToggle btn-chat">'
                                        +'<i class="icon icon-chat"></i>'
                                     +'</button>'

	                           +'</div>'
                        + chatWrap
                    +'</div>';

            return html;

        },
        renderUserThumb: function( o ){

            if( !o.user )
                return '';

        		var a = o.user;
        		var myClass = o.myClass;

        	var d = LJ.cloudinary.displayParamsAskerThumb
        		dbnw = LJ.cloudinary.displayParamsAskerThumbRefused;
        		 
        		d.version = a.imgVersion,
        		dbnw.version = a.imgVersion;

        	var imgTagBlackWhite = $.cloudinary.image( a.imgId, dbnw ),
        	    imgTag = $.cloudinary.image( a.imgId, d );
        	
        		imgTagBlackWhite.addClass('grey');
        		imgTag.addClass('normal').addClass('none');

        	var imgTagHTML = imgTag.prop('outerHTML'),
        		imgTagBlackWhiteHTML = imgTagBlackWhite.prop('outerHTML');

        	var html = '<div data-userid="' + a._id + '" class="imgWrapThumb '+ myClass + '">'
                        +'<i class="online-marker icon icon-up-dir"></i>'
        				//+'<i class="icon icon-help-1 "></i>'
        				+ imgTagHTML
        				+ imgTagBlackWhiteHTML
        				+ '</div>';

        	return html;

        },
        renderUsersThumbs: function( maxGuest ){

        	var html = '',
        		L = maxGuest || LJ.myAskers.length;

        	for( var i = 0; i < L ; i++ )
        	{
        		var o = {};

        		if( i < LJ.myAskers.length )
        		{
	        		o.user = LJ.myAskers[i];
	        		i == 0 ?  o.myClass = 'active' : o.myClass = '';

        			html += LJ.fn.renderUserThumb( o );
        		}
        		else
        		{
        			o.user = {}
        			o.user._id 	= 'placeholder';
        			o.user.imgId 	= LJ.cloudinary.placeholder_id;
        			o.myClass 		= 'placeholder';
		
        			html += LJ.fn.renderUserThumb( o );

        		}
        		

        	}

        	return html;

        },
        renderTagsFilters: function(){

        	var html = '',
        		tagList = LJ.settings.tagList,
        		L = tagList.length;

        		for( var i=0; i < L; i++){
        			html += '<div class="tag tag-' + tagList[i] + '">' + LJ.fn.matchTagName( tagList[i] ) + '</div>';
        		}
        	return html;

        },
        renderLocsFilters: function(){

        	var html = '',
        		locList = LJ.locList,
        		L = locList.length;

        		for( var i=0; i < L; i++){
        			html += '<div class="loc loc-' + locList[i] + '">' + locList[i] + '</div>';
        		}
        	return html;

        },
        renderAddFriendToPartyButton: function( user, inEvent ){

            var html = '';
            
            if( user.status == 'hosting' )
            {
                html += '<button class="themeBtn isHosting">'
                  + '<i class="icon icon-forward-1"></i>'
                  +'</button>';
                return html;
            }

            if( !inEvent )
            {             
                html += '<button class="themeBtn ready">'
                      + '<i class="icon icon-user-add"></i>'
                      +'</button>';
                return html;
            }

            if( inEvent )
            {
                html += '<button class="themeBtn onHold">'
                      + '<i class="icon icon-ok-1"></i>'
                      +'</button>';
                return html;
            }
            

        },
        renderUser: function( options ){

            var u = options.user,
                w = options.wrap,
                myClass = Array.isArray( options.myClass ) ? options.myClass.join(' ') : options.myClass || '';
                html = '';

            var cl = '', buttons = '', email = '', dataset = '';


            if( !u || !w ){
                return alert('Cannot format user');
            }

            if( w == 'searchWrap' )
            {
                cl = 'u';
                buttons = '<button></button>'
            }

            if( w == 'eventsWrap' )
            {
                cl = 'f'; 
                buttons = '<button class="none"></button>' // sera remove tout de suite par displayButtons...(); 
            }

            if( w == 'adminWrap' )
            {
                cl = 'u';              
            }

            if( w == 'botsWrap' )
            {
                cl = 'u';
                dataset = 'data-imgid="'+u.imgId+'" data-imgversion="'+u.imgVersion+'" '
                email = ' ( '+u.email+' )';

                var active = '';
                var locked = '';
                var none = 'nonei';

                if( $('.eventItemWrap[data-hostid="'+u._id+'"]').length != 0 ){
                    active = 'active validating-btn';
                }

                if(  $('.eventItemWrap[data-hostid="'+u._id+'"]').data('eventstate') == 'suspended' ){
                    locked = 'locked validating-btn';
                }

                buttons = '<button class="createBotEvent themeBtn '+active+'"><i class="icon icon-glass"></i></button>'
                          + '<button class="addBotToEvent themeBtn '+none+'" data-gender="male"><i class="icon"></i>M</button>'
                          + '<button class="addBotToEvent themeBtn '+none+'" data-gender="female"><i class="icon"></i>F</button>'
                          + '<button class="lockBotEvent themeBtn '+none+' '+locked+'"><i class="icon icon-lock"></i></button>';   
                          + '<button class="addBotToEvent themeBtn '+none+'"><i class="bot-added onHold">0</i></button>'
            }

                var d = LJ.cloudinary.displayParamsAskerThumb;
                    imgId = u.imgId;
                    d.version = u.imgVersion;
                    d.radius = '5';

                var imgTagHTML = $.cloudinary.image( imgId, d ).prop('outerHTML');

                html += '<div class="'+cl+'-item '+myClass+'" data-username="'+u.name.toLowerCase()+'"'
                          + 'data-userid="'+u._id+'"'
                          + 'data-useremail="'+u.email+'"'
                          + 'data-userdrink="'+u.favoriteDrink.toLowerCase()+'"'
                          + dataset
                          + 'data-usergender="'+u.gender+'"'
                          + 'data-userage="'+u.age+'">'
                          +'<div class="u-head imgWrapThumb">'
                            +'<i class="icon online-marker icon-right-dir"></i>'
                            + imgTagHTML
                          +'</div>'
                          +'<div class="'+cl+'-body">'
                            + '<span class="'+cl+'-name">'+ u.name + email + '</span>'
                            + '<span class="'+cl+'-age">'+ u.age +' ans, drinks</span>'
                            + '<span class="'+cl+'-favdrink">'+ u.favoriteDrink +'</span>'
                          +'</div>'
                            + buttons
                        +'</div>';

            return html;

        },
        renderUsersInCreateEvent: function(){

            var html = '',
                friendList = LJ.myFriends,
                L = friendList.length;


            for( var i = 0; i < L; i++ )
            {   
                if( _.find( LJ.user.friendList, function(el){ return el.friendId == friendList[i]._id }).status == 'mutual' )
                html += LJ.fn.renderUserThumb( { user: friendList[i], myClass:''} );
            }

            if( html == '' )
                return '<div class="noFriendsYet"><button class="themeBtn static">Ajouter des amis</button></div>'

            return html;



        },
        renderUsersInSearch: function(){

        	var html = '';

        	for( var i = 0; i < LJ.myUsers.length ; i++ )
            {   
                if( LJ.myUsers[i]._id != LJ.user._id )
                html += LJ.fn.renderUser( { user: LJ.myUsers[i], wrap: 'searchWrap', myClass: 'none'} );
        	}

        	return html;

        },
        renderUsersInFriendlist: function(){

            var html = '';

                var fL = LJ.myFriends,
                    L = fL.length;

                for( var i = 0 ; i < L ; i++ )
                {   
                    if( _.find( LJ.user.friendList, function(el){ return el.friendId == fL[i]._id }).status == 'mutual' )
                        html += LJ.fn.renderUserInFriendlist( fL[i] );
                }
                if( html == '' )
                    return '<div class="noFriendsYet"><button class="themeBtn static">Ajouter des amis</button></div>'
                        
                html += '</div></div>';

                return html;

        },
        renderUserInFriendlist: function( friend ){

			if(!friend) return ''

            if( friend.status == 'hosting' )
                return LJ.fn.renderUser({ user: friend, wrap: 'eventsWrap'  });

            if( _.find( LJ.user.friendList, function(el){ return el.friendId == friend._id }).status == 'askedMe' )
                return '';

            if( _.find( LJ.user.friendList, function(el){ return el.friendId == friend._id }).status == 'askedHim' ) 
                return '';

            return LJ.fn.renderUser({ user: friend, wrap: 'eventsWrap'});
        },
        renderProfileRows: function( profileRowsList ){

            var html = '',
                arr = profileRowsList;

            for( var i=0; i<arr.length; i++ )
            {
                vals = arr[i].values;
                var list ='';
                for( var k=0; k<vals.length; k++ )
                {
                    list += '<div class="' + arr[i].name + '" data-' +arr[i].name + '="' +vals[k].name + '">'+ vals[k].display +'</div>';  
                }
                
                html += '<div class="input-row-wrap">'
                          + '<label for="' + arr[i].name + '">' + arr[i].display + '</label>'
                          + '<div id="' + arr[i].name + '">'
                          + list
                          +'</div>'
                      + '</div>'
            }
            return html;

        }

});