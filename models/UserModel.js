
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
  access: {
    type: Array
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
  drink: {
    type: String,
    default:'water'
  },
  mood: {
    type: String,
    default:'happy'
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
  status: {
    type: String
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
  },
  experience: {
    type: Number
  },
  skills: {
    type: Object,
    default: {
      xp: 1000,
      medals: [{
        id:'first_sip',
        name: 'Première gorgée',
        img_id:'lala',
        img_version:'lali', 
        is_main: true,
        earned_date: ''
      }]
    }
  }


});


UserSchema.methods.getChannel = function(){
  return _.result( _.find( this.channels, function(el){ return el.access_name == 'mychan'; }), 'channel_label') ;
};


module.exports = mongoose.model('Users', UserSchema);