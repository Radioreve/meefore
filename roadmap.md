
#Commands
	- Reset events  : db.events.update({}, { $set : { 'askersList' : []}}, {upsert:true,multi:true});
	- Reset users   : db.users.update({},{ $set: { 'friendList' :[], 'status':'idle', 'socketRooms':[],'eventsAskedList':[] }},{'multi':true, 'upsert':true})
	- Reset friends : db.users.update({},{ $set: { 'friendList' :[] }},{'multi':true, 'upsert':true})
					: db.users.update({ 'name' : { $in : ['Karine','Damon','MorganDeToi']}},{ $set : { 'status': 'hosting'} }, {multi:true,upsert:true})

#Production
	- Database Replica, pre-production & stuff 
	- Validation clientside, validation serverside
	- Mailchimp integration 

#V2.1 
	- Définir des routes  GET/events?id="..." et renvoyer un HTML avec des infos sur l'event et un lien d'inscription

#BigWarnings
	- Bug sur le friend link, lors que i > 9 ?
	- [security] Coder une fn qui vérifie que pour certains events, l'id envoyé correspond bien à celle enregistré 
	  sur le socket qui emet la demande, pour éviter un socket spoofing éventuel (annuler l'event de kk1 d'autre...)

#Warning
	- Cloudinary : public_id , signed.isValid() & regen Timer
	- Valider la signature cloudinary des image uploaded (!)
  
#LTE 
	- Intégrer une vue générale avec une MAP et des pins correspondant aux soirées
