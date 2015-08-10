
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
        renderCreateEvent: function(){

            var html = '<div id="createEvent" class="">'
      
                      +'<div class="row-create">'
                        +'<h2>Faites nous plaisir</h2>'
                      +'</div>'
                      +'<div class="row-title-sub">'
                        +'Tous les befores rapportent 500pts lorsqu\'ils donnent lieu à une vraie rencontre'
                      +'</div>'

                      +'<div class="row-input row-input-lg etiquette row-create-hosts">'
                        +'<label class="label label-lg" for="cr-hosts">Organisateurs</label>'
                        +'<input class="need-sanitize" id="cr-hosts" type="text" placeholder="Sélectionne parmis tes amis ( 3 max )">'
                      +'</div>'

                      +'<div class="row-input row-input-md etiquette row-create-date">'
                        +'<label class="label " for="cr-date">Date du before</label>'
                        +'<input class="need-sanitize" readonly data-select="datepicker" id="cr-date" type="text" placeholder="A quelle heure on débarque?">'
                      +'</div>'

                      +'<div class="row-input row-input-md etiquette row-create-before-location">'
                        +'<label class="label " for="cr-before-location">Lieu du before</label>'
                        +'<input id="cr-before-location" type="text" placeholder="Nom de la rue, du quartier">'
                      +'</div>'

                      +'<div class="row-input row-input-lg etiquette row-create-ambiance">'
                        +'<label class="label label-lg" for="cr-ambiance">Ambiance</label>'
                        +'<input class"need-sanitize" id="cr-ambiance" type="text" placeholder="Hashtag ton before ( 5 max )">'
                      +'</div>'

                      +'<div class="row-input row-input-lg etiquette row-create-age">'
                        +'<label class="label label-lg" for="cr-age">Âge souhaité</label>'
                        +'<input id="cr-age" type="text" placeholder="Nom de la rue">'
                      +'</div>'

                      +'<div class="row-input row-input-lg etiquette row-create-mixity">'
                        +'<label class="label label-lg" for="cr-mixity">Invités</label>'
                        +'<div class="row-select-wrap mixity-wrap">'
                              +'<div class="row-select mixity" data-selectid="boys"><i class="icon icon-boys icon-male-1"></i>Plutôt des hommes</div>'
                              +'<div class="row-select mixity" data-selectid="mixed"><i class="icon icon-mix icon-users"></i>Les deux</div>'
                              +'<div class="row-select mixity selected" data-selectid="girls"><i class="icon icon-girls icon-female-1"></i>Plutôt des femmes</div>'
                        +'</div>'
                      +'</div>'

                      +'<div class="row-input row-input-lg etiquette row-create-party-location">'
                        +'<label class="label label-lg" for="cr-party-location">Soirée prévue</label>'
                        +'<input id="cr-party-location" type="text" placeholder="Bar, nightclub, évènement facebook...">'
                        //+'<div class="row-select-description etiquette">Aide nous à connaître ton état d\'esprit</div>'
                      +'</div>'

                      +'<div class="row-buttons visible">'
                          +'<button class="theme-btn btn-cancel right">Annuler</button>'
                          +'<button class="theme-btn btn-validate right">Créer!</button>'
                      +'</div>' 

                    +'</div>'

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

            if( LJ.user.asked_events.indexOf( eventId ) > -1 )
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
        renderHostImg: function( hostimg_id, hostimg_version ){

        	var d = LJ.cloudinary.displayParamsEventHost;
				d.version = hostimg_version;


			var imgTag = $.cloudinary.image( hostimg_id, d )
						  .addClass('zoomable')
						  .attr('data-img_id', hostimg_id )
						  .attr('data-img_version', hostimg_version );

			var imgTagHTML = imgTag.prop('outerHTML');

			return imgTagHTML
        },
        renderAskerInEvent: function( img_id, o ){

        	var $img = $.cloudinary.image( img_id, LJ.cloudinary.displayParamsEventAsker );
        		$img.attr('data-img_id', img_id)
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
	        		var img_id        = askersList[i].img_id;
	        			d.img_version = askersList[i].img_version;
	        			o.classList = ['askedInThumb'];
	        			o.dataList   = [ { dataName: 'userid', dataValue:  askersList[i]._id } ];

        		}else //On affiche via placeholder le nb de places restantes.
        		{     
                    /* Deprecated
        			var img_id = LJ.cloudinary.placeholder_id;
        				o.classList = ['askedInRemaining'];
                    */
        		}

        		html += LJ.fn.renderAskerInEvent( img_id, o ).prop('outerHTML');
        	}
        		
        		return html
        },
		renderEvent: function( e ){

			var eventId        = e._id,
				hostId         = e.hostId,
				hostimg_id      = e.hostimg_id,
				hostimg_version = e.hostimg_version,
				tags           = e.tags;

			var imgTagHTML   = LJ.fn.renderHostImg( hostimg_id, hostimg_version ),
			    button       = LJ.fn.renderEventButton( e._id, hostId, e.state ),
				eventTags    = LJ.fn.renderEventTags( tags ),
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
		renderAskerPlaceholder: function(){

			var asker = {

				id: "placeholder",
				img_id: LJ.cloudinary.placeholder_id,
				name:"White",
				age: 25,
				description:""

			}

			return LJ.fn.renderAskerMain( asker );

		},
        renderAskerMain: function( a, className ){

        	className = className || '';

            var d = LJ.cloudinary.displayParamsAskerMain;
            	d.version = a.img_version; // Ne fonctionne pas car le param 'a' provient de la base qui est pas MAJ

            var imgTag = $.cloudinary.image( a.img_id, d );
            	imgTag.addClass('zoomable')
            		  .attr('data-img_id', a.img_id)
            		  .attr('data-img_version', a.img_version);

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
                           +'<div class="a-birth">Membre depuis le ' + LJ.fn.matchDateDDMMYY( a.signup_date ) + '</div>'
                           +'</div>'
	                           +'<div class="a-body">'
	                             +'<div class="a-name"><span class="label">Nom</span>'+a.name+'</div>'
                                 +'<div class="a-desc"><span class="label">Desc</span>'+a.description+'</div>'
	                             +'<div class="a-age"><span class="label">Age</span>'+a.age+' ans'+'</div>'
	                             +'<div class="a-desc"><span class="label">Humeur</span><div>'+a.mood+'</div></div>'
	                             +'<div class="a-desc"><span class="label">Verre</span><div>'+a.drink+'</div></div>'
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
        		 
        		d.version = a.img_version,
        		dbnw.version = a.img_version;

        	var imgTagBlackWhite = $.cloudinary.image( a.img_id, dbnw ),
        	    imgTag = $.cloudinary.image( a.img_id, d );
        	
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
        			o.user.img_id 	= LJ.cloudinary.placeholder_id;
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
                dataset = 'data-img_id="'+u.img_id+'" data-img_version="'+u.img_version+'" '
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
                    img_id = u.img_id;
                    d.version = u.img_version;
                    d.radius = '5';

                var imgTagHTML = $.cloudinary.image( img_id, d ).prop('outerHTML');

                html += '<div class="'+cl+'-item '+myClass+'" data-username="'+u.name.toLowerCase()+'"'
                          + 'data-userid="'+u._id+'"'
                          + 'data-useremail="'+u.email+'"'
                          + 'data-userdrink="'+u.drink.toLowerCase()+'"'
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
                            + '<span class="'+cl+'-favdrink">'+ u.drink +'</span>'
                          +'</div>'
                            + buttons
                        +'</div>';

            return html;

        },
        renderUsersInfriends: function(){

            var html = '';

                var fL = LJ.myFriends,
                    L = fL.length;

                for( var i = 0 ; i < L ; i++ )
                {   
                    if( _.find( LJ.user.friends, function(el){ return el.friendId == fL[i]._id }).status == 'mutual' )
                        html += LJ.fn.renderUserInfriends( fL[i] );
                }
                if( html == '' )
                    return '<div class="noFriendsYet"><button class="themeBtn static">Ajouter des amis</button></div>'
                        
                html += '</div></div>';

                return html;

        },
        renderUserInfriends: function( friend ){

			if(!friend) return ''

            if( friend.status == 'hosting' )
                return LJ.fn.renderUser({ user: friend, wrap: 'eventsWrap'  });

            if( _.find( LJ.user.friends, function(el){ return el.friendId == friend._id }).status == 'askedMe' )
                return '';

            if( _.find( LJ.user.friends, function(el){ return el.friendId == friend._id }).status == 'askedHim' ) 
                return '';

            return LJ.fn.renderUser({ user: friend, wrap: 'eventsWrap'});
        },
        renderProfilePicturesWraps: function(){

            var pictures = LJ.user.pictures;
            var html = '';

            for( var i = 0; i < pictures.length; i++)
            {
                var main = '';
                if( pictures[i].is_main )
                    var main = " main-picture";

                html += '<div class="picture unselectable'+main+'" data-img_version="'+pictures[i].img_version+'" data-img_place="'+i+'">'
                        +'<div class="picture-hashtag"><span>#</span><input readonly type="text" placeholder="classic"></input></div>'
                        +'<div class="picture-edit">'
                          +'<i class="icon icon-main icon-user-1"></i>'
                          +'<i class="icon icon-delete icon-trash-empty"></i>'
                        +'</div>'
                        +'<div class="picture-upload none">'
                         +'<div class="upload-desktop">'
                          +'<form class="upload_form"></form>'
                          +'<i class="icon icon-upload-desktop icon-desktop"></i>'
                         +'</div>'
                         +'<div class="upload-facebook">'
                          +'<i class="icon icon-upload-facebook icon-facebook"></i>'
                         +'</div>'
                        +'</div>'
                        +'</div>';
            }

            return html;
        },
        renderFriendInProfile: function( friend ){

            var img_id = LJ.fn.findMainImage( friend ).img_id,
                img_version = LJ.fn.findMainImage( friend ).img_version,
                display_options = LJ.cloudinary.profile.friends.params;

            display_options.img_version = img_version;

            var image_tag = $.cloudinary.image( img_id, display_options ).prop('outerHTML');

            var html =  '<div class="row-friend-item detailable" data-id="'+friend.facebook_id+'">'
                            + '<div class="row-friend-img">'+ image_tag +'</div>'
                            + '<div class="row-friend-name">' + friend.name + '</div>'
                            + '<div class="row-friend-action"></div>' 
                        +'</div>'

            return html;
        },
        renderUserProfileInCurtain: function( user ){

            /* Photos de thumbs */
            var user_main_pictures = '';
            var user_thumb_pictures = '';
            var user_picture_hashtags = '';

            user.pictures.forEach( function( itm ){

                var main_type      = itm.is_main ? 'main_active'  : 'main'  ;
                var thumb_type     = itm.is_main ? 'thumb_active' : 'thumb' ;
                var hashtag_active = itm.is_main ? 'active'       : '' ;

                var display_params_main             = LJ.cloudinary.curtain[ main_type ].params;
                    display_params_main.img_version = itm.img_version;

                var display_params_thumb             = LJ.cloudinary.curtain[ thumb_type ].params;
                    display_params_thumb.img_version = itm.img_version;
                    display_params_thumb.width       = LJ.cloudinary.curtain.main.params.width / 5;
                    display_params_thumb.height      = display_params_thumb.width;

                var user_picture_thumb   = $.cloudinary.image( itm.img_id, display_params_thumb ).attr('img-place', itm.img_place).prop('outerHTML'),
                    user_picture_main    = $.cloudinary.image( itm.img_id, display_params_main ).prop('outerHTML'),
                    user_picture_hashtag = '<div class="modal-user-picture-hashtag '+ hashtag_active+'" img-place="' + itm.img_place + '">#' + itm.hashtag + '</div>';

                user_thumb_pictures += user_picture_thumb;
                user_main_pictures  += user_picture_main;
                user_picture_hashtags += user_picture_hashtag;
            });

            /* Rendu des images */    
            var images_html = '<div class="modal-user-pictures">'
                                + '<div class="modal-user-main-picture">'
                                    + user_main_pictures
                                    + user_picture_hashtags
                                + '</div>'
                                + '<div class="modal-user-other-pictures">' + user_thumb_pictures + '</div>'
                            + '</div>'

            /* Rendu des informations */
            var description_html = '<div class="modal-user-description">'
                                + '<div class="modal-user-description-head">'
                                    + '<div class="modal-user-name">' + user.name + '</div>'
                                    + '<div class="modal-user-membersince">Membre depuis le ' + moment(user.signup_date).format('DD/MM/YYYY') + '</div>'
                                    + '<div class="modal-user-age">' + user.age + '<span> ans</span></div>'
                                   // + '<div class="modal-user-motto etiquette">"' + user.motto + '"</div>'
                                    + '<div class="modal-user-mood">#'  + LJ.fn.hashtagify( user.mood ) + '</div>'
                                    + '<div class="modal-user-drink">#' + LJ.fn.hashtagify( user.drink )+ '</div>'
                                    + '<div class="modal-user-job">#'   + LJ.fn.hashtagify( user.job ) + '</div>'
                                + '</div>'
                                + '<div class="modal-user-description-body">'
                                + '</div>'


            var html = '<div class="modal-user-content">' + images_html + description_html + '</div>';

            return html;
        },
        renderUserProfileInCurtainNone: function(){
             var html = '<h2 class="super-centered">Mauvais identifiant :/</h2>';
             return html;

        },
        renderFacebookUploadedPictures: function( data ){

            var urls = _.pluck( data, 'source' ),
                html = '<div class="facebook-image-item-wrap">';

            urls.forEach(function(url){
                html += '<div class="facebook-image-item"><img src="' + url + '" width="100%"></div>';
            });
                html += ['<div class="upload-buttons">',
                          '<button class="theme-btn btn-cancel right">Annuler</button>',
                          '<button class="theme-btn btn-validate btn-validating right">Valider</button>',
                        '</div>'].join('');

                html += '</div>';

            return html;
        },
        renderFriendInCreate: function( friend ){

            /* Rendering friend thumb image */
            var img_id          = LJ.fn.findMainImage( friend ).img_id,
                img_version     = LJ.fn.findMainImage( friend ).img_version,
                display_options = LJ.cloudinary.create.friends.params;
                display_options.img_version = img_version;

            var image_tag_friend = $.cloudinary.image( img_id, display_options ).prop('outerHTML');
            var image_tag_loader = LJ.$bar_loader.clone().addClass('host-loader').prop('outerHTML');

            var html =  '<div class="rem-click host" data-id="'+friend.facebook_id+'">'
                            + image_tag_friend
                            + image_tag_loader
                            + '<div class="host-name">' + friend.name + '</div>'
                        +'</div>'

            return html;


        },
        renderAmbianceInCreate: function( hashtag ){

            var html =  '<div class="rem-click ambiance">'
                            + '<div class="ambiance-hashtag">#</div>'
                            + '<div class="ambiance-name">' + hashtag + '</div>'
                        +'</div>'

            return html;
        },
        renderDateInCreate: function( date ){

            var html =  '<div class="rem-click date">'
                            + '<i class="icon icon-date icon-clock"></i>'
                            + '<div class="date-name">' + date + '</div>'
                        +'</div>'

            return html;
        },
        renderFacebookUploadedPicturesNone: function(){

        }


});