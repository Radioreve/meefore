
  var mongoose = require("mongoose");
  var settings = require('../config/settings');
  var config   = require('../config/config');
  var bcrypt   = require("bcrypt-nodejs");
  var _        = require('lodash');

  var default_img_id = settings.placeholder.img_id;
  var default_img_vs = settings.placeholder.img_version;

  var UserSchema = new mongoose.Schema({

  contact_email: {
    type: String,
    default: ''
  },
  facebook_email:{
    type: String,
    default:''
  },
  mailchimp_email: {
    type: String,
    default:''
  },
  mailchimp_id: {
    type: String,
    default:''
  },
  facebook_id: {
    type:String,
    default:''
  },
  facebook_url:{
    type:String
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
  // use to make a difference between new users ("new") or regualr users ("idle")
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
    type:String
  },
  job: {
    type: String,
    default:''
  },
  name: {
    type: String,
    required:true,
    default:'Inconnu'
  },
  friends: {
    type:Array,
    default:[]
  },
  pictures: {
    type: Array,
    default: [
      { img_id: default_img_id, img_version: default_img_vs, img_place: 0, is_main: true , hashtag: 'classic' },
      { img_id: default_img_id, img_version: default_img_vs, img_place: 1, is_main: false, hashtag: 'meerofka' },
      { img_id: default_img_id, img_version: default_img_vs, img_place: 2, is_main: false, hashtag: 'swag' },
      { img_id: default_img_id, img_version: default_img_vs, img_place: 3, is_main: false, hashtag: 'chill' },
      { img_id: default_img_id, img_version: default_img_vs, img_place: 4, is_main: false, hashtag: 'hipster' }
      ]
  },
  events: {
    type: Array,
    default: []
  },
  channels: {
    type: Object
  },
  app_preferences: {
    type    : Object,
    default : settings.default_app_preferences
  },
  notifications: {
    type    : Array,
    default : []
  }


});


UserSchema.methods.getChannel = function(){
  return _.result( _.find( this.channels, function(el){ return el.access_name == 'mychan'; }), 'channel_label') ;
};


module.exports = mongoose.model('Users', UserSchema);