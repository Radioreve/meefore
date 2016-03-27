
  var mongoose = require("mongoose");
  var settings = require('../config/settings');
  var config   = require('../config/config');
  var bcrypt   = require("bcrypt-nodejs");
  var _        = require('lodash');

  var UserSchema = new mongoose.Schema({

  contact_email: {
    type: String
  },
  facebook_email:{
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
  events: {
    type    : Array,
    default : []
  },
  channels: {
    type: Object
  },
  app_preferences: {
    type    : Object
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


UserSchema.methods.getChannel = function(){
  return _.result( _.find( this.channels, function(el){ return el.access_name == 'mychan'; }), 'channel_label') ;
};


module.exports = mongoose.model('Users', UserSchema);