
#Idées
	- Faut que les users puissent lacher un commentaire, genre 24H après la fin d'une soirée, sur la fiche de l'host
	- Implémenter un délire de points, de rewards (visuel), définir hiérarchie, ambassadeur, vip etc...
	- Limiter le nombre de participations possibles par jours
	- Rajouter un data--hint type "attention si vous faites des events chez vous!" 
	- Donner à 'host la possibilité de valider un user, et le nombre de personnes prévues'
	- Faire un système de badges par tag et par palier ET/OU de niveaux. Cadeaux offert à chaque palier
	- Faire un smooth scrolling sur la page events (fixé le semi header, mettre 1 bar semi transparente dégradée en overlay)

#Schedule 

  ~ Lundi
	- Design la page Management, et amélioration du système de chat
  ~ Mardi
  ~ Mercredi
  ~ Jeudi
  ~ Vendredi
	- Socials signins with passport (Facebook & Google)
  ~ Weekend
	- Système d'admin avec privilèe pour monitor (se poser pour réfléchir)
	- Rendre le design responsive @media queries et/ou bootstrap

#Bugs! :@

#Mandatory 
  ~> Dev steps
	- Rédiger le contenu de "First Connexion"

  ~> Deployment Steps
	- Empêcher les double connexion socket
	- Validation clientside, validaton server side

#Design issues
	- 

#LTE 
	- Intégrer une vue générale avec une MAP et des pins correspondant aux soirées
	- appli mobile ?

#Warning
	- Clientside routing
	- Cloudinary : public_id , signed.isValid() & regen Timer
	- Valider la signature cloudinary des image uploaded (!)
	- Coder une fn qui vérifie que pour certains events, l'id envoyé correspond bien à celle enregistré 
	  sur le socket qui emet la demande, pour éviter un socket spoofing éventuel (annuler l'event de kk1 d'autre...)
