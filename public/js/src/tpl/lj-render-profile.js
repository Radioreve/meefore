
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		renderMoodInProfile: function( mood_array ){

          var html = '';
            mood_array.forEach(function(mood){
              html += '<div class="row-select mood" data-selectid="' + mood.id + '"><i class="icon icon-mood icon-' + mood.id +'"></i>' + mood.display + '</div>'
            });
          return html;

        },
        renderDrinkInProfile: function( drink_array ){

          var html = '';
            drink_array.forEach(function(drink){
              html += '<div class="row-select drink" data-selectid="' + drink.id + '">' + drink.display + '</div>'
            });
          return html;

        },
        renderFacebookUploadedPictures: function( data ){

            var urls = _.pluck( data, 'source' ),
                html = '<div class="facebook-image-item-wrap">';

            urls.forEach(function(url){
                html += '<div class="facebook-image-item"><img src="' + url + '" width="100%" height="100%"></div>';
            });
                html += ['<div class="upload-buttons">',
                          '<button class="theme-btn btn-cancel right">Annuler</button>',
                          '<button class="theme-btn btn-validate btn-validating right">Valider</button>',
                        '</div>'].join('');

                html += '</div>';

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
        }
        

	});