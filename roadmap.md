
#Commands
	- Reset events  : db.events.update({}, { $set : { 'askersList' : []}}, {upsert:true,multi:true});
	- Reset users   : db.users.update({},{ $set: { 'friendList' :[], 'status':'idle', 'socketRooms':[],'eventsAskedList':[] }},{'multi':true, 'upsert':true})
	- Reset friends : db.users.update({},{ $set: { 'friendList' :[] }},{'multi':true, 'upsert':true})
					: db.users.update({ 'name' : { $in : ['Karine','Damon','MorganDeToi']}},{ $set : { 'status': 'hosting'} }, {multi:true,upsert:true})

#Idées
	- 


#Production
	- Database Replica, pre-production & stuff 
	- Validation clientside, validation serverside
	- Mailchimp integration 

#Bugs
	- Changer le titre de la page en fn des notifications
	- Ne pas écrire en dure les choix de drink/mood
	- Bug lors du /f add
	- Refactoring pusher event pour savoir qui est online -> presence channels
	- Clientside routing hashtags #
	- Rendre le chat un minimum persistant : télécharger les msg non lus au click
	- Améliorer le système de logout ( mettre en place un mécanisme de session )

#Schedule 
 	Todo
	- SEO
	- Détecter quand les users mettent des photos au mauvais format
	
	- Définir des routes  GET/events?id="..." et renvoyer un HTML avec des infos sur l'event et un lien d'inscription
	- Mettre une real time sync sur les données... ( nom, age, desc, drink, mood, photo )

#BigWarnings
	- Bug sur le friend link, lors que i > 9 ?
	- Cron jobs Heroku fail to work when sleeping dynos
	- [security] Coder une fn qui vérifie que pour certains events, l'id envoyé correspond bien à celle enregistré 
	  sur le socket qui emet la demande, pour éviter un socket spoofing éventuel (annuler l'event de kk1 d'autre...)

#Warning
	- Cloudinary : public_id , signed.isValid() & regen Timer
	- Valider la signature cloudinary des image uploaded (!)
  
#LTE 
	- Intégrer une vue générale avec une MAP et des pins correspondant aux soirées
	- Appli mobile 
	- Lazy load sur les events et sur les users
