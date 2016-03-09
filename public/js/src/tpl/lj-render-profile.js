
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

        renderFacebookUploadedPictures: function( data ){

            var images = _.pluck( data, 'images' ),
                html = '<div class="facebook-image-item-wrap">';

                html += '<div data-lid="p_facebook_upload_title" class="modal-title modal-title-facebook">Vos photos de profil</div>'
            images.forEach(function( img ){

              var url = '';
              img.forEach(function( itm ){

                LJ.fn.log(itm);
                if( itm.width > 250 && itm.width < 450 || itm.height > 250 && itm.height < 450){
                  url = itm.source
                }

              });

                var $img = $('<img class="super-centered fb" src="' + url + '">');                
                var html_img = '<div class="facebook-image-item none">'
                                + '<div class="facebook-image-wrap">' + $img.prop('outerHTML') + '</div>'
                             + '</div>';

                html += html_img;

            });
                html += ['<div class="upload-buttons">',
                          '<button class="theme-btn btn-validate btn-validating">Valider</button>',
                          '<button class="theme-btn btn-cancel">Annuler</button>',
                        '</div>'].join('');

                html += '</div>';

            html = $(html);
            LJ.fn.setAppLanguage( LJ.app_language, html );
            return html.prop('outerHTML');
            
        },
        renderFriendInProfile: function( friend ){

            var img_id = LJ.fn.findMainImage( friend ).img_id,
                img_version = LJ.fn.findMainImage( friend ).img_version,
                display_options = LJ.cloudinary.profile.friends.params;

            display_options.version = img_version;

            var image_tag = $.cloudinary.image( img_id, display_options ).prop('outerHTML');

            var html =  '<div class="row-friend-item detailable" data-id="'+friend.facebook_id+'">'
                            + '<div class="row-friend-img">'+ image_tag +'</div>'
                            + '<div class="row-friend-name">' + friend.name + '</div>'
                            + '<div class="row-friend-action"></div>' 
                        + '</div>'

            return html;
        },
        renderProfilePicturesWraps: function(){

            var pictures = LJ.user.pictures;
            var html = '';

            for( var i = 0; i < pictures.length; i++)
            {
                var main = '';
                if( pictures[i].is_main ){
                    var main = " main-picture";
                }

                html += '<div class="picture unselectable' + main + '" data-img_version="' + pictures[i].img_version + '" data-img_place="' + i + '">'
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
        renderDeleteProfile: function(){

          var html = [
                '<div class="delete-profile-wrap">',
                    '<div data-lid="s_delete_title" class="modal-title">Supprimer mon profile</div>',
                    '<div data-lid="s_delete_text" class="delete-profile-text">Toutes les données vous concernant seront supprimées</div>',
                    '<div class="delete-profile-buttons">',
                      '<button data-lid="s_delete_validate" class="theme-btn btn-validate btn-validate-modal">Supprimer</button>',
                      '<button data-lid="s_delete_cancel" class="theme-btn btn-cancel">Annuler</button>', 
                    '</div>',
                '</div>',
            ].join('');

          html = $(html)
          LJ.fn.setAppLanguage( LJ.app_language, html );
          return html.prop('outerHTML');

        },
        renderGoodbye: function(){

          var html = [
            '<div class="super-centered">',
              '<div data-lid="s_delete_goodbye" class="goodbye none">',
                  'Votre compte a bien été supprimé',
              '</div>',
            '</div>'
          ].join('');

          html = $(html);
          LJ.fn.setAppLanguage( LJ.app_language, html );
          return html.prop('outerHTML');

        }
        

	});