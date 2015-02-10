
	var mongoose = require("mongoose"),
 	      bcrypt = require("bcrypt-nodejs");

var UserSchema = new mongoose.Schema({

  local: {
    email: {
      type: String,
    },
    password: {
      type: String,
    },
  },
  facebookId: {
    type:String
  },
  signupDate: {
    type: Date
  },
  access: {
    type: String,
    default: 'standard'
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
    type: String
  },
  name: {
    type: String,
    default:"Inconnu"
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
  socketRooms:{
    type: Array,
    default: []
  },
  newsletter:{
    type: Boolean,
    default: true
  }


});

UserSchema.statics.fetchUser = function( userId, userSocket ){

  var userInformations = {};

   this.findById( userId, function(err, user ){
    if(err){
      return console.log('Error ---- ' + err );
    }

      userInformations = {

              _id             :  user._id,
              email           :  user.local.email,
              name            :  user.name,
              age             :  user.age,
              status          :  user.status,
              description     :  user.description,
              imgId           :  user.imgId,
              imgVersion      :  user.imgVersion,
              eventsAskedList :  user.eventsAskedList,
              hostedEventId   :  user.hostedEventId,
              newsletter      :  user.newsletter
      };

     userSocket.emit('fetch user success', userInformations );

   });

};

UserSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('SocketUsers', UserSchema);