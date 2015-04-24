
#Commands
	- Reset events  : db.socketevents.update({}, { $set : { 'askersList' : []}}, {upsert:true,multi:true});
	- Reset users   : db.socketusers.update({},{ $set: { 'friendList' :[], 'status':'idle', 'socketRooms':[],'eventsAskedList':[] }},{'multi':true, 'upsert':true})
	- Reset friends : db.socketusers.update({},{ $set: { 'friendList' :[] }},{'multi':true, 'upsert':true})
					: db.socketusers.update({ 'name' : { $in : ['Karine','Damon','MorganDeToi']}},{ $set : { 'status': 'hosting'} }, {multi:true,upsert:true})

#Idées
	- Faut que les users puissent lacher un commentaire, genre 24H après la fin d'une soirée, sur la fiche de l'host
	- Penser à un back-office analytics (pour faire des reportings)

#Feedbacks
	- Changer le titre de la page en fn des notifications
	- Faire apparaître en + obvious le "find your friends"
	- Traduction de "event suspended" et asker is not online et changement de look
	- Proposer des messages template
	- Remplacer "about" par "qui voulez vous"

#Production
	- Database Replica, pre-production & stuff 
	- Mailchimp integration 

#Schedule 
 	Todo
	- Middleware watcher qui tient à jour la liste des users connected
	- Bloquer les actions des gens qui n'ont pas mis leur photo de profile!
	- Clientside routing hashtags #
	- Validation clientside, validation serverside
	- SEO
	
	- Définir des routes  GET/events?id="..." et renvoyer un HTML avec des infos sur l'event et un lien d'inscription
	- Mettre une real time sync sur les données... ( nom, age, desc, drink, mood, photo )
	- Améliorer le système de logout

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
