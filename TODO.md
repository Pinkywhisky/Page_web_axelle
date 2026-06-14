# Club des Pattes - Roadmap & Suivi

## Version actuelle

* [x] Migration Flask → PHP / MariaDB
* [x] Authentification et gestion des sessions
* [x] Gestion des utilisateurs
* [x] Gestion des animaux
* [x] Gestion des gardes
* [x] Messagerie
* [x] Dashboard administrateur
* [x] Protection CSRF
* [x] Configuration via `.env`
* [x] Audit v1.0

---

# Correctifs à surveiller

## UX

* [x] Vérifier que les coordonnées n'affichent plus aucune information liée aux animaux
* [x] Vérifier que l'ajout d'un animal n'est possible que depuis l'onglet **Animaux**
* [x] Vérifier le comportement du bouton **Répondre** désactivé dans les messages administrateur (tooltip au survol)

## Validation des données

* [ ] Vérifier l'ensemble des contrôles de saisie côté utilisateur
* [ ] Vérifier les validations backend sur toutes les API
* [ ] Vérifier les limites de longueur sur tous les champs texte
* [x] Vérifier la cohérence des numéros de téléphone
* [ ] Vérifier les validations des dates de garde

---

# Tests fonctionnels à effectuer

## Espace client

* [x] Création de compte
* [x] Connexion
* [x] Déconnexion
* [x] Modification du profil
* [x] Ajout d'un animal
* [x] Modification d'un animal
* [x] Suppression d'un animal
* [x] Création d'une demande de garde
* [x] Modification d'une demande de garde
* [O] Consultation des messages --> quand le client envoi un message, il n'apparait pas tant que l'admin n'a pas répondu.

## Espace administrateur

* [ ] Gestion des utilisateurs 
* [O] Gestion des animaux
* [x] Gestion des gardes
* [x] Réponse aux messages
* [ ] Fermeture / réouverture des messages
* [ ] Vérification du dashboard

## Responsive

* [ ] Test smartphone Android
* [ ] Test tablette
* [x] Test navigateur Firefox
* [ ] Test navigateur Chrome / Edge

---

# Roadmap v1.1

## Gestion des disponibilités

* [ ] Définition des disponibilités du pet-sitter
* [ ] Blocage des créneaux indisponibles
* [ ] Vérification des conflits de réservation
    [ ] 2 chiens et 2 chats en même temps
    [ ] Si chien ou chat non sociable alors bloqué à 1 chien ou chat

## Calendrier

* [ ] Vue calendrier mensuelle
* [ ] Vue calendrier administrateur
* [ ] Affichage visuel des gardes

## Animaux

* [ ] Ajout de photos
* [ ] Race
* [ ] Date de naissance
* [ ] Informations vétérinaires

## Suivi

* [ ] Journal d'activité
* [ ] Historique des actions administrateur
* [ ] Possibilité d'initié des messages dans le profil client / administrateur
* [ ] Séparer le nom complet en prénom / nom dans la vue admin pour la modification du profil
* [ ] Séparer le côté profil et animaux en onglet pour la modification des animaux
* [ ] Bien vérifier que les 2 animaux de type identiques ou différents sont bien représenté.
---

# Roadmap v1.2

## Documents

* [ ] Gestion des pièces jointes
* [ ] Téléversement sécurisé
* [ ] Limitation taille et type MIME

## Dossier animal

* [ ] Carnet vétérinaire
* [ ] Carnet de vaccination
* [ ] Documents administratifs

## Exports

* [ ] Export PDF des demandes de garde
* [ ] Export PDF des fiches animaux
* [ ] Export administratif

---

# Idées à étudier

* [ ] Notifications e-mail
* [ ] Rappels automatiques de garde
* [ ] Galerie photo des animaux
* [ ] Signature électronique
* [ ] Paiement en ligne
* [ ] Tableau de bord client enrichi
* [ ] Statistiques d'activité
* [ ] Sauvegarde automatique de la base de données
* [ ] Installation Docker du projet
* [ ] Déploiement automatisé

---

# Notes

* La branche `main` correspond aux versions stables.
* Les nouvelles fonctionnalités doivent être développées sur `develop`.
* Ne jamais versionner le fichier `.env`.
* Version actuelle : **v1.0**
