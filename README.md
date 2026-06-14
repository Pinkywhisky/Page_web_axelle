# Club des Pattes

Application de gestion de clients et d'animaux pour un service de garde à domicile.

Le projet est désormais une application PHP native avec stockage MariaDB / MySQL.
La racine fonctionnelle officielle se trouve dans le dossier `www/`.

## Technologies

- PHP 8.1+
- MariaDB / MySQL
- HTML
- CSS
- JavaScript

## Installation locale

### Prérequis

- PHP 8.1+
- MariaDB ou MySQL

### Création de la base

```sql
CREATE DATABASE club_des_pattes
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### Import du schéma

Depuis la racine du projet :

```bash
mysql -u admin -p club_des_pattes < www/schema.sql
```

### Configuration

Copier le modèle d'environnement :

```bash
cp .env.example .env
```

Puis renseigner les variables :

```text
DB_HOST
DB_NAME
DB_USER
DB_PASS
APP_NAME
APP_TIMEZONE
```

### Création du premier administrateur

Depuis le dossier `www/` :

```bash
ALLOW_CREATE_ADMIN="true" # dans .env le temps du bootstrap
php create_admin.php admin@example.com motdepasse "Administrateur"
```

Le script `create_admin.php` est un outil de bootstrap local. Il est désactivé par défaut et nécessite `ALLOW_CREATE_ADMIN="true"` dans `.env`.
Remettre `ALLOW_CREATE_ADMIN="false"` après la création du compte.

### Lancement local

Depuis la racine du projet :

```bash
cd www
php -S 0.0.0.0:8000
```

Puis ouvrir :

```text
http://localhost:8000
```

Le dossier `www/` doit être utilisé comme racine web de l'application.

## Fonctionnalités

- Connexion
- Déconnexion
- Inscription client
- Gestion des membres
- Gestion des rôles
- Gestion des animaux
- Demandes de garde
- Sélection des animaux lors d'une demande de garde
- Administration des demandes
- Formulaire de contact

## Structure

```text
www/
├── api/
│   ├── bookings.php
│   ├── contact.php
│   ├── login.php
│   ├── pets.php
│   └── users.php
├── assets/
│   ├── favicon.ico
│   ├── script.js
│   └── style.css
├── config/
│   └── config.php
├── includes/
│   ├── auth.php
│   ├── db.php
│   └── functions.php
├── create_admin.php
├── dashboard.php
├── index.php
├── login.php
├── logout.php
└── schema.sql
```

## Sécurité

- Les mots de passe sont stockés avec `password_hash()`.
- La connexion utilise `password_verify()`.
- L'authentification repose sur les sessions PHP.
- Les API d'administration sont protégées par rôle.
- Un administrateur ne peut pas supprimer son propre compte.
- Les réponses API sont au format JSON.
- Les e-mails invalides ou contenant des accents sont refusés.
- Les requêtes `POST`, `PUT` et `DELETE` sont protégées par jeton CSRF.
- Les cookies de session sont `HttpOnly` et `SameSite=Lax`.
- Le vrai fichier `.env` ne doit pas être suivi par Git.

## Migrations automatiques

Le schéma de référence est `www/schema.sql`.
Pour garder les anciennes installations compatibles, certaines API créent automatiquement les tables manquantes liées aux animaux et complètent les colonnes de messagerie nécessaires.
Pour une installation neuve, importer d'abord `www/schema.sql`.

## Déploiement

Pour un hébergement PHP/MySQL classique :

1. Copier le contenu de `www/` dans la racine web de l'hébergement.
2. Importer `www/schema.sql` dans la base MariaDB/MySQL.
3. Créer et configurer `.env`.
4. Créer le premier administrateur avec `ALLOW_CREATE_ADMIN="true"`.
5. Remettre `ALLOW_CREATE_ADMIN="false"`.
