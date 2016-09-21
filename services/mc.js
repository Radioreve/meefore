	
	var request = require('request');
	var Promise = require('bluebird');
	var fs  	= require('fs');
	var _ 		= require('lodash');
	var term 	= require('terminal-kit').terminal

	// require('request-debug')(request);

	Promise.promisifyAll( fs );

	// Interface to interact with the Mailchimp api 3.0 
	// http://developer.mailchimp.com

	// Constructor base function, instantiate one per list 
	var Mailchimp = function( opts ){
		
		this.api_version  = this.api_version || '3.0';
		this.api_key      = opts.api_key;
		this.dc           = opts.dc;
		this.list_id      = opts.list_id
		this.interests 	  = opts.interests;

		this.log = {};
		[ "info", "warn", "err", "debug" ].forEach(( log_type ) => {
			this.log[ log_type ] = opts[ log_type ];
		});

		
		// Generate HTTP helper functions to make api calls
		this._generateHTTPHelper({ method: 'get' });
		this._generateHTTPHelper({ method: 'post', json_body: true });
		this._generateHTTPHelper({ method: 'patch', json_body: true });
		this._generateHTTPHelper({ method: 'delete' });

		// Generate the full suite of REST operations for the 'members' resource
		this._generateRestInterface({

			// For information purposes only
			_mandatory_fields 	 : [ "email_address", "status" ],
			resource 		     : 'member',
			read_only_fields     : [ "email_address" ],
			get_default_fields   : [ "id", "email_address", "status", "merge_fields", "language", "last_changed", "location" ],
			write_default_fields : [ "id", "email_address", "merge_fields", "interests" ],

			getRes: function( res ){
				return res.members;
			},
			formatFields: function( fields ){
				return _.map( fields, function( field ){
					return 'members.' + field;
				});
			},
			setCreateDefaults: function( data ){
				data.status = "subscribed";
			}

		});

		// Generate the full suite of REST operations for the 'merge-fields' resource
		this._generateRestInterface({

			// For information purposes only
			_mandatory_fields 	 : [ "tag", "type" ],
			resource 		     : 'merge-field',
			get_default_fields   : [ "merge_id", "type", "name", "default_value" ],
			write_default_fields : [ "merge_id","type", "name", "options" ],

			getRes: function( res ){
				return res.merge_fields;
			},
			formatFields: function( fields ){
				return _.map( fields, function( field ){
					return 'merge_fields.' + field;
				});
			},
			
		});

		// Generate the full suite of REST operations for the 'interest-category' resource
		this._generateRestInterface({

			// For information purposes only
			_mandatory_fields 	 : [ "title", "type" ],
			resource 		     : 'interest-categorie',
			methodName 			 : 'InterestCat',
			get_default_fields   : [ "id", "type", "title", "list_id" ],
			write_default_fields : [ "id", "type", "title", "list_id" ],

			getRes: function( res ){
				return res.categories;
			},
			formatFields: function( fields ){
				return _.map( fields, function( field ){
					return 'categories.' + field;
				});
			},
			setCreateDefaults : function( data ){
				data.type = "hidden";
			}
			
		});

		// Turn every callback-version of each function into a promise-based version
		this._promisifyAll();

		// Specific version because code doesnt work for subresources
		this._promisify( "getInterestsAsync" );

	}

	// Turn each specific api call into a promisified version
	Mailchimp.prototype._promisifyAll = function(){

		var self = this;
		[ "Member", "MergeField", "InterestCat" ].forEach(function( methodName ){

			self._promisify( "get" + methodName + "Async" );
			self._promisify( "get" + methodName + "sAsync" );
			self._promisify( "create" + methodName + "Async" );
			self._promisify( "update" + methodName + "Async" );
			self._promisify( "delete" + methodName + "Async" );

		});

	}

	// Turn any function into a promise, provided that this function
	// accept a callback as its last parameter
	Mailchimp.prototype._promisify = function( method ){

		var self = this;
		var methodName;

		self[ method.replace("Async", "") ] = function(){

			var args = arguments;
			return new Promise(function( resolve, reject ){

				[].push.call( args, function( err, res ){
					if( err ){
						reject( err );
					} else {
						resolve( res );
					}
				});

				self[ method ].apply( self, args );

			});

		}

	}

	// Getter on the interest_id when given the name of the list
	Mailchimp.prototype.getInterestId = function( interest_name ){
		var self = this;
		var id   = _.find( self.interests, function( int ){
			return int.name == interest_name;
		}).id;

		self.infoLog('Id : ' + id + ' found for list name : ' + interest_name );
		return id;
	};

	// @As found in the node-validator module
	// seems to cover allmost all usecases
	Mailchimp.prototype.isEmail = function( email ){
		return /^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/.test( email );
	}

	// Test purposes, make sure the interface is accessible
	Mailchimp.prototype.printConfig = function(){

		return JSON.stringify({

			api_key		: this.api_key,
			api_version : this.api_version,
			dc          : this.dc,
			list_id  	: this.list_id

		}, null, 4 );

	}

	Mailchimp.prototype._parseResponse = function( res ){

		var parsed;
		try {
			parsed = JSON.parse( res )
		} catch( e ){
			parsed = res;
		}

		return parsed;
	}

	Mailchimp.prototype._handleRequestDone = function( callback ){

		var self = this;

		return function( err, body, response ){

			if( err ){
				callback( err, null );
			} else {
				callback.apply( self, [ null, self._parseResponse( response ) ] );
			}
		}

	}

	Mailchimp.prototype._makeAuthorizationHeader = function(){

		return "Basic " + new Buffer( "anystring:" + this.api_key, "utf-8" ).toString("base64");

	}

	Mailchimp.prototype._capitalizeFirstLetter = function( word ){

		return word[0].toUpperCase() + word.slice(1);
	}

	Mailchimp.prototype._makeMethodName = function( resource ){

		var self = this;
		var parts = resource.split('-');

		return _.map( parts, function( part ){
			return self._capitalizeFirstLetter( part );
		}).join('');

	}

	Mailchimp.prototype._generateHTTPHelper = function( http_verb ){

		var self       = this;
		var methodName = "_http" + self._capitalizeFirstLetter( http_verb.method );

		if( http_verb.json_body ){

			self[ methodName ] = function( url, data ){

				var callback = arguments[ arguments.length - 1 ];
				request({

					headers: { "Authorization": self._makeAuthorizationHeader() },
					method : http_verb.method,
					url    : url,
					json   : data

				}, self._handleRequestDone( callback ) );
			}

		} else {

			self[ methodName ] = function( url ){

				var callback = arguments[ arguments.length - 1 ];
				request({

					headers: { "Authorization": self._makeAuthorizationHeader() },
					method : http_verb.method,
					url    : url

				}, self._handleRequestDone( callback ) );
			}

		}


	}


	// Helper | Promisified version of the fs write method, adapted for json only
	Mailchimp.prototype._writeJson = function( path, content ){

		content = typeof content == 'string' ?
				  content :
				  JSON.stringify( content, null, 4 );

		return fs.writeFileAsync( path + '.json', content, 'utf-8' );

	}

	Mailchimp.prototype.debugLog = function( message ){

		if( this.log && typeof this.log.debug == "function" ){
			return this.log.debug( message );
		}

		term('[ ') + term.bold.white('Mailchimp') + term(' ]') + term(' -> ') + term( JSON.stringify(message, null, 4) ) + term('\n');
	}

	Mailchimp.prototype.infoLog = function( message ){

		if( this.log && typeof this.log.info == "function" ){
			return this.log.info( message );
		}

		term('[ ') + term.bold.magenta('Mailchimp') + term(' ]') + term(' -> ') + term( JSON.stringify(message, null, 4) )  + term('\n');
	}

	Mailchimp.prototype.warnLog = function( message ){

		if( this.log && typeof this.log.warn == "function" ){
			return this.log.warn( message );
		}

		term('[ ') + term.bold.yellow('Mailchimp') + term(' ]') + term(' -> ') + term( JSON.stringify(message, null, 4) )  + term('\n');
	}

	Mailchimp.prototype.successLog = function( message ){

		if( this.log && typeof this.log.info == "function" ){
			return this.log.info( message );
		}

		term('[ ') + term.bold.green('Mailchimp') + term(' ]') + term(' -> ') + term( JSON.stringify(message, null, 4) )  + term('\n');
	}


	Mailchimp.prototype.errLog = function( message ){

		if( this.log && typeof this.log.err == "function" ){
			return this.log.err( message );
		}

		term('[ ') + term.bold.red('Mailchimp') + term(' ]') + term(' -> ') + term( JSON.stringify(message, null, 4) )  + term('\n');
	}


	// @private, construct the url according to Mailchimp api 3.0
	Mailchimp.prototype._makeResourceURL = function( resource ){

		if( resource[0] != '/' ){
			resource = '/' + resource;
		}

		var url = 'https://{dc}.api.mailchimp.com/{api_version}/lists/{list_id}{resource}'

				.replace('{dc}', this.dc )
				.replace('{api_version}', this.api_version )
				.replace('{list_id}', this.list_id )
				.replace('{resource}', resource )

		return url;

	}

	// "Patchify" | Apply the b patch on the a object 
	// ---------------------------------------------------
	// Update all object a's keys with the ones in b 
	// only if they are of the same type. Any other key contained in b
	// that is not present in a will be ignored. This is typically the 
	// algorithm that is applied when doing a PATCH on a resource.
	Mailchimp.prototype.patchify = function( a, b ){

		var self = this;

		var o = {};
	    var distinct_keys = [];
	    
	    Object.keys( a ).forEach(function( key ){
	        distinct_keys.push( key );
	    });

	    Object.keys( b ).forEach(function( key ){
	      if( distinct_keys.indexOf( key ) == -1 ){
	        distinct_keys.push( key );
	      }
	    });
	    
	    distinct_keys.forEach(function( key ){
	        
	        if( !(key in a)  ){
	          return;
	        }        
	        if( (key in a) && !(key in b) ){
	          return o[ key ] = a[ key ];
	        }
	        
	        if( (key in a) && (key in b) && (typeof a[ key ] == typeof b[ key ]) ){
	          
	          if( typeof a[ key ] == "object" ){
	            return o[ key ] = self.patchify( a[ key ], b[ key ] );
	          } else {
	            return o[ key ] = b[ key ];
	          }
	          
	        } else {

	          o[ key ] = a[ key ];

	        }
	      
	    });
      
      return o;

	}

	Mailchimp.prototype._makeUrlGetter = function( opts ){

		var self       = this;
		var methodName = opts.methodName || this._makeMethodName( opts.resource );

		// Generate the single-version of the resource 
		self[ "_get" + methodName + "URL" ] = function( id, fields ){

			var url;

			if( !fields || typeof fields == "function" ){
				url = self._makeResourceURL( '/'+ opts.resource + 's/' + id );
			}

			if( fields == "filtered" ){
				fields = opts.get_default_fields;
			}

			if( Array.isArray( fields ) ){
				url = self._makeResourceURL( '/' + opts.resource + 's/' + id + '?fields=' + fields.join(',') );
			}

			if( url ){
				// Strip the domain part for maximum readability in the console
				// self.infoLog("Generated url (1) : ..." + url.slice( 34, url.length ) );
				return url;
			}

			self.errLog( "Error, unable to make url for resource " + opts.resource );

		}


		// Generate the multiple-version of the resource 
		self[ "_get" + methodName + "sURL" ] = function( fields ){

			var url;

			if( !fields || typeof fields == "function" ){
				url = self._makeResourceURL( '/' + opts.resource + 's' );
			}

			if( fields == "filtered" ){
				fields = opts.get_default_fields;
			}

			if( Array.isArray( fields ) ){

				fields = opts.formatFields( fields );
				url = self._makeResourceURL( '/' + opts.resource + 's?fields=' + fields.join(',') );
			}

			if( url ){
				// Strip the domain part for maximum readability in the console
				// self.infoLog("Generated url (2) : ..." + url.slice( 34, url.length ) );
				return url;
			}

			self.errLog( "Error, unable to make url for resource " + opts.resource );

		}

	}

	Mailchimp.prototype._isPatchPossible = function( read_only_fields, patch ){

		var has_unpatchable_keys = false;

		for( var key in patch ){
			if( read_only_fields.indexOf( key ) != -1 ){
				has_unpatchable_keys = true;
			}
		}

		return !has_unpatchable_keys;
	}
	

	Mailchimp.prototype._generateRestInterface = function( opts ){

		var self = this;
		var methodName = opts.methodName || this._makeMethodName( opts.resource );

		self._makeUrlGetter( opts );

		// Get a single ressource based on its id
		self[ "get" + methodName + "Async" ] = function( id ){

			var callback = arguments[ arguments.length - 1 ];
			var url 	 = self[ "_get" + methodName + "URL" ]( id, "filtered" );

			self._httpGet( url, callback );
		}


		// Get multiple ressources, by appending a discrete 's' to the method name
		self[ "get" + methodName + "sAsync" ] = function( fields ){

			var callback = arguments[ arguments.length - 1 ];
			var url 	 = self[ "_get" + methodName + "sURL" ]( fields );

			self._httpGet( url, function( err, res ){
				var parsed = opts.getRes( res );
				if( parsed ){
					callback( null, parsed );
				} else {
					callback( err, null );
				}
			});
		}


		// Create one ressource. The resource is returned by Mailchimp upon creation
		self[ "create" + methodName + "Async" ] = function( data ){

			var callback = arguments[ arguments.length - 1 ];
			var url 	 = self[ "_get" + methodName + "sURL" ]();

			if( typeof opts.setCreateDefaults == "function" ){
				opts.setCreateDefaults( data );
			}

			self._httpPost( url, data, callback );
		}


		// Delete a resource 
		self[ "delete" + methodName + "Async" ] = function( id ){

			var callback = arguments[ arguments.length - 1 ];
			var url 	 = self[ "_get" + methodName + "URL" ]( id );

			self._httpDelete( url, callback );

		}

		// Update a resource
		self[ "update" + methodName + "Async" ] = function( id, patch ){

			var callback = arguments[ arguments.length - 1 ];
			var url 	 = self[ "_get" + methodName + "URL" ]( id );

			// self.debugLog( id );
			// self.debugLog( patch );
			if( self._isPatchPossible( opts.read_only_fields, patch ) ){

				self.infoLog("Patch is possible");
				self._httpPatch( url, patch, callback );

			} else {

				var resource_ref;

				self[ "get" + methodName + "Async" ]( id, function( err, resource ){

					if( err ) return callback( err, null );
					resource_ref = self.patchify( resource, patch );
					self[ "delete" + methodName + "Async" ]( id, function( err ){

						if( err ) return callback( err, null );
						self[ "create" + methodName + "Async" ]( resource_ref, function( err, resource ){

							if( err ) return callback( err, null );
							callback( null, resource );

						});
					})

				});
			}
		}


		// Write the state of the base in a local json file
		self[ "write" + methodName + "sToFile" ] = function( path ){

			var self = this;
			var ref  = [];
			var path = path || process.cwd();

			return this[ "get" + methodName + "s"]( opts.write_default_fields )
				.then(function( res ){

					if( res ){
						ref = res;
						return self._writeJson( path + '/' + opts.resource + 's', ref );
					} else {
						self.warnLog("There was nothing to be written on file (res=" + res +")");
					}

				})
				.then(function(){
					return self.infoLog( opts.resource + 's.json updated (%n entries)'.replace('%n', ref.length));
				});
			}


	}

	Mailchimp.prototype.getInterestsAsync = function( category_id ){

		var self     = this;
		var callback = arguments[ arguments.length - 1 ];

		var fields   = 'interests.category_id,interests.list_id,interests.id,interests.name,interests.subscriber_count';
		var url      = self._makeResourceURL( '/interest-categories/' + category_id + '/interests?fields=' + fields );

		self._httpGet( url, function( err, res ){
			if( res.interests ){
				callback( null, res.interests );
			} else {
				callback( err, null );
			}
		});

	}

	Mailchimp.prototype.writeInterestsToFile = function( path ){

		var self = this;
		var L    = 0;
		var path = path || process.cwd();

		return this.getInterestCats( "filtered" )
			.then(function( interest_cats ){

				var promises = [];
				for( var i=0; i<interest_cats.length; i++ ){
					var p = self.getInterests( interest_cats[ i ].id );
					promises.push( p );
				}

				return Promise.all( promises )
					.then(function(){

						var res = [];
						for( var i=0; i< arguments.length; i++ ){
							res = res.concat( arguments[ i ] );
							L += arguments[ i ].length;
						}

						if( res.length != 0 ){
							return self._writeJson( path + '/interests', res );
						} else {
							self.warnLog("There was nothing to be written on file (res=" + res +")");
						}

					});
			})
			.then(function(){
				return self.infoLog( 'interests.json updated (%n entries)'.replace('%n', L ));
			});
		}



	module.exports = Mailchimp
