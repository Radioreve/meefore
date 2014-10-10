
function sleep(ms,cb,p2){setTimeout(function(){cb(p2);},ms)}
window.csl = function(msg){
	console.log(msg);
};

var el;

//Penser à update le state après une img upload

window.LJ = {
	params:{
		socket    :  null,
		domain	  : "http://87.247.105.70:1337"
	},
	ui:{
		artificialDelay: 600
	},
	cloudinary:{
		uploadParams: {
			cloud_name:"radioreve",
			api_key:"835413516756943"
		},
		displayParamsProfile: {
				cloud_name :"radioreve",
				width:150,
				height:150,
			//	effect:'grayscale',
				crop:'fill',
				gravity:'face'
		},
		displayParamsEvent: {
				cloud_name :"radioreve",
				width:80,
				height:80,
			//	effect:'sepia',
				crop:'fill',
				gravity:'face',
				radius:'max'
		},
		displayParamsMainThumb: {
				cloud_name :"radioreve",
				width:50,
				height:50,
			//	effect:'grayscale',
				crop:'fill',
				gravity:'face',
				radius:'max'
		},
        displayParamsAsker:{
                cloud_name :"radioreve",
                width:45,
                height:45,
                crop:'fill',
                gravity:'face',
            //   effect:'grayscale',
                radius:7
        }
	},
	vel:{
		duration:400,
		begin: function(){
			csl('Animating begin from globals');
		},
		complete: function(){
			csl('Animating completed from globals');
		}
	},
	user:{
		_id:'',
		name:'',
		email:'',
		age:'',
		location:'',
		description:'',
		imgId:'',
		imgVersion:'',
		status:'',
		hostedEventId:'',
		eventsAskedList:[]
	},
	myEvents:[],
    myAskers:[],
    chatPile:[],
	state: {
		fetchingEvents: false,
        fetchingAskers: false,
		animatingContent: false,
		animatingChat: false,
		jspAPI:{}
	},
        $body                 : $('body'), 
		$loginWrap		 	  : $('#loginWrap'),
		$signupWrap			  : $('#signupWrap'),
		$profileWrap	      : $('#profileWrap'),
		$eventsWrap		      : $('#eventsWrap'),
		$manageEventsWrap     : $('#manageEventWrap'),
        $askersListWrap       : $('#askersListWrap'),
		$thumbWrap			  : $('#thumbWrap'),
		$loginBtn  	          : $('#login'),
		$signupBtn            : $('#signup'),
		$emailInput           : $('#email'),
		$passwordInput        : $('#pw'),
		$lostPassword         : $('#lost_pw'),
		$emailInputSignup     : $('#emailSignup'),
		$passwordInputSignup  : $('#pwSignup'),
		$passwordCheckInput   : $('#pwCheckSignup'),
		$backToLogin          : $('#b_to_login'),
		$becomeMember         : $('#bcm_member'),
		$validateBtn          : $('#validate'),
		$nameInput            : $('#name'),
		$ageInput             : $('#age'),
		$descInput	          : $('#description'),
		$locationInput        : $('#location'),
		$loaderWrap 	      : $('.loaderWrap'),
		$menuBtn		      : $('.menuBtn'),
		$contactMenu          : $('#contact'),
		$profileMenu          : $('#profile'),
		$eventsMenu           : $('#events'),
		$createMenu			  : $('#create'),
		$createEventWrap	  : $('#createEventWrap'),
		$createEventBtn       : $('#createEventBtn'),
		$eventNameInput       : $('#eventName'),
		$eventLocationInput   : $('#eventLocation'),
		$eventHourInput       : $('#eventHour'),
		$eventMinutInput      : $('#eventMinut'),
		$eventDescriptionInput: $('#eventDescription'),
		$contentWrap          : $('#contentWrap'),
		$contactWrap          : $('#contactWrap'),
		$menuWrap             : $('#menuWrap'),
		$toastSuccess         : $('#toastSuccess'),
		$toastError           : $('#toastError'),
		$toastInfo  		  : $('#toastInfo'),
		$eventsListWrap       : $('#eventsListWrap'),
		$logout				  : $('#logout'),
		 
	utils:{
		dateHHMM: function(d){
	    	 var dS = '';
    	     if(d.getUTCHours()==0){dS = '0';}
	       	  dS += d.getUTCHours() + "h";
     	     if(d.getUTCMinutes()<10){dS+='0';}
              dS+=d.getUTCMinutes();
   		     return dS;
		}
	},
	fn:{
		init: function(){
				/*Bind any UI action with the proper handler */
				LJ.fn.handleDomEvents();

				/*Global UI Settings ehanced UX*/
				LJ.fn.initEhancements();


		},
		initSocketConnection: function(jwt){
			LJ.params.socket = io.connect({
				query:'token='+jwt
			});
			LJ.fn.initEventListeners();

		},
		initEhancements: function(){
			(function bindEnterKey(){ //Petite IIEF pour le phun

				$('#loginWrap').on('keypress','input.input-field',function(e){
					if(e.which=='13'){
						e.preventDefault();
						$('#login').click();
					}
				});

				$('#signupWrap').on('keypress','input.input-field',function(e){
					if(e.which=='13'){
						e.preventDefault();
						$('#signup').click();
					}
				});

				$('.profileInput').on('change keypress',function(){
					$(this).addClass('modified');
				});

				LJ.$body.on('click', '.themeBtn',function(){
					$(this).addClass('validating-btn');
				});
 
				LJ.$body.on('focusout', '.askInMsgWrap input', function(e){
					if($(this).val().trim().length==0){
						$(this).removeClass('text-active').val('');}
					else{$(this).addClass('text-active');}
				}); 

				LJ.$body.on('mousedown','.chatWrap',function(){
					csl('Hello');
					var $that = $(this);
					_.remove( LJ.chatPile, function(el){
						return el.is($that);
					});
					LJ.chatPile.push($that);
					LJ.fn.setChatIndexes(LJ.chatPile);               
	                $that.find('input[type="text"]').focus();
               		
            	});

            	LJ.$body.on('keypress','.chatInputWrap input[type="text"]', function(e){
            		if(e.which=='13'){
            			$(this).siblings('input[type="submit"]').click();
            		}
            	});
			
			})();
				
		},
		handleDomEvents: function(){

			$('body *').each(function(){
				$(this).on('click', function(e){
					e.stopPropagation();
					e.preventDefault();
					el = $(this);
				});
			});

			LJ.$signupBtn.click(function(e){ 
				e.preventDefault(); 
				csl('About to Signup User')
				LJ.fn.signupUser(); 
			});

			LJ.$loginBtn.click(function(e){	
				e.preventDefault();
				LJ.fn.loginUser();	
			});

			LJ.$becomeMember.click(function(){
				LJ.fn.updateView(LJ.$signupWrap);
			});

			LJ.$backToLogin.click(function(){
				LJ.fn.updateView(LJ.$loginWrap);
			});

			LJ.$menuBtn.click(function(){
				LJ.fn.toggleMenu();
			});

			LJ.$contactMenu.click(function(){
				if(!$(this).hasClass('menu-item-active')){
			   	  LJ.fn.updateMenuView(LJ.$contactMenu);
				  LJ.fn.updateView(LJ.$contactWrap);
				}
			});

			LJ.$createMenu.click(function(){
				if(!$(this).hasClass('menu-item-active')){
				  LJ.fn.updateMenuView(LJ.$createMenu);
				 $(this).hasClass('created') ? LJ.fn.updateView(LJ.$manageEventsWrap) : LJ.fn.updateView(LJ.$createEventWrap);
				}
			});

			LJ.$profileMenu.click(function(){
				if(!$(this).hasClass('menu-item-active')){
				  LJ.fn.updateMenuView(LJ.$profileMenu);
				  LJ.fn.updateView(LJ.$profileWrap);
				}
			});

			LJ.$eventsMenu.click(function(){
				if(!$(this).hasClass('menu-item-active')){
			  	  LJ.fn.updateMenuView(LJ.$eventsMenu);
				  LJ.fn.updateView(LJ.$eventsWrap);
				}
			});

			LJ.$validateBtn.click(LJ.fn.updateProfile);

			LJ.$body.on('click','.askIn',function(){
				var $self = $(this);
				if(!$self.hasClass('validating-btn')){
					$self.addClass('validating-btn');
					$self.text('En attente');
					LJ.fn.requestIn($self); 
				}else{
				var $eHead = $self.parents('.eventItemWrap').find('.e-head');
					if($eHead.hasClass('e-active')) $eHead.click(); 
					$self.removeClass('validating-btn');
					$self.text('Je veux y aller');
					LJ.fn.requestOut($self);
				}
			});

			LJ.$body.on('click','.themeBtnToggleHost', function(){
				LJ.$createMenu.click();
			});

			LJ.$createEventBtn.click(function(){
				LJ.fn.createEvent();
			});

			LJ.$logout.click(function(){
				location.reload();
			});

            LJ.$askersListWrap.on('click','.askerPicture',function(){
            	var $that = $(this);
            	if(! $that.hasClass('moving') ){
            		$that.addClass('moving');
            		LJ.fn.toggleChatWrapAskers($that);     
            	
            		sleep(600, function(){
            			$that.removeClass('moving');
            		});
            	}

            });

            LJ.$eventsListWrap.on('click', '.e-head', function(){
                LJ.fn.toggleChatWrapEvents($(this));
            });

            LJ.$body.on('click','.chatInputWrap input[type="submit"]', function(e){
            	e.preventDefault();
            	e.stopPropagation();
            	LJ.fn.sendChat($(this));
            });

            LJ.$body.on('click','#cancelEvent', function(){
            	var $self = $(this),
            	    hostId = LJ.user._id,
            	    eventId = LJ.user.hostedEventId;

            	LJ.fn.cancelEvent(eventId, hostId);
            });
			



		},
		signupUser: function(credentials){

			   credentials = {} ;

				credentials.email = LJ.$emailInputSignup.val();
				credentials.password = LJ.$passwordInputSignup.val();	
				//csl("Posting this : " +JSON.stringify(credentials,0,4))

			$.ajax({
				method:'POST',
				url:'/signup',
				dataType:'json',
				data : {
					email    : credentials.email,
					password : credentials.password
				},
				beforeSend : function(){
					LJ.fn.handleBeforeSendSignup();
				},
				success: function(data){
					data.email    = credentials.email;
					data.password = credentials.password;
					LJ.fn.handleSuccessSignup(data);
				},
				error : function(data){
					LJ.fn.handleFailedSignup(data);
				}
			});
		},
		loginUser: function(credentials){

			    credentials = credentials || {} ;

				credentials.email    = credentials.email    || LJ.$emailInput.val();
				credentials.password = credentials.password || LJ.$passwordInput.val();

			$.ajax({
				method:'POST',
				url:'/login',
				dataType:'json',
				data : {
					email   :  credentials.email,
					password : credentials.password
				},
				beforeSend:function(){
					LJ.fn.handleBeforeSendLogin();
				},
				success:function(data){
					LJ.fn.handleSuccessLogin(data);
				},
				error:function(data){
					LJ.fn.handleFailedLogin(data);
				}
			});
		},
		updateProfile: function(){
			var _id 		 = LJ.user._id,
				age   		 = LJ.$ageInput.val(),
				name  		 = LJ.$nameInput.val(),
				description  = LJ.$descInput.val();

			if(LJ.user.status == 'new'){LJ.user.status = 'idle'}

			var profile = {
				_id			: _id,
				age 		: age,
				name 		: name,
				description : description,
				status      : LJ.user.status
			};
				LJ.params.socket.emit('update profile', profile);
				csl('Emetting update profile');
				LJ.$loaderWrap.removeClass('none');	
		},
		handleBeforeSendLogin: function(){
			LJ.$loginBtn.val('Loading');
			LJ.fn.fadeOut(LJ.$becomeMember);
			LJ.$loaderWrap.removeClass('none');
			$('input.input-field').addClass('validating');
		},
		handleSuccessLogin: function(user){
			sleep(LJ.ui.artificialDelay,function(){ 

				/*
				/* La requête AJAX ne revoit que les données sur l'utilisateurs.
				/* On va ensuite chercher immédiatement les informations sur les events
				/* Via la connexion socket authentifiée 
				*/

				LJ.fn.initSocketConnection(user.token);
				LJ.fn.initCloudinary(user.cloudTag);

				// Internal State Update
				LJ.fn.setClientSettings(user);
				LJ.fn.fetchEvents();
				LJ.fn.reloadRooms(LJ.user._id);

				// User Interface Update
				LJ.$loaderWrap.addClass('none');
				$('#codebar').text(user._id);
				LJ.fn.renderMainThumb();

				LJ.fn.replaceMainImage(LJ.user.imgId,
							           LJ.user.imgVersion,
							           LJ.cloudinary.displayParamsProfile);

				sleep(350,function(){
					LJ.fn.toggleMenu();
					LJ.fn.fadeIn(LJ.$thumbWrap);
				});

				switch (LJ.user.status){
					case 'new':
						LJ.fn.displayViewAsNew();
						break;
					case 'idle':
						LJ.fn.displayViewAsIdle();
						break;
					case 'hosting':
						LJ.fn.displayViewAsHost();
						break;
					default:
						alert('No status available');
				}
			});
		},
		handleFailedLogin: function(data){
			data = JSON.parse(data.responseText);
			sleep(LJ.ui.artificialDelay,function(){
				LJ.fn.toastMsgInfo(data.msg);
				$('input.input-field').removeClass('validating');
				LJ.fn.fadeIn(LJ.$becomeMember);
				LJ.$loaderWrap.addClass('none');
				LJ.$loginBtn.val('Login');
			});
		},
		handleBeforeSendSignup: function(){
			LJ.fn.fadeOut(LJ.$backToLogin);
			$('.loaderWrap').removeClass('none');
			$('input.input-field').addClass('validating');
		},
		handleSuccessSignup: function(data){
			sleep(LJ.ui.artificialDelay,function(){
				$('.loaderWrap').addClass('none');
				LJ.fn.loginUser(data);
			});		
		},
		handleFailedSignup: function(data){
			data = JSON.parse(data.responseText);
			sleep(LJ.ui.artificialDelay,function(){
				$('input.input-field').removeClass('validating');
				LJ.fn.toastMsgInfo(data.msg);
				LJ.fn.fadeIn(LJ.$backToLogin);
				$('.loaderWrap').addClass('none');
			});
		},
		fadeInLeft: function(el, options){
			var o = LJ.vel;
			if( _.isObject(options)){
				o = LJ.fn.updateObject(o, options);
			}
			el.velocity("transition.slideLeftIn");    
		},
		fadeOutRight: function(el, options){ 
			var o = LJ.vel; 
			if( _.isObject(options)){
				o = LJ.fn.updateObject(o, options);
			}
			console.log(o);
			el.velocity("transition.slideRightOut",o); 
		},
		updateView: function(){

			for(var i=0; i<arguments.length; i++){

				if(! _.isObject(arguments[i]) ){
					console.log('Wrong format for updating view');
					return;
				}

				switch arguments[i].anim{
					case 'slideLeftIn':
						arguments[i].$el.velocity('transition.slideLeftIn');
					break;

					case 'slideRightIn':
						arguments[i].$el.velocity('transition.slideRightIn');
					break;

					case 'slideLeftOut':
						arguments[i].$el.velocity('transition.slideLeftOut');
					break;

					case 'slideRightOut':
						arguments[i].$el.velocity('transition.slideRightOut');
					break;

					default:
						alert('Animation not recognized');
					break;
				}

			};
					
		},
		toggleAnimatingState: function(){
			LJ.state.animatingContent ? LJ.state.animatingContent = false : LJ.state.animatingContent = true ;
		},
		displayViewAsNew: function(){
			LJ.fn.updateView(LJ.$profileWrap);
		},
		displayViewAsIdle: function(){
			LJ.fn.updateView(LJ.$eventsWrap);
            $('.menu-item-active').removeClass('menu-item-active');
            LJ.$eventsMenu.addClass('menu-item-active');

		},
		displayViewAsHost: function(){
            LJ.fn.fetchAskers();
			LJ.fn.updateView(LJ.$manageEventsWrap);
			$('.menu-item-active').removeClass('menu-item-active');
			LJ.$createMenu.addClass('created menu-item-active')
						  .removeClass('icon-plus')
						  .addClass('icon-minus')
						  .find('span')
						  .text('Management');
		},
		toggleMenu: function(){
			var that = LJ.$menuBtn;
				if(that.hasClass('menuBtnActive')){
					that.removeClass('menuBtnActive');
				}
				else{
					that.addClass('menuBtnActive');
				}
		},
		toggleChatWrapAskers: function(askerPictureTag){

			var $chatWrap = askerPictureTag.parents('.a-row').find('.chatWrap');
        	
                if(!askerPictureTag.hasClass('a-active')){
                    askerPictureTag.addClass('a-active');
                	LJ.chatPile.push($chatWrap);
                    LJ.fn.displayChat($chatWrap);
             		LJ.fn.setChatIndexes(LJ.chatPile);

                }else{
                    askerPictureTag.removeClass('a-active');
                    _.remove(LJ.chatPile, function(el){
                    	return el.is($chatWrap);
                    });
                 	LJ.fn.setChatIndexes(LJ.chatPile);
                    LJ.fn.hideChat($chatWrap);
                }          
		},
		toggleChatWrapEvents: function(eHeadTag){
			 var $chatWrap = eHeadTag.siblings('.chatWrap');
                if(eHeadTag.siblings('.askInWrap').find('button').hasClass('validating-btn')){
                    if(!eHeadTag.hasClass('e-active')){
                        eHeadTag.addClass('e-active');
                        LJ.fn.displayChat($chatWrap);
                    }
                    else{
                        eHeadTag.removeClass('e-active');
                        LJ.fn.hideChat($chatWrap);
                    }
                }
                else{
                    LJ.fn.toastMsgInfo('You need to ask participation to chat with the host');
                }
		}, 
		toggleCreateEventMenu: function(){
			var el = LJ.$createMenu;
			if(el.hasClass('created')){
				el.removeClass('created')
				  .removeClass('icon-minus')
				  .addClass('icon-plus')
				  .find('span')
				  .text('Create');
			}else{
				el.addClass('created')
				  .removeClass('icon-plus')
				  .addClass('icon-minus')
				  .find('span')
				  .text('Management');
			}
		},
		updateMenuView: function(el){
			if(!LJ.state.animatingContent){
			if(!el.hasClass('menu-item-active')){
					$('.menu-item-active').removeClass('menu-item-active');
					el.addClass('menu-item-active');
				}
			}
		},
		setClientSettings: function(data){
			//csl('Updating client state : '+JSON.stringify(data,0,4));
            LJ.user = data;
			//User Interface Update
			LJ.fn.updateSettingsDOM();
		},
		updateClientSettings: function(newSettings){
			_.keys(newSettings).forEach(function(el){
				LJ.user[el] = newSettings[el];
			});
		},
		/* Updates o1 with o2 properties, if existants in o1 only
		   Example of usage : var o = LJ.updateObject(LJ.params, preferences); 
		*/
		updateObject: function(o1,o2){
			_.keys(o2).forEach(function(key){
					o1[key] = o2[key];
			});
			return o1;
		},
		updateSettingsDOM: function(){
			LJ.$nameInput.val(LJ.user.name);
			LJ.$ageInput.val(LJ.user.age);
			LJ.$descInput.val(LJ.user.description);
		},
		toastMsgSuccess: function(msg){
			var toast = LJ.$toastSuccess;
				toast.find('.toastMsg').text(msg);
			LJ.fn.fadeInLeft(toast);
			sleep(3000,function(){
				LJ.fn.fadeOutRight(toast);
			});
		},
		toastMsgError: function(msg){
			var toast = LJ.$toastError;
				toast.find('.toastMsg')
					 .text(msg);
				toast.removeClass('none');
				toast.on('click', function(){
					 	$(this).addClass('none');
					 });
		},
		toastMsgInfo: function(msg){
			var toast = LJ.$toastInfo;
				toast.find('.toastMsg').text(msg);
			LJ.fn.fadeInLeft(toast);
			sleep(3000,function(){
				LJ.fn.fadeOutRight(toast);
			});
		},
		replaceMainImage: function(id,version,d){
		        d = d || LJ.cloudinary.displayParamsProfile;
		    	d.version = version;

			var previousImg = $('#pictureWrap').find('img'),
				newImg      = $.cloudinary.image(id, d); 
				newImg.addClass('mainPicture').hide();
				$('#pictureWrap').prepend(newImg);
 													
				previousImg.fadeOut(700, function(){
					$(this).remove();
					newImg.fadeIn(700);
				});

		},
		replaceThumbImage: function(id,version,d){
			    d = d || LJ.cloudinary.displayParamsMainThumb;
				d.version = version;

			var previousImg = $('#thumbWrap').find('img'),
				newImg      = $.cloudinary.image(id,d);
				newImg.hide();

				$('#thumbWrap').prepend(newImg);

				previousImg.fadeOut(700, function(){
					$(this).remove();
					newImg.fadeIn(700);
				});
		},
		initCloudinary: function(upload_tag){

			$.cloudinary.config(LJ.cloudinary.uploadParams);
			$('.upload_form').append(upload_tag);
			$('.cloudinary-fileupload')

				.bind('fileuploadprogress',function(e,data){
  							$('.progress_bar').css('width', 
    						Math.round((data.loaded * 100.0) / data.total) + '%');

				}).bind('cloudinarydone',function(e,data){
  							//csl(JSON.stringify(data.result,0,4));

  							sleep(LJ.ui.artificialDelay,function(){
  								$('.progress_bar').fadeOut(function(){
  									$(this).css({width:"0%"}).fadeIn();
  									});

  								LJ.fn.toastMsgInfo('Votre photo de profile a été modifiée');

  								var imgId=data.result.public_id;
  								var imgVersion = data.result.version;

                                LJ.user.imgVersion = imgVersion;
                                LJ.user.imgId = imgId;

  								LJ.params.socket.emit('update picture',{_id: LJ.user._id,
  																		imgId: imgId,
  																		imgVersion:imgVersion });

  								LJ.fn.replaceMainImage(imgId,imgVersion,LJ.cloudinary.displayParamsProfile);
  								LJ.fn.replaceThumbImage(imgId,imgVersion,LJ.cloudinary.displayParamsMainThumb);
					
  							});

  				}).cloudinary_fileupload();
  				

		},
		renderEvents: function(arr,max){
				var html =''; 
				    max = max || arr.length;
				for(var i=0;i<max;i++){ html += LJ.fn.renderEvent(arr[i]); }
				return html;
		},
        renderAskers: function(arr,max){
                var html =''; 
                    max = max || arr.length;
                for(var i=0;i<max;i++){ html += LJ.fn.renderAsker(arr[i]); }
                return html;
        },
		renderEvent: function(e){
			var d = LJ.cloudinary.displayParamsEvent;
				d.version = e.hostImgVersion;

			var chatId = LJ.fn.buildChatId(e._id, e.hostId, LJ.user._id);
            var chatWrap = '<div class="chatWrap chat-asker" data-chatid="'+chatId+'">'
                           +'<div class="tri"></div>'
                            +'<div class="chatLineWrap"></div>'    
                            +'<div class="chatInputWrap">'
                            +  '<input type="text" value="" placeholder="say something..">'
                            +  '<input type="submit" value="">'
                            +'</div>'
                           +'</div>';
			
			var imgTag = $.cloudinary.image(e.hostImgId, d).prop('outerHTML'); // Thanks StackoverFlow	

			var button = '<div class="askInWrap"><button class=" ';
			
			if(e.hostId == LJ.user._id){
				button += 'right themeBtnToggle themeBtnToggleHost"> Management'	
			} else {
				button += 'askIn themeBtnToggle right';
				LJ.user.eventsAskedList.indexOf(e._id)>-1? button+=' validating-btn "> En attente' : button+='">Je veux y aller';
			}
				button+="</button></div>";

			var html = '<div class="eventItemWrap none" data-eventid="'+e._id+'" data-hostid="'+e.hostId+'">'
						+'<div class="e-head hint--left" data-hint="'+e.hostName+'">' + imgTag 
						+'<div class="e-itm e-hour e-weak">'+LJ.utils.dateHHMM(new Date(e.beginsAt))+'</div>'
						+'</div>'
						+'<div class="e-body">'
						   +'<div class="e-itm e-name">'+e.name+'</div>'
						   +'<div class="e-row">'
						     +'<i class="left icon icon-direction"></i><div class="e-itm e-location e-weak">'+e.location+'</div>'
						   +'</div>'
						   +'<div class="e-row">'
						     +'<i class="left icon icon-lamp"></i><div class="e-itm e-description e-weak">'+e.description+'</div>'
						   +'</div>'
						+'</div>'
						+ button
                        + chatWrap
						+'</div>';
			return html;
		},
        renderAsker: function(a){
            var d = LJ.cloudinary.displayParamsAsker;
            	d.version = a.imgVersion; // Ne fonctionne pas car le param 'a' provient de la base qui est pas MAJ

            var imgTag = $.cloudinary.image(a.imgId,d).prop('outerHTML');

            var chatId = LJ.fn.buildChatId( LJ.user.hostedEventId, LJ.user._id, a.id );

            var chatWrap = '<div class="chatWrap chat-host none" data-chatid="'+chatId+'">'
                           +'<div class="tri"></div>'
                            +'<div class="chatLineWrap"></div>'    
                            +'<div class="chatInputWrap">'
                            +  '<input type="text" value="" placeholder="say something..">'
                            +  '<input type="submit" value="">'
                            +'</div>'
                           +'</div>';

            var html =  '<div class="a-row">'
                        +'<div class="askerPicture">'
                          + imgTag
                        +'</div>'
                        +'<div class="askerInfos" data-userid="'+a.id+'">'
                          +'<div class="a-name">'+a.name+'</div>'
                          +'<div class="a-age">'+a.age+' ans'+'</div>'
                          +'<div class="a-desc">'+a.description+'</div>'
                        +'</div>'
                        + chatWrap
                    +'</div>';
            return html;
        },
		renderMainThumb: function(){
			var d = LJ.cloudinary.displayParamsMainThumb;
				d.version = LJ.user.imgVersion;

			var imgTag = $.cloudinary.image(LJ.user.imgId, d);
				imgTag.addClass('left');

			LJ.$thumbWrap.prepend( imgTag );
			LJ.$thumbWrap.find( 'h2#thumbName' ).text( LJ.user.name );

		},
        displayChat: function(chatWrap){
        	var chatId = chatWrap.data('chatid');
            LJ.fn.fadeIn(chatWrap);
            if(LJ.state.jspAPI[chatId] != undefined){
	            LJ.state.jspAPI[chatId].reinitialise();
	        	LJ.state.jspAPI[chatId].scrollToBottom();   
        	}                 
        },
        hideChat: function(chatWrap){
            LJ.fn.fadeOut(chatWrap);
        },
        setChatIndexes: function(chatPile){
        	var l = chatPile.length;
        	chatPile.forEach(function(chatEl){
        		var i = chatPile.indexOf(chatEl);
        		var z = '0'
        		i == l - 1 ? z = '100'  :  z = '1' ;
        		chatEl.css({"z-index": z});  
        	});
        },
		initEventListeners: function(){

				LJ.params.socket.on('update profile success', function(data){

					csl('update profile success received');
					sleep(LJ.ui.artificialDelay,function(){
						LJ.fn.updateClientSettings(data);
						$('#thumbName').text(data.name);
						LJ.fn.toastMsgInfo("Vos informations ont été modifiées");
						$('.modified').removeClass('modified');
						LJ.$loaderWrap.addClass('none');
						$('.themeBtn').removeClass('validating-btn');
						$('.themeBtn').removeClass('validating-btn');
						});
				});

				LJ.params.socket.on('update profile error',function(){

					sleep(LJ.ui.artificialDelay,function(){
					LJ.$loaderWrap.addClass('none');
					alert('Error updating profile');
					});			
				});

				LJ.params.socket.on('update image success', function(data){

					LJ.fn.updateClientSettings(data);
					csl(JSON.stringify(data,0,4));
				});

				LJ.params.socket.on('client connected',function(){

					csl('Client authenticated on the socket stream');
				});

				LJ.params.socket.on('create event success', function(myEvent){
					
					var eventId = myEvent._id,
						hostId = myEvent.hostId;

					if( LJ.user._id === hostId ){
						sleep( LJ.ui.artificialDelay, function(){
							LJ.user.status = 'hosting';
							LJ.user.hostedEventId = eventId;
							LJ.fn.toastMsgInfo("Evènement créé avec succès !");
							LJ.$loaderWrap.addClass('none');
							$('.themeBtn').removeClass('validating-btn');
							LJ.$createEventWrap.find('input').val('');
							LJ.fn.updateView(LJ.$manageEventsWrap);
							LJ.fn.toggleCreateEventMenu(); 
						});
					} else {
						//rien de spécial so far
					}

					/* Pour tous les users */
					LJ.myEvents.push( myEvent );
					var eventHTML = LJ.fn.renderEvent( myEvent );
					LJ.$eventsListWrap.append( eventHTML );
					LJ.fn.fadeIn( LJ.$eventsListWrap.children() );
					
				});

				LJ.params.socket.on('create event error', function(data){

					sleep(LJ.ui.artificialDelay,function(){
						LJ.fn.toastMsgError( data.msg );
						LJ.$loaderWrap.addClass('none');
						$('.themeBtn').removeClass('validating-btn');
					});
				});

				LJ.params.socket.on('cancel event success', function(data){

                	if( data.hostId == LJ.user._id ){
                		LJ.user.status = 'idle';
                		LJ.$manageEventsWrap.find('#askersListWrap').html('');
                		LJ.fn.toggleCreateEventMenu();
                		LJ.fn.updateView(LJ.$createEventWrap);
						$('.menu-item-active').removeClass('menu-item-active');
						LJ.$createMenu.addClass('menu-item-active')
						  .removeClass('icon-minus created')
						  .addClass('icon-plus')
						  .find('span')
						  .text('Create');		
                	} else {
                		/* 
                			Les clients sont toujours dans les rooms des évents annulés,
               				pour leur session active. En revanche, les events auxquels
               				ils sont inscrits sont supprimés de leur liste dans la base 
               			*/
                	}
                	var canceledEvent = LJ.$eventsListWrap.find('.eventItemWrap[data-hostid="'+data.hostId+'"]');
                		LJ.fn.fadeOut(canceledEvent);
                		sleep(600, function(){ canceledEvent.remove(); });

                	_.remove(LJ.myEvents, function(el){
                		return el.hostId == data.hostId; 
                	});
                });
 
				LJ.params.socket.on('fetch events success', function(events){
					LJ.state.fetchingEvents = false;
					for(var i=0;i<events.length;i++){
						LJ.myEvents[i] = events[i];
					}
					LJ.fn.displayEvents();
				});

				LJ.params.socket.on('request participation in success', function(data){

					var hostId = data.hostId,
						userId = data.userId,
						asker  = data.asker;

					console.log('Requestion participation in received');
					if(LJ.user._id === data.userId){
						LJ.fn.toastMsgSuccess('You may now chat with the host');
					}else{
						var askerHTML = LJ.fn.renderAsker(data.asker);
						    $(askerHTML).appendTo(LJ.$askersListWrap);

						 LJ.myAskers.push(asker);
						}

				});

				LJ.params.socket.on('request participation out success', function(data){

						var userId = data.userId,
							hostId = data.hostId,
							eventId = data.eventId;

						var chatId = LJ.fn.buildChatId(eventId, hostId, userId);
						var $aRow = LJ.$askersListWrap.find('.askerInfos[data-userid="'+userId+'"]').parents('.a-row');
						var $chatWrapAsHost = LJ.$askersListWrap.find('.chatWrap[data-chatid="'+chatId+'"]');
						var $chatWrapAsUser = LJ.$eventsListWrap.find('.chatWrap[data-chatid="'+chatId+'"]');

						_.remove( LJ.chatPile, function(el){
							return el.is($chatWrapAsHost);
						});

						_.remove( LJ.myAskers, function(asker){
							return asker.id === data.userId;
						});

						hostId === LJ.user._id ? LJ.fn.fadeOut($aRow, true) : LJ.fn.toastMsgInfo('Vous avez été désinscris de la liste');

				});

				LJ.params.socket.on('disconnect', function(){

					LJ.fn.toastMsgError("You have been disconnected from the stream");
					LJ.params.socket.disconnect(LJ.user._id);
				});

                LJ.params.socket.on('fetch askers success', function(askersList){

                    LJ.state.fetchingAskers = false;
                    for(var i=0;i<askersList.length;i++) {
                        LJ.myAskers[i] = askersList[i];
                    }
                   LJ.fn.displayAskers();
                });

                LJ.params.socket.on('receive message', function(data){


                	LJ.fn.addChatLine(data);
                });

                
		},
		createEvent: function(){
			var e = {};
				e.hostId	  = LJ.user._id;
				e.hostName   = LJ.user.name;
				e.hostImgId = LJ.user.imgId;
				e.hostImgVersion  = LJ.user.imgVersion;
				e.name 		  = LJ.$eventNameInput.val();
				e.location    = LJ.$eventLocationInput.val();
				e.hour 		  = LJ.$eventHourInput.val();
				e.min  		  = LJ.$eventMinutInput.val();
				e.description = LJ.$eventDescriptionInput.val();

				LJ.params.socket.emit('create event', e);
				LJ.$loaderWrap.removeClass('none');
		},
		fetchEvents: function(){
			if(LJ.state.fetchingEvents){ 
				LJ.fn.toastMsgError('Aleady fetching events');
			}else{
				LJ.state.fetchingEvents = true;
                LJ.params.socket.emit('fetch events', LJ.user._id );
            }
		},
        fetchAskers: function(){
            if(LJ.state.fetchingAskers){
                LJ.fn.toastMsgError("Already fetching askers");
            }else{
                LJ.state.fetchingAskers = true;
                LJ.params.socket.emit('fetch askers',{ eventId: LJ.user.hostedEventId, hostId: LJ.user._id });
            }
        },
        displayEvents: function(){
            LJ.$eventsListWrap.append(LJ.fn.renderEvents(LJ.myEvents));
            LJ.fn.fadeIn($('.eventItemWrap'));
        },
        displayAskers: function(){
            LJ.$askersListWrap.append(LJ.fn.renderAskers(LJ.myAskers));
        },
        requestIn: function(askInBtn){
            var eventId = askInBtn.parents('.eventItemWrap').data('eventid');
            var hostId = askInBtn.parents('.eventItemWrap').data('hostid');
            csl("requesting IN with id : "+eventId);
            LJ.params.socket.emit("request participation in", {
                            userInfos: LJ.user,
                            hostId: hostId,
                            eventId: eventId});
        },
        requestOut: function(askInBtn){
        	var eventId = askInBtn.parents('.eventItemWrap').data('eventid');
        	var hostId = askInBtn.parents('.eventItemWrap').data('hostid');        	
        	csl("requesting OUT with id : "+eventId);
        	LJ.params.socket.emit("request participation out", {
        					userInfos: LJ.user,
        					hostId: hostId,
        					eventId: eventId
        	});

        },
        sendChat: function(submitInput){
        	var textInput = submitInput.siblings('input[type="text"]');
        	var msg = textInput.val();
        		textInput.val('');

        		var askerId = submitInput.parents('.a-row').find('.askerInfos').data('userid')
        				 || LJ.user._id;
        		var hostId  = submitInput.parents('.eventItemWrap').data('hostid')
        				 || LJ.user._id;
        		var eventId = submitInput.parents('.eventItemWrap').data('eventid')
        		         || LJ.user.hostedEventId;

        		csl('Sending chat with id : '+eventId + ' and '+ hostId + ' and '+askerId);

        		LJ.params.socket.emit('send message',{
        			msg: msg,
        			eventId: eventId,
        			hostId: hostId,
        			askerId: askerId,
        			senderId: LJ.user._id
        		});
        },
        buildChatId: function(eventId, hostId, userId){
        	return eventId + '_' + hostId + '-' + userId;
        },
        /*
        	Ajoute une ligne en prennant comme paramètre:
        		- Le message (data.msg)
        		- Les ids définissant de manière unique un message entre 2 personnes
        		  (data.eventId - data.hostId - data.askerId) 
        		  utilisés pour construire une room unique 
        */
        addChatLine: function(data){
        	csl('Adding chatLine');
            var cha12 = '';
            data.senderId === LJ.user._id ?  cha12 = 'cha1' : cha12 = 'cha2';
            var chatLineHtml = '<div class="chatLine none">'
								+'<div class="cha '+cha12+'">'+data.msg+'</div>'
        						+'</div>';

       		var chatId = data.chatId;
       		
        	var $chatLineWrap = $('.chatWrap[data-chatid="'+chatId+'"]').find('.chatLineWrap');
        		if($chatLineWrap){csl('DOM Found');}
        		
        		if(!$chatLineWrap.hasClass('jspScrollable')){
        			$chatLineWrap.jScrollPane();
        			LJ.state.jspAPI[chatId] =  $chatLineWrap.data('jsp');
        		}
        		$chatLineWrap.find('.jspPane').append(chatLineHtml);
        		LJ.fn.fadeInLeft($chatLineWrap.find('.chatLine:last-child'));
        		LJ.state.jspAPI[chatId].reinitialise();
        		LJ.state.jspAPI[chatId].scrollToBottom();
        

        },
        reloadRooms: function(id){
        	LJ.params.socket.emit('load rooms', id );
        },
        cancelEvent: function(eventId, hostId){
        	LJ.params.socket.emit('cancel event',{ eventId: eventId, hostId: hostId });
        }
        

    }//end fn

}//end LJ

$('document').ready(function(){
		LJ.fn.init();
		csl('Application ready');
	
});