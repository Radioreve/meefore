
#Bugs! :@
	
	- Bug d'affichage avec z-index & multichat (HostView);
	- Bug d'affichage sur les chatMsg (affiche le dernier en retard)

#Currently

 ~> Today
	- Gérer la suspension/annulation/terminaison

#Mandatory 

  ~> First step 
	- Socials signins with passport 
	- Penser à styliser la page *events*, plein de carrés?
	- Lazy loading sur les events (dabord click, puis scroll)

  ~> SecondStep
	- Critère de recherche (HOUR+TAG) Typeahead?
	- Validation clientside, validaton server side
	- Fonction showModal(), notamment pour la première vue, avec background blanc transparent
	- Nodemailer (email bienvenue + mot de passe oublié)  

#Design issues

	- Avec une mise à jour dynamique des events... 

#Autre 

	- Intégrer une vue générale avec une MAP et des pins correspondant aux soirées
	- appli mobile ?
	- cloudinary : public_id , signed.isValid() & regen Timer
	- clientside routing



#Warning
		
	- Valider la signature cloudinary des image uploaded (!)
 