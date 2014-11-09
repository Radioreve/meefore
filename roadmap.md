
#Idées
	- Faut que les users puissent lacher un commentaire, genre 24H après la fin d'une soirée, sur la fiche de l'host
	- Implémenter un délire de points, de rewards (visuel), définir hiérarchie, ambassadeur, vip etc...
	- Limiter le nombre de participations possibles par jours
	- Rajouter un data--hint type "attention si vous faites des events chez vous!" 
	- Donner à 'host la possibilité de valider un user, et le nombre de personnes prévues'
	- Faire un système de badges par tag et par palier ET/OU de niveaux. Cadeaux offert à chaque palier

#Schedule 

  ~ Lundi
	- Quand on clique sur une photo avec la class ".zoomable", fond noir puis photo affichée en grand avec radius max
	- Mettre un unique loader, sur le bandeau, en format gauche à droite. Plus élégant et cohérent
	- Gérer la terminaison automatique, implémenter le state "frozen" entre 7h du mat, et 14h.
	- Ajouter dynamiquement nombre de participants 
  ~ Mardi
  ~ Mercredi
  ~ Jeudi
	- Design la page Management...
  ~ Vendredi
	- Socials signins with passport (Facebook & Google)
  ~ Weekend
	- Rendre le design responsive @media queries et/ou bootstrap

#Bugs! :@
	- Validation des caractères invalides !!!!!

#Mandatory 
  ~> Dev steps
	- Rédiger le contenu de "First Connexion"

  ~> Deployment Steps
	- Validation clientside, validaton server side

#Design issues hello
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
