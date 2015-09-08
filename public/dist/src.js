	
	window.LJ = _.merge( window.LJ || {}, 

{

	accessToken:'',
	ui:{
		artificialDelay: 700,
		minimum_loading_time: 1000,
		displayIn:  { opacity: [1, 0], translateX: [-8, 0]   },
		displayOut: { opacity: [0, 1], translateX: [10, 0]   }
	},
	cloudinary:{
		uploadParams: { cloud_name:"radioreve", api_key:"835413516756943" },

		/* Image de l'host dans un event */
		displayParamsEventHost: { cloud_name :"radioreve", width: 80, height: 80, crop: 'fill', gravity: 'face', radius: '2' },

        /* Image des askers dans la vue event */
        displayParamsEventAsker: { cloud_name: "radioreve", width:45, height:45, crop:'fill', gravity:'face', radius:'0' },

		/* Image du user dans le header */
		displayParamsHeaderUser: { cloud_name: "radioreve",width: 50,height: 50, crop: 'fill', gravity: 'face', radius: 'max' },

		/* Image zoom lorsqu'on clique sur une photo*/
		displayParamsOverlayUser: { cloud_name: "radioreve", width: 280, height: 280, crop: 'fill', gravity: 'face', radius: 'max' },

        /* Image principale des askers dans vue managemnt */
        displayParamsAskerMain: { cloud_name: "radioreve", width:120, height:120, crop:'fill', gravity:'face', radius:3 },

		/* Image secondaire des askers dans vue management */
        displayParamsAskerThumb: { cloud_name: "radioreve", width:45, height:45, crop:'fill', gravity:'face', radius:'max' },

        /* Image secondaire des askers dans vue management, lorsqu'ils sont refusé */
        displayParamsAskerThumbRefused: { cloud_name: "radioreve", width:45, height:45, crop:'fill', effect:'grayscale', gravity:'face', radius:'max' },
        
		/* Image of friends in profile view */
		profile: {
			me: {
				params: { cloud_name: "radioreve", width: 150, height: 150, crop: 'fill', gravity: 'face' }
			},
			friends: {
				params: { cloud_name: "radioreve", width: 50, height: 50, crop: 'fill', gravity: 'face' }
			}
		},
		search: {
			user: {
				params: { cloud_name: "radioreve", 'class': 'super-centered', width: 40, height: 40, crop: 'fill', gravity: 'face' }
			}
		},
        curtain: {
        	main: {
        		params: { cloud_name: "radioreve", 'class': 'modal-main-picture etiquette', width: 250, height: 250, crop: 'fill', gravity: 'face' }
        	},
        	main_active: {
        		params: { cloud_name: "radioreve", 'class': 'modal-main-picture etiquette active', width: 250, height: 250, crop: 'fill', gravity: 'face' }
        	},
        	thumb: {
        		params: { cloud_name: "radioreve", 'class': 'modal-thumb-picture', crop: 'fill', gravity: 'face' }	
        	},
        	thumb_active: {
        		params: { cloud_name: "radioreve", 'class': 'modal-thumb-picture active', crop: 'fill', gravity: 'face' }
        	}
        },
        logo: {
        	black_on_white: {
        		id:'logo_black_on_white'
        	},
        	white_on_black: {
        		id:'logo_white_on_black'
        	}
        },
        placeholder: {
        	id: 'placeholder_picture',
        	params: { cloud_name :"radioreve", html: { 'class': 'mainPicture' }, width: 150 }
        },
    	loaders: {
    		main: {
    			id: 'main_loader',
    			params: { cloud_name :"radioreve", 'class': 'ajax-loader' }
    		},
    		mobile: {
    			id: 'mobile_loader',
    			params: { cloud_name :"radioreve", 'class': 'ajax-loader', width: 25 }
    		},
    		chat: {
    			id: 'chat_loader',
    			params: { cloud_name :"radioreve", 'class': 'chat-loader', width: 12 }
    		},
    		curtain: {
    			id: 'curtain_loader_v4',
    			params: { cloud_name :"radioreve", 'class': 'curtain-loader super-centered', width: 20 }
    		}
    	},
	},
	/* To be dynamically filled on login */
	user:{},
	myEvents: [],
    myAskers: [],
    myUsers: [],
    myFriends: [],
    channels: { 
    	myChats: []
    },
    myOnlineUsers: [],
    selectedTags: [],
    selectedLocations: [],
    $eventsToDisplay: $(),
    $main_loader: $(),
    $mobile_loader: $(),
    $chat_loader: $(),
    $curtain_loader: $(),
	state: {
		connected: false,
		fetchingEvents: false,
        fetchingAskers: false,
		animatingContent: false,
		animatingChat: false,
		toastAdded: false,
		typingMsg: {},
		jspAPI:{},
		uploadingImage: false,
		uploadingimg_id:'',
		uploadingimg_version:''
	},
	tpl:{
		toastInfo : '<div class="toast toastInfo" class="none"><span class="toast-icon icon icon-right-open-big">'
					+'</span><span class="toastMsg"></span></div>',
		toastError: '<div class="toast toastError" class="none"><span class="toast-icon icon icon-cancel">'
					+'</span><span class="toastMsg"></span></div>',
		toastSuccess: '<div class="toast toastSuccess" class="none"><span class="toast-icon icon icon-right-open-big">'
					+'</span><span class="toastMsg"></span></div>',
		noResults: '<center id="noResults" class="filtered"><h3>Aucun évènement pour ce choix de filtre </h3></center>',
		noEvents: '<center id="noEvents" class=""><h3>Aucun évènement n\'a encore été proposé. Soyez le premier! </h3></center>'
	},
	tagList: [],
	msgQueue: [],
	locList: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 ],
        $body                 : $('body'), 
		$loginWrap		 	  : $('#loginWrapp'),
		$signupWrap			  : $('#signupWrapp'),
		$resetWrap   	      : $('#resetWrapp'),
		$profileWrap	      : $('#profileWrap'),
		$eventsWrap		      : $('#eventsWrap'),
		$manageEventsWrap     : $('#manageEventsWrap'),
        $askersListWrap       : $('#askersListWrap'),
		$thumbWrap			  : $('#thumbWrap'),
		$loginBtn  	          : $('#login'),
		$signupBtn            : $('#signup'),
		$resetBtn			  : $('#reset'),
		$emailInput           : $('#email'),
		$passwordInput        : $('#pw'),
		$lostPassword         : $('#lost_pw'),
		$emailInputSignup     : $('#emailSignup'),
		$passwordInputSignup  : $('#pwSignup'),
		$passwordCheckInput   : $('#pwCheckSignup'),
		$backToLogin          : $('#b_to_login'),
		$validateBtn          : $('#validate'),
		$locationInput        : $('#location'),
		$loaderWrap 	      : $('.loaderWrap'),
		$createEventWrap	  : $('#createEventWrap'),
		$createEventBtn       : $('#createEventBtn'),
		$contentWrap          : $('#contentWrap'),
		$contactWrap          : $('#contactWrap'),
		$menuWrap             : $('#menuWrap'),
		$eventsListWrap       : $('#eventsListWrap'),
		$logout				  : $('#logout')

});

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
                        +'<input id="cr-hosts" type="text" placeholder="Sélectionner les organisateurs parmis tes amis">'
                      +'</div>'

                      +'<div class="row-input row-input-md etiquette row-create-date">'
                        +'<label class="label " for="cr-date">Date du before</label>'
                        +'<input id="cr-date" type="text" placeholder="">'
                      +'</div>'

                      +'<div class="row-input row-input-md etiquette row-create-before-location">'
                        +'<label class="label " for="cr-before-location">Lieu du before</label>'
                        +'<input id="cr-before-location" type="text" placeholder="">'
                      +'</div>'

                      +'<div class="row-input row-input-lg etiquette row-create-ambiance">'
                        +'<label class="label label-lg" for="cr-ambiance">Ambiance</label>'
                        +'<input id="cr-ambiance" type="text" placeholder="Nom de la rue">'
                      +'</div>'

                      +'<div class="row-input row-input-lg etiquette row-create-age">'
                        +'<label class="label label-lg" for="cr-age">Âge souhaité</label>'
                        +'<input id="cr-age" type="text" placeholder="Nom de la rue">'
                      +'</div>'

                      +'<div class="row-input row-input-lg etiquette row-create-mixity">'
                        +'<label class="label label-lg" for="cr-mixity">Type d\'invités</label>'
                        +'<div class="row-select-wrap mixity-wrap">'
                              +'<div class="row-select mixity" data-selectid="boys"><i class="icon icon-boys icon-male-1"></i>Plutôt des hommes</div>'
                              +'<div class="row-select mixity" data-selectid="mixed"><i class="icon icon-mix icon-users"></i>Les deux</div>'
                              +'<div class="row-select mixity selected" data-selectid="girls"><i class="icon icon-girls icon-female-1"></i>Plutôt des femmes</div>'
                        +'</div>'
                      +'</div>'

                      +'<div class="row-input row-input-lg etiquette row-create-party-location">'
                        +'<label class="label label-lg" for="cr-party-location">Soirée envisagée</label>'
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
        renderFacebookUploadedPicturesNone: function(){

        }


});


