
	var nodemailer = require('nodemailer'),
		config = require('./config/config')


	var smtpTransport = nodemailer.createTransport("SMTP",{
			service:"Gmail",
			auth:{
				user:config.mail.user
				pass:config.mail.password
			}
		});

	module.exports.sendGlobal = function(options){

		smtpTransport.sendMail({
							from:"PhoneTracker <phonetrackercp@gmail.com>",
							to:data.target+'@chauffeur-prive.com',
							subject:data.answerer+" has left a phone note for you ("+data.firstname+" "+data.lastname+")",
							html:"<div style='padding:20px;margin:20px; background:#eee'><b style='margin-right:5px'> Additionnal comment : </b>" + data.comment + "</div>"

						}, function(err,res){
							if(err){
								console.log('error sending mail');
								socket.emit("error sending mail");
						}
							else{
								console.log('mail successfully sent');
								socket.emit('success sending mail', {mail:data.target+"@chauffeur-prive.com"});
							}
						});


	}