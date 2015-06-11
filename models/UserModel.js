
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
  description: {
    type: String,
    default:''
  },
  name: {
    type: String,
    required:true,
    default:'Inconnu'
  },
  favoriteDrink: {
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
  imgId:{  
    type: String,
    default:'placeholder_spjmx7'
  },
  imgVersion:{
      type: String,
      default: '1407342805'
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