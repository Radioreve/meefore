
	
	var supported = ["fr", "en"];
	// var base_style = "\"background:#eee; padding: 5px 2px; border-radius:2px; display:inline-block;\""
	var text_source = {

		"alert_message_received_subject": {
			"fr": "%sender_name vous a envoyé un message",
			"en": "%sender_name has sent you a message"
		},
		"alert_message_received_body": {
			"fr": [
						"<div><b>Bonjour %receiver_name,</b></div>",
						"<br>",
						"<div>Des messages vous ont été envoyé lorsque vous n'étiez pas connecté.</div>",
						"<div>Pour y répondre, c'est par <a href=\"http://www.meefore.com\">ici</a>.</div>",
						"<br>",
						"<div>A bientôt en soirée,</div>",
						"<div>L'équipe de Meefore</div>"

			].join(''),
			"en": [
						"<div><b>Hi %receiver_name,</b></div>",
						"<br>",
						"<div>You have unread messages in your inbox.</div>",
						"<div>To reply, it happens <a href=\"http://www.meefore.com\">here</a>.</div>",
						"<br>",
						"<div>See you soon around a drink,</div>",
						"<div>The Meefore team</div>"
			].join('')
		},
		"alert_accepted_in_subject": {
			"fr": "Votre demande de participation vient d'être acceptée",
			"en": "Your participation request has been accepted"
		},
		"alert_accepted_in_body": {
			"fr": [
						"<div><b>Bonjour %receiver_name,</b></div>",
						"<br>",
						"<div>Vous avez été accepté dans un meefore.</div>",
						"<div>Pour engager la discussion, c'est par <a href=\"http://www.meefore.com\">ici</a>.</div>",
						"<br>",
						"<div>A bientôt en soirée,</div>",
						"<div>L'équipe de Meefore</div>"

			].join(''),
			"en": [
						"<div><b>Hi %receiver_name,</b></div>",
						"<br>",
						"<div>Your request has been accepted.</div>",
						"<div>To chat with people hosting the pregame party, go <a href=\"http://www.meefore.com\">here</a>.</div>",
						"<br>",
						"<div>See you soon around a drink,</div>",
						"<div>The Meefore team</div>"
			].join('')
		}

	};


	var makeText = function( country_code, text_id ){

		if( supported.indexOf( country_code ) == -1 ){
			country_code = "en";
		}

		return text_source[ text_id ][ country_code ];

	};

	module.exports = {
		makeText: makeText
	};