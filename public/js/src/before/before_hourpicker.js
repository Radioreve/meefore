// CSS 
.hp-main {
    width: 360px;
    height: 85px;
    background: white;
    box-shadow: 0 0 1px #BEBEBE;
    text-align: center;
    padding: 4px;
    background: #F9F9F9;
    font-family: 'Roboto';
    font-weight: 300;
    border: 1px solid #DADADA;
    display: none;
}

.hp-main:hover .hp-spliter {}

.hp-hourwrap,
.hp-minwrap,
.hp-spliter {
    display: inline-block;
    vertical-align: middle;
    background: white;
}

.hp-hour,
.hp-min,
.hp-spliter {
    font-size: 32px;
    color: #5B5B5B;
    font-family: 'Roboto';
    font-weight: 300;
    padding: 0 6px;
    text-shadow: 0 0 50px #E3E3E3;
}

.hp-min {}

.hp-spliter {
    display: inline-block;
    color: #65605B;
    font-weight: 100;
    transition: all ease-out .5s;
    border-radius: 5px;
}

.hp-layer {
    background: #FEFEFE;
    height: 100%;
    padding-top: 22px;
    border-radius: 5px;
}

.hp-hourwrap,
.hp-minwrap {
    position: relative;
}

.hp-hour.active,
.hp-min.active {
    display: inline-block;
    color: #727272;
}

.hp-upndown {
    position: absolute;
    color: #E7E7E7;
    height: 37px;
    top: 23px;
}

.hp-upndown-left {
    left: 29px;
}

.hp-upndown-right {
    right: 51px;
}

.hp-icon {
    transition: all ease-out .15s;
    display: block;
    font-size: 18px;
}

.hp-icon:hover {
    color: #e94f6a;
}

.hp-icon-up {
    position: absolute;
    top: 0;
}

.hp-icon-down {
    position: absolute;
    bottom: 0;
}