window.LJ.fn = _.merge( window.LJ.fn || {} ,

{
		handleDomEvents: function(){

			LJ.fn.handleDomEvents_Globals();
			LJ.fn.handleDomEvents_Landing();
			LJ.fn.handleDomEvents_Navbar();
			LJ.fn.handleDomEvents_Modal();
			LJ.fn.handleDomEvents_Profile();
			LJ.fn.handleDomEvents_Events();
			LJ.fn.handleDomEvents_Create();
			LJ.fn.handleDomEvents_Management();
			LJ.fn.handleDomEvents_Search();
			LJ.fn.handleDomEvents_Settings();

		},
		handleDomEvents_Globals: function(){


			LJ.$body.on('mouseenter', '.eventItemWrap', function(){
				$(this).addClass('mouseover');
			});

			LJ.$body.on('mouseleave', '.eventItemWrap', function(){
				$(this).removeClass('mouseover');
			});

			$('.curtain').click( function(){
				LJ.fn.hideModal();
			});

            LJ.$body.on('click', '.detailable', function(){
            	LJ.fn.displayUserProfile( $(this).attr('data-id') );
            });
            
            LJ.$body.on('click', '.row-input', function(){
            	var $self = $(this);
            	if( $self.parents('.row').hasClass('editing') ) return;
            	$self.parents('.row').find('.icon-edit').toggleClass('slow-down full-rotation');
            });

		},
		handleDomEvents_Landing: function(){

			$('#facebook_connect').click(function(e){

				e.preventDefault();

				FB.login( function(res){

					delog('Client facebook status is : ' + res.status ) ;

					if( res.status == 'not_authorized' ){
						LJ.state.loggingIn = false;
						delog('User didnt let Facebook access informations');
						return
					}

					if( res.status == 'connected' ){

					  	$('#facebook_connect').velocity({ opacity: [0,1] }, { duration: 1250 });

						LJ.state.loggingIn = true;
						var access_token = res.authResponse.accessToken;
						delog('short lived access token : ' + access_token );

						FB.api('/me', function( facebookProfile ){
							facebookProfile.access_token = access_token;
					  		LJ.fn.loginWithFacebook( facebookProfile );
				  		}); 
					}

				}, { scope: ['public_profile', 'email', 'user_friends']} );
			});

		},
		handleDomEvents_Navbar: function(){

			LJ.$logout.click(function(){
				LJ.user.app_preferences.ux.auto_login = 'no';
				LJ.fn.setLocalStoragePreferences();
				location.reload();

			});

			LJ.$body.on('click', '#thumbWrap img', function(){
				LJ.fn.displayUserProfile( LJ.user.facebook_id );
			});

			$('#search').click(function(){
				$(this).find('input').focus();
			});

			$('#search').mouseover(function(){

			});

			['#contact', '#profile', '#events', '#management', '#settings'].forEach(function(menuItem){

				$(menuItem).click(function(){

				$(menuItem).find('span.bubble').addClass('filtered').text('');
		
				  if( LJ.state.animatingContent || $(menuItem).hasClass('menu-item-active') || ($(menuItem).hasClass('disabled')) )
				  	return;

				  		LJ.state.animatingContent = true;
						
						var linkedContent = $(menuItem).data('linkedcontent');
						
						var indexActive = $('.menu-item-active').offset().left,
							indexTarget = $(menuItem).offset().left;

						if( indexActive > indexTarget ){
							var myWayOut = 'transition.slideLeftOut' ; //{opacity: [0, 1], translateX:[15,0 ] },
								myWayIn = 'transition.slideRightIn' ; //{opacity: [1, 0], translateX:[0,-5 ] };
						} else {
							var myWayOut = 'transition.slideRightOut' ;// {opacity: [0, 1], translateX:[-15,0 ] },
								myWayIn = 'transition.slideLeftIn' ; //{opacity: [1, 0], translateX:[0, 5] };
						}

						$('.menu-item-active').removeClass('menu-item-active')
											  .find('span.underlay')
											  .velocity({ opacity: [0, 1], translateY: [-2, 0]   },
											   { duration: 300,
											   complete: function(){
											   	$(menuItem).addClass('menu-item-active')
														   .find('span.underlay')
													   	   .velocity({ opacity: [1, 0], translateY: [0, -2]   }, { duration: 300 });
											   	} 
											});

						LJ.fn.displayContent( $(linkedContent), {
							myWayOut: myWayOut,
							myWayIn : myWayIn, 
							prev:'revealed',
							duration: 320
						});
					
				  
				});
			});

		},
		handleDomEvents_Profile: function(){

			LJ.$body.on('mouseover', '#createEvent', function(){
				$('.search-results-places').addClass('open');
			});

			LJ.$body.on('change-user-xp', LJ.fn.updateUserXp );

			LJ.$body.on('click', '.upload-facebook', function(){
				
				var img_place = $(this).parents('.picture').data('img_place');
				LJ.fn.displayInModal({
					url:'/me/photos/uploaded',
					source:'facebook',
					render_cb: LJ.fn.renderFacebookUploadedPictures,
					error_cb: LJ.fn.renderFacebookUploadedPicturesNone,
					custom_data: [{ key: 'img-place', val: img_place }]
				});

			});

			LJ.$body.on('click', '.row-informations .btn-validate', function(){
				if( $(this).hasClass('btn-validating') )
					return;
				$(this).addClass('btn-validating');
				LJ.fn.updateProfile();
			});

			/* Généric ui update of selectable inputs */
			LJ.$body.on('click', '.row-select', function(){
				var $self = $(this);
				if( !$self.parents('.row-select-daddy').hasClass('editing') )
					return ;

				var $selectedType = $self.parents('.row-select-wrap');
				$selectedType.find('.row-select.modified').removeClass('modified');
				$self.addClass('modified');
			
			});


			/* Activate modifications */
			LJ.$body.on('click', '.row-select-daddy .icon-edit:not(.active)', function(){ 

				var $self = $(this);
				var $daddy = $self.parents('.row-select-daddy');

				$self.addClass('active');
				$daddy.addClass('editing');
				
				$daddy
					.find('.row-buttons').velocity('transition.fadeIn',{ duration:600 })
					.end().find('input').attr('readonly', false)
					.end().find('.row-input')
					.each( function( i, el ){
						var current_val = $(el).find('input').val(),
					    	current_select_id = $(el).find('.row-select.selected').attr('data-selectid'),
					    	restore_arr = [ current_val, current_select_id ];
					    	restore_arr.forEach(function( val ){
					    		if( val != undefined )
					    			$(el).attr('data-restore', val );
					    	});
					});

				$daddy.find('.row-select.selected').removeClass('selected').addClass('modified');
			});

			/* Cancel ugoing modifications */
			LJ.$body.on('click', '.row-select-daddy .icon-edit.active, .row-select-daddy .btn-cancel', function(){

				var $daddy = $(this).parents('.row-select-daddy');

				$daddy
					.removeClass('editing')
					.find('.icon-edit.active').removeClass('active')
					.end().find('input').attr('readonly',true)
					.end().find('.row-buttons').hide()
					.end().find('.modified').removeClass('modified')
					.end().find('[data-restore]')
					.each(function( i, el ){
						var val = $(el).attr('data-restore')
						$(el).find('input').val( val )
							 .end()
							 .find('[data-selectid="'+val+'"]').addClass('selected');						
					});

			});

			LJ.$body.on('click', '.row-pictures .icon-edit:not(.active)', function(){

				var $self = $(this);
				$self.addClass('active').parents('.row-pictures').addClass('editing');

				$('.row-pictures')
					.find('.picture-hashtag input').attr('readonly', false)
					.end().find('.row-buttons').velocity('transition.fadeIn',{ duration:600 })
					.end().find('.picture-edit, .row-pictures .row-buttons').velocity('transition.fadeIn',{ duration: 600 });

			});

			LJ.$body.on('mouseenter', ".row-pictures:not('.editing') .picture", function(){
				if( LJ.state.uploadingImage ) return;
				$(this)
				   .find('.picture-upload')
				   .velocity('stop')
				   .velocity('transition.fadeIn', { duration: 260 });
			});
			LJ.$body.on('mouseleave', ".row-pictures:not('.editing') .picture", function(){
				$(this)
				   .find('.picture-upload')
				   .velocity('stop')
				   .velocity('transition.fadeOut', { duration: 260 });
			});

			LJ.$body.on('click', '.row-pictures .icon-edit.active, .row-pictures .btn-cancel', function(){

				$('.row-pictures')
					.removeClass('editing')
					.find('.icon-edit.active').removeClass('active')
					.end().find('.selected').removeClass('selected')
					.end().find('.picture-hashtag input').attr('readonly',true)
					.end().find('.picture-edit').velocity('transition.fadeOut', { duration: 600 })
					.end().find('.row-buttons').hide();
				return;

			});

			LJ.$body.on('click', '.picture-edit i', function(){

				var $self = $(this);

				if( $self.hasClass('selected') )
					return $self.removeClass('selected');

				if( $self.hasClass('icon-main') ){
					$('.icon-main').removeClass('selected');
					$self.siblings('.icon-delete').removeClass('selected');
					$self.addClass('selected');
					return;
				}

				if( $self.hasClass('icon-delete') ){
					$self.siblings('.icon-main').removeClass('selected');
					$self.addClass('selected');
				}

			});


			LJ.$body.on('focusout', '.picture-hashtag input', function(){
				$(this).val( LJ.fn.hashtagify( $(this).val() ));
			});

			LJ.$body.on('click', '.row-pictures .btn-validate', function(){
				
				var $self = $(this);
				if( $self.hasClass('btn-validating') )
					return;

				var updatedPictures  = [],
					$newMainPicture  = $('.icon-main.selected').parents('.picture'),
					$deletedPictures = $('.icon-trash-empty.selected').parents('.picture');
					$hashtagPictures = $('.picture');
					
					$deletedPictures.each(function( i, el ){
						var $el = $( el ),
							picture = { 
								img_place: $el.data('img_place'),
								action: "delete"
							};
							updatedPictures.push( picture );
					});

					$newMainPicture.each(function( i, el ){
						var $el = $( el ),
							picture = {
								img_place: $el.data('img_place'),
								action: "mainify"
							};
							updatedPictures.push( picture );
					});

					$hashtagPictures.each(function( i, el ){
						var new_hashtag = $('.picture[data-img_place="'+i+'"]').find('.picture-hashtag').find('input').val();
						var $el = $( el ),
							picture = {
								img_place: $el.data('img_place'),
								action: "hashtag",
								new_hashtag: LJ.fn.hashtagify( new_hashtag )
							};
							updatedPictures.push( picture );
					});

				if( updatedPictures.length == 0 )
					return LJ.fn.toastMsg("Aucune mise à jour nécessaire!","error");

				csl('Emitting update pictures (all)');
				$self.addClass('btn-validating');

				var eventName = 'me/update-pictures',
					data = { userId: LJ.user._id, updatedPictures: updatedPictures },
					cb = {
						success: LJ.fn.handleUpdatePicturesSuccess						
					};

				LJ.fn.say( eventName, data, cb );

			});

			$('.inspire').click( function(){
        		var list = LJ.settings.profileDescList;
        		$(this).siblings('input').val( LJ.settings.profileDescList[ LJ.fn.randomInt( 0, list.length - 1) ])
            });


		},
		handleDomEvents_Modal: function(){

			$('.modal-container').on('click','.modal-thumb-picture', function(){

				var $self = $(this);

				if( $self.hasClass('active') )
					return;

				if( $self.attr('src').split('/').slice(-1)[0] == 'placeholder_picture')
					return 

				var img_place = $self.attr('img-place');
				$('.modal-thumb-picture, .modal-user-picture-hashtag').removeClass('active');
				$self.add( $('.modal-user-picture-hashtag[img-place="'+ img_place +'"]') ).addClass('active');

				var img_version = $self.attr('img_version');

				$('.modal-main-picture').removeClass('active');
				$('.modal-main-picture[img_version="'+img_version+'"]').addClass('active');

			});

			$('.modal-container').on('click', '.facebook-image-item', function(){

				var $self = $(this);

				if( $self.hasClass('active') ){
					$self.removeClass('active');
					$('.modal-container').find('.btn-validate').addClass('btn-validating');
				} else {
					$('.facebook-image-item').removeClass('active')
					$('.modal-container').find('.btn-validate').removeClass('btn-validating');
					$self.addClass('active');
				}

			});

			$('.modal-container').on('click', '.btn-cancel', LJ.fn.hideModal );

			$('.modal-container').on('click', '.btn-validate', function(){

				var $self = $(this);
				if( $self.hasClass('btn-validating') )
					return;

				if( $('.facebook-image-item.active').length != 1 )
					return;

				$self.addClass('btn-validating');

				var url = $('.facebook-image-item.active').find('img').attr('src');
				var img_place = $self.parents('.modal-container-body').children().last().attr('data-img-place');

				LJ.fn.hideModal();

				LJ.fn.updatePictureWithUrl({
        				userId: LJ.user._id,
        				url: url,
        				img_place: img_place
        			}, function( err, data ){

					if( err )
						return LJ.fn.handleServerError("L'upload avec Facebook a échoué.");

					LJ.fn.handleServerSuccess("Vos photos ont été mises à jour");

					LJ.fn.replaceImage({
							img_id: data.img_id,
							img_version: data.img_version,
							img_place: img_place,
							scope: ['profile']
						});

				});
				

			});

		},
		handleDomEvents_Events: function(){
	
			$('#refreshEventsFilters').click( function(){
					
				var $inserted = $('.inserted');

				if( $inserted.length == 0 ) return ;

				if( LJ.selectedTags.length == 0 ) return $('.inserted').removeClass('inserted');

				$inserted.each( function( i, el )
				{
					var $eventItemWrap = $( el );
					var myEvent = _.find( LJ.myEvents, function(elem){ return elem.hostId == $eventItemWrap.attr('data-hostid'); });

					var eventTags = myEvent.tags,
								L = eventTags.length;

					for( var k = 0; k < L; k++ ){
						eventTags[k] = "tag-" + eventTags[k];
					}

					if( _.intersection( eventTags, LJ.selectedTags ).length != 0 || LJ.selectedTags.length == 0 )
					{

						$eventItemWrap.find('.tag').each( function( i, tag )
						{	
							var $tag = $(tag);
							if( LJ.selectedTags.indexOf( $tag.attr('class').split(' ')[1] ) != -1 )
							{
								$tag.addClass( 'selected' );
							}
						});

						if( $eventItemWrap.find('.tag.selected').length != 0 ) $eventItemWrap.removeClass('inserted');

					}
				});

			});
			LJ.$body.on('click', '.f-item button', function(){

				csl('Asking for someone else');
				var $that = $(this);

				if( $that.hasClass('isHosting') )
				{
					LJ.fn.toastMsg('Redirecting to his event','info');
					$('.friendAddIconWrap.active').click();
				}

				if( ! $that.hasClass('ready') ) return;

				var eventId  = $that.parents('.eventItemWrap').attr('data-eventid'),
					hostId   = $that.parents('.eventItemWrap').attr('data-hostid'),
					friendId = $that.parents('.f-item').attr('data-userid'),
					friend   = _.find( LJ.myFriends, function(el){ return el._id == friendId ; });

				$that.removeClass('ready');

				csl('eventId : ' + eventId+ '\n hostId : '+hostId +'\n friend : '+friend );
				LJ.fn.showLoaders();
				LJ.fn.requestIn( eventId, hostId, friendId, LJ.user._id );

			});

			LJ.$body.on('click','.themeBtnToggleHost', function(){

				$('#management').click();

			});


			LJ.$body.on('click', '.friendAddIconWrap', function(){

				sleep( 30, function(){ LJ.state.jspAPI['#friendsWrap'].reinitialise(); });

				if( $(this).hasClass('active') )
				{
					$(this).removeClass('active');
					$('#friendsWrap').velocity('transition.slideUpOut', { duration: 300 });
					LJ.fn.displayAddFriendToPartyButton();
					return;
				}

				$('.friendAddIconWrap').removeClass('active');
				$(this).addClass('active');

				$('#friendsWrap').insertAfter( $(this).parents('.eventItemWrap').children() )
									.velocity('transition.slideUpIn',
									{
										duration: 550
									});
				LJ.fn.displayAddFriendToPartyButton();

			});

			LJ.$body.on('click', '.guestsWrap', function(){

				$(this).toggleClass('active');
				var $askersWrap = $(this).parents('.eventItemWrap').find('.askedInWrap');
				var eventId = $(this).parents('.eventItemWrap').data('eventid');

				if( $(this).hasClass('active') )
				{
					$askersWrap.toggleClass('active')
						       .velocity('transition.fadeIn');

					var eventName = 'fetch-asked-in',
						data = {
							eventId: eventId
						},
						cb = {
							success: LJ.fn.handleFetchAskedInSuccess,
							error: LJ.fn.handleErrorDefault
						}
					LJ.fn.say( eventName, data, cb );

				}else
				{
					$askersWrap.toggleClass('active')
						       .velocity('transition.fadeOut');
				}

			});

			LJ.$body.on('click', '.askIn', function(){

				// Make sure client doesn't spam ask
				if( $('.asking').length > 0 ) return;

				var $self = $(this),
					$itemWrap = $self.parents('.eventItemWrap');

				var eventId = $self.parents('.eventItemWrap').data('eventid');
           		var hostId  = $self.parents('.eventItemWrap').data('hostid');

				if( $itemWrap.attr('data-eventstate') == 'open' )
				{
					LJ.fn.showLoaders();
					$self.addClass('asking');

					if( $self.hasClass('idle') )
					{	
						LJ.fn.requestIn( eventId, hostId, LJ.user._id, LJ.user._id ); 
					}
					else
					{	// To be removed in production for freemium considerations?
						LJ.fn.requestOut( eventId, hostId, LJ.user._id, LJ.user._id );
					}
				}
				else
				{
					LJ.fn.toastMsg("Cet évènement est complet!", 'error');
				}

			});

             $('#resetFilters').click( function(){

            	LJ.$eventsWrap.find('.selected').removeClass('selected');
            	$('#activateFilters').click();

            });

             $('#displayFilters').click( function(){

             	var $filtersWrap = $('.filtersWrap');

             	if( $filtersWrap.css('opacity') != 0 )
             	{
             		$filtersWrap.velocity('transition.slideUpOut', { duration: 400 });
             		$(this).find('span').text('Afficher');

             	}else
             	{
             		$filtersWrap.velocity('transition.slideDownIn', { duration: 550 });
             		$(this).find('span').text('Masquer');

             	}

             });

            $('#activateFilters').click( function() {

            	var tags 	  = [];
            		locations = [];  

				$('.filters-tags-row .selected').each( function( i, el ){
					var tag = $( el ).attr('class').split(' ')[1];						 
					tags.push( tag );
				});
				
				$('.filters-locs-row .selected').each( function( i, el ){
					var loc = parseInt( $( el ).attr('class').split(' ')[1].split('loc-')[1] );				 
					locations.push( loc );
				});  

				LJ.selectedTags 	 = tags;
				LJ.selectedLocations = locations;

				LJ.fn.filterEvents( LJ.selectedTags, LJ.selectedLocations );
            	
            });

           $('body').on('click', '#noFriendsYet span', function(){
           		$('#search').click();
           });

		},
		handleDomEvents_Create: function(){

			
			LJ.$body.on('click', '.mixity', function(){

				var $self = $(this);
				$('.mixity').removeClass('selected');
				$self.addClass('selected');

			});

			LJ.$body.on('click', '.btn-create-event', function(){

				LJ.fn.displayInModal({ 
					source:'local',
					fix_height: -43,
					custom_classes: ['text-left'],
					render_cb: LJ.fn.renderCreateEvent,
					predisplay_cb: function(){
						LJ.fn.initTypeaheadPlaces();
						LJ.fn.adjustAllInputsWidth('#createEvent');
					} 
				});

			});


		},
		handleDomEvents_Search: function(){

			LJ.$body.bind('typeahead:select', function(ev, suggestion) {

				console.log(suggestion);

				if( $('.row-create-party-location input').is( ev.target ) ){
					/*setTimeout(function(){
			  			$('.row-create-party-location input').val( suggestion.name );
					}, 10 ) */
				}

			  	if( $('#search input').is( ev.target ) ){
			  		LJ.fn.displayUserProfile( suggestion.facebook_id );
			  	}

			  	
			  
			});

		},
		handleDomEvents_Management: function(){

			$('#manageEventsWrap i.icon').click(function(){

				if( LJ.state.animatingContent ) return;
				LJ.state.animatingContent = true;

				var askerId = '';
				var $currentItem = $('.a-item.active');

				if( $(this).hasClass('next-right') )
				{
					$nextItem = $currentItem.next();
					askerId = $nextItem.data('userid');

				}
				else if( $(this).hasClass('next-left') )
				{
					$nextItem = $currentItem.prev();
					askerId = $nextItem.data('userid');
				}

				LJ.fn.displayAskerItem( $currentItem, $nextItem, askerId );

				/* Highlight friend */
				$('#askersListWrap .activated').removeClass('activated');
				var j = parseInt( $('#askersThumbs div.active').attr('class').match(/head-\d/)[0][5] ); /*Bug quand le nombre > 9 */			
				$('#askersListWrap .imgWrapThumb.team-'+j+':not(.active)').addClass('activated');

			});

			LJ.$body.on('click', '#askersListWrap .imgWrapThumb', function(){
				
				//if( $(this).hasClass('active') ) return;
				
				/* Displaying asker profile */
				var askerId      = $(this).data('userid'),
					$currentItem = $('.a-item.active'), 
					$nextItem    = $('.a-item[data-userid="'+askerId+'"]');

				if( $(this).hasClass('next-right') )
				{
					$nextItem = $currentItem.next();
					askerId = $nextItem.data('userid');

				}
				else if( $(this).hasClass('next-left') )
				{
					$nextItem = $currentItem.prev();
					askerId = $nextItem.data('userid');
				}

				LJ.fn.displayAskerItem( $currentItem, $nextItem, askerId );

				/* Highlighting friends */
				$('#askersListWrap .activated').removeClass('activated');
				var j = parseInt( $(this).attr('class').match(/head-\d/)[0][5] );		 /*Bug quand le nombre > 9 */			
				$('#askersListWrap .imgWrapThumb.team-'+j+':not(.active)').addClass('activated');				  

			});

			 [ '#cancelEvent', '#suspendEvent' ].forEach( function(item){ 

		 		var $item = $( item );

        		$item.click( function() {

	            		var hostId = LJ.user._id,
	            			eventId = LJ.user.hosted_event_id;

        			switch( item ){
        				case '#cancelEvent':
        				LJ.fn.cancelEvent( eventId, hostId );
        				break;

        				case '#suspendEvent':
        				LJ.fn.suspendEvent( eventId, hostId );
        				break;

        				default:
        				break;
        			}

        		});
       		 });


		},
		handleDomEvents_Settings: function(){

			LJ.$body.on('click', '.row-ux .btn-validate', function(){

				var $self = $(this);
				if( $self.hasClass('btn-validating') )
					return;

				$self.addClass('btn-validating');

				var _id 		  = LJ.user._id,
				$container    = $('.row-ux')
				auto_login    = $container.find('.auto_login.modified').attr('data-selectid'),
				app_preferences = LJ.user.app_preferences;

				app_preferences.ux.auto_login = auto_login;

			var data = {
				userId		    : _id,
				app_preferences : app_preferences
			};

			csl('Emitting update settings [ui]');

			var eventName = 'me/update-settings-ux',
				data = data
				, cb = {
					success: LJ.fn.handleUpdateSettingsUxSuccess,
					error: function( xhr ){
						sleep( LJ.ui.artificialDelay, function(){
							LJ.fn.handleServerError( JSON.parse( xhr.responseText ).msg );
						});
					}
				};

				LJ.fn.say( eventName, data, cb );
				
			});

			LJ.$body.on('click', '.row-notifications .btn-validate', function(){

				var $self = $(this);
				if( $self.hasClass('btn-validating') )
					return;

				$self.addClass('btn-validating');

				var _id 		  = LJ.user._id,
				$container    = $('.row-notifications')
				invitations   = $container.find('.invitations.modified').attr('data-selectid'),
				newsletter    = $container.find('.newsletter.modified').attr('data-selectid'),
				app_preferences = LJ.user.app_preferences;

				app_preferences.email.invitations = invitations;
				app_preferences.email.newsletter  = newsletter;

			var data = {
				userId		    : _id,
				app_preferences : app_preferences
			};

			csl('Emitting update settings [mailinglists]');

			var eventName = 'me/update-settings-mailinglists',
				data = data
				, cb = {
					success: LJ.fn.handleUpdateSettingsMailingListsSuccess,
					error: function( xhr ){
						sleep( LJ.ui.artificialDelay, function(){
							LJ.fn.handleServerError( JSON.parse( xhr.responseText ).msg );
						});
					}
				};

				LJ.fn.say( eventName, data, cb );
				
			});



		}


});

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

	
	window.LJ = _.merge( window.LJ || {} , {

		typeahead: {
			users: {
				class_names: {
					input:'',
					hint:'',
					menu:'search-results-users',
					dataset:'search-wrap',
					suggestion:'search-result-places search-result',
					empty:'empty',
					open:'open',
					cursor:'cursor',
					highlight:'highlight'
				}
			},
			places: {
				class_names: {
					input:'',
					hint:'hint-places',
					menu:'search-results-places',
					dataset:'search-wrap',
					suggestion:'search-result-places search-result',
					empty:'empty',
					open:'open',
					cursor:'cursor',
					highlight:'highlight'
				}
			}
		}

	});


	window.LJ.fn = _.merge( window.LJ.fn || {} , 

	{
		initTypeaheadUsers: function(){

			var users = new Bloodhound({
				 datumTokenizer: Bloodhound.tokenizers.whitespace,
  				 queryTokenizer: Bloodhound.tokenizers.whitespace,
  				 identify: function(o){ return o.name; },
  				 remote: {
  				 	url: '/api/v1/users?name=%query',
  				 	wildcard: '%query'
  				 },
  				 transform: function(res){
  				 	delog(res);
  				 }
			});

			users.initialize()
				 .done(function(){ })
				 .fail(function(){ delog('Bloodhound engine failed to initialized users'); })

			$('#search input').typeahead({
				hint: true,
				highlight: true,
				minLength: 1,
				classNames: LJ.typeahead.users.class_names
			},
			{
				name:'users',
				display:'name',
				source: users.ttAdapter(),
				templates: {
					notFound   : LJ.fn.renderTypeaheadNotFound_Users,
					pending    : LJ.fn.renderTypeaheadPending_Users,
					suggestion : LJ.fn.renderTypeaheadSuggestion_Users
				}
			});

		},
		initTypeaheadPlaces: function(){

			var places = new Bloodhound({
				 datumTokenizer: Bloodhound.tokenizers.whitespace,
  				 queryTokenizer: Bloodhound.tokenizers.whitespace,
  				 identify: function(o){ return o.name; },
  				 remote: {
  				 	url: '/api/v1/places?name=%query',
  				 	wildcard: '%query'
  				 },
  				 transform: function(res){
  				 	delog(res);
  				 }
			});

			places.initialize()
				 .done(function(){ })
				 .fail(function(){ delog('Bloodhound engine failed to initialized places'); })

			$('.row-create-party-location input').typeahead({
				hint: true,
				highlight: true,
				minLength: 1,
				classNames: LJ.typeahead.places.class_names
			},
			{
				name:'places',
				display:'name',
				source: places.ttAdapter(),
				templates: {
					notFound   : LJ.fn.renderTypeaheadNotFound_Places,
					pending    : LJ.fn.renderTypeaheadPending_Places,
					suggestion : LJ.fn.renderTypeaheadSuggestion_Places
				}
			});

		},
		renderTypeaheadNotFound_Users: function(){
			
			var display_settings = LJ.cloudinary.search.user.params;
				img_id  		 = LJ.cloudinary.logo.black_on_white.id;

			var message 		 = "Aucun résultats";

			user_main_img = $.cloudinary.image( img_id, display_settings ).prop('outerHTML');

			var html = '<div class="search-result-places search-result-places-empty">'
					   + '<div class="search-result-images">' 
				       		+ user_main_img 
				       + '</div>'
				       + '<div class="search-result-name-wrap">'
				       + '<div class="search-result-name">' + message + '</div>'
				       + '</div>'
				      +'</div>';
			return html;

		},
		renderTypeaheadNotFound_Places: function(){
			
			var display_settings = LJ.cloudinary.search.user.params;
				img_id  		 = LJ.cloudinary.logo.black_on_white.id;

			var message 		 = "Aucun résultats";

			user_main_img = $.cloudinary.image( img_id, display_settings ).prop('outerHTML');

			var html = '<div class="search-result-places search-result-places-empty">'
					   + '<div class="search-result-images">' 
				       		+ user_main_img 
				       + '</div>'
				       + '<div class="search-result-name-wrap">'
				       + '<div class="search-result-name">' + message + '</div>'
				       + '</div>'
				      +'</div>';

			return html;

		},
		renderTypeaheadPending_Users: function(){

			var message 		 = "Recherche..."

			var html = '<div class="search-result-places search-result-places-empty" >'
					   + '<div class="search-result-images">' 
				       		+ '<img class="search-loader super-centered" src="/img/495.gif" width="15">'
				       + '</div>'
				       + '<div class="search-result-name-wrap">'
				       + '<div class="search-result-name">' + message + '</div>'
				       + '</div>'
				      +'</div>';
			return html;

		},
		renderTypeaheadPending_Places: function(){

			var message 		 = "Recherche..."

			var html = '<div class="search-result-places search-result-places-empty" >'
					   + '<div class="search-result-images">' 
				       		+ '<img class="search-loader super-centered" src="/img/495.gif" width="15">'
				       + '</div>'
				       + '<div class="search-result-name-wrap">'
				       + '<div class="search-result-name">' + message + '</div>'
				       + '</div>'
				      +'</div>';
			return html;

		},
		renderTypeaheadSuggestion_Places:  function( place ){

			var html = '<div data-placeid="'+place._id+'" class="place-result">'
							+'<div class="place-data place-name">'+place.name+'</div>'
							+'<div class="place-data place-address">'+place.address+'</div>'
							+'<div class="place-data place-type">'+place.type+'</div>'
						+'</div>';

			return html;

		},
		renderTypeaheadSuggestion_Users: function( user ){

			var user_main_img = '', user_hashtags = '';

			var main_img = LJ.fn.findMainImage( user ),
				display_settings = LJ.cloudinary.search.user.params;
				display_settings.img_version = main_img.img_version;

			user_main_img = $.cloudinary.image( main_img.img_id, display_settings ).prop('outerHTML');

			user_hashtags += '<div>#' +  user.drink + '</div>';
			user_hashtags += '<div>#' +  user.mood + '</div>';

			var html = '<div data-userid="'+user.facebook_id+'">'
					   + '<div class="search-result-images">' 
				       		+ user_main_img 
				       		+ '<img class="search-loader super-centered" src="/img/495.gif" width="15">'
				       + '</div>'
				       + '<div class="search-result-name-wrap">'
				       + '<div class="search-result-name">' + user.name + '</div>'
				       + '<div class="search-result-hashtags">' + user_hashtags + '</div>'
				       + '</div>'
				      +'</div>';
			return html;

		}
	});

	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		adjustInputWidth: function( input, width ){

			var $input = $(input);

			$input.css({ width: width+'px' });

		},
		getMaxWidthLabel: function(container){

			var labels = $(container).find('label');
			var widthArray = [];

			labels.each( function( i, el ){
				widthArray.push( $(el).width() );
			});

			var max = Math.max.apply( null, widthArray );
			console.log('Maximum label width : ' + max );
			return max;
		},
		adjustAllInputsWidth: function(container){

			var $container = $(container);
			var max = LJ.fn.getMaxWidthLabel( container );

			$container.find('label').each( function( i, label ){

				var $label = $(label);
				var $inp = $label.siblings('*:not(.inspire, .etiquette)');

				var label_width = max + 15;
				var label_full_width = $label.outerWidth(true);
				var parent_width = $label.parent().width();

				$label.css({ width: label_width });
				$inp.css({ width: parent_width - label_full_width - 50 }); /* Mega hack, security margin */
				$inp.children('input').css({ width:'100%' });
			});
			

		}

	});

