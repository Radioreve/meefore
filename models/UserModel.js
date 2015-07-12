
	var mongoose = require("mongoose"),
 	      bcrypt = require("bcrypt-nodejs"),
        _ = require('lodash');

var UserSchema = new mongoose.Schema({

  email:{
    type:String,
    default:''
  },
  facebookId: {
    type:String,
    default:''
  },
  facebookURL:{
    type:String
  },
  signupDate: {
    type: Date
  },
  access: {
    type: Array,
    default:['standard']
  },
  tokenAuth: String,
  age: {
    type: Number,
    default: 25
  },
  gender: {
    type:String
  },
  job: {
    type: String,
    default:''
  },
  description: {
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
    default:'whatever'
  },
  location: {
    type: Number,
    default: 1
  },
  friendList: {
    type:Array,
    default:[]
  },
  pictures: {
    type: Array,
    default: [
      { imgId: 'placeholder_spjmx7', imgVersion: '1407342805', imgPlace: 0, isMain: true , hashtag: 'classic' },
      { imgId: 'placeholder_spjmx7', imgVersion: '1407342805', imgPlace: 1, isMain: false, hashtag: 'meerofka' },
      { imgId: 'placeholder_spjmx7', imgVersion: '1407342805', imgPlace: 2, isMain: false, hashtag: 'swag' },
      { imgId: 'placeholder_spjmx7', imgVersion: '1407342805', imgPlace: 3, isMain: false, hashtag: 'chill' },
      { imgId: 'placeholder_spjmx7', imgVersion: '1407342805', imgPlace: 4, isMain: false, hashtag: 'hipster' }
      ]
  },
  status:{
    type: String,
    default: 'new'
  },
  eventsAskedList:{
    type: Array,
    default: []
  },
  hostedEventId:{
    type: String
  },
  myChannels: {
    type: Array,
    default: []
  },
  newsletter:{
    type: Boolean,
    default: true
  }


});


UserSchema.methods.getChannel = function(){
  return _.result( _.find( this.myChannels, function(el){ return el.accessName == 'mychan'; }), 'channelName') ;
};

UserSchema.methods.unaskForEvent = function( eventId ){
  this.eventsAskedList.pull( eventId );
  return this;
}

module.exports = mongoose.model('Users', UserSchema);