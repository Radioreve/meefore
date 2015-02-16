
#Commands
	- Reset events  : db.socketevents.update({}, { $set : { 'askersList' : []}}, {upsert:true,multi:true})
	- Reset users   : db.socketusers.update({},{ $set: { 'friendList' :[], 'status':'idle', 'socketRooms':[],'eventsAskedList':[] }},{'multi':true, 'upsert':true})
	- Reset friends : db.socketusers.update({},{ $set: { 'friendList' :[] }},{'multi':true, 'upsert':true})
					: db.socketusers.update({ 'name' : { $in : ['Karine','Damon','MorganDeToi']}},{ $set : { 'status': 'hosting'} }, {multi:true,upsert:true})

#Idées
	- Faut que les users puissent lacher un commentaire, genre 24H après la fin d'une soirée, sur la fiche de l'host
	- Implémenter un délire de points, de rewards (visuel), définir hiérarchie, ambassadeur, vip etc...
	  + faire un système de badges par tag et par palier ET/OU de niveaux. Cadeaux offert à chaque palier
	- Limiter le nombre de participations possibles par jours
	- Mettre un timeout de 10 secondes et gérer l'erreur server
	- Définir des routes  GET/events?id="..." et renvoyer un HTML avec des infos sur l'event et un lien d'inscription

#Schedule 
 	Design
	- Mettre une real time sync sur les données... ( nom, age, desc, drink, mood, photo )
	- can add friends to event that are not mutual?!

 	Todo
	- Système d'admin minimal pour monitorer les gens connectés + panel CTRL+M
			o Nombre de clients connectés ( garçons, filles )
			o Ce qu'ils sont en train de regardé 
			o Nombre d'évènements créés
			o Nombre de personnes inscrites dans un event
	
	- Identifier les users online/offline
	- Validation clientside, validaton serverside
	- Clientside routing hashtags #
	- Réaliser une page "Ambassadors"

	- SEO
	- Améliorer le système de logout
	- "Someone is typing..."

#BigWarnings
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