renderHourPicker: function( opts ){

          var hour_range = opts.hour_range;
          var min_range  = opts.min_range;

          var hours_html = '<div class="hp-hour">' + LJ.before.formatHourAndMin( opts.default_hour[0] ) + '</div>'
          var min_html   = '<div class="hp-min">' + LJ.before.formatHourAndMin( opts.default_hour[1] ) + '</div>'

          var html = [

            '<div class="hp-main">',
              '<div class="hp-layer">',
                '<div class="hp-upndown hp-upndown-left">',
                  '<i class="hp-icon hp-icon-up icon-up-dir"></i>',
                  '<i class="hp-icon hp-icon-down icon-down-dir"></i>',
                '</div>',
                '<div class="hp-hourwrap">',
                  hours_html,
                '</div>',
                '<div class="hp-spliter">',
                  opts.spliter,
                '</div>',
                '<div class="hp-minwrap">',
                  min_html,
                '</div>',
                '<div class="hp-upndown hp-upndown-right">',
                  '<i class="hp-icon hp-icon-up icon-up-dir"></i>',
                  '<i class="hp-icon hp-icon-down icon-down-dir"></i>',
                '</div>',
              '</div>',
            '</div>'

          ].join('');

          return html;

        },
        formatHourAndMin: function( hour ){

          if( hour < 10 ){
            return '0'+hour;
          } else {
            return ''+hour;
          }
          
		},
		addHourpicker: function( opts ){

			LJ.before.addHourpicker({

                inp 		 : '.be-create-row.--hour input',
                spliter      : 'H',
                hour_range   : [ 14, 23 ],
                min_range    : [ 0, 55 ],
                default_hour : [ 20, 30 ],
                min_step     : 5

            });

            //.....

            var opts = opts || {};
            var $inp = $( opts.inp );

            if( !$inp ){
                return LJ.wlog('Cant initialize hour picker without input');
            }
            var $hourPicker = $( LJ.before.renderHourPicker( opts ) );

            $hourPicker
            	.insertAfter( $inp )
                    .css({
                        'position' : 'absolute',
                        'top'      : '10px',
                        'left'     : '135px',
                        'z-index'  : '100000'
                   	});

            $('.hp-upndown-left .hp-icon-up').click(function(e){
                LJ.before.incrHour(e, opts);
            });

            $('.hp-upndown-left .hp-icon-down').click(function(e){
                LJ.before.decrHour(e, opts);
            });

            $('.hp-upndown-right .hp-icon-up').click(function(e){
                LJ.before.incrMint(e, opts);
            });

            $('.hp-upndown-right .hp-icon-down').click(function(e){
                LJ.before.decrMint(e, opts);
            });
            
            $('.hp-main').mousewheel(function(e){

                e.preventDefault();

                if( $(e.target).hasClass('hp-hour')){
                    if( e.deltaY == 1 ){
                        LJ.before.incrHour(e, opts);
                    }
                    if( e.deltaY == -1 ){
                        LJ.before.decrHour(e, opts);
                    }
                }
                if( $(e.target).hasClass('hp-min')){
                    if( e.deltaY == 1 ){
                        LJ.before.incrMint(e, opts);
                    }
                    if( e.deltaY == -1 ){
                        LJ.before.decrMint(e, opts);
                    }
                }
            });

            $('.row-create-hour').click(function(e){

                if(  $('.hp-main').hasClass('block') ){
                    return;
                }

                $inp.attr('placeholder','');
                $('.hp-main').show();

            });

            LJ.ui.$body.mousedown(function(e){

                if( $(e.target).closest('.row-create-hour').length == 0 && $('.hp-main').css('display') != 'none' ){

                    var hour = $('.hp-hour').text();
                    var min  = $('.hp-min').text();

                    LJ.before.addHourToInput( hour, min );
                    $('.hp-main').hide();

                }
            });

            $('.hp-main').on('mousedown', function(e){
                
                if( $(e.target).hasClass('hp-icon') ){
                    return;
                }

                $('.hp-main').hide().addClass('block');
                setTimeout(function(){
                    $('.hp-main').removeClass('block');
                }, 300);

                var hour = $('.hp-hour').text();
                var min  = $('.hp-min').text();

                LJ.before.addHourToInput( hour, min );


            });


        },
        addHourToInput: function( hour, min ){

        	$('.be-create-row.--hour input').val( hour + ':' + min );

        },
        incrHour: function(e, opts){

            e.stopPropagation();

            if( parseInt( $('.hp-hour').text() ) == opts.hour_range[1] ){
                return;
            }

            $('.hp-hour').text( LJ.before.formatHourAndMin( parseInt( $('.hp-hour').text() ) + 1 ));
            if( parseInt( $('.hp-hour').text() ) == opts.hour_range[1] ){
                $('.hp-upndown-left .hp-icon-up').hide();
                return;
            }
            $('.hp-upndown-left .hp-icon-down').show();
        },
        decrHour: function(e, opts){

            e.stopPropagation();

            if( parseInt( $('.hp-hour').text() ) == opts.hour_range[0] ){
                return;
            }

            $('.hp-hour').text( LJ.before.formatHourAndMin( parseInt( $('.hp-hour').text() ) - 1 ));
            if( parseInt( $('.hp-hour').text() ) == opts.hour_range[0] ){
                $('.hp-upndown-left .hp-icon-down').hide();
                return;
            }
            $('.hp-upndown-left .hp-icon-up').show();
        },
        incrMint: function(e, opts){

            e.stopPropagation();

            if( parseInt( $('.hp-min').text() ) == opts.min_range[1] ){
                return;
            }

            $('.hp-min').text( LJ.before.formatHourAndMin( parseInt( $('.hp-min').text() ) + opts.min_step ));
            if( parseInt( $('.hp-min').text() ) == opts.min_range[1] ){
                $('.hp-upndown-right .hp-icon-up').hide();
                return;
            }
             $('.hp-upndown-right .hp-icon-down').show();

        },
        decrMint: function(e, opts){

            e.stopPropagation();

            if( parseInt( $('.hp-min').text() ) == opts.min_range[0] ){
                return;
            }

             $('.hp-min').text( LJ.before.formatHourAndMin( parseInt( $('.hp-min').text() ) - opts.min_step ));
             if( parseInt( $('.hp-min').text() ) == opts.min_range[0] ){
                $('.hp-upndown-right .hp-icon-down').hide();
                return;
            }
             $('.hp-upndown-right .hp-icon-up').show();
        }