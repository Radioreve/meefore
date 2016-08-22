
  var mongoose = require("mongoose");
  var Before   = require("./BeforeModel");
  var Message  = require("./MessageModel");
  var settings = require('../config/settings');
  var config   = require('../config/config');
  var bcrypt   = require("bcrypt-nodejs");
  var _        = require('lodash');
  var md5      = require('blueimp-md5');

  var UserSchema = new mongoose.Schema({

  contact_email: {
    type: String
  },
  mailchimp_id: {
    type: String
  },
  facebook_id: {
    type: String
  },
  facebook_url:{
    type: String
  },
  facebook_scope: {
    type: Array
  },
  facebook_access_token: {
    type: Object,
    default: { 
      short_lived: null,
      long_lived: null, 
      long_lived_valid_until: null 
    }
  },
  signed_up_at: {
    type: Date
  },
  disconnected_at: {
    type: Date
  },
  // Use to make a difference between admin, early adopters, etc...
  access: {
    type: Array
  },
  // use to make a difference between new users ("new") or regular users ("idle")
  status: {
    type: String
  },
  age: {
    type: Number,
    default: 25
  },
  country_code: {
    type: String
  },
  gender: {
    type: String
  },
  job: {
    type: String
  },
  name: {
    type: String,
  },
  friends: {
    type    : Array,
    default : []
  },
  pictures: {
    type: Array
  },
  befores: {
    type    : Array,
    default : []
  },
  channels: {
    type: Array
  },
  app_preferences: {
    type: Object
  },
  notifications_seen_at: {
    type: Date
  },
  notifications: {
    type    : Array,
    default : []
  },
  n_meepass: {
    type    : Number,
    default : 0
  },
  meepass: {
    type    : Array,
    default : []
  },
  spotted: {
    type    : Array,
    default : []
  },
  shared: {
    type    : Array,
    default : []
  },
  invite_code: {
    type    : String
  },
  sponsor: {
    type    : Object
  },
  sponsees: {
    type    : Array,
    default : []
  },
  location: {
    type: Object
  },
  ideal_night: {
    type: String
  },
  onboarding: {
    type: Array,
    default: []
  },
  alerted_at: {
    type: Date
  }


});

UserSchema.methods.findBeforesByIds = function( callback ){

  var before_ids = _.map( this.befores, function( bfr ){
        return mongoose.Types.ObjectId( bfr.before_id );
      });  

  Before.find({ '_id': { $in: before_ids } }, function( err, befores ){

        if( err ){
          callback( err, null );
        } else {
          callback( null, befores );
        }

  });
}

UserSchema.methods.findBeforesByPresence = function( callback ){

  Before.find({ 
      'status': { '$in': [ 'open', 'canceled' ] },
      $or: [
        {
          'hosts': this.facebook_id
        },
        {
          'groups.members': this.facebook_id
        }
      ]
    }, function( err, befores ){

        if( err ){
          callback( err, null );
        } else {
          callback( null, befores );
        }

  });
}



UserSchema.methods.getChannel = function( channel_name ){

  return _.find( this.channels, function( chan ){
    return chan.name == channel_name;
  });
}

UserSchema.methods.getChatChannel = function( chat_id ){

  return _.find( this.channels, function( chan ){
    return chan.chat_id == chat_id;
  });

}

UserSchema.methods.getChatChannels = function(){

  return  _.map( _.filter( this.channels, function( chan ){
    return chan.chat_id;
  }), 'chat_id' );

}

UserSchema.methods.getPrivateChannel = function(){

  return _.find( this.channels, function( chan ){
          return chan.type == 'personnal'
  }).name;

}

UserSchema.methods.isBot = function(){

  return this.access.indexOf("bot") != -1;

}

UserSchema.statics._makeBeforeItem = function( before, opts ){

  return {

      timezone  : parseFloat( before.timezone ),
      before_id : before._id,
      begins_at : before.begins_at,

      status    : opts.status

  };

}

UserSchema.statics.makeBeforeItem__Host = function( before ){

  return this._makeBeforeItem( before, {
    status: "hosting"
  });


}

UserSchema.statics.makeBeforeItem__Member = function( before, group_status ){

  return this._makeBeforeItem( before, {
    status: group_status
  });

}


UserSchema.statics.makeCheersItem__Sent = function( before, group ){

    var o = this.makeCheersItem( before, group );

    o.cheers_type = "sent";
    o.cheers_id    = md5( JSON.stringify(o) );

    return o;
}

UserSchema.statics.makeCheersItem__Received = function( before, group ){

    var o = this.makeCheersItem( before, group );

    o.cheers_type = "received";
    o.cheers_id   = md5( JSON.stringify(o) );

    return o;
}

UserSchema.statics.makeCheersItem = function( before, group, opts ){

    return {
      "status"       : group.status,
      "before_id"    : before._id,
      "main_member"  : group.main_member,
      "members"      : group.members,
      "main_host"    : before.main_host,
      "place_name"   : before.address.place_name,
      "requested_at" : group.requested_at,
      "chat_id"      : Message.makeChatId( before._id, before.hosts, group.members ),
      "begins_at"    : before.begins_at
    }
}


 // patch function by Léo Jacquemin :)
  // @params  a{ object }
  // @params  b{ object }
  // @returns o{ object }
  // This function copies b prooerties in the a object, only if they
  // already exist in the a object and have the same type. Its like a safe "replace";
  // Works recursively throughout all the keys of course
  // The behavior can be easily altered to allow the b object to copy "new keys", even if
  // they are not present in the a object. 
  UserSchema.methods.patch = function( b, callback ){

    var self = this;

    self._doc = patchify( this._doc, b );
    Object.keys( self._doc ).forEach(function( key ){

      if( key[0] != "_" ){
        self.markModified( key );
      }

    });

    self.save( callback );

  }


  function patchify( a, b ){

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
        
        if( (key in a) && (key in b) && (typeof a[ key ] == typeof b[ key ] || (a[ key ] == null && b[ key ] != null ) ) ){
          
          if( typeof a[ key ] == "object" && a[ key ] != null ){
            return o[ key ] = patchify( a[ key ], b[ key ] );
          } else {
            return o[ key ] = b[ key ];
          }
          
        } else {

          o[ key ] = a[ key ];

        }
      
    });
      
    return o;

  }

module.exports = mongoose.model( 'Users', UserSchema );
