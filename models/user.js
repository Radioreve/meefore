
	var mongoose = require('mongoose'),
		bcrypt = require('bcrypt-nodejs');

		var userSchema = mongoose.Schema({

			name: {
				type : String,
				required: true
			},
			email:{
				type : String,
				required: true,
				unique: true
			},
			password: String,
			city: String

		});

		userSchema.pre('save',function(next){
			if(this.email=='jean@gmail.com'){
				console.log('Alert aux gogoles');
				return;
			}
			this.findOne({email:this.email},function(err,user){
				if(user){
					console.log('People already exist!');
					return;
				}
			});
			next();
		})

	module.exports = mongoose.model('SocketUsers', userSchema);