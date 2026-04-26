# Club des Pattes

Mini application Flask pour un site vitrine avec:

- espace membre (inscription, connexion, edition, suppression du compte)
- demandes de garde avec validation admin
- calendrier des indisponibilites
- gestion admin des membres, reservations, jours bloques et cartes d'information
- zone de premier contact

## Lancer le projet

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Application disponible sur `http://127.0.0.1:5000`.

## Stockage

Le projet utilise SQLite dans `club_des_pattes.db`.

Au premier lancement:

- si `clients.json` existe, ses comptes sont importes dans la base avec hashage du mot de passe
- sinon un admin de secours est cree

Admin de secours:

- email: `admin@clubdespattes.local`
- mot de passe: `Admin123!`

## Tests

```bash
python -m unittest discover -s tests
```
