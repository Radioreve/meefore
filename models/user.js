
	var mongoose = require("mongoose"),
		bcrypt = require("bcrypt-nodejs");


	var UserSchema = new mongoose.Schema({
				
		local     : {
			name	  : String,
			email     : {
						type:String, required:true
					},	
			password  :  {type: String, required:true}
		},
		isAdmin : {
			type: Boolean, default: false
		}

	});
	
	
	UserSchema.methods.generateHash = function(password){
		return bcrypt.hashSync(password, bcrypt.genSaltSync(8),null);
	};

	UserSchema.methods.validPassword = function(password){
		return bcrypt.compareSync(password, this.local.password);
	};

	module.exports = mongoose.model('SocketUsers', UserSchema);
