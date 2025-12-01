from flask import Flask, request, jsonify, send_from_directory
import json
import os

app = Flask(__name__)

# Emplacement du JSON (dans backend)
DB_PATH = os.path.join(os.path.dirname(__file__), "clients.json")

# Emplacement du frontend (dossier frère de backend)
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend")


def load_db():
    """Charge le fichier JSON des clients."""
    if not os.path.exists(DB_PATH):
        return []
    with open(DB_PATH, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except Exception:
            return []


def save_db(data):
    """Sauvegarde la liste des clients dans clients.json."""
    with open(DB_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


# 👉 Route qui sert index.html depuis le dossier frontend
@app.route("/frontend")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")


# (facultatif mais pratique) : route / qui redirige vers /frontend
@app.route("/")
def root():
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.route("/api/login", methods=["POST"])
def login():
    """Login très simple par email : renvoie l'utilisateur + son rôle."""
    data = request.json or {}
    email = (data.get("email") or "").strip().lower()

    if not email:
        return jsonify({"error": "missing email"}), 400

    clients = load_db()
    for c in clients:
        if (c.get("email") or "").strip().lower() == email:
            # trouvée -> on renvoie l'utilisateur complet
            return jsonify({"status": "ok", "user": c}), 200

    return jsonify({"error": "not found"}), 404



# -------- API JSON --------

@app.route("/api/clients", methods=["GET"])
def get_clients():
    """Retourne la liste complète des clients."""
    return jsonify(load_db())


@app.route("/api/clients", methods=["POST"])
def add_client():
    """Ajoute un nouveau client."""
    clients = load_db()
    new_client = request.json

    if not isinstance(new_client, dict):
        return jsonify({"error": "bad payload"}), 400

    if "id" not in new_client:
        return jsonify({"error": "missing id"}), 400

    clients.append(new_client)
    save_db(clients)
    return jsonify({"status": "ok"}), 201


@app.route("/api/clients/<int:client_id>", methods=["DELETE"])
def delete_client(client_id):
    """Supprime un client par ID."""
    clients = load_db()
    new_clients = [c for c in clients if c.get("id") != client_id]

    if len(new_clients) == len(clients):
        return jsonify({"error": "not found"}), 404

    save_db(new_clients)
    return jsonify({"status": "deleted"}), 200


@app.route("/api/clients/<int:client_id>", methods=["PUT"])
def update_client(client_id):
    """Met à jour un client par ID."""
    clients = load_db()
    updated = request.json

    if not isinstance(updated, dict):
        return jsonify({"error": "bad payload"}), 400

    found = False
    for i, c in enumerate(clients):
        if c.get("id") == client_id:
            # On garde l'id original, même si le client envoie autre chose
            updated["id"] = client_id
            clients[i] = updated
            found = True
            break

    if not found:
        return jsonify({"error": "not found"}), 404

    save_db(clients)
    return jsonify({"status": "updated"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
