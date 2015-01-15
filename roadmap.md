
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
 	Done

 	Todo
	- Créer la vue login mobile 50%
	- Rendre responsive la vue Management ( avec le chat ) + vue add friend 
	- Système d'admin minimal pour monitorer les gens connectés

  Lundi
  Mardi
	- Validation clientside, validaton server side
	- Déploiement live + Nom de domaine
  Mercredi
	- SEO
  3----------
    - Définir de qui j'ai besoin ! 
  4----------
  5---------- 

  ~ NICE TO HAVE
	- Améliorer le système de logout
	- "Someone is typing..."
	- Clientside routing

  ~ FUCK @deadline = 24/12/14!
	- Tester sur tous les navigateurs
	- Tester en production
	- Tester sur vue mobile
  
#LTE 
	- Intégrer une vue générale avec une MAP et des pins correspondant aux soirées
	- Appli mobile 
	- Lazy load sur les events et sur les users

#Warning
	- Cloudinary : public_id , signed.isValid() & regen Timer
	- Valider la signature cloudinary des image uploaded (!)
	- [security] Coder une fn qui vérifie que pour certains events, l'id envoyé correspond bien à celle enregistré 
	  sur le socket qui emet la demande, pour éviter un socket spoofing éventuel (annuler l'event de kk1 d'autre...)
