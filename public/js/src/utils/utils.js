
window.LJ = _.merge( window.LJ || {}, {

    initAugmentations: function(){

        String.prototype.capitalize = function() {
            return this.charAt( 0 ).toUpperCase() + this.slice( 1 );
        }

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

        // upgrading version
        _.pluck = _.map;

        $('body').on('mouseenter', '.jspContainer', function(){
            LJ.ui.deactivateHtmlScroll();
        });

        $('body').on('mouseleave', '.jspContainer', function(){
            LJ.ui.activateHtmlScroll();
        });

                
    },
    promise: function( callback ){
        return new Promise( callback );
    },
    Promise: Promise,

    storeItem: function( key, value ){

        if( !key || !value ){
            var object = key;
            key = _.keys( object )[0];
            value = object[key];
        }

        value = typeof value == 'object' ? JSON.stringify(value) : value;
        return localStorage.setItem( key, value );

        localStorage.setItem( key, value );

    },
    isMobileMode: function(){

        var is_mobile = window.innerWidth <= 500;

        return is_mobile;

    },
    isBrowserSafari: function(){

        var is_safari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
               navigator.userAgent && !navigator.userAgent.match('CriOS');

        return is_safari;

    },
    cacheUser: function( user ){

        if( !LJ.user ){
            LJ.log('Caching user for the first time');
            LJ.user = user;
            LJ.user.cheers = [];
            return LJ.user;
        } else {
            if( user.facebook_id == LJ.user.facebook_id ){
                LJ.log('Facebook_id matched, updating user cache');
                _.keys( user ).forEach(function( key ){
                    if( LJ.user.hasOwnProperty( key ) ){
                        LJ.user[ key ] = user[ key ];
                    }
                });
            } else {
                
            }
        }

    },
    isSameDay: function( d1, d2 ){
        return m1.dayOfYear() == m2.dayOfYear();

    },
    findMainPic: function( user ){

        var user = user || LJ.user;

        return _.find( user.pictures, function( p ){
            return p.is_main;
        });

    },
    delay: function( delay ){

        if( typeof delay != "number" ){
            delay = 1000;
        }

        return LJ.promise(function( resolve, reject ){
            setTimeout(function(){
                resolve();
            }, delay );
        })
    },
    hashtagify: function( str ){

        var hashtag_parts = [];

        str.toLowerCase().trim().split(/[\s_-]/).forEach(function( el, i ){

            if( i == 0 ){
                hashtag_parts.push( el );
            } else {
                if( el != '') {
                    var elm = el[0].toUpperCase() + el.substring(1);
                    hashtag_parts.push( elm );
                }
            }
        });

        return hashtag_parts.join('');

    },
    log: function log( message ){

        if( LJ.app_mode == "prod" ){
            console.log("Hello there.")
            return LJ.log = function(){}
        }
        console.log( message );

    },
    wlog: function wlog( message ){
        
        console.warn( message );

    },
    tlog: function tlog( message ){
        
        console.trace( message );

    },
    elog: function elog( message ){

        console.error( message )

    },
    ilog: function ilog( message ){

        console.info( message );
        
    },
    getGhostUser: function(){

        var ghost_user = {

            facebook_id : 'ghost',
            name        : LJ.text('ghost_user_name'),
            age         : 18,
            job         : LJ.text('ghost_user_job'),
            img_id      : "ghost_user",
            img_vs      : "1468060134",
            location    : {
                place_name: "Paris, France"
            },
            cc           : "fr",
            country_code : "fr",
            pictures: [{
                img_id      : "ghost_user",
                img_version : "1468060134",
                is_main     : true
            }]

        }

        return ghost_user;

    },
    renderUserRow: function( user ){

        var filterlay = 'js-filterlay';

        if( !user || !user.img_id || !user.img_vs ){
            LJ.log('No user was provided, rendering ghost user instead');
            user = LJ.getGhostUser();
            filterlay = '';
        }

        var img_small = LJ.pictures.makeImgHtml( user.img_id, user.img_vs, "user-row" );

        var gender = user.g;
        var cc     = user.cc;

        return LJ.ui.render([

            '<div class="user-row js-user-profile" data-facebook-id="'+ user.facebook_id +'">',
                '<div class="user-row__pic '+ filterlay +'">',
                  img_small,
                '</div>',
                '<div class="user-row__informations">',
                  '<div class="user-row__about">',
                    '<div class="user-gender x--'+ gender +' js-user-gender"></div>',
                    '<span class="user-name">'+ user.name +'</span>',
                    '<span class="user-comma">,</span>',
                    '<span class="user-age">'+ user.age +'</span>',
                    '<div class="user-country js-user-country">',
                      '<i class="flag-icon flag-icon-'+ cc +'"></i>',
                    '</div>',
                    '<span class="user-online js-user-online" data-facebook-id="'+ user.facebook_id +'"></span>',
                  '</div>',
                  '<div class="user-row__education">',
                    '<span class="user-row__education-icon x--round-icon">',
                      '<i class="icon icon-education-empty"></i>',
                    '</span>',
                    '<span class="user-row__education-label">'+ user.job +'</span>',
                  '</div>',
                '</div>',
          '</div>'

        ].join(''));

    },
    renderUserRows: function( users ){

        if( !Array.isArray( users ) ){
            return LJ.wlog('Cant render users row with empty array, users='+ users );
        }

        var user_rows = [];
        users.forEach(function( u ){
            user_rows.push( LJ.renderUserRow( u ) );

        });

        return user_rows.join('');


    },
    mainifyUserRow: function( $w, main_user ){

        var $rows = $w.find('.user-row');
        $rows.each(function( i, row ){

            var $r = $( row );
            if( $r.attr('data-facebook-id') == main_user ){

                $r.addClass('x--main').addClass('js-main').insertBefore( $rows.first() );
                $r.find('.user-row__pic').append('<div class="user__host x--round-icon"><i class="icon icon-star"></i></div>');
            }

        }); 

    },
    generateId: function(){
        return LJ.randomInt( 100, 100000000000 );

    },
    randomInt: function(low, high) {
        return Math.floor(Math.random() * (high - low + 1) + low);

    },
    renderDate: function( date ){
        return moment( date ).format('hh:mm')
        
    },
    renderMultipleNames: function( names, opts ){
        
        opts = opts || {};

        if( typeof names == "string" ){
            names = [ names ];
        }

        if( !Array.isArray( names ) ){
            return LJ.wlog('Cannot render multiple names, wrong argument');
        }

        names = names.filter( Boolean );

        if( names.length == 0 ){
            return LJ.wlog('Cannot render multiple names, empty array');
        }

        var name_to_replace = opts.lastify_user;
        if( name_to_replace ){

            if( names.indexOf( name_to_replace ) == -1 ){
                return LJ.wlog('Cannot lastify name, doesnt exist in the array');
            }

            names.forEach(function( name, i ){
                if( name == name_to_replace ){
                    delete names[ i ];
                }
            });

            names.push( LJ.text("w_you") );
            return LJ.renderMultipleNames( names );

        }

        if( names.length == 1 ){
            return names[0];
        } 

        if( names.length == 2 ){
            return [ names[0], names[1] ].join(' ' + LJ.text('w_and') + ' ');
        }

        return [ names[0], LJ.renderMultipleNames( names.slice(1) ) ].join(', ');

    },
    renderManyMultipleNames: function( names ){
        
        names = Array.isArray( names ) ? names : [ names ];
        names.reverse();
        var T = names.length;
        var displayed = [].slice.call( arguments, -1 );


        if( typeof displayed != "number" ){
            displayed = 2;
        }

        if( displayed >= T - 1 ){
            displayed = T - 1;
        }

         if( names.length == 1 ){
            return names[0];
        }
        if( names.length == 2 ){
            return names[0] + ' '+ LJ.text('w_and') +' ' + names[1];
        }

        var cur = 1;
        var str = names.pop();

        while ( cur < displayed ){
            str += ', ' + names.pop();
            cur++;
        }

        str += ' '+ LJ.text('w_and') +' ' + names.length + ' ' + LJ.text('w_more');
        return str;


    },
    renderGroupName: function( name ){
        return name + ' & co';

    },
    swapNodes: function( a, b ){

        var aparent = a.parentNode;
        var asibling = a.nextSibling === b ? a : a.nextSibling;
        b.parentNode.insertBefore(a, b);
        aparent.insertBefore(b, asibling);

    },
    testTemplate: function( tplName, param, wrapper ){

        var html = LJ.fn[tplName]( param );

        if( wrapper ){
            html = '<div class="' + wrapper + '">' + html + '</div>';
        }

        $( html )
            .addClass('temp')

            .css({

                'opacity'   : '1',
                'left'      : '50%',
                'top'       : '50%',
                'z-index'   :'1000000000000',
                'transform' : 'translate(-50%,-50%)'

            })

            .appendTo('body');

        $('.temp').click(function(){ 

            $(this).remove(); 
            
        });

    },
    getDisconnectedAt: function(){

        return LJ.user.disconnected_at;

    },
    roughSizeOfObject: function( object ) {

            var objectList = [];
            var stack = [ object ];
            var bytes = 0;

            while ( stack.length ) {
                var value = stack.pop();

                if ( typeof value === 'boolean' ) {
                    bytes += 4;
                }
                else if ( typeof value === 'string' ) {
                    bytes += value.length * 2;
                }
                else if ( typeof value === 'number' ) {
                    bytes += 8;
                }
                else if
                (
                    typeof value === 'object'
                    && objectList.indexOf( value ) === -1
                )
                {
                    objectList.push( value );

                    for( var i in value ) {
                        stack.push( value[ i ] );
                    }
                }
            }
            return bytes;
        },
        isElementInViewport: function(el) {

            var rect = el[0].getBoundingClientRect();
            return ( rect.top >= 0 && rect.left >= 0 && rect.bottom <=  $(window).height() && rect.right <= $(window).width() );
        },
        offsetElements: function(){

            if( LJ.nav.getActiveView() == "search" ){
                LJ.offsetSearchUsers();
            } else {
                LJ.offsetRows();
            }

        },
        unoffsetElements: function(){

             if( LJ.nav.getActiveView() == "search" ){
                LJ.unoffsetSearchUsers();
            } else {
                LJ.unoffsetRows();
            }

        },
        unoffsetAll: function(){
            
            LJ.unoffsetSearchUsers();
            LJ.unoffsetRows();
                            
        },  
        offsetSearchUsers: function( duration ){

            if( LJ.isMobileMode() ) return;

            duration = duration || 330;

            $('.search-user:not(.search-user--offset), .app-subheader.x--search h2:not(.search-user--offset)').addClass('search-user--offset').css({ 'position': 'relative' }).velocity({ 'left': [ 190, 0 ]}, { duration: duration });

        },  
        unoffsetSearchUsers: function(){

            if( LJ.isMobileMode() ) return;

            try {

                var current_offset = parseInt( $('.search-user--offset').css('left').split('px')[ 0 ] );
                $('.search-user--offset').removeClass('search-user--offset').css({ 'position': 'relative' }).velocity({ 'left': [ 0, current_offset ]}, { duration: 330 });
                
            } catch( e ){
                
            }

        },
        offsetRows: function(){

            if( LJ.isMobileMode() ) return;

            $('.row-pic, .row-body').addClass('row--offset').css({ 'position': 'relative' }).velocity({ 'left': [ 250, 0 ]}, { duration: 330 });

        },
        unoffsetRows: function(){

            if( LJ.isMobileMode() ) return;

            try {

                var current_offset = parseInt( $('.row--offset').css('left').split('px')[ 0 ] );
                $('.row-pic, .row-body').removeClass('row--offset').css({ 'position': 'relative' }).velocity({ 'left': [ 0, current_offset ]}, { duration: 330 });

            } catch( e ){
                
            }

        }


});
