
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

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
                                    + '<div class="modal-user-age">' + user.age +'</div>'
                                    //+ '<div class="modal-user-mood">#'  + LJ.fn.hashtagify( user.mood ) + '</div>'
                                    //+ '<div class="modal-user-drink">#' + LJ.fn.hashtagify( user.drink )+ '</div>'
                                    //+ '<div class="modal-user-job">#'   + LJ.fn.hashtagify( user.job ) + '</div>'
                                + '</div>'
                                + '<div class="modal-user-description-body">'
                                + '</div>'


            var html = '<div class="modal-user-content">' + images_html + description_html + '</div>';

            return html;
        },
        renderUserProfileInCurtainNone: function(){
             var html = '<h2 class="super-centered">Mauvais identifiant :/</h2>';
             return html;

        }
		
	});	