
	window.LJ.store = _.merge( window.LJ.store || {}, {

		mode: null,

		init: function(){

			LJ.store.activateStoreMode();
			return;
		},
		activateStoreMode: function(){

			try {
				localStorage && localStorage.setItem( "local", "storage" );
				LJ.log("Local storage is supported");
				LJ.store.mode = "localstorage";
			} catch( e ){
				LJ.wlog("Local storage is not supported");
				LJ.store.mode = "cookie";
			}

			// if( window.localStorage ){
			// 	LJ.store.mode = "localstorage";
			// } else {
			// 	LJ.store.mode = "cookie";
			// }

		},
		changeStoreMode: function( new_mode ){

			if( [ "cookie", "localstorage" ].indexOf( new_mode ) == -1 ){
				return LJ.wlog('This storage mode is not supported, please use "cookie" or "localstorage"');
			}

			LJ.store.mode = new_mode;

		},
		getStore: function(){

			if( LJ.store.mode == "localstorage" ){
				return window.localStorage;
			} else {
				return document.cookie;
			}

		},
		get: function( name ){

			var mode = LJ.store.mode;

			if( mode == "localstorage" ){
				return LJ.store.getLocalItem( name );
			}

			if( mode == "cookie" ){
				return LJ.store.getCookie( name );
			}

		},
		set: function( key, item ){

			var mode = LJ.store.mode;

			if( mode == "localstorage" ){
				return LJ.store.setLocalItem( key, item );
			}

			if( mode == "cookie" ){
				return LJ.store.setCookie( key, item );
			}

		},
		remove: function( key ){

			var mode = LJ.store.mode;

			if( mode == "localstorage" ){
				return LJ.store.removeLocalItem( key );
			}

			if( mode == "cookie" ){
				return LJ.store.removeCookie( key );
			}

		},
		setLocalItem: function( key, item ){

			if( typeof item == "object" ){
				item = JSON.stringify( item );
			}

			window.localStorage.setItem( key, item );

		},
		getLocalItem: function( key ){

			var item = window.localStorage.getItem( key );

			try {
				item = JSON.parse( item );

			} catch( e ){
				// Do nothing
			}

			return item;

		},
		removeLocalItem: function( key ){

			window.localStorage.removeItem( key );

		},
		setCookie: function( cname, cvalue, exdays ){

		    var d = new Date();
		    d.setTime( d.getTime() + ( exdays * 24 * 60 * 60 * 1000 ) );

		    var expires = "expires="+ d.toUTCString();

		    document.cookie = cname + "=" + cvalue + "; " + expires;

		},
		getCookie: function( cname ){

		    var name = cname + "=";
		    var ca = document.cookie.split(';');

		    for( var i = 0; i <ca.length; i++ ){

		        var c = ca[i];
		        while( c.charAt(0)==' ' ){
		            c = c.substring(1);
		        }

		        if( c.indexOf( name ) == 0 ){
		            return c.substring(name.length,c.length);
		        }
		    }

		    return null;
		},
		removeCookie: function( cname ){

			LJ.store.setCookie( cname, '', -1 );

		}

	});