function sleep(ms,cb,p2){setTimeout(function(){cb(p2);},ms)}
function look(json){ return JSON.stringify(json, null, '\t'); }
window.csl = function(msg){
	delog(msg);
};

window.LJ.fn = _.merge( window.LJ.fn || {}, 

{

		init: function(o){

				if( o.debug )
					LJ.state.debug = true;
			
				/* Landing page animation */
				this.initAppBoot();

				/* Ajax setup */
				this.initAjaxSetup();				

				/* Bind UI action with the proper handler */
				this.handleDomEvents();

				/* Gif loader and placeholder */
				this.initStaticImages();

				/* Global UI Settings ehanced UX*/
				this.initEhancements();

				/* Init Pusher Connexion via public chan */
				this.initPusherConnection();

				/* Augment lodash */
				this.initAugmentations();

				/* Typeahead pluggin */
				this.initTypeahead();

				/*
				LJ.fn.displayInModal({ 
					source:'local',
					dom_target: '#createEvent',
					custom_classes: ['text-left'],
					render_cb: function(){}
					predisplay_cb: function(){
						LJ.fn.initTypeaheadPlaces();
						LJ.fn.adjustAllInputsWidth('#createEvent');
					} 
				});
				*/

				$('body').on('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e){
					console.log('Transition ended');
					console.log(e.target);
				});

		},
		initTypeahead: function(){

			LJ.fn.initTypeaheadUsers();

		},
		initAugmentations: function(){

			/* La base! */
			_.mixin({
			    pluckMany: function() {
			        var array = arguments[0],
			            propertiesToPluck = _.rest(arguments, 1);
			        return _.map(array, function(item) {
			            return _.partial(_.pick, item).apply(null, propertiesToPluck);
			        });
				}
			});

		},
		initAjaxSetup: function(){

			$.ajaxSetup({
				error: function( xhr ){
					LJ.fn.handleServerError( xhr );
				},
				complete: function(){
					setTimeout( function(){
						LJ.fn.hideLoaders();
					}, LJ.ui.artificialDelay );
				}
			})

		},
		initPusherConnection: function(){

			LJ.pusher = new Pusher('9d9e7859b349d1abe8b2');

			LJ.pusher.connection.bind('state_change', function( states ) {
				csl('Pusher state is noww : ' + states.current );

				if( (states.current == 'connecting') && LJ.state.connected  )
				{
					LJ.fn.toastMsg("La connexion a été interrompue", 'success', true);
				}
				if( states.current == 'disconnected' )
				{
					LJ.fn.toastMsg("Vous avez été déconnecté.", 'error', true);
				}
				if( states.current == 'unavailable' )
				{
					LJ.fn.toastMsg("Le service n'est pas disponible actuellement, essayez de relancer l'application ", 'error', true);
				}
				if( states.current == 'connected' && LJ.state.connected )
				{
					LJ.fn.say('auth/app', { userId: LJ.user._id }, { success: LJ.fn.handleFetchUserAndConfigurationSuccess });

				}
			});

			LJ.pusher.connection.bind('connected', function() {
				csl('Pusher connexion is initialized');
			});

			LJ.pusher.connection.bind('disconnected', function(){
				alert('hey');
			});


		},
		initStaticImages: function(){

			LJ.$main_loader = $.cloudinary.image( LJ.cloudinary.loaders.main.id, LJ.cloudinary.loaders.main.params );
			LJ.$main_loader.appendTo( $('.loaderWrap') );

			LJ.$mobile_loader = $.cloudinary.image( LJ.cloudinary.loaders.mobile.id, LJ.cloudinary.loaders.mobile.params );
			LJ.$mobile_loader.appendTo( $('.m-loaderWrap'));

			LJ.$chat_loader = $.cloudinary.image( LJ.cloudinary.loaders.chat.id, LJ.cloudinary.loaders.chat.params );
			/* Dynamically cloned and appended */

			LJ.$curtain_loader = $.cloudinary.image( LJ.cloudinary.loaders.curtain.id, LJ.cloudinary.loaders.curtain.params );
			/* Dynamically cloned and appended */
			

		},
		initAppBoot: function(){

			var ls = window.localStorage;

			if( !ls || !ls.getItem('preferences') ){
				delog('No local data available, initializing lp...');
				return LJ.fn.initLandingPage();
			}

			preferences = JSON.parse( ls.getItem('preferences') );

			tk_valid_until = preferences.tk_valid_until;
			long_lived_tk  = preferences.long_lived_tk;

			if( !tk_valid_until || !long_lived_tk ){
				delog('Missing init preference param, initializing lp...');
				return LJ.fn.initLandingPage();
			}

			if( new moment( tk_valid_until ) < new moment() ){
				delog('long lived tk found but has expired');
				return LJ.fn.initLandingPage();
			}

			var current_tk_valid_until = new moment( tk_valid_until );
			var now = new moment();
			var diff = current_tk_valid_until.diff( now, 'd' );

			if( diff < 30 ) {
				delog('long lived tk found but will expire soon, refresh is needed');
				return LJ.fn.initLandingPage();
			}

			delog('Init data ok, auto logging in...');
			return LJ.fn.autoLogin();
				

		},
		fetchUserState: function(){
			$.ajax({
				method:'GET',
				url:'/api/v1/users/'+LJ.user.facebook_id,
				success: function( user ){
					delog('User state has been repaired');
					LJ.user = user;
				}, error: function( xhr ){
					delog('Unable to repaire user state!');
				}
			})
		},
		autoLogin: function(){

    		var $el = $('<div class="auto-login-msg super-centered none">Auto login <b>on</b></div>');
			$el.appendTo('.curtain').velocity('transition.fadeIn')
			setTimeout( function(){

			LJ.fn.GraphAPI('/me', function( facebookProfile ){
				delog( facebookProfile );
		  		LJ.fn.loginWithFacebook( facebookProfile );
  			});

			}, 400 );
		},
		initLandingPage: function(){

        	var data = [
        		{
        			'name':'Rue de lappe',
        			'hashtags': ["bastille","monop'","roquette"]
        		},
        		{
        			'name':'Hôtel de ville',
        			'hashtags': ['concerts',"bhv","crowd"],
        		},
        		{
        			'name':'Les quais de seine',
        			'hashtags': ['pakibière',"sunset","wine"]
        		},
        		{
        			'name':'Event Facebook',
        			'hashtags':['projetX','peutêtre','whatever']
        		},
        		{
        			'name':'La concrete',
        			'hashtags':['after','after','after','md','after']
        		},
        		{
        			'name':'Rue princesse',
        			'hashtags':[ 'lasoif','odéon','bedford','pousseaucrime']
        		},
        		{
        			'name':'Grands boulevards',
        			'hashtags':['étranger(e)s','help','me','out']
        		},
        		{
        			'name':'Westeros',
        			'hashtags':['danaerys','is','coming']
        		}
        	]

        	var names     = _.pluck( data, 'name' ),
        		hashtags  = _.pluck( data, 'hashtags' ),
        		maxLength = names.length,
        		i 		  = 0;  

        	$('html').css({ 'overflow': 'hidden' });
        	$('.hero-img').first()
        				  .addClass('active')
        				  .waitForImages(function(){

	        	$('.curtain').velocity('transition.fadeOut', { duration: 1000 });
	            $('.typed-text').typed({
	                strings: names,
	                typeSpeed: 200, 
	                backDelay: 4000,
	                loop:true,
	                preStringTyped: function(){

	                	/* Display text */
	                	var hashtags = data[i].hashtags, html = '';
	                	for( var j = 0; j < hashtags.length; j++){
	                		html +='<div class="hashtag">#'+hashtags[j]+'</div>';
	                	}
	                	$('.landing-hashtags').html( $(html) );
	                	$('.hashtag').velocity('transition.fadeIn',
	                		{ delay:1000,display:'inline-block', duration:2500
	                	}).delay( data[i].name.length * 250 ).velocity('transition.fadeOut', {duration:1000});

	                	/* Zoom in image */
	                	if( i == 0)
	                		return $('.hero-img.active').removeClass('scaled');

	                },
	                onStringTyped: function(){
	                	i == maxLength-1 ? i=0 : i++;
	                	setTimeout( function(){
	                		if( LJ.state.loggingIn ){
	                			$('.hero-img.active').removeClass('active').addClass('scaled');
	                			$('html').css({'overflow':'auto'});
	                			return 
	                		} 
	                		$('.curtain').velocity('transition.fadeIn', {
	                			duration: 1200, 
	                			complete: function(){ 
	                				$('.hero-img.active').removeClass('active').addClass('scaled');
	                				$('.hero-img.img-'+i).addClass('active');
	                				setTimeout(function(){ $('.hero-img.img-'+i).removeClass('scaled');
	                					$('.curtain').velocity('transition.fadeOut', {
	                						duration:1500
	                					});
	                				 }, 50 )
	                			}
	             			});
	                	}, 3500 ); 
	                }
	            });
			});

		},
		initEhancements: function(){

			(function bindEnterKey(){ //Petite IIEF pour le phun

				//prevent double click pour UI reasons
				//$('body:not(input)').mousedown(function(e){ e.preventDefault(); });

				$('.profileInput, #description').on('change keypress',function(){
					$(this).addClass('modified');
				});

				LJ.$body.on('click', '.themeBtn:not(.static)',function(){
					$(this).addClass('validating-btn');
				});

				LJ.$body.on('focusout', '.askInMsgWrap input', function(e){
					if($(this).val().trim().length===0){
						$(this).removeClass('text-active').val('');}
					else{$(this).addClass('text-active');}
				}); 


            	$('body').on('click', '.filtersWrap .tag, .filtersWrap .loc, #createEventInputsWrap .tag', function(){ 
            		$(this).toggleClass('selected');
            	});

            	$('#createEventWrap .tag').click( function(){

            			$(this).toggleClass('selected');
            		 	if( $('#createEventWrap .selected').length > 3 ){
            				$(this).toggleClass('selected');
            				return LJ.fn.toastMsg("3 tags maximum", 'error' );
            		}       		
            	});


			})();
				
		},
		updateProfile: function(){

			var _id 		  = LJ.user._id,
				$container    = $('.row-informations')
				name  		  = $container.find('.row-name input').val(),
				age   		  = $container.find('.row-age input').val(),
				motto         = $container.find('.row-motto input').val(),
				job			  = $container.find('.row-job input').val(),
				drink 		  = $container.find('.drink.modified').attr('data-selectid'),
				mood          = $container.find('.mood.modified').attr('data-selectid');

			if( LJ.user.status == 'new' )
				LJ.user.status = 'idle';

			var profile = {
				userId		  : _id,
				age 		  : age,
				name 		  : name,
				motto   	  : motto,
				job           : job,
				drink 		  : drink,
				mood          : mood,
				status        : LJ.user.status
			};
				csl('Emitting update profile');

			var eventName = 'me/update-profile',
				data = profile
				, cb = {
					success: LJ.fn.handleUpdateProfileSuccess,
					error: function( xhr ){
						sleep( LJ.ui.artificialDelay, function(){
							LJ.fn.handleServerError( JSON.parse( xhr.responseText ).msg );
						});
					}
				};

				LJ.fn.say( eventName, data, cb );

		},
		handleUpdateProfileSuccess: function( data ){

			csl('update profile success received, user is : \n' + JSON.stringify( data.user, null, 4 ) );
			var user = data.user;

			sleep( LJ.ui.artificialDelay, function(){

				$('.row-informations').removeClass('editing')
					.find('.row-buttons').velocity('transition.fadeOut', {duration: 600 })
					.end().find('.icon-edit').removeClass('active')
					.end().find('.btn-validating').removeClass('btn-validating');

				LJ.fn.updateClientSettings( user );
				$('#thumbName').text( user.name );
				LJ.fn.handleServerSuccess('Vos informations ont été modifiées', '.row-informations');
		
			});

		},
		handleUpdateSettingsUxSuccess: function( data ){

			csl('update settings ux success received' );

			sleep( LJ.ui.artificialDelay, function(){

				$('.row-ux').removeClass('editing')
					.find('.row-buttons').velocity('transition.fadeOut', {duration: 600 })
					.end().find('.icon-edit').removeClass('active')
					.end().find('.btn-validating').removeClass('btn-validating');

				LJ.user = data.user;

				LJ.fn.setLocalStoragePreferences();
				LJ.fn.handleServerSuccess('Vos informations ont été modifiées', '.row-ux');
		
			});

		},
		handleUpdateSettingsMailingListsSuccess: function( data ){

			csl('update settings mailing lists success received' );

			sleep( LJ.ui.artificialDelay, function(){

				$('.row-notifications').removeClass('editing')
					.find('.row-buttons').velocity('transition.fadeOut', {duration: 600 })
					.end().find('.icon-edit').removeClass('active')
					.end().find('.btn-validating').removeClass('btn-validating');

				LJ.user = data.user;

				LJ.fn.handleServerSuccess('Vos informations ont été modifiées', '.row-notifications');
		
			});

		},
		setLocalStoragePreferences: function(){

			var auto_login = LJ.user.app_preferences.ux.auto_login;

			if( auto_login == 'yes' ){

				var preferences = {
					facebook_id : LJ.user.facebook_id,
					long_lived_tk: LJ.user.facebook_access_token.long_lived,
					tk_valid_until: LJ.user.facebook_access_token.long_lived_valid_until
				};

				window.localStorage.setItem('preferences', JSON.stringify( preferences ));					
			}

			if( auto_login == 'no' ){
				window.localStorage.removeItem('preferences');
			}


		},
		swapNodes: function( a, b ){

		    var aparent = a.parentNode;
		    var asibling = a.nextSibling === b ? a : a.nextSibling;
		    b.parentNode.insertBefore(a, b);
		    aparent.insertBefore(b, asibling);

		},
		loginWithFacebook: function( facebookProfile ){

				delog('logging in with facebook...');
				$.ajax({

					method:'POST',
					data: { facebook_id: facebookProfile.id, facebookProfile: facebookProfile },
					dataType:'json',
					url:'/auth/facebook',
					success: function( data ){
						LJ.fn.handleSuccessLogin( data );
					},
					error: function( err ){
						LJ.fn.handleServerError( err )
					}
				});

		},
		handleSuccessLogin: function( data ){

			delog('Handling success login with fb');
			LJ.user._id = data.id; 
			LJ.accessToken = data.accessToken; 
			//document.cookie = 'token='+data.accessToken;

            console.log('Fetching user and configuration..');
			LJ.fn.say('auth/app', {}, {
                success    : LJ.fn.handleFetchUserAndConfigurationSuccess 
			});

		},
		fetchAndSyncFriends: function( callback ){

			LJ.fn.GraphAPI('/me/friends', function( res ){

				var fb_friends = res.data;
				var fb_friends_ids = _.pluck( res.data, 'id' );

				var data = { 
                    userId         : LJ.user._id,
                    fb_friends_ids : fb_friends_ids
                };

                var cb = {
                    success: callback,
                    error  : LJ.fn.handleServerError
                };

                LJ.fn.say('me/fetch-and-sync-friends', data, cb );

			});

		},
		displayViewAsFrozen: function(){

			$('.eventItemWrap').remove();
			LJ.myEvents = [];

			$('.eventsHeader, #noEvents').velocity('transition.slideUpOut', 
				{ 
				  duration: 400,
				  complete: function(){
				  	$('#frozenTimezone').velocity('transition.slideLeftIn', { duration: 700 });
				}
			});

		},
		displayViewAsNormal: function(){

			$('.eventItemWrap').remove();
			LJ.myEvents = [];
			
			$('#frozenTimezone').velocity('transition.slideRightOut', 
				{ 
				  duration: 400,
				  complete: function(){
				  	$('.eventsHeader, #no').velocity('transition.slideUpIn', { duration: 700 });
					LJ.fn.displayEvents();
				}
			});

		},
		randomInt: function(low, high) {
    		return Math.floor(Math.random() * (high - low + 1) + low);
		},
		displayContent: function( content, options ){
			
				options = options || {};

			if( !options.mode ){
				
				var prev = options.prev;			
				var $prev = $('.'+options.prev);

				$prev.velocity( options.myWayOut || 'transition.fadeOut', {
					duration: options.duration || 0 || 400,
					complete: function(){
						$prev.removeClass( prev );
						content.addClass( prev )
							   .velocity( options.myWayIn || 'transition.fadeIn', {
							   	duration: 0 || 800,
							   	display:'block',
							   	complete: function(){
							   		LJ.state.animatingContent = false;
							   		if(LJ.user.status === 'new'){
							   			//LJ.fn.toggleOverlay('high', LJ.tpl.charte );
							   		}
							   		if( options.after_cb )
							   			options.after_cb();
							   	}
							   });
					}
				});
			}


			if( options.mode == 'curtain' ) {

				var prev = options.prev;			
				var $prev = $('.'+options.prev);
				
				var behindTheScene = function(){

					options.during_cb();
					$prev.removeClass( prev );
					content.addClass( prev )
						   .show()
						   .css({'display':'block'});

				};

				var afterTheScene = function(){
					options.after_cb();
				}

				LJ.fn.displayCurtain({
					behindTheScene: behindTheScene,
					afterTheScene : afterTheScene
				})
				
			} 


		},
		displayCurtain: function( opts ){

			var behindTheScene = opts.behindTheScene || function(){ delog('Behind the scene'); },
				afterTheScene  = opts.afterTheScene   || function(){ delog('after the scene');  },
				delay          = opts.delay    || 500,
				duration       = opts.duration || 800;

			var $curtain = $('.curtain');

			if( $curtain.css('opacity') != '0' || $curtain.css('display') != 'none' ){
				var init_duration = 10;
			}

				$curtain
				.velocity('transition.fadeIn',
				{ 
					duration: init_duration || duration, //simuler l'ouverture instantanée
				  	complete: behindTheScene 
				})
				.delay( delay )
				.velocity('transition.fadeOut',
				{	
					display : 'none',
					duration: duration,
					complete: afterTheScene
				});
		

		},
		updateClientSettings: function( newSettings ){

			_.keys(newSettings).forEach(function(el){
				LJ.user[el] = newSettings[el];
			});
		},
		toastMsg: function( msg, status, fixed ){

			var toastStatus, toast, tpl;

			if( status == 'error' ){
				    toastStatus = '.toastError',
					tpl = LJ.tpl.toastError;
			}
			if( status == 'info' ){
				    toastStatus = '.toastInfo',
					tpl = LJ.tpl.toastInfo;
			}
			if( status == 'success'){
				    toastStatus = '.toastSuccess',
					tpl = LJ.tpl.toastSuccess;
			}

			if( $( '.toast' ).length === 0 )
			{
				$( tpl ).prependTo('#mainWrap');

				    toast = $( toastStatus );
					toastMsg = toast.find('.toastMsg');
					toastMsg.text( msg );

					toast.velocity('transition.slideDownIn', {
						duration: 600,
						complete: function(){

						  if( typeof(fixed) == 'string' )
						  	return

							toast.velocity('transition.slideUpOut', {
								duration:300,
								delay: fixed || 2000,
								complete: function(){
									toast.remove();
									if( LJ.msgQueue.length != 0 )
										LJ.fn.toastMsg( LJ.msgQueue[0].msg, LJ.msgQueue[0].type );
									    LJ.msgQueue.splice( 0, 1 ) //remove le premier élément
								}
								});
							
						  }
					});
			}

			else
			{
				LJ.msgQueue.push({ msg: msg, type: status });
			}
		},
		/* Permet de remplacer les images du profile, ou du thumbWrap uniquement */
		replaceImage: function( options ){

			var img_id      = options.img_id,
				img_version = options.img_version,
				img_place   = options.img_place,
				scope      = options.scope;

			if( scope.indexOf('profile') != -1 )
			{
				var $element = $('.picture').eq( img_place ),
					display_settings = LJ.cloudinary.profile.me.params;

				if( display_settings == undefined )
					return LJ.fn.toastMsg("Options d'affichage manquantes", "error");

				display_settings.version = img_version;

				/* En cas de photos identiques, prend celle la plus à gauche avec .first()*/
				var $previousImg = $element.find('img'),
					$newImg      = $.cloudinary.image( img_id, display_settings );

					$newImg.addClass('mainPicture').addClass('none');
					$previousImg.parent().prepend( $newImg )
								.find('.picture-upload').velocity('transition.fadeOut', { duration: 250 });
	 													
					$previousImg.velocity('transition.fadeOut', { 
						duration: 600,
						complete: function(){
							$newImg.velocity('transition.fadeIn', { duration: 700, complete: function(){} });
							$newImg.parent().attr('data-img_id', img_id );
							$newImg.parent().attr('data-img_version', img_version );
							$previousImg.remove();
						} 
					});
			}

			if( scope.indexOf('thumb') != -1 )
			{
				display_settings = LJ.cloudinary.displayParamsHeaderUser;
				display_settings.version = img_version;

				var previousImg = $('#thumbWrap').find('img'),
					newImg      = $.cloudinary.image( img_id, display_settings );
					newImg.addClass('none');

					$('#thumbWrap .imgWrap').prepend( newImg );

					previousImg.fadeOut(700, function(){
						$(this).remove();
						newImg.fadeIn(700);
					});
			}

		},
		replaceThumbImage: function( id, version, d ){

			    d = d || LJ.cloudinary.displayParamsHeaderUser;
				d.version = version;

			var previousImg = $('#thumbWrap').find('img'),
				newImg      = $.cloudinary.image(id,d);
				newImg.addClass('none');

				$('#thumbWrap .imgWrap').prepend( newImg );

				previousImg.fadeOut(700, function(){
					$(this).remove();
					newImg.fadeIn(700);
				});
		},
		initCloudinary: function( cloudTags ){

			$.cloudinary.config( LJ.cloudinary.uploadParams );
			//LJ.tpl.$placeholderImg = $.cloudinary.image( LJ.cloudinary.placeholder_id, LJ.cloudinary.displayParamsEventAsker );

			if( cloudTags.length != $('.upload_form').length )
				return LJ.fn.toastMsg('Inconsistence data', 'error');

			$('.upload_form').each(function(i,el){
				$(el).html('').append( cloudTags[i] );
			});

			$('.cloudinary-fileupload')

				.click( function(e){

					if( LJ.state.uploadingImage ){
						e.preventDefault();
						LJ.fn.toastMsg("N'uploadez qu'une seule image à la fois!","info");
						return;
					}

					LJ.state.uploadingimg_id = $(this).parents('.picture').data('img_id');
					LJ.state.uploadingimg_version = $(this).parents('.picture').data('img_version');
					LJ.state.uploadingimg_place = $(this).parents('.picture').data('img_place');
				})

				.bind('fileuploadstart', function(){

					LJ.state.uploadingImage = true;
					LJ.fn.showLoaders();

				})
				.bind('fileuploadprogress', function( e, data ){

  					$('.progress_bar').css('width', Math.round( (data.loaded * 100.0) / data.total ) + '%');

				}).bind('cloudinarydone',function( e, data ){

					LJ.state.uploadingImage = false;

					var img_id      		= data.result.public_id;
					var img_version 		= data.result.version;
					var img_place   		= LJ.state.uploadingimg_place;;

                    var eventName = 'me/update-picture',
                    	data = {
                    				_id             : LJ.user._id,
									img_id           : img_id,
									img_version      : img_version,
									img_place        : img_place
								}
						, cb = {
							beforeSend: function(){ },
							success: function( data ){
								sleep( LJ.ui.artificialDelay, function(){
									$('.progress_bar').velocity('transition.slideUpOut', {
									 	duration: 400,
									 	complete: function(){
									 		$(this).css({ width: '0%' })
									 			   .velocity('transition.slideUpIn');
										} 
									});

									LJ.fn.toastMsg('Votre photo a été modifiée', 'info');

									var user = data.user;
									//LJ.fn.updateClientSettings( user );

									// Mise à jour interne sinon plein d'update sur la même photo bug
									var pic = _.find( LJ.user.pictures, function(el){
										return el.img_place == img_place;
									});
									pic.img_version = img_version;
									var scope = pic.is_main ? ['profile','thumb'] : ['profile'];

	  								LJ.fn.replaceImage( {
	  									img_id: img_id, 
	  									img_version: img_version,
	  									img_place: img_place,
	  									scope: scope
	  								});
	  								
	  							});
							},
							error: function( xhr ){
								delog('Error saving image identifiers to the base');
							}
						};

						LJ.fn.say( eventName, data, cb );

  				}).cloudinary_fileupload();
  				
		},
		refreshOnlineUsers: function(){

			var i=0;
			for( ; i<LJ.myOnlineUsers.length; i++ )
			{
				LJ.fn.displayAsOnline( { userId: LJ.myOnlineUsers[i] } );
			}

		},
		refreshArrowDisplay: function(){

			var $arrLeft  = $('#manageEventsWrap i.next-left'),
				$arrRight = $('#manageEventsWrap i.next-right');

			$arrLeft.removeClass('none');
			$arrRight.removeClass('none');

			if( ($('.a-item').length === 0) ||  ($('.a-item').length == 1) ){
				$arrLeft.addClass('none');
				$arrRight.addClass('none');
				return;
			}

			if( $('.a-item.active').is( $('.a-item').last() ) ){
				$arrRight.addClass('none');
				return;
			}

			if( $('.a-item.active').next().hasClass('placeholder') ){
				$arrRight.addClass('none');
				return;
			}

			if( $('.a-item.active').is( $('.a-item').first() ) ){
				$arrLeft.addClass('none');
				return;
			}

		},
		displayAskerItem: function( current, next, askerId ){

			var currentIndex = current.index(),
				nextIndex    = next.index();

			var $askerThumb = $('#askersThumbs').find('.imgWrapThumb[data-userid="'+askerId+'"]');
				$('.imgWrapThumb.active').removeClass('active');
				$askerThumb.addClass('active');

				LJ.state.animatingContent = false;

			if( currentIndex < nextIndex )
			{
				current.velocity('transition.slideLeftOut', 
					{ 
						duration: 200,
						complete: function(){ 
							current.removeClass('active');
							next.addClass('active');
							LJ.fn.refreshArrowDisplay();
							next.velocity('transition.slideRightIn', { 
									duration: 500,
									complete: function(){
									} 
								});
						}
					});
				return;
			}
			if( currentIndex > nextIndex )
			{
				current.velocity('transition.slideRightOut', 
					{ 
						duration: 200,
						complete: function(){ 
							current.removeClass('active');
							next.addClass('active');
							LJ.fn.refreshArrowDisplay();
							next.velocity('transition.slideLeftIn', { 
									duration: 500,
									complete: function(){
									} 
								});
						}
					});
				return;
			}		
				
		},
		findMainImage: function( user ){

			var user = user || LJ.user ;
			var index = _.findIndex( user.pictures, function( el ){
				return el.is_main == true;
			});

			return user.pictures[ index ];

		},
        initLayout: function( settings ){


        	/* Mise à jour dynamique des filters */
        	$( '.tags-wrap' ).html('').append( LJ.fn.renderTagsFilters() );
        	$( '.locs-wrap' ).html('').append( LJ.fn.renderLocsFilters() );
        	$( '#no' ).html('').append( LJ.tpl.noResults );


    		/* Profile View */
			//$('.row-subheader').find('span').text( LJ.user._id );
			$('.row-name').find('input').val( LJ.user.name );
			$('.row-age').find('input').val( LJ.user.age );
			$('.row-motto').find('input').val( LJ.user.motto );
			$('.row-job').find('input').val( LJ.user.job );
			$('.drink[data-selectid="'+LJ.user.drink+'"]').addClass('selected');
			$('.mood[data-selectid="'+LJ.user.mood+'"]').addClass('selected');

			//LJ.fn.adjustAllInputsWidth('#profileWrap');

			/* Settings View */
			_.keys( LJ.user.app_preferences ).forEach( function( key ){
				_.keys( LJ.user.app_preferences[ key ] ).forEach( function( sub_key ){
					var value = LJ.user.app_preferences[ key ][ sub_key ];
					$('.row-select.' + sub_key + '[data-selectid="'+value+'"]').addClass('selected');
				});
			});


			/* Mise à jour des images placeholders */
			$('.picture-wrap').html( LJ.fn.renderProfilePicturesWraps );
			var $placeholder = $.cloudinary.image( LJ.cloudinary.placeholder.id, LJ.cloudinary.placeholder.params );
				$('.picture').prepend( $placeholder );

			/* Update de toutes les images */
			for( var i = 0; i < LJ.user.pictures.length; i++){
				LJ.user.pictures[i].scope = ['profile'];
				LJ.fn.replaceImage( LJ.user.pictures[i] );
			}

			LJ.fn.displayPictureHashtags();

			/* ThumbHeader View */
			LJ.$thumbWrap.find( 'h2#thumbName' ).text( LJ.user.name );
			var d = LJ.cloudinary.displayParamsHeaderUser;

			var mainImg = LJ.fn.findMainImage();
				d.version = mainImg.img_version;

			var imgTag = $.cloudinary.image( mainImg.img_id, d );
				imgTag.addClass('left');

			LJ.$thumbWrap.find('.imgWrap').html('').append( imgTag );

			/* Settings View */
			$('#newsletter').prop( 'checked', LJ.user.newsletter );
			$('#currentEmail').val( LJ.user.email );


        	/* Initialisation du friendspanel */
        	$('#friendsWrap').jScrollPane();
        	LJ.state.jspAPI['#friendsWrap'] = $('#friendsWrap').data('jsp');

    		/* L'user était déjà connecté */
			if( LJ.state.connected )
				return LJ.fn.toastMsg('Vous avez été reconnecté', 'success');
				
			LJ.state.connected = true;

			$('.menu-item-active').removeClass('menu-item-active');

			var $landingView;
			if( LJ.user.status == 'idle' ){
				$landingView = $('#eventsWrap');
				$('#management').addClass('filtered');
	            $('#events').addClass('menu-item-active')
	            			.find('span').velocity({ opacity: [1,0], translateY: [0, -5] });
			}

			if( LJ.user.status == 'hosting' ){
				$landingView = $('#manageEventsWrap');
				$('#create').addClass('filtered');
	            $('#management').addClass('menu-item-active')
	            			.find('span').velocity({ opacity: [1,0], translateY: [0, -5] });
	            LJ.fn.fetchAskers();
			}

			if( LJ.user.status == 'new' ){
				$landingView = $('#profileWrap');
				$('#management').addClass('filtered');
	            $('#profile').addClass('menu-item-active')
	            			.find('span').velocity({ opacity: [1,0], translateY: [0, -5] });

			}
			function during_cb(){	
				/* Landing Page View */				
				$('#facebook_connect').hide();
				$('#logo-hero').hide();
				$('body > header').removeClass('none');
				$('#landingWrap').remove();
				$('body').css({'background':'none'});
        		$('#mainWrap').css({'background':'url(/img/crossword.png)'});	
        		$('.auto-login-msg').velocity('transition.fadeOut');

			};		

			function after_cb(){

				$('#thumbWrap').velocity('transition.slideUpIn',{duration:1000});
				$('.menu-item').velocity({ opacity: [1, 0] }, {
					display:'inline-block',
					duration: 800,
					complete: function(){

						$('.menu-item').each( function( i, el ){
							$(el).append('<span class="bubble filtered"></span>')
						});

						if( LJ.user.status == 'new' )
							LJ.fn.initTour();

						if( LJ.user.friends.length == 0 )
					 		LJ.fn.toastMsg("Aucun de vos amis Facebook n'est sur meefore. Invitez-en !","info");
				
					}
				});
			};

            LJ.fn.displayContent( $landingView, {
            	 during_cb: during_cb,
            	 after_cb: after_cb,
            	 mode:'curtain',
            	 myWayIn: 'transition.slideDownIn',
            	 myWayOut: 'transition.slideUpOut',
            	 prev:'revealed'
            });

        },
        initTour: function(){

        
        	var textProfile = "Tout commence par ton profile! Nom, âge, boisson préférée et c'est parti (1/3)";
        	var textEvents  = "Tous les before à venir sont visibles ici. Rien ne va? Propose en un! (2/3)";
        	var textSearch  = "Effectues des recherches à propos de n'importe quel membre (3/3)";

        	var html = '<ol id="intro">'
						+ '<li data-class="intro-item" data-id="profile">'+textProfile+'</li>'
						+ '<li data-class="intro-item" data-id="events">'+textEvents+'</li>'
						+ '<li data-class="intro-item" data-id="search">'+textSearch+'</li>'
						+ '</ol>';

			$( html ).appendTo( $('body') );

			$('#intro').joyride({
				  'timer': 5500,                   
				  'nextButton': false,              
				  'tipAnimation': 'fade',           
				  'tipAnimationFadeSpeed': 1000,    
				  'postRideCallback': LJ.fn.handleTourEnded,      
				  'preStepCallback': LJ.fn.handleTourNextStep
			});

			$('.curtain').css({'display':'block'}).velocity({'opacity':[0.4,0]});
			$('.joyride-tip-guide').joyride('startTimer');

        },
        handleTourEnded: function(){

        	$('#profile').click();
        	$('.curtain').delay(700).velocity({opacity:[0,0.4]}, { 

        		complete:function(){ 
        			$('.curtain').css({'display':'none'});

        			var url = 'https://graph.facebook.com/' + LJ.user.facebook_id + '/picture?width=180&height=180';
        			var img_place = 0;

        			LJ.fn.updatePictureWithUrl({
        				userId: LJ.user._id,
        				url: url,
        				img_place: img_place
        			}, function( err, data ){

        				if( err )
        					return LJ.fn.handleServerError("La synchronisation avec Facebook a échouée.");

        				LJ.fn.handleServerSuccess();
        				LJ.fn.toastMsg("Bienvenue sur Meefore",'info', 4000);
						LJ.fn.updateClientSettings( data );

						$('#intro').remove();

						LJ.fn.replaceImage({
							img_id: data.img_id,
							img_version: data.img_version,
							img_place: 0,
							scope: ['profile','thumb']
						});

        			});
        	}});

        },
        handleTourNextStep: function(){
        	if( !LJ.state.touring )
        		return LJ.state.touring = true;
        	
        	$('.menu-item-active').next().click();

        },
        handleServerSuccess: function( msg, selector ){

        	setTimeout( function(){ 

		        if( msg )
		        	LJ.fn.toastMsg( msg, 'info');

		        var $container = $(selector);
		        $container.find('.selected').removeClass('selected')
				$container.find('.modified').removeClass('modified').addClass('selected')
				$container.find('.validating').removeClass('validating')
				$container.find('.validating-btn').removeClass('validating-btn')
				$container.find('.asking').removeClass('asking')
				$container.find('.pending').removeClass('pending');

        	}, LJ.ui.artificialDelay );

        },
        handleServerError: function( msg, ms ){

        	if( typeof(msg) != 'string' )
        		msg = JSON.parse( msg.responseText ).msg;

        	if( typeof(msg) != 'string' )
        		return LJ.fn.toastMsg('Erreur interne','error');

        	var ms = ms || 500;
        	setTimeout( function(){ 
        	
        	LJ.fn.toastMsg( msg, 'error');
        				$('.validating').removeClass('validating');
						$('.btn-validating').removeClass('btn-validating');
						$('.asking').removeClass('asking');
						$('.pending').removeClass('pending');

			}, ms );

        },
		initSocketEventListeners: function(){
			
				//LJ.fn.on('fetch user success', function( data ){ delog(data); });


				LJ.fn.on('send contact email success', function(){

					sleep( LJ.ui.artificialDelay, function(){
						LJ.fn.toastMsg( "Merci beaucoup!", 'info');
						$('.validating-btn').removeClass('validating-btn');
					});

				});

				LJ.fn.on('server error', function( data ){

					var msg   = data.msg,
						flash = data.flash;

					csl('Receiving error from the server');

					if( flash ){
						return LJ.fn.handleServerError( msg );
					}
					sleep( LJ.ui.artificialDelay, function(){
						LJ.fn.handleServerError( msg );
					});
				});

                
		},
		handleResetEvents: function(){

					LJ.fn.toastMsg('Les évènements sont maintenant terminés!', 'info');
					LJ.fn.displayEvents();
					if( LJ.user.status == 'hosting') LJ.fn.handleCancelEvent( { hostId: LJ.user._id });
		},
		handleRestartEvents: function(){
					
					LJ.fn.toastMsg('Les évènements sont à présent ouverts!', 'info');
					LJ.fn.displayEvents();
		},
		handleCancelEvent: function( data ){
			
			if( data.hostId == LJ.user._id )
			{
      	$('.pending').removeClass('pending');
    		LJ.user.status = 'idle';
    		LJ.myAskers = [];
    		LJ.$manageEventsWrap.find('#askersThumbs, #askersMain').html('');
    		LJ.fn.displayMenuStatus( function(){ $('#create').click(); } );
				
			}	  		
		                	 
    	var canceledEvent = LJ.$eventsListWrap.find('.eventItemWrap[data-hostid="'+data.hostId+'"]');
  		canceledEvent.velocity("transition.slideRightOut", {
  			complete: function(){
  				canceledEvent.remove();
  				if( $('.eventItemWrap').length == 0 ) LJ.fn.displayEvents();
  			}
  		});

	  	_.remove( LJ.myEvents, function(el){
	  		return el.hostId == data.hostId; 
	  	});


		},
		handleRequestParticipationInSuccess: function( data ){

			delog('Handling request participation in success');

			var hostId  	  = data.hostId,
				  userId 		  = data.userId,
				  eventId 	  = data.eventId,
				  requesterId = data.requesterId,
				  asker   	  = data.asker,
				  alreadyIn   = data.alreadyIn || false;	

					/* L'ordre de l'appel est important, car certaines 
					/* informations sont cachées par les premières 
					/* et utilisées par celles d'après 
					*/
			sleep( LJ.ui.artificialDelay, function(){
				
				if( alreadyIn ) {
					LJ.fn.toastMsg('Votre ami s\'est ajouté à l\évènement entre temps', 'info');
					var button = '<button class="themeBtn onHold">'
			                      + '<i class="icon icon-ok-1"></i>'
			                      +'</button>';
			            $('.f-item[data-userid="'+userId+'"]').find('button').replaceWith( button );
					return;
				}

					
					/* Demande pour soi-même */
					if( LJ.user._id == requesterId && LJ.user._id == userId )
					{
						LJ.user.asked_events.push( eventId );
						LJ.fn.toastMsg('Votre demande a été envoyée', 'info');
						 $('.asking').removeClass('asking').removeClass('idle').addClass('asked').text('En attente')
								  .siblings('.chatIconWrap, .friendAddIconWrap').velocity('transition.fadeIn');
					}

					/* Demande de la part de quelqu'un d'autre */
					if( LJ.user._id != requesterId && LJ.user._id == userId )
					{	
						LJ.fn.bubbleUp( '#events' )
						LJ.fn.toastMsg('Un ami vous a ajouté à une soirée', 'info');
						$('.eventItemWrap[data-eventid="'+eventId+'"]').find('.askIn')
						          .removeClass('asking').removeClass('idle').addClass('asked').text('En attente')
								  .siblings('.chatIconWrap, .friendAddIconWrap').velocity('transition.fadeIn');
					}

					/* Demande pour quelqu'un d'autre */
					if( LJ.user._id == requesterId && LJ.user._id != userId )
					{

						LJ.fn.toastMsg('Votre ami a été ajouté', 'info');
						var button = '<button class="themeBtn onHold">'
			                      + '<i class="icon icon-ok-1"></i>'
			                      +'</button>';
			            $('.f-item[data-userid="'+userId+'"]').find('button').replaceWith( button );
					}

				/* Pour l'host */
				if( LJ.user._id == hostId )
				{

					LJ.fn.bubbleUp( '#management' )
					LJ.myAskers.push( asker );

					var askerMainHTML  = LJ.fn.renderAskerMain( asker ),
						askerThumbHTML = LJ.fn.renderUserThumb ({ user: asker });

					    $( askerMainHTML ).appendTo( $('#askersMain') ).hide();
					    $( askerThumbHTML ).appendTo( $('#askersThumbs') );

						if( $('.a-item').length == 1 )
						{
							$('#manageEventsWrap .a-item, #manageEventsWrap .imgWrapThumb')
							.addClass('active')
							.velocity('transition.fadeIn',{
							 duration: 300,
							 display:'inline-block'
							 });
						}

					    LJ.fn.refreshArrowDisplay();
					    LJ.fn.displayAsOnline( requesterId );
				}	

			});

		},
		handleRequestParticipationOutSuccess: function( data ){

			delog( data.asker.name +' asked out' );

				var userId  	= data.userId,
					hostId  	= data.hostId,
					eventId 	= data.eventId,
					asker   	= data.asker,
					requesterId = data.requesterId;

				var $aItemMain = LJ.$askersListWrap.find('.a-item[data-userid="'+userId+'"]'),
				    $chatWrapAsUser = LJ.$eventsListWrap.find('.chatWrap[data-chatid="'+hostId+'"]');

				_.remove( LJ.myAskers, function( asker ){
					return asker._id === data.userId;
				});

				_.remove( LJ.user.asked_events, function( el ){
					return el == eventId;
				});

				sleep( LJ.ui.artificialDelay, function(){

					/* Pour l'Host */
					if( hostId === LJ.user._id)
					{		
							$('.imgWrapThumb[data-userid="' + asker._id + '"]').remove();
							LJ.state.jspAPI[ asker._id ] = undefined; // sinon chat fail lorsqu'ask in/out/in...
							$aItemMain.velocity("transition.fadeOut", { 
								duration: 200,
								complete: function(){
									$aItemMain.remove();
									if( !$aItemMain.hasClass('active') ) return LJ.fn.refreshArrowDisplay();
									$('.imgWrapThumb').first().addClass('active');
									$('.a-item').first().addClass('active').velocity('transition.fadeIn', 
										{ 
											duration: 300,
											complete: function(){

												LJ.fn.refreshArrowDisplay();
										}})
								} 
							});
					}
					if( requesterId == userId && LJ.user._id == userId )
					{
						
						LJ.fn.toggleChatWrapEvents( $chatWrapAsUser.find('.chatIconWrap') );
						LJ.fn.toastMsg('Vous avez été désinscris de la liste', 'info');
						$('.asking').removeClass('asked').removeClass('asking').addClass('idle').text('Je veux y aller!')
								.siblings('.chatIconWrap, .friendAddIconWrap').hide();
					}	

					
					/*
					var $nbAskers = $('.eventItemWrap[data-eventid="'+eventId+'"]').find('.e-guests span.nbAskers');
						$nbAskers.text( parseInt( $nbAskers.text() ) - 1 );

					$('.eventItemWrap[data-eventid="'+eventId+'"]').find('.askedInWrap')
																   .find('img[data-userid="'+asker._id+'"]')
																   .remove();  */
				});

		},
		handleFetchUserAndConfigurationSuccess: function( data ){

			/* L'ordre de l'appel est important, car certaines 
			/* informations sont cachées par les premières 
			/* et utilsiées par celles d'après 

					- On cache les informations sur l'user 
					- On fait les mises à jours du DOM (checkbox, thumbPic, input) à partir du cache
					- On envoie une demande des derniers évènements / utilisateurs / amis
					- On envoie une demande pour rejoindre les chatrooms en cours
					- On active le pluggin d'upload de photos
					- On génère le HTML dynamique à partir de données server ( Tags... )
			*/
			delog('Fetching user and config success');

			var user 	 = data.user,
				settings = data.settings;
			
			LJ.myOnlineUsers = data.onlineUsers;

			LJ.user = user;
			LJ.settings = settings;

			LJ.fn.subscribeToChannels();
			LJ.fn.initChannelListeners();
			
			LJ.fn.initLayout( settings );
			LJ.fn.setLocalStoragePreferences();
			LJ.fn.initCloudinary( data.cloudinary_tags );

			LJ.fn.fetchEvents(function(){

			});

			/* Update friends based on facebook activity on each connection */
			LJ.fn.fetchAndSyncFriends(function( data ){

				var friends = data.friends;
				LJ.user.friends = friends;

				if( friends.length == 0 )
					return; 

				var html = '';
				friends.forEach( function( friend ){
					html += LJ.fn.renderFriendInProfile( friend );
				});
				$('.row-friends').find('.row-body').html( html );

			});
	
			/* Admin scripts. Every com is secured serverside */	
			if( LJ.user.access.indexOf('admin') != -1 )
				LJ.fn.initAdminMode();
			
		},
		displayInModal: function( options ){

			var options = options || {};

			var call_started = new Date();
			LJ.fn.displayModal();

			var eventName = 'display-content';

			$('.modal-container').on( eventName, function( e, data ){

				var content = data.html_data;
				var starts_in = LJ.ui.minimum_loading_time - ( new Date() - call_started )
				setTimeout(function(){
					
					var $content = $(content);

					options.custom_classes && options.custom_classes.forEach( function( class_itm ){
						$content.addClass( class_itm );
					});

					options.custom_data && options.custom_data.forEach(function( el ){
						$content.attr('data-'+el.key, el.val );
					}); 

					$('.curtain-loader').velocity('transition.fadeOut', { duration: 300 });
					$content.hide().appendTo('.modal-container-body');

					$content.waitForImages(function(){

						var old_height = $('.modal-container').innerHeight(),
							new_height = old_height + $('.modal-container-body > div').innerHeight() + ( options.fix_height || 0 );

						var old_width = $('.modal-container').innerWidth(),
							new_width = old_width + $('.modal-container-body > div').innerWidth();

						var duration = new_height > 400 ? 450 : 300;

						$('.modal-container')
							.velocity({ height: [ new_height, old_height ], width: [ new_width, old_width ] }, { 
									duration: duration,
									complete: function(){
										$content.css({'display':'block','opacity':'0'});
										options.predisplay_cb && options.predisplay_cb();
										$content.velocity('transition.fadeIn');
									} 
							});
					});


				}, starts_in );

			});

			if( options.source === 'server' )
			{
				$.ajax({
					method:'GET',
					url: options.url,
					success: function( data ){
						var html_data = options.render_cb( data );
						$('.modal-container').trigger( eventName, [{ html_data: html_data }]);
					},
					error: function(){
						var html_data = options.error_cb();
						$('.modal-container').trigger( eventName, [{ html_data: html_data }]);
					},
					complete: function(){
						$('.modal-container').unbind( eventName );
					}
				});
			}

			if( options.source === 'facebook' )
			{	
				LJ.fn.GraphAPI( options.url, function(res){

					if( !res || !res.data ) {
						var html_data = options.error_cb();
					} else {
						var html_data = options.render_cb( res.data );
					}
					
					$('.modal-container').trigger( eventName, [{ html_data: html_data }]);
					$('.modal-container').unbind( eventName );

				});
			}

			if( options.source === 'local' )
			{
				setTimeout( function(){

					var html_data = options.render_cb();
					$('.modal-container').trigger( eventName, [{ html_data: html_data }]);
					$('.modal-container').unbind( eventName );

				}, 1000 );
			}

		},
		GraphAPI: function( url, callback, opts ){

			var ls = window.localStorage;

			var access_token = ( LJ.user.facebook_access_token && LJ.user.facebook_access_token.long_lived ) 
							|| ( ls.preferences && JSON.parse( ls.preferences ).long_lived_tk );
			FB.api( url, { access_token: access_token }, callback );

		},
		displayUserProfile: function( facebook_id ){

			LJ.fn.displayInModal({ 

                url       : '/api/v1/users/' + facebook_id,
                source    : 'server',
                render_cb : LJ.fn.renderUserProfileInCurtain,
                error_cb  : LJ.fn.renderUserProfileInCurtainNone
                
			});
			
		},
		displayModal: function( callback ){
			
			$('.curtain')
				.css({'display':'block'})
				.velocity({ 'opacity': [0.4,0] });

			$('.modal-container')
				.find('.modal-container-body').html( LJ.$curtain_loader ).end()
				.css({'display':'block'})
				.velocity({ 'opacity': [1,0] });

			$('.curtain-loader').velocity('transition.fadeIn', { delay: 200, duration: 300});

		},
		hideModal: function(){

			$('.curtain')
				.velocity({ 'opacity': [0,0.4] }, { complete: function(){
					$('.curtain').css({ display: 'none' }); }
			});

			$('.modal-container')
				.velocity({ 'opacity': [0,1] }, { complete: function(){
					$('.modal-container').css({ display: 'none', height: 'auto', width: 'auto' });
					$(".modal-container-body *:not('.curtain-loader')").remove(); }
			});

			$('.curtain-loader').hide();

		},
		initLadder: function( options ){

			if( typeof( options ) != "object" )
				return delog('Param error, object needed');

			var max_level  = options.max_level,
				base_point = options.base_point,
				coef_point = options.coef_point;

			if( !max_level || !base_point || !coef_point )
				return delog('Param error, missing key');

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

		},
		updatePictureWithUrl: function( options, callback ){

			var eventName = 'me/update-picture-fb',
				data = options,
				cb = {
					success: function( data ){
						callback( null, data );
					},
					error: function( xhr ){
						callback( xhr, null );
					}
				};

			LJ.fn.say( eventName, data, cb );

		},
		handleSuspendEvent: function(data, state){

			var eventId = data.eventId;

			if( data.hostId == LJ.user._id ){

				var $li = $('#suspendEvent');
				$('.pending').removeClass('pending');

					if( data.myEvent.state == 'suspended' ){
						LJ.fn.toastMsg( "Les inscriptions sont momentanément suspendues", 'info' );
						$li.text('Reprendre');
					}

					if( data.myEvent.state == 'open' ){
						LJ.fn.toastMsg( "Les inscriptions sont à nouveau possible", 'info' );
						$li.text('Suspendre');
					}
			}

			var eventWrap = LJ.$eventsWrap.find('.eventItemWrap[data-eventid="' + eventId + '"]');

			eventWrap.attr('data-eventstate', state )
					 .find('button.askIn');
					

		},
		fetchEventParameters: function(){

			setTimeout( function(){

				var expose = window.dum_params;

			}, 1000 );

		},
		insertEvent: function( myEvent ){

			csl('Inserting new event');
			myEvent.beginsAt = new Date ( myEvent.beginsAt );

			/* On ajoute l'event au bon endroit pour maintenir l'ordre*/
			var idx = _.sortedIndex( LJ.myEvents, myEvent, 'beginsAt' );
			LJ.myEvents.splice( idx, 0, myEvent );

			var eventHTML = LJ.fn.renderEvent( myEvent );

			/* Prise en compte des effets de bords sinon le jQuery return undefined */
			if( idx == 0 )
			{	
				csl('Inserting first element');
				if( $('.eventItemWrap').length == 0 )
					$( eventHTML ).insertAfter( $('#noEvents') );
				else
					$( eventHTML ).insertBefore( $('.eventItemWrap').first() );
				$('#noEvents').addClass('filtered');
				return;
			}
			// myEvents just got incremented, hence the - 1
			if( idx == LJ.myEvents.length - 1){
				$( eventHTML ).insertAfter( $( $('.eventItemWrap')[idx-1] ) ).addClass('inserted');
			}else{
				$( eventHTML ).insertAfter( $( $('.eventItemWrap')[idx] ) ).addClass('inserted');
			}

		},
		hashtagify: function( str ){
			
			var hashtag_parts = [];
				str.trim().split(/[\s_-]/).forEach(function( el, i ){
					if( i == 0 ){
						hashtag_parts.push( el );
					} else {
							var elm = el[0].toUpperCase() + el.substring(1);
							hashtag_parts.push( elm );
					}
				});
				return hashtag_parts.join('');

		},
		createEvent: function(){

			var tags = [],
				userIds = [];

			$('#createEventWrap .selected').each( function( i, $el ){
				var tag = $( $el) .attr('class').split(' ')[1].split('-')[1];						 
				tags.push( tag );
			});

			$('#createEventWrap .imgWrapThumb.active').each( function( i, el ){
				userIds.push( $(el).data('userid') ); 
			});

			var e = {};
				e.hostId	  	  = LJ.user._id;
				e.hostName   	  = LJ.user.name;
				//e.hostimg_id 	  = LJ.user.img_id;
				//e.hostimg_version  = LJ.user.img_version;
				e.name 		  	  = $('#eventName').val();
				e.location    	  = $('#eventLocation').val();
				e.hour 		  	  = $('#eventHour').val();
				e.min  	  		  = $('#eventMinut').val();
				e.description 	  = $('#eventDescription').val();
				e.maxGuest        = $('#eventMaxGuest').val();
				e.tags            = tags;
				e.userIds		  = userIds;

				var eventName = 'event/create',
					data = e
					data.socketId = LJ.pusher.connection.socket_id
					, cb = {
						success: function( data ){

							var myEvent = data.myEvent;

							var eventId = myEvent._id,
							hostId = myEvent.hostId;
						
							sleep( LJ.ui.artificialDelay , function(){ 

								/* Internal */
								LJ.user.status = 'hosting';
								LJ.user.hosted_event_id = eventId;
								LJ.myAskers = data.myEvent.askersList;

								/* Display in Manage */
        						LJ.fn.displayAskers();
        						LJ.fn.addFriendLinks();
								LJ.fn.refreshArrowDisplay();

								/* Smooth transition */
								LJ.fn.displayMenuStatus( function(){ $('#management').click(); } );

								/* CreateEvent UI restore */
								$('.themeBtn').removeClass('validating-btn');
								LJ.$createEventWrap.find('input, #eventDescription').val('');
								LJ.$createEventWrap.find('.selected').removeClass('selected');

								/* Display in Events */
								LJ.fn.insertEvent( myEvent );
								$('#refreshEventsFilters').click();

							});

						},
						error: function( xhr ){
							LJ.fn.handleServerError( JSON.parse( xhr.responseText ).msg );
						}
					};

				LJ.fn.say( eventName, data, cb );
		},
		fetchEvents: function(){

			if( LJ.state.fetchingEvents )
				return LJ.fn.toastMsg('Already fetching events', 'error');
			
			LJ.state.fetchingEvents = true;

			var eventName = 'fetch-events',
				data = { userId: LJ.user._id };

			var cb = {
				beforeSend: function(){},
				success: function( data ){
					//delog(data);
					var myEvents = data.myEvents;
					LJ.state.fetchingEvents = false;

					var L = myEvents.length;
					csl('Events fetched from the server, number of events : ' + L);

					for( var i=0; i<L; i++ ){

						LJ.myEvents[i] = myEvents[i];
						LJ.myEvents[i].createdAt = new Date( myEvents[i].createdAt );
						LJ.myEvents[i].beginsAt  = new Date( myEvents[i].beginsAt );
					}

					/* L'array d'event est trié à l'initialisation */
					LJ.myEvents.sort( function( e1, e2 ){
						return e1.beginsAt -  e2.beginsAt ;
					});

					LJ.fn.displayEvents();
				},
				error: function( xhr ){
					csl('Error fetching events');
				}
			};
				
            LJ.fn.say( eventName, data, cb );
            
		},
        fetchAskers: function(){

            if( LJ.state.fetchingAskers )
                return LJ.fn.toastMsg("Already fetching askers", 'error');

            LJ.state.fetchingAskers = true;

            var eventName = 'fetch-askers',
            	data = { eventId: LJ.user.hosted_event_id };

            var cb = {
            	success: function( data ){

                	LJ.state.fetchingAskers = false;
                    LJ.myAskers = data.askersList;
                    LJ.fn.displayAskers();
                    LJ.fn.addFriendLinks();
					$('#askersListWrap div.active').click(); // force update
					LJ.fn.refreshArrowDisplay();   
            	},
            	error: function( xhr ){
            		delog('Error fetching askers');
            	}
            };

            LJ.fn.say( eventName, data, cb );

        },
        displayEvents: function(){

        	/* Mise à jour de la vue des évènements
        	  au cas où quelqu'un se connecte en période creuse
        	*/
        	//csl('Displaying events');

	        	var hour = ( new Date() ).getHours();
	        	if( hour < LJ.settings.eventsRestartAt && hour >= LJ.settings.eventsTerminateAt ){
        			csl('Displaying events frozen state');
	        		return LJ.fn.displayViewAsFrozen();
	        	}     		

            LJ.$eventsListWrap.html( LJ.fn.renderEvents( LJ.myEvents ) );
            $('.eventItemWrap').velocity("transition.slideLeftIn", {
            	display:'inline-block'
            });

        },
        displayAskers: function(){

            $('#askersMain').html('').append( LJ.fn.renderAskersMain() );
            $('#askersThumbs').html('').append( LJ.fn.renderUsersThumbs() );

            LJ.fn.refreshArrowDisplay();
            LJ.fn.refreshOnlineUsers();

        },
        addFriendLinks: function(){

        	var idArray = _.pluck( LJ.myAskers, '_id' );
	
        	for( var i = 0; i < LJ.myAskers.length ; i ++ )
        	{	
        		$('#askersThumbs .team-'+i).removeClass('team-'+i);
        		$('#askersThumbs .head-'+i).removeClass('head-'+i);
        		
        		$('#askersThumbs div[data-userid="'+ LJ.myAskers[i]._id +'"]').addClass('team-'+i).addClass('head-'+i);
        		
        		for( var k = 0 ; k < LJ.myAskers[i].friends.length ; k++ )
        		{	
        			if( idArray.indexOf( LJ.myAskers[i].friends[k].friendId ) == -1 )
        			{
        				//nada
        			}
        			else
        			{	
        				if( LJ.myAskers[i].friends[k].status == 'mutual' )
        				{	
        					$('#askersThumbs div[data-userid="'+ LJ.myAskers[i].friends[k].friendId+'"]').addClass('team-'+i);		  
        				}
        			}
        		} 
        	}

        },
        displayAsOnline: function( data ){

        	var userId = data.userId;
			$('div[data-userid="'+userId+'"]')
					.find('.online-marker')
					.addClass('active');

        },
        displayAsOffline: function( data ){

        	var userId = data.userId;
					$('div[data-userid="'+userId+'"]')
					.find('.online-marker')
					.removeClass('active');

        },
        filterEvents: function(tags, locations){

        	if( $('.eventItemWrap').length == 0 ) return LJ.fn.toastMsg('Aucun évènement à filtrer', 'error');

        	LJ.$eventsListWrap.find('.selected').removeClass('selected');

        	    isFilteredByLoc = ( locations.length != 0 ),
        		isFilteredByTag = ( tags.length      != 0 );

	        	var eventsToDisplay = [];
	        	var matchLocation = false;
	        	var matchTags = false;

	        	$('.eventItemWrap').each( function( i, itemWrap ) {

	        		matchLocation = matchTags = false;

	        		if( locations.indexOf( $(itemWrap).data('location') ) != -1 ){
	        			matchLocation = true;
	        		}

	        		$( itemWrap ).find('.tag')
	        					 .each( function( i, tag ){
	        					 	var l = $( tag ).prop('class').split(' ')[1];
	        					 	if( tags.indexOf( l ) != -1 ){
	        					 		$( tag ).addClass('selected');
	        					 		matchTags = true;
	        					 	}
	        					 });

			        function addItem(){ eventsToDisplay.push( $(itemWrap) ); } /*For readability */	

			    	if ( !isFilteredByTag && !isFilteredByLoc 								 ){ addItem(); }
			    	if (  isFilteredByTag &&  isFilteredByLoc && matchTags && matchLocation  ){ addItem(); }
			    	if (  isFilteredByTag && !isFilteredByLoc && matchTags 					 ){ addItem(); }
			    	if ( !isFilteredByTag &&  isFilteredByLoc && matchLocation 				 ){ addItem(); }

	      		});

	        	//delog('Events to display : ' + eventsToDisplay );

        		/* Transforme un Array de jQuery objects, en un jQuery-Array */
        		LJ.$eventsToDisplay = $(eventsToDisplay).map( function(){ return this.toArray(); });
	        	
       		$('.eventItemWrap, #noResults ').addClass('filtered');
       		LJ.$eventsToDisplay.removeClass('filtered');

       		if( LJ.$eventsToDisplay.length == 0){
       			LJ.fn.toastMsg( 'Aucun évènement trouvés', 'info');
       			$('#noEvents').addClass('filtered');
       			$('#noResults').removeClass('filtered')
       						  .velocity('transition.slideLeftIn', { duration: 700 });

       		}else{
       			//LJ.fn.toastMsg( LJ.$eventsToDisplay.length + ' soirées pour ces filtres!', 'info');
       		}

        },
        requestIn: function( eventId, hostId, userId, requesterId ){

            csl("requesting IN with id : "+ eventId);

            var eventName = 'request-participation-in',
            	data = {
            		eventId: eventId,
            		hostId: hostId,
            		userId: userId,
            		requesterId: requesterId
            	},
            	cb = {
            		success: function( data ){
            			LJ.fn.handleRequestParticipationInSuccess( data );
            		},
            		error: function( xhr ){
            			LJ.fn.handleServerError( JSON.parse( xhr.responseText ).msg );
            		}
            	};

            LJ.fn.say( eventName, data, cb );

        },
        requestOut: function( eventId, hostId, userId, requesterId ){  

        	csl("requesting OUT with id : "+ eventId);

        	var eventName = 'request-participation-out',
        		data = {
        			userId: userId,
					hostId: hostId,
					eventId: eventId,
					requesterId: requesterId
        		},
        		cb = {
        			success: function( data ){
        				LJ.fn.handleRequestParticipationOutSuccess( data );
        			},
        			error: function( xhr ){

        			}
        		}

        	LJ.fn.say( eventName, data, cb );


        },/*sayfn*/
        say: function( eventName, data, cb ){

        	var url = '/' + eventName;

        	$.ajax({
        		method:'POST',
        		url:url,
        		dataType:'json',
        		data: data,
        		beforeSend: function(req){
        			req.setRequestHeader('x-access-token', LJ.accessToken );
        			if( typeof( cb.beforeSend ) == 'function' ){
        				cb.beforeSend(); 
        			} else { LJ.fn.showLoaders(); }
        		},
        		success: function( data ){
        			if( typeof( cb.success ) == 'function' ) cb.success( data );
        		},
        		error: function( data ){
        			if( typeof( cb.error ) == 'function' ) return cb.error( data );
        			/* Default response to any HTTP error */
        			LJ.fn.handleServerError( JSON.parse( data.responseText ).msg );
        		}
        	});

        	//LJ.fn.handleTimeout();

        },
        handleTimeout: function(){

        	/* !! Algo ne marche pas si loader success en cours d'affichage après une failure */
        	sleep( 8000, function(){

        		if( $('.loaderWrap').css('display') == 'none' && $('.m-loaderWrap').css('display') == 'none') return  // pas jolie mais bn

        		LJ.fn.handleServerError('Timeout');
        	});

        }, 
        bubbleUp: function( el ){

        	var $el = $(el);

        	if( $el.hasClass('menu-item-active') ) return; 

        	var $bubble = $el.find('.bubble'),
        		n = $bubble.text() == 0 ? 0 : parseInt( $bubble.text() );

        	$bubble.removeClass('filtered');

        		if( n == 99 ) 
        			return $bubble.text(n+'+');

        	return $bubble.text( n + 1 );

        },
        handleFetchAskedInSuccess: function( data ){

        	var askersList = data.askersList,
        		eventId = data.eventId,
        		$itemWrap =  $('.eventItemWrap[data-eventid="'+eventId+'"]'),
        		$askersWrap = $itemWrap.find('.askedInWrap');

        	var d = LJ.cloudinary.displayParamsEventAsker;
        		$askersWrap.html('');

			for( var i = 0; i < askersList.length ; i ++ ){
				
				var asker = askersList[i];

					d.version = asker.img_version;

				//var $askerImg = LJ.fn.renderAskerInEvent( asker.img_id, { dataList: [{ dataName: 'userid', dataValue: asker._id }]});
				//	$askersWrap.prepend( $askerImg );					

				var $nbAskers = $itemWrap.find('.e-guests span.nbAskers');
					$nbAskers.text( askersList.length );
			}

        },
        displayPictureHashtags: function(){

        	for( var i = 0; i < LJ.user.pictures.length; i ++ ){
				var hashtag = LJ.user.pictures[i].hashtag;
				$('.picture-hashtag').eq(i).find('input').val(hashtag);        		
        	}

        },
        handleUpdatePicturesSuccess: function( data ){

        setTimeout( function(){ 
			LJ.user.pictures = data.pictures;
			var currentimg_place = $('.main-picture').data('img_place');

			$('.row-pictures').find('.icon-edit').click();

			$('.btn-validating').removeClass('btn-validating');
			$('.icon.selected').removeClass('selected');

			/* Changement de la main picture et update du header associé */
			var mainImg = LJ.fn.findMainImage();
			if( currentimg_place != mainImg.img_place ){
				$('.main-picture').removeClass('main-picture');
				$('.picture[data-img_place="'+mainImg.img_place+'"]').addClass('main-picture');
				mainImg.scope = ['thumb'];
				LJ.fn.replaceImage( mainImg );
			}

			/* Mise à jour temps réelle des nouvelles photos */
			for( var i = 0; i < LJ.user.pictures.length; i++){
				LJ.user.pictures[i].scope = ['profile'];
				if( $('.picture[data-img_place="'+i+'"]').attr('data-img_version') != LJ.user.pictures[i].img_version )
				LJ.fn.replaceImage( LJ.user.pictures[i] );
			}

			/* Mise à jour des hashtags*/
			LJ.fn.displayPictureHashtags();

			LJ.fn.handleServerSuccess('Vos photos ont été mises à jour');
        	
        }, LJ.ui.artificialDelay );

        },
        handleSuccessDefault: function( data ){
        	delog('Success!');
        },
        handleErrorDefault: function( data ){
        	delog('Error!');
        },
        displayAddFriendToPartyButton: function(){

        	var $friendsWrap = $('#friendsWrap'),
        		$eventWrap = $friendsWrap.parents('.eventItemWrap'),
        		$askedInWrap = $friendsWrap.parents('.eventItemWrap').find('.askedInWrap');

        	$friendsWrap.find('.f-item').each( function( i, el ){

        		var $friend = $(el),
        			friendId = $friend.data('userid');

        		var button;
        		
        		var myFriend = _.find( LJ.myFriends, function(el){ return el._id == friendId ; });

           		if( myFriend.status == 'hosting' )
           		{
	                button = '<button class="themeBtn isHosting">'
	                  + '<i class="icon icon-forward-1"></i>'
	                  +'</button>';
	                return $friend.find('button').replaceWith( button );
              	}

	        	if( $askedInWrap.find('img[data-userid="'+friendId+'"]').length == 1 )
	        	{  
              		button = '<button class="themeBtn onHold">'
                      + '<i class="icon icon-ok-1"></i>'
                      +'</button>';
	              	return $friend.find('button').replaceWith( button );
	        	}

        		    button = '<button class="themeBtn ready">'
                  + '<i class="icon icon-user-add"></i>'
                  +'</button>';
	        	return $friend.find('button').replaceWith( button );
	        	
        	});

        },
        subscribeToChannels: function(){

        	var channels = LJ.user.channels,
        		L = channels.length;
        	for( var i=0; i<L; i++ )
        	{
        		LJ.channels[ channels[i].access_name ] = LJ.pusher.subscribe( channels[i].channel_label )
        	}
        	return;

        },
        initChannelListeners: function(){

        	/* Bind all defaults global events */
        	LJ.channels['defchan'].bind('create-event-success', LJ.fn.handleCreateEventSuccess );
        	LJ.channels['defchan'].bind('suspend-event-success', LJ.fn.handleSuspendEventSuccess );
        	LJ.channels['defchan'].bind('cancel-event-success', LJ.fn.handleCancelEventSuccess );

        	LJ.channels['defchan'].bind('restart-events', LJ.fn.handleRestartEvents );
        	LJ.channels['defchan'].bind('reset-events', LJ.fn.handleResetEvents );

        	LJ.channels['defchan'].bind('refresh-users-conn-states', LJ.fn.refreshUserConnState );

        	//-----------------------------------------------------
        	/* Bind personnal events */  	
        	LJ.channels['mychan'].bind('request-participation-in-success', LJ.fn.handleRequestParticipationInSuccess );
        	LJ.channels['mychan'].bind('request-participation-out-success', LJ.fn.handleRequestParticipationOutSuccess );

        	LJ.channels['defchan'].bind('display-msg', function( data ){
        		LJ.fn.toastMsg( data.msg, 'info' );
        	});



        },
        refreshUserConnState: function( data ){

        	LJ.myOnlineUsers = _.keys( data.onlineUsers );
        	$('.online-marker').removeClass('active');
        	LJ.fn.refreshOnlineUsers();
        },
        testAllChannels: function(){

        	var userId = LJ.user._id;
        	var channel_label = 'test-all-channels'
        		, data = { userId: userId }
        		, cb = {
        			success: function( data ){
        				delog('Test launched...ok');
        			},
        			error: function( xhr ){
        				delog('Error! :@');
        			}
        		};

        	LJ.fn.say( channel_label, data, cb );

        },
        cancelEvent: function( eventId, hostId, templateId ){

        	csl('canceling event : '+eventId+'  with hostId : '+hostId);
        	$( '#cancelEvent' ).addClass( 'pending' );

        	var eventName = 'event/cancel',
        		data = { eventId: eventId, hostId: hostId, socketId: LJ.pusher.connection.socket_id, templateId: templateId }
        		, cb = {
        			success: function( data ){

        				/* Host only */
			        		$('.pending').removeClass('pending');
			        		LJ.user.status = 'idle';
			        		LJ.myAskers = [];
			        		LJ.$manageEventsWrap.find('#askersThumbs, #askersMain').html('');
			        		LJ.fn.displayMenuStatus( function(){ if(hostId==LJ.user._id) $('#create').click(); } );
					
						/* For all users */							                	 
			        	var canceledEvent = LJ.$eventsListWrap.find('.eventItemWrap[data-hostid="'+hostId+'"]');
			        		canceledEvent.velocity("transition.slideRightOut", {
			        			complete: function(){
			        				canceledEvent.remove();
			        				if( $('.eventItemWrap').length == 0 ) LJ.fn.displayEvents();
			        			}
			        		});

			        	_.remove( LJ.myEvents, function( el ){
			        		return el.hostId == hostId; 
			        	});
        			},
        			error: function( xhr ){
        				delog('Error canceling event');
        				LJ.fn.handleServerError( JSON.parse( xhr.responseText ).msg );
        			}
        		};

        	LJ.fn.say( eventName, data, cb );

        },
        suspendEvent: function( eventId, hostId ){

        	delog('Suspending event with id : ' + eventId + ' and hostId : ' + hostId );
        	$( '#suspendEvent' ).addClass( 'pending' );

        	var eventName = 'event/suspend',
        		data = { eventId: eventId, hostId: hostId, socketId: LJ.pusher.connection.socket_id }
        		, cb = {
        			success: function( data ){
        				sleep( LJ.ui.artificialDelay, function(){

	        				var eventState = data.eventState,
	        					hostId     = data.hostId;

	        				var $li = $('#suspendEvent');
							$('.pending').removeClass('pending');

							if( eventState == 'suspended' ){
								LJ.fn.toastMsg( "Les inscriptions sont momentanément suspendues", 'info' );
								$li.text('Reprendre');
							}

							if( eventState == 'open' ){
								LJ.fn.toastMsg( "Les inscriptions sont à nouveau possible", 'info' );
								$li.text('Suspendre');
							}
        				});
        			},
        			error: function( xhr ){
        				sleep( LJ.ui.artificialDelay, function(){
	        				delog('Error suspending event');
	        				LJ.fn.handleServerError( JSON.parse( xhr.responseText ).msg );
        				});
        			}
        		};

        	delog('Calling say with eventName:' +eventName+'  and data:'+data);
        	LJ.fn.say( eventName, data, cb );

        },
        showLoaders: function(){

        	$( '.loaderWrap, .m-loaderWrap' ).velocity( 'fadeIn', { duration: 400 });

        },
        hideLoaders: function(){

            $( '.loaderWrap, .m-loaderWrap' ).velocity( 'fadeOut', { duration: 250 });

        }, 
        handleCreateEventSuccess: function( data ){

        	var myEvent = data.myEvent;

        		LJ.myAskers = data.myEvent.askersList;
        		LJ.fn.displayAskers();

        		/* Réagir si un ami créé un évènement, MAJ les buttons */ 
				//LJ.fn.toastMsg( myEvent.hostName + ' a créé un évènement !', 'info' );
				LJ.fn.bubbleUp( '#events' );

				LJ.fn.insertEvent( myEvent );
				$('#refreshEventsFilters').click();

        },
        handleSuspendEventSuccess: function( data ){

        	var hostId     = data.hostId,
        		eventId    = data.eventId,
			    eventState = data.eventState;			


        		sleep( LJ.ui.artificialDelay , function(){ 

						var eventId = data.eventId;
						var eventWrap = LJ.$eventsWrap.find('.eventItemWrap[data-hostid="' + hostId + '"]');

						var textBtn = eventState == 'suspended' ? "L'évènement est complet" : "Je veux y aller";

						eventWrap.attr('data-eventstate', eventState );

						if( LJ.user.asked_events.indexOf( eventId ) != -1 ){
							return delog('Exiting');
						}
						 eventWrap.find('button.askIn')
						 		  .text( textBtn );
						
					});	

        },
        handleCancelEventSuccess: function( data ){

        	var hostId  = data.hostId;

        		sleep( LJ.ui.artificialDelay , function(){ 

					var canceledEvent = LJ.$eventsListWrap.find('.eventItemWrap[data-hostid="'+data.hostId+'"]');
	        		canceledEvent.velocity("transition.slideRightOut", {
	        			complete: function(){
	        				canceledEvent.remove();
	        				if( $('.eventItemWrap').length == 0 ) LJ.fn.displayEvents();
	        			}
	        		});

		        	_.remove( LJ.myEvents, function( el ){
		        		return el.hostId == data.hostId; 
		        	});
				});	

        },
        displayMenuStatus: function( cb ){
 
			var status = LJ.user.status;

			if( status == 'idle' )
			{
				$('#management').velocity('transition.slideRightOut', {
					duration: 200,
					complete: function(){ $('#create').removeClass('filtered').velocity('transition.slideLeftIn', { 
						duration: 200, display:'inline-block', complete: function(){ cb(); } }); }
				});
			}

			 if( status == 'hosting' )
			{
				$('#create').velocity('transition.slideRightOut', {
					duration: 200,
					complete: function(){ $('#management').removeClass('filtered').velocity('transition.slideLeftIn', { 
						duration: 200, display: 'inline-block', complete: function(){ cb(); } }); }
				});
			}
        }

}); //end LJ

