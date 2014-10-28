
#Idées
	- Faut que les users puissent lacher un commentaire, genre 24H après la fin d'une soirée, sur la fiche de l'host
	- Filtrer sur l'arondissement et l'heure
	- Rajouter un data--hint type "attention si vous faites des events chez vous!" 
	- Donner à 'host la possibilité de valider un user, et le nombre de personnes prévues'

#Schedule 

  ~ Lundi
	- Filtrer sur l'heure, sur le lieu. Incorporer l'arondissement dans l'EventModel
	- Incorporer Google Material Design pour "Ask In Click" 
  ~ Mardi
	- Nodemailer (email bienvenue + mot de passe oublié) 
	- Gérer la terminaison automatique
  ~ Mercredi
	- Ajouter dynamiquement nombre de participants 
	- Rendre le design responsive @media queries et/ou bootstrap
  ~ Jeudi
    - Révisions TelRes + Mises à jours BDA
  ~ Vendredi
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
	- cloudinary : public_id , signed.isValid() & regen Timer
	- clientside routing

#Warning
	- Valider la signature cloudinary des image uploaded (!)
