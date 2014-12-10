
	window.LJ.fn = _.merge( window.LJ.fn || {}, 

		{

		renderEvents: function( arr, max ){

			var html =''; 
			    max = max || arr.length;

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

        	return '<div class="chatWrap chat-asker none" data-chatid="'+chatId+'">'
                            +'<div class="chatLineWrap"></div>'    
                            +'<div class="chatInputWrap">'
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
        renderEventButton: function( eventId, hostId ){

        	var button = '<div class="askInWrap"><button class=" ';
			
			if( hostId == LJ.user._id )
			{
				button += 'themeBtnToggle themeBtnToggleHost"> Management'	
			}
			else
			{
				button += 'askIn themeBtnToggle';
				LJ.user.eventsAskedList.indexOf( eventId ) > -1 ? button += ' asked"> En attente' : button += ' idle">Je veux y aller';
			}
				button += '</button>'
                         +'<div class="chatIconWrap"><i class="icon icon-chat"/></div>'
                         +'<div class="friendAddIconWrap"><i class="icon icon-user-add"/></div>'
                         +'</div>';

				return button;
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
        renderAskerInEvent: function( imgId, o){

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
        	
        	for ( i = 0; i < maxGuest ; i++ )
        	{ 
        		var o = { classList: ['hello'], dataList: [] };
	        	var d = LJ.cloudinary.displayParamsEventAsker;

        		if( i < L )
        		{
	        		var imgId        = askersList[i].imgId;
	        			d.imgVersion = askersList[i].imgVersion;
	        			o.classList = ['askedInThumb'];
	        			o.dataList   = [ { dataName: 'askerid', dataValue:  askersList[i].id } ];

        		}else //On affiche via placeholder le nb de places restantes.
        		{
        			var imgId = LJ.cloudinary.placeholder_id;
        				o.classList = ['askedInRemaining'];
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
				tags           = e.tags,
				chatId 		   = LJ.fn.buildChatId( eventId, hostId, LJ.user._id );

			var imgTagHTML   = LJ.fn.renderHostImg( hostImgId, hostImgVersion ),
			    button       = LJ.fn.renderEventButton( e._id, hostId ),
				eventTags    = LJ.fn.renderEventTags( tags ),
            	chatWrap     = LJ.fn.renderChatWrap( chatId ),
            	askersThumbs = LJ.fn.renderAskersInEvent( e.askersList, e.maxGuest );

			var html = '<div class="eventItemWrap" '
						+ 'data-eventid="'+e._id+'" '
						+ 'data-hostid="'+e.hostId+'" '
						+ 'data-location="'+e.location+'"'
						+ 'data-eventstate="'+e.state+'">'
						+'<div class="eventItemLayer">'
						+ '<div class="headWrap">' 
						   + '<div class="e-image left">'+ imgTagHTML +'</div>'
						     + '<div class="e-hour e-weak">'+ LJ.fn.matchDateHHMM( e.beginsAt ) +'</div>'
						   + '<div class="e-guests right">'
						     + '<span class="guestsWrap">'
						       + '<i class="icon icon-users"></i>'
						       + '<span class="nbAskers">'+ e.askersList.length +'</span>/'
						       + '<span class="nbAskersMax">'+ e.maxGuest +'</span>'
						     + '</span>'
						   + '</div>'
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

			if( loc == 1){
				return '1er';
			}
			
				return loc + 'ème';
			
		},
		matchDateHHMM: function(d){

	    	 var dS = '';

    	     if( d.getHours() == 0){
    	     	dS = '0';
    	     }
	       	 dS += d.getHours() + "h";
     	     if( d.getMinutes() < 10){
     	     	dS+='0';
     	     }
             dS += d.getMinutes();
   		     return dS;
		},
		matchDateDDMMYY: function(d){
			
			var d = new Date(d);

			var day = d.getDate();
			var month = d.getMonth() + 1 + '';
			var year = (d.getFullYear()+'').substring(4,2);

			return day + '/' + month + '/' + year;
			
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

            var imgTagHTML = imgTag.prop('outerHTML');

            var chatId = LJ.fn.buildChatId( LJ.user.hostedEventId, LJ.user._id, a._id );

            var chatWrap = '<div class="chatWrap chat-host none" data-chatid="'+chatId+'">'
                            +'<div class="chatLineWrap"></div>'    
                            +'<div class="chatInputWrap">'
                            +  '<input type="text" value="" placeholder="Are you alone ?">'
                            +  '<input type="submit" value="">'
                            +'</div>'
                           +'</div>';

            var html =  '<div class="a-item '+className+'" data-askerid="'+a._id+'">'
                           +'<div class="a-picture">'
                             + imgTagHTML
                           +'</div>'
                           +'<div class="a-birth">Membre depuis le ' + LJ.fn.matchDateDDMMYY( a.signupDate ) + '</div>'
	                           +'<div class="a-body">'
	                             +'<div class="a-name"><span class="label">Name</span>'+a.name+'</div>'
	                             +'<div class="a-age"><span class="label">Age</span>'+a.age+' ans'+'</div>'
	                             +'<div class="a-desc"><span class="label">Style</span><div>'+a.description+'</div></div>'
	                             +'<div class="a-drink"><span class="label">Drink</span><div class="drink selected">'+a.favoriteDrink+'</div></div>'
                           +'</div>'
	                             +'<div class="a-btn">'
	                             	 +'<button class="themeBtnToggle btn-chat"><i class="icon icon-chat"></i></button>'
	                                 +'<button class="themeBtn btn-accept"><i class="icon icon-ok-1"></i></button>'
	                            	 +'<button class="themeBtn btn-refuse"><i class="icon icon-cancel-1"></i></button>'
	                           +'</div>'
                        + chatWrap
                    +'</div>';

            return html;

        },
        renderAskerThumb: function( o ){

        		var a = o.asker;
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

        	var html = '<div data-hint="'+a.name+'"data-askerid="' + a._id + '" class="imgWrapThumb hint--top '+ myClass + '">'
        				+'<i class="icon icon-cancel-1 askerRefused none"></i>'
        				+'<i class="icon icon-ok-1     askerAccepted none"></i>'
        				//+'<i class="icon icon-help-1 "></i>'
        				+ imgTagHTML
        				+ imgTagBlackWhiteHTML
        				+ '</div>';

        	return html;

        },
        renderAskersThumbs: function( maxGuest ){

        	var html = '',
        		L = maxGuest || LJ.myAskers.length;

        	for( var i = 0; i < L ; i++ )
        	{
        		var o = {};

        		if( i < LJ.myAskers.length )
        		{
	        		o.asker = LJ.myAskers[i];
	        		i == 0 ?  o.myClass = 'active' : o.myClass = '';

        			html += LJ.fn.renderAskerThumb( o );
        		}
        		else
        		{
        			o.asker = {}
        			o.asker._id 	= 'placeholder';
        			o.asker.imgId 	= LJ.cloudinary.placeholder_id;
        			o.myClass 		= 'placeholder';
		
        			html += LJ.fn.renderAskerThumb( o );

        		}
        		

        	}

        	return html;

        },
        renderOverlayUser: function( imgId, imgVersion ){

        	var d = LJ.cloudinary.displayParamsOverlayUser;
					d.version = imgVersion;

				var imgTag = $.cloudinary.image( imgId, d ).prop('outerHTML');

				return '<div class="largeThumb">'
					     + imgTag
					    +'</div>'

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
        renderFriendRequestButton: function( user ){

            var html = '';
                html += '<button class="themeBtn"><i class="icon icon-ok"></i></button>';
            return html;

        },
        renderAddFriendToPartyButton: function( user, inEvent ){

            var html = '';
            
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
                html = '';


            if( !u || !w ){
                return alert('Cannot format user');
            }

            if( w == 'searchWrap' )
            {
                var cl     = 'u';
                var friendButton = LJ.fn.renderFriendRequestButton( u );
            }

            if( w == 'eventsWrap' )
            {
                var cl = 'f'; 
                var friendButton = '<button class="none"></button>' // sera remove tout de suite par displayButtons...();       
            }
            /*TBI*/
            if( w == 'friendsWrap' )
            {
                var cl = 'f';
            }

                var d = LJ.cloudinary.displayParamsAskerThumb;
                    imgId = u.imgId;
                    d.version = u.imgVersion;
                    d.radius = '5';

                var imgTagHTML = $.cloudinary.image( imgId, d ).prop('outerHTML');

                html += '<div class="'+cl+'-item" data-username="'+u.name.toLowerCase()+'"'
                          + 'data-userid="'+u._id+'"'
                          + 'data-userdrink="'+u.favoriteDrink.toLowerCase()+'"'
                          + 'data-userage="'+u.age+'">'
                          +'<div class="u-head imgWrapThumb">'
                            + imgTagHTML
                          +'</div>'
                          +'<div class="'+cl+'-body">'
                            + '<span class="'+cl+'-name">'+ u.name + '</span>'
                            + '<span class="'+cl+'-age">'+ u.age +' ans, drinks</span>'
                            + '<span class="'+cl+'-favdrink">'+ u.favoriteDrink +'</span>'
                          +'</div>'
                            + friendButton
                        +'</div>';

            return html;

        },
        renderUsersInSearch: function(){

        	var html = '';

        	for( var i = 0; i < LJ.myUsers.length ; i++ )
            {   
                html += LJ.fn.renderUser( { user: LJ.myUsers[i], wrap: 'searchWrap'} );
        	}

        	return html;

        },
        renderUsersInFriendlist: function(){

            var html = '';

                var fL = LJ.myFriends,
                    L = fL.length;

                for( var i = 0 ; i < L ; i++ )
                {
                    html += LJ.fn.renderUserInFriendlist( fL[i] );
                }
                        
                html += '</div></div>';

                return html;

        },
        renderUserInFriendlist: function( friend ){
			if(!friend) return ''
            if( friend.status == 'hosting' ) return '';
            if( _.find( LJ.user.friendList, function(el){ return el.friendId == friend._id }).status == 'askedMe' ) return '';
            if( _.find( LJ.user.friendList, function(el){ return el.friendId == friend._id }).status == 'askedHim' ) return '';
            return LJ.fn.renderUser({ user: friend, wrap: 'eventsWrap' });
        }

});