$('document').ready(function(){
		

		/* Recursive initialisation of FB pluggin*/
		var initFB = function(time){
			if( typeof(FB) === 'undefined' ) return sleep(time, initFB )
			FB.init({
					    appId      : '1509405206012202',
					    xfbml      : true,  // parse social plugins on this page
					    version    : 'v2.1' // use version 2.1
				});
			LJ.fn.init({ debug: true });
			csl('Application ready!');
		}

		initFB(300);

});


function delog(msg){
	if( LJ.state.debug )
		console.log(msg);
}



window.dumdata = [
  {
    "_id": "55aa651dd00913bc0a5b9eed",
    "index": 0,
    "guid": "8c2a16ea-1eb6-4fb4-a2a8-0cf3815cae43",
    "isActive": true,
    "picture": "http://placehold.it/32x32",
    "age": 26,
    "name": "Fannie Cain",
    "gender": "female",
    "email": "fanniecain@telequiet.com",
    "registered": "2014-02-20T07:16:14 -01:00",
    "latitude": 79.631695,
    "longitude": -13.765706,
    "tags": [
      "qui",
      "est",
      "culpa",
      "non",
      "cillum",
      "aliquip",
      "laboris"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Rene Reed"
      },
      {
        "id": 1,
        "name": "Francine Banks"
      },
      {
        "id": 2,
        "name": "Susan Strong"
      }
    ],
    "greeting": "Hello, Fannie Cain! You have 4 unread messages.",
    "favoriteFruit": "apple"
  },
  {
    "_id": "55aa651dadb7755339c32793",
    "index": 1,
    "guid": "e93dee0b-d865-4c70-86e1-4a0600e95cc0",
    "isActive": true,
    "picture": "http://placehold.it/32x32",
    "age": 40,
    "name": "Bauer Bird",
    "gender": "male",
    "email": "bauerbird@telequiet.com",
    "registered": "2014-11-02T13:09:28 -01:00",
    "latitude": 83.599981,
    "longitude": 127.370264,
    "tags": [
      "est",
      "velit",
      "in",
      "veniam",
      "labore",
      "laborum",
      "voluptate"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Stark Wiley"
      },
      {
        "id": 1,
        "name": "Bonnie George"
      },
      {
        "id": 2,
        "name": "Higgins Shepard"
      }
    ],
    "greeting": "Hello, Bauer Bird! You have 1 unread messages.",
    "favoriteFruit": "banana"
  },
  {
    "_id": "55aa651df3ddc578abf5b576",
    "index": 2,
    "guid": "65ff1b0f-127f-4549-900b-7bf61cf9f683",
    "isActive": false,
    "picture": "http://placehold.it/32x32",
    "age": 21,
    "name": "Tessa Anthony",
    "gender": "female",
    "email": "tessaanthony@telequiet.com",
    "registered": "2015-06-12T13:19:33 -02:00",
    "latitude": -83.109766,
    "longitude": -90.599844,
    "tags": [
      "dolor",
      "et",
      "voluptate",
      "ut",
      "ipsum",
      "ut",
      "exercitation"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Thelma Wagner"
      },
      {
        "id": 1,
        "name": "Denise Barrera"
      },
      {
        "id": 2,
        "name": "Alexander David"
      }
    ],
    "greeting": "Hello, Tessa Anthony! You have 1 unread messages.",
    "favoriteFruit": "banana"
  },
  {
    "_id": "55aa651daa2c00a661e298be",
    "index": 3,
    "guid": "008c2b0a-9aff-4767-8a2b-b0f6935ac7e5",
    "isActive": false,
    "picture": "http://placehold.it/32x32",
    "age": 20,
    "name": "Renee Henry",
    "gender": "female",
    "email": "reneehenry@telequiet.com",
    "registered": "2014-07-13T04:19:49 -02:00",
    "latitude": -82.359818,
    "longitude": -110.960972,
    "tags": [
      "mollit",
      "nostrud",
      "ullamco",
      "ad",
      "sit",
      "eu",
      "sit"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Rosario Freeman"
      },
      {
        "id": 1,
        "name": "Blevins Carroll"
      },
      {
        "id": 2,
        "name": "Elinor Norton"
      }
    ],
    "greeting": "Hello, Renee Henry! You have 8 unread messages.",
    "favoriteFruit": "apple"
  }
]




window.dum_places = [
	{
		id: '1',
		name:'Le barilleur',
		address: 'blabla',
		tag: 'bar'
	},
	{
		id: '2',
		name:'Le Duplexe',
		address: 'blabla',
		tag: 'nightclub'
	},
	{
		id: '3',
		name:'Le Violondingue',
		address: 'blabla',
		tag: 'bar dansant'
	},
	{
		id: '4',
		name:'Le Rex Club',
		address: 'blabla',
		tag: 'nightclub'
	},
	{
		id: '5',
		name:'O\'Sullivans',
		address: 'blabla',
		tag: 'bar'
	}
];