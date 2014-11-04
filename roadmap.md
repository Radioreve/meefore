
#Idées
	- Faut que les users puissent lacher un commentaire, genre 24H après la fin d'une soirée, sur la fiche de l'host
	- Implémenter un délire de points, de rewards (visuel), définir hiérarchie, ambassadeur, vip etc...
	- Limiter le nombre de participations possibles par jours
	- Rajouter un data--hint type "attention si vous faites des events chez vous!" 
	- Donner à 'host la possibilité de valider un user, et le nombre de personnes prévues'
	- Faire un système de badges par tag et par palier ET/OU de niveaux. Cadeaux offert à chaque palier

#Schedule 

  ~ Lundi
	- Nodemailer (email bienvenue + mot de passe oublié) 
  ~ Mardi
	- Gérer la terminaison automatique, implémenter le state "frozen" entre 7h du mat, et 14h.
  ~ Mercredi
	- Ajouter dynamiquement nombre de participants 
  ~ Jeudi
	- Rendre le design responsive @media queries et/ou bootstrap
  ~ Vendredi
	- Design la page Management...
  ~ Weekend
	- Socials signins with passport (Facebook & Google)

#Bugs! :@

#Mandatory 
  ~> Dev steps
	- Rédiger le contenu de "First Connexion"

  ~> Deployment Steps
	- Validation clientside, validaton server side

#Design issues
	- Eventuellement pictogramms en fin 

#Refactor
	- Utiliser le Module Pattern
	- Utiliser JsRender

#Autre 
	- Intégrer une vue générale avec une MAP et des pins correspondant aux soirées
	- appli mobile ?

#Warning
	- Clientside routing
	- Cloudinary : public_id , signed.isValid() & regen Timer
	- Valider la signature cloudinary des image uploaded (!)
