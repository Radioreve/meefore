
	var mongoose = require("mongoose"),
 	      bcrypt = require("bcrypt-nodejs");


var UserSchema = new mongoose.Schema({

  local: {
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    }
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  tokenAuth: String,
  age: {
    type: Number,
    default: 25
  },
  description: {
    type: String,
    default: "Tell us something special about you"
  },
  name: {
    type: String,
    default: "Michel Essentiel"
  },
  phone: {
    type: String,
    default: '06...'
  },
  img: {
    id:{   // id is used client side by cloudinary to build url
    type: String,
    default:'placeholder_spjmx7'
    },
    version:{
      type:String,
      default:'1407342805'
    }
  }

});


UserSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('SocketUsers', UserSchema);