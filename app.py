import json
import os
import re
from flask import Flask, jsonify, render_template, request  # pyright: ignore[reportMissingImports]

# --------------------------------------------------------------------
# CONFIGURATION GÉNÉRALE
# --------------------------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CLIENTS_FILE = os.path.join(BASE_DIR, "clients.json")

app = Flask(
    __name__,
    template_folder="templates",
    static_folder="static",
)

EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


# --------------------------------------------------------------------
# OUTILS : CHARGER & SAUVEGARDER LE FICHIER JSON
# --------------------------------------------------------------------

def load_clients():
    """Charge le fichier clients.json.
    Si le fichier n'existe pas ou est invalide, retourne une liste vide.
    """
    if not os.path.exists(CLIENTS_FILE):
        return []

    try:
        with open(CLIENTS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except Exception as e:
        print("ERREUR lecture JSON :", e)
        return []


def save_clients(clients):
    """Écrit la liste des clients dans clients.json."""
    try:
        with open(CLIENTS_FILE, "w", encoding="utf-8") as f:
            json.dump(clients, f, indent=4, ensure_ascii=False)
        return True
    except Exception as e:
        print("ERREUR écriture JSON :", e)
        return False


def normalize_email(email: str) -> str:
    """Nettoie et normalise une adresse e-mail."""
    return (email or "").strip().lower()


def is_valid_email(email: str) -> bool:
    """Valide le format général de l'adresse e-mail."""
    return bool(EMAIL_REGEX.match(email))


def is_ascii_only(value: str) -> bool:
    """Vérifie qu'une chaîne ne contient que des caractères ASCII."""
    try:
        value.encode("ascii")
        return True
    except UnicodeEncodeError:
        return False


def find_client_by_id(clients, client_id: int):
    """Retourne le client correspondant à l'id, sinon None."""
    for client in clients:
        if client.get("id") == client_id:
            return client
    return None


# --------------------------------------------------------------------
# ROUTE FRONTEND
# --------------------------------------------------------------------

@app.route("/")
def index():
    """Affiche la page principale."""
    return render_template("index.html")


# --------------------------------------------------------------------
# API : GET /api/clients
# --------------------------------------------------------------------

@app.route("/api/clients", methods=["GET"])
def api_get_clients():
    """Renvoie la liste complète des clients."""
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
    data = request.get_json(silent=True) or {}

    full_name = (data.get("fullName") or "").strip()
    email = normalize_email(data.get("email"))
    password = data.get("password") or ""
    phone = (data.get("phone") or "").strip()
    animal_type = (data.get("animalType") or "").strip()
    animal_name = (data.get("animalName") or "").strip()
    role = (data.get("role") or "client").strip().lower()

    if not full_name or not email or not password or not animal_type:
        return jsonify({"error": "Merci de remplir tous les champs obligatoires."}), 400

    if not is_valid_email(email):
        return jsonify({"error": "Adresse e-mail invalide."}), 400

    if not is_ascii_only(email):
        return jsonify({"error": "L’adresse e-mail ne doit pas contenir d’accent."}), 400

    if role not in {"client", "admin"}:
        return jsonify({"error": "Rôle invalide."}), 400

    for client in clients:
        if normalize_email(client.get("email")) == email:
            return jsonify({"error": "Cet e-mail est déjà utilisé."}), 409

    new_client = {
        "id": data.get("id"),
        "fullName": full_name,
        "email": email,
        "password": password,
        "phone": phone,
        "animalType": animal_type,
        "animalName": animal_name,
        "role": role,
    }

    if not save_clients(clients + [new_client]):
        return jsonify({"error": "Erreur lors de l'enregistrement du compte."}), 500

    return jsonify({"message": "Compte créé avec succès.", "user": new_client}), 201


# --------------------------------------------------------------------
# API : DELETE /api/clients/<id>
# Suppression d'un client
# --------------------------------------------------------------------

@app.route("/api/clients/<int:client_id>", methods=["DELETE"])
def api_delete_client(client_id):
    """Supprime un utilisateur en fonction de son id."""
    clients = load_clients()
    updated_clients = [c for c in clients if c.get("id") != client_id]

    if len(updated_clients) == len(clients):
        return jsonify({"error": "Membre introuvable."}), 404

    if not save_clients(updated_clients):
        return jsonify({"error": "Erreur lors de la suppression du membre."}), 500

    return jsonify({"message": "Membre supprimé avec succès."}), 200


# --------------------------------------------------------------------
# API : PUT /api/clients/<id>
# Mise à jour d'un client
# --------------------------------------------------------------------

@app.route("/api/clients/<int:client_id>", methods=["PUT"])
def api_update_client(client_id):
    """Met à jour les informations d'un client."""
    clients = load_clients()
    data = request.get_json(silent=True) or {}

    client = find_client_by_id(clients, client_id)
    if client is None:
        return jsonify({"error": "Membre introuvable."}), 404

    full_name = (data.get("fullName") or "").strip()
    email = normalize_email(data.get("email"))
    password = data.get("password") or client.get("password", "")
    phone = (data.get("phone") or "").strip()
    animal_type = (data.get("animalType") or "").strip()
    animal_name = (data.get("animalName") or "").strip()
    role = (data.get("role") or "client").strip().lower()

    if not full_name or not email:
        return jsonify({"error": "Le nom et l’adresse e-mail sont obligatoires."}), 400

    if not is_valid_email(email):
        return jsonify({"error": "Adresse e-mail invalide."}), 400

    if not is_ascii_only(email):
        return jsonify({"error": "L’adresse e-mail ne doit pas contenir d’accent."}), 400

    if role not in {"client", "admin"}:
        return jsonify({"error": "Rôle invalide."}), 400

    for other in clients:
        if other.get("id") != client_id and normalize_email(other.get("email")) == email:
            return jsonify({"error": "Cet e-mail est déjà utilisé par un autre compte."}), 409

    updated_client = {
        "id": client_id,
        "fullName": full_name,
        "email": email,
        "password": password,
        "phone": phone,
        "animalType": animal_type,
        "animalName": animal_name,
        "role": role,
    }

    for index, existing_client in enumerate(clients):
        if existing_client.get("id") == client_id:
            clients[index] = updated_client
            break

    if not save_clients(clients):
        return jsonify({"error": "Erreur lors de la mise à jour du membre."}), 500

    return jsonify({"message": "Membre mis à jour avec succès.", "user": updated_client}), 200


# --------------------------------------------------------------------
# API : POST /api/login
# Vérification email + mot de passe
# --------------------------------------------------------------------

@app.route("/api/login", methods=["POST"])
def api_login():
    """Vérifie les identifiants et renvoie l'utilisateur s'ils sont corrects."""
    clients = load_clients()
    data = request.get_json(silent=True) or {}

    email = normalize_email(data.get("email"))
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Merci de saisir e-mail et mot de passe."}), 400

    for client in clients:
        if normalize_email(client.get("email")) == email and client.get("password") == password:
            return jsonify({"user": client}), 200

    return jsonify({"error": "Identifiants incorrects."}), 401


# --------------------------------------------------------------------
# LANCEMENT
# --------------------------------------------------------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)