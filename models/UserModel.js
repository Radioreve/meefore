
  var mongoose = require("mongoose");
  var Before   = require("./BeforeModel");
  var settings = require('../config/settings');
  var config   = require('../config/config');
  var bcrypt   = require("bcrypt-nodejs");
  var _        = require('lodash');

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
  signup_date: {
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
      'status': 'open',
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

};

UserSchema.methods.getChatChannels = function(){

  return  _.map( _.filter( this.channels, function( chan ){
    return chan.chat_id;
  }), 'chat_id' );

}

UserSchema.methods.getPrivateChannel = function(){

  return _.find( this.channels, function( chan ){
          return chan.type == 'personnal'
  }).name;

};


module.exports = mongoose.model( 'Users', UserSchema );
