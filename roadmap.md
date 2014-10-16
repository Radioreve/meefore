
#Bugs! :@
	

#Currently
  ~> Today
	- Toast msg vide (lorsqu'on login sans pw)
	- Ajouter une petite croix pour fermer un chat
	- Ajouter le nombre de participants genre (4/25), avec possibilité de l'aug dans le manage panel. 

#Mandatory 
  ~> First steps 
	- Gérer la suspension/annulation/terminaison
	- Penser à styliser la page *events*, plein de carrés?
	- Lazy loading sur les events (dabord click, puis scroll)
	- Critère de recherche (HOUR+TAG) Typeahead? [women only, boy only, apéro, afterwork, nightclub, etc..]
	- Socials signins with passport 

  ~> Second Steps
	- Fonction showModal(), notamment pour la première vue, avec background blanc transparent
	- Nodemailer (email bienvenue + mot de passe oublié) 
	- Intégrer une vue générale avec une MAP et des pins correspondant aux soirées

  ~> Deployment Steps
	- Validation clientside, validaton server side

#Design issues
	- Avec une mise à jour dynamique des events... 

#Refactor
	- Nothing

#Autre 
	- appli mobile ?
	- cloudinary : public_id , signed.isValid() & regen Timer
	- clientside routing

#Warning
	- Valider la signature cloudinary des image uploaded (!)
 