
	var mongoose = require("mongoose"),
      settings = require('../config/settings'),
 	      bcrypt = require("bcrypt-nodejs"),
        _ = require('lodash');

var UserSchema = new mongoose.Schema({

  facebook_email:{
    type:String,
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
    default: { short_lived: null, long_lived: null, long_lived_valid_until: null }
  },
  signup_date: {
    type: Date
  },
  access: {
    type: Array,
    default:['standard']
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
      { img_id: settings.placeholder.img_id, img_version: settings.placeholder.img_version, img_place: 0, is_main: true , hashtag: 'classic' },
      { img_id: settings.placeholder.img_id, img_version: settings.placeholder.img_version, img_place: 1, is_main: false, hashtag: 'meerofka' },
      { img_id: settings.placeholder.img_id, img_version: settings.placeholder.img_version, img_place: 2, is_main: false, hashtag: 'swag' },
      { img_id: settings.placeholder.img_id, img_version: settings.placeholder.img_version, img_place: 3, is_main: false, hashtag: 'chill' },
      { img_id: settings.placeholder.img_id, img_version: settings.placeholder.img_version, img_place: 4, is_main: false, hashtag: 'hipster' }
      ]
  },
  status: {
    type: String,
    default: 'new'
  },
  events: {
    type: Array,
    default: []
  },
  channels: {
    type: Object
  },
  app_preferences: {
    type: Object,
    default: {
      email: {
        'newsletter'  : 'yes',
        'invitations' : 'no'
      },
      ux: {
        'auto_login': 'no'
      }
    }
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