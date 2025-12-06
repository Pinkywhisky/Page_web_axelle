import json
import os
from flask import Flask, jsonify, request, send_from_directory

# --------------------------------------------------------------------
# CONFIGURATION GÉNÉRALE
# --------------------------------------------------------------------

# Chemin absolu vers le dossier frontend (HTML / CSS / JS)
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))

# Fichier JSON où sont stockés les comptes
CLIENTS_FILE = os.path.join(os.path.dirname(__file__), "clients.json")

# On crée l'application Flask
app = Flask(__name__)


# --------------------------------------------------------------------
# OUTILS : CHARGER & SAUVEGARDER LE FICHIER JSON
# --------------------------------------------------------------------

def load_clients():
    """Charge le fichier clients.json.
       Si le fichier n'existe pas, retourne une liste vide."""
    if not os.path.exists(CLIENTS_FILE):
        return []

    try:
        with open(CLIENTS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data
    except Exception as e:
        print("ERREUR lecture JSON :", e)
        return []


def save_clients(clients):
    """Écrit la liste des clients dans clients.json."""
    try:
        with open(CLIENTS_FILE, "w", encoding="utf-8") as f:
            json.dump(clients, f, indent=4, ensure_ascii=False)
    except Exception as e:
        print("ERREUR écriture JSON :", e)


# --------------------------------------------------------------------
# ROUTES POUR LE FRONTEND (site web)
# --------------------------------------------------------------------

@app.route("/")
def index():
    """Envoie la page d'accueil du site."""
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/style.css")
def css():
    """Envoie le fichier CSS."""
    return send_from_directory(FRONTEND_DIR, "style.css")


@app.route("/favicon.ico")
def favicon():
    """Envoie la favicon (l'icône du site)."""
    return send_from_directory(FRONTEND_DIR, "favicon.ico")


# --------------------------------------------------------------------
# API : GET /api/clients
# --------------------------------------------------------------------
@app.route("/api/clients", methods=["GET"])
def api_get_clients():
    """Renvoie la liste complète des clients sous forme de JSON."""
    clients = load_clients()
    return jsonify(clients), 200


# --------------------------------------------------------------------
# API : POST /api/clients
# Inscription d'un utilisateur
# --------------------------------------------------------------------
@app.route("/api/clients", methods=["POST"])
def api_add_client():
    """Ajoute un nouvel utilisateur dans clients.json."""

    clients = load_clients()
    data = request.json  # JSON envoyé par fetch()

    # On récupère les champs obligatoires
    fullName = data.get("fullName", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password")

    # Vérification minimale
    if not fullName or not email or not password:
        return jsonify({"error": "missing fields"}), 400

    # Vérifier que l'e-mail n'est pas déjà utilisé
    for c in clients:
        if c.get("email", "").strip().lower() == email:
            return jsonify({"error": "email already exists"}), 409

    # Si tout est OK → on ajoute l'utilisateur
    clients.append(data)
    save_clients(clients)

    return jsonify({"message": "client added"}), 201


# --------------------------------------------------------------------
# API : DELETE /api/clients/<id>
# Suppression d'un client (admin)
# --------------------------------------------------------------------
@app.route("/api/clients/<int:client_id>", methods=["DELETE"])
def api_delete_client(client_id):
    """Supprime un utilisateur en fonction de son id."""

    clients = load_clients()
    updated = [c for c in clients if c.get("id") != client_id]

    # Vérifier si quelque chose a été supprimé
    if len(updated) == len(clients):
        return jsonify({"error": "client not found"}), 404

    save_clients(updated)
    return jsonify({"message": "client deleted"}), 200


# --------------------------------------------------------------------
# API : PUT /api/clients/<id>
# Mise à jour d'un client (changement de rôle par admin)
# --------------------------------------------------------------------
@app.route("/api/clients/<int:client_id>", methods=["PUT"])
def api_update_client(client_id):
    """Met à jour les informations d'un client (ex : rôle)."""

    clients = load_clients()
    data = request.json

    updated = False

    for i, c in enumerate(clients):
        if c.get("id") == client_id:
            clients[i] = data
            updated = True
            break

    if not updated:
        return jsonify({"error": "client not found"}), 404

    save_clients(clients)
    return jsonify({"message": "client updated"}), 200


# --------------------------------------------------------------------
# API : POST /api/login
# Vérification email + mot de passe
# --------------------------------------------------------------------
@app.route("/api/login", methods=["POST"])
def api_login():
    """Vérifie les identifiants et renvoie l'utilisateur s'ils sont corrects."""

    clients = load_clients()
    data = request.json

    email = data.get("email", "").strip().lower()
    password = data.get("password")

    # Recherche du compte correspondant
    for c in clients:
        if c.get("email", "").strip().lower() == email and c.get("password") == password:
            return jsonify({"user": c}), 200

    # Si aucune correspondance
    return jsonify({"error": "invalid credentials"}), 401


# --------------------------------------------------------------------
# Lancement du serveur Flask
# --------------------------------------------------------------------
if __name__ == "__main__":
    # host="0.0.0.0" → accessible sur le réseau local
    # debug=False → plus stable
    app.run(host="0.0.0.0", port=5000, debug=False)
