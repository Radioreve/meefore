
	var mongoose = require("mongoose"),
 	      bcrypt = require("bcrypt-nodejs"),
        _ = require('lodash');

var UserSchema = new mongoose.Schema({

  local:{
    email: {
    type: String,
    default:''
  },
  password: {
    type: String,
  }
},
  email:{
    type:String,
    default:''
  },
  password:{
    type:String
  },
  facebookId: {
    type:String,
    default:''
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
    default:'Unknown'
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


UserSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

UserSchema.statics.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.getChannel = function(){
  return _.result( _.find( this.myChannels, function(el){ return el.accessName == 'mychan'; }), 'channelName') ;
};

UserSchema.methods.unaskForEvent = function( eventId ){
  this.eventsAskedList.pull( eventId );
  return this;
}

module.exports = mongoose.model('Users', UserSchema);