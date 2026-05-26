# Presence Animale

Mini application Flask pour un service de garde a domicile et pet-sitting avec:

- espace personnel (inscription, connexion, edition, suppression du compte)
- demandes de garde avec validation par l'espace de gestion
- calendrier des indisponibilites
- gestion des comptes, demandes, jours indisponibles et services presentes
- zone de demande de garde

## Lancer le projet

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Application disponible sur `http://127.0.0.1:5000`.

En local, lancez l'application avec `FLASK_ENV=development` si `SECRET_KEY`
n'est pas definie. En production, definissez obligatoirement une valeur forte
pour `SECRET_KEY`.

## Stockage

Le projet utilise SQLite dans `club_des_pattes.db`.

Au premier lancement:

- si `clients.json` existe, ses comptes sont importes dans la base avec hashage du mot de passe
- sinon aucun admin connu n'est cree automatiquement en production
- pour initialiser un admin en production, definissez `INITIAL_ADMIN_EMAIL` et
  `INITIAL_ADMIN_PASSWORD`

Un admin de secours connu reste possible uniquement en local avec
`FLASK_ENV=development` et `ALLOW_DEV_ADMIN=true`.

## Tests

```bash
python -m unittest discover -s tests
```
