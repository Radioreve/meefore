
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

	   
     testTemplate: function( tplName, param, wrapper ){

      var html = LJ.fn[tplName]( param );

      if( wrapper ){
        html = '<div class="'+wrapper+'">'+html+'</div>';
      }

      $(html).addClass('super-centered test-tpl').css({
        'z-index':'1000000000000', 'opacity': '1' })
      .appendTo('body');

      $('.test-tpl').click(function(){ $(this).remove(); })

    }
       
        
        

});