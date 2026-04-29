import json
import os
import re
import sqlite3
from datetime import date, timedelta
from functools import wraps

from flask import (
    Flask,
    current_app,
    g,
    jsonify,
    render_template,
    request,
    session,
)
from werkzeug.security import check_password_hash, generate_password_hash


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DATABASE = os.path.join(BASE_DIR, "club_des_pattes.db")
DEFAULT_CLIENTS_FILE = os.path.join(BASE_DIR, "clients.json")
DEFAULT_ADMIN_EMAIL = "admin@clubdespattes.local"
DEFAULT_ADMIN_PASSWORD = "Admin123!"

EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
ANIMAL_TYPES = {"chien", "chat"}
TIME_SLOTS = {
    "matin": "Matin",
    "apres-midi": "Apres-midi",
    "journee": "Journee complete",
    "soir": "Soiree",
}
BOOKING_STATUSES = {"pending", "approved", "rejected", "cancelled"}
CONTACT_STATUSES = {"new", "handled"}

SCHEMA_SQL = """
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    animal_type TEXT NOT NULL DEFAULT '',
    animal_name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'client',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (role IN ('client', 'admin'))
);

CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Accompagnement',
    description TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blocked_dates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    block_date TEXT NOT NULL UNIQUE,
    reason TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS booking_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    service_type TEXT NOT NULL,
    animal_type TEXT NOT NULL,
    animal_name TEXT NOT NULL DEFAULT '',
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    admin_note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS contact_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (status IN ('new', 'handled'))
);
"""

DEFAULT_ACTIVITIES = [
    {
        "title": "Éducation canine du quotidien",
        "category": "Éducation",
        "description": "Séances individuelles pour poser des bases claires, travailler la marche, le rappel et retrouver une relation plus sereine avec votre chien.",
        "sort_order": 1,
    },
    {
        "title": "Gardes chien et visites chat",
        "category": "Absences",
        "description": "Gardes à domicile, visites de confort et suivi rassurant pour vos chiens et vos chats pendant vos absences.",
        "sort_order": 2,
    },
    {
        "title": "Préparation des gardes",
        "category": "Organisation",
        "description": "Calendrier de disponibilités, demande de créneau et confirmation manuelle pour planifier les gardes avec clarté et douceur.",
        "sort_order": 3,
    },
]

LEGACY_DEFAULT_ACTIVITY_TITLES = {
    "Visites a domicile",
    "Gardes sur mesure",
    "Accompagnement quotidien",
}


def normalize_email(email: str) -> str:
    return (email or "").strip().lower()


def is_valid_email(email: str) -> bool:
    return bool(EMAIL_REGEX.match(email or ""))


def split_full_name(full_name: str):
    cleaned = (full_name or "").strip()
    if not cleaned:
        return "", ""

    parts = cleaned.split()
    if len(parts) == 1:
        return parts[0], ""

    return parts[0], " ".join(parts[1:])


def parse_iso_date(raw_value: str) -> date:
    return date.fromisoformat((raw_value or "").strip())


def daterange(start_date: date, end_date: date):
    current = start_date
    while current <= end_date:
        yield current
        current += timedelta(days=1)


def get_db():
    if "db" not in g:
        database_path = current_app.config["DATABASE"]
        g.db = sqlite3.connect(database_path)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


def close_db(_exception=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def query_one(query, params=()):
    return get_db().execute(query, params).fetchone()


def query_all(query, params=()):
    return get_db().execute(query, params).fetchall()


def load_legacy_clients(clients_file: str):
    if not os.path.exists(clients_file):
        return []

    try:
        with open(clients_file, "r", encoding="utf-8") as file_handle:
            data = json.load(file_handle)
    except (OSError, json.JSONDecodeError):
        return []

    return data if isinstance(data, list) else []


def init_database():
    db = get_db()
    db.executescript(SCHEMA_SQL)
    seed_users(db)
    seed_activities(db)
    db.commit()


def seed_users(db):
    existing_users = db.execute("SELECT COUNT(*) AS count FROM users").fetchone()["count"]
    if existing_users:
        return

    imported = 0
    for legacy_client in load_legacy_clients(current_app.config["CLIENTS_FILE"]):
        email = normalize_email(legacy_client.get("email"))
        password = legacy_client.get("password") or ""
        full_name = (legacy_client.get("fullName") or "").strip()
        role = (legacy_client.get("role") or "client").strip().lower()
        animal_type = (legacy_client.get("animalType") or "").strip().lower()

        if not email or not password or not full_name or not is_valid_email(email):
            continue

        if role not in {"client", "admin"}:
            role = "client"

        if animal_type and animal_type not in ANIMAL_TYPES:
            animal_type = ""

        db.execute(
            """
            INSERT INTO users (full_name, email, password_hash, phone, animal_type, animal_name, role)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                full_name,
                email,
                generate_password_hash(password),
                (legacy_client.get("phone") or "").strip(),
                animal_type,
                (legacy_client.get("animalName") or "").strip(),
                role,
            ),
        )
        imported += 1

    if imported:
        return

    db.execute(
        """
        INSERT INTO users (full_name, email, password_hash, phone, animal_type, animal_name, role)
        VALUES (?, ?, ?, '', '', '', 'admin')
        """,
        (
            "Administrateur",
            DEFAULT_ADMIN_EMAIL,
            generate_password_hash(DEFAULT_ADMIN_PASSWORD),
        ),
    )


def seed_activities(db):
    existing_rows = db.execute(
        "SELECT id, title FROM activities ORDER BY sort_order ASC, id ASC"
    ).fetchall()

    if existing_rows:
        existing_titles = {row["title"] for row in existing_rows}
        if len(existing_rows) == 3 and existing_titles == LEGACY_DEFAULT_ACTIVITY_TITLES:
            db.execute("DELETE FROM activities")
        else:
            return

    for activity in DEFAULT_ACTIVITIES:
        db.execute(
            """
            INSERT INTO activities (title, category, description, sort_order)
            VALUES (?, ?, ?, ?)
            """,
            (
                activity["title"],
                activity["category"],
                activity["description"],
                activity["sort_order"],
            ),
        )


def serialize_user(row):
    if row is None:
        return None

    first_name, last_name = split_full_name(row["full_name"])

    return {
        "id": row["id"],
        "firstName": first_name,
        "lastName": last_name,
        "fullName": row["full_name"],
        "email": row["email"],
        "phone": row["phone"],
        "animalType": row["animal_type"],
        "animalName": row["animal_name"],
        "role": row["role"],
        "createdAt": row["created_at"],
    }


def serialize_activity(row):
    return {
        "id": row["id"],
        "title": row["title"],
        "category": row["category"],
        "description": row["description"],
        "sortOrder": row["sort_order"],
        "updatedAt": row["updated_at"],
    }


def serialize_blocked_date(row):
    return {
        "id": row["id"],
        "date": row["block_date"],
        "reason": row["reason"],
        "createdAt": row["created_at"],
    }


def serialize_contact(row):
    return {
        "id": row["id"],
        "fullName": row["full_name"],
        "email": row["email"],
        "phone": row["phone"],
        "message": row["message"],
        "status": row["status"],
        "createdAt": row["created_at"],
    }


def serialize_booking(row):
    return {
        "id": row["id"],
        "userId": row["user_id"],
        "fullName": row["full_name"],
        "email": row["email"],
        "serviceType": row["service_type"],
        "animalType": row["animal_type"],
        "animalName": row["animal_name"],
        "startDate": row["start_date"],
        "endDate": row["end_date"],
        "timeSlot": row["time_slot"],
        "notes": row["notes"],
        "status": row["status"],
        "adminNote": row["admin_note"],
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


def get_current_user():
    user_id = session.get("user_id")
    if not user_id:
        return None

    return query_one("SELECT * FROM users WHERE id = ?", (user_id,))


def login_required(route_handler):
    @wraps(route_handler)
    def wrapped(*args, **kwargs):
        user = get_current_user()
        if user is None:
            return jsonify({"error": "Connexion requise."}), 401
        return route_handler(user, *args, **kwargs)

    return wrapped


def admin_required(route_handler):
    @wraps(route_handler)
    @login_required
    def wrapped(user, *args, **kwargs):
        if user["role"] != "admin":
            return jsonify({"error": "Acces reserve a l'administration."}), 403
        return route_handler(user, *args, **kwargs)

    return wrapped


def get_unavailable_dates():
    blocked_rows = query_all("SELECT * FROM blocked_dates ORDER BY block_date ASC")
    approved_rows = query_all(
        """
        SELECT booking_requests.*, users.full_name, users.email
        FROM booking_requests
        JOIN users ON users.id = booking_requests.user_id
        WHERE booking_requests.status = 'approved'
        ORDER BY booking_requests.start_date ASC
        """
    )

    unavailable = {}
    for row in blocked_rows:
        unavailable[row["block_date"]] = {
            "date": row["block_date"],
            "reason": row["reason"] or "Date indisponible",
            "source": "blocked",
        }

    for row in approved_rows:
        for current_date in daterange(parse_iso_date(row["start_date"]), parse_iso_date(row["end_date"])):
            iso_date = current_date.isoformat()
            unavailable[iso_date] = {
                "date": iso_date,
                "reason": f"Garde confirmee pour {row['full_name']}",
                "source": "booking",
            }

    return sorted(unavailable.values(), key=lambda item: item["date"])


def booking_has_conflict(start_date: date, end_date: date, exclude_booking_id=None):
    db = get_db()
    conflict = db.execute(
        """
        SELECT id
        FROM booking_requests
        WHERE status = 'approved'
          AND NOT (end_date < ? OR start_date > ?)
          AND (? IS NULL OR id != ?)
        LIMIT 1
        """,
        (start_date.isoformat(), end_date.isoformat(), exclude_booking_id, exclude_booking_id),
    ).fetchone()

    if conflict is not None:
        return True

    blocked = db.execute(
        """
        SELECT id
        FROM blocked_dates
        WHERE block_date BETWEEN ? AND ?
        LIMIT 1
        """,
        (start_date.isoformat(), end_date.isoformat()),
    ).fetchone()

    return blocked is not None


def build_admin_payload():
    members = [
        serialize_user(row)
        for row in query_all("SELECT * FROM users ORDER BY created_at DESC, id DESC")
    ]
    bookings = [
        serialize_booking(row)
        for row in query_all(
            """
            SELECT booking_requests.*, users.full_name, users.email
            FROM booking_requests
            JOIN users ON users.id = booking_requests.user_id
            ORDER BY
                CASE booking_requests.status
                    WHEN 'pending' THEN 0
                    WHEN 'approved' THEN 1
                    WHEN 'rejected' THEN 2
                    WHEN 'cancelled' THEN 3
                END,
                booking_requests.start_date ASC,
                booking_requests.id DESC
            """
        )
    ]
    blocked_dates = [
        serialize_blocked_date(row)
        for row in query_all("SELECT * FROM blocked_dates ORDER BY block_date ASC")
    ]
    contacts = [
        serialize_contact(row)
        for row in query_all("SELECT * FROM contact_requests ORDER BY created_at DESC, id DESC")
    ]

    return {
        "stats": {
            "memberCount": len(members),
            "bookingCount": len(bookings),
            "pendingBookingCount": len([item for item in bookings if item["status"] == "pending"]),
            "newContactCount": len([item for item in contacts if item["status"] == "new"]),
        },
        "members": members,
        "bookings": bookings,
        "blockedDates": blocked_dates,
        "contacts": contacts,
    }


def validate_profile_payload(data, require_password=False):
    first_name = (data.get("firstName") or "").strip()
    last_name = (data.get("lastName") or "").strip()
    full_name = (data.get("fullName") or "").strip()
    email = normalize_email(data.get("email"))
    password = data.get("password") or ""
    phone = (data.get("phone") or "").strip()
    animal_type = (data.get("animalType") or "").strip().lower()
    animal_name = (data.get("animalName") or "").strip()

    if not full_name and (first_name or last_name):
        full_name = " ".join(part for part in [first_name, last_name] if part).strip()

    if not full_name or not email:
        return None, "Le nom complet et l'adresse e-mail sont obligatoires."

    if not is_valid_email(email):
        return None, "Adresse e-mail invalide."

    if require_password and len(password) < 6:
        return None, "Le mot de passe doit contenir au moins 6 caracteres."

    if animal_type and animal_type not in ANIMAL_TYPES:
        return None, "Type d'animal invalide."

    return {
        "firstName": first_name,
        "lastName": last_name,
        "fullName": full_name,
        "email": email,
        "password": password,
        "phone": phone,
        "animalType": animal_type,
        "animalName": animal_name,
    }, None


def create_app(test_config=None):
    app = Flask(__name__, template_folder="templates", static_folder="static")
    app.config.update(
        SECRET_KEY=os.environ.get("SECRET_KEY", "club-des-pattes-dev-key"),
        DATABASE=os.environ.get("APP_DATABASE", DEFAULT_DATABASE),
        CLIENTS_FILE=DEFAULT_CLIENTS_FILE,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_HTTPONLY=True,
    )

    if test_config:
        app.config.update(test_config)

    @app.teardown_appcontext
    def teardown_db(exception):
        close_db(exception)

    with app.app_context():
        init_database()

    @app.get("/")
    def index():
        return render_template("index.html")

    @app.get("/api/bootstrap")
    def api_bootstrap():
        user = get_current_user()
        payload = {
            "user": serialize_user(user),
            "activities": [
                serialize_activity(row)
                for row in query_all("SELECT * FROM activities ORDER BY sort_order ASC, id ASC")
            ],
            "unavailableDates": get_unavailable_dates(),
            "myBookings": [],
            "admin": None,
        }

        if user is not None:
            payload["myBookings"] = [
                serialize_booking(row)
                for row in query_all(
                    """
                    SELECT booking_requests.*, users.full_name, users.email
                    FROM booking_requests
                    JOIN users ON users.id = booking_requests.user_id
                    WHERE booking_requests.user_id = ?
                    ORDER BY booking_requests.created_at DESC, booking_requests.id DESC
                    """,
                    (user["id"],),
                )
            ]

            if user["role"] == "admin":
                payload["admin"] = build_admin_payload()

        return jsonify(payload), 200

    @app.post("/api/register")
    def api_register():
        data = request.get_json(silent=True) or {}
        payload, error_message = validate_profile_payload(data, require_password=True)
        if error_message:
            return jsonify({"error": error_message}), 400

        if query_one("SELECT id FROM users WHERE email = ?", (payload["email"],)) is not None:
            return jsonify({"error": "Cet e-mail est deja utilise."}), 409

        db = get_db()
        cursor = db.execute(
            """
            INSERT INTO users (full_name, email, password_hash, phone, animal_type, animal_name, role)
            VALUES (?, ?, ?, ?, ?, ?, 'client')
            """,
            (
                payload["fullName"],
                payload["email"],
                generate_password_hash(payload["password"]),
                payload["phone"],
                payload["animalType"],
                payload["animalName"],
            ),
        )
        db.commit()

        user = query_one("SELECT * FROM users WHERE id = ?", (cursor.lastrowid,))
        session["user_id"] = user["id"]
        return jsonify({"message": "Compte cree avec succes.", "user": serialize_user(user)}), 201

    @app.post("/api/login")
    def api_login():
        data = request.get_json(silent=True) or {}
        email = normalize_email(data.get("email"))
        password = data.get("password") or ""

        if not email or not password:
            return jsonify({"error": "Merci de saisir e-mail et mot de passe."}), 400

        user = query_one("SELECT * FROM users WHERE email = ?", (email,))
        if user is None or not check_password_hash(user["password_hash"], password):
            return jsonify({"error": "Identifiants incorrects."}), 401

        session["user_id"] = user["id"]
        return jsonify({"message": "Connexion reussie.", "user": serialize_user(user)}), 200

    @app.post("/api/logout")
    def api_logout():
        session.clear()
        return jsonify({"message": "Deconnexion reussie."}), 200

    @app.put("/api/account")
    @login_required
    def api_update_account(user):
        data = request.get_json(silent=True) or {}
        payload, error_message = validate_profile_payload(data, require_password=False)
        if error_message:
            return jsonify({"error": error_message}), 400

        existing = query_one(
            "SELECT id FROM users WHERE email = ? AND id != ?",
            (payload["email"], user["id"]),
        )
        if existing is not None:
            return jsonify({"error": "Cet e-mail est deja utilise par un autre compte."}), 409

        db = get_db()
        db.execute(
            """
            UPDATE users
            SET full_name = ?, email = ?, phone = ?, animal_type = ?, animal_name = ?
            WHERE id = ?
            """,
            (
                payload["fullName"],
                payload["email"],
                payload["phone"],
                payload["animalType"],
                payload["animalName"],
                user["id"],
            ),
        )
        db.commit()

        updated_user = query_one("SELECT * FROM users WHERE id = ?", (user["id"],))
        session["user_id"] = updated_user["id"]
        return jsonify({"message": "Profil mis a jour.", "user": serialize_user(updated_user)}), 200

    @app.delete("/api/account")
    @login_required
    def api_delete_account(user):
        if user["role"] == "admin":
            admin_count = query_one("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'")["count"]
            if admin_count <= 1:
                return jsonify({"error": "Impossible de supprimer le dernier administrateur."}), 409

        db = get_db()
        db.execute("DELETE FROM users WHERE id = ?", (user["id"],))
        db.commit()
        session.clear()
        return jsonify({"message": "Compte supprime."}), 200

    @app.post("/api/contact")
    def api_contact():
        data = request.get_json(silent=True) or {}
        full_name = (data.get("fullName") or "").strip()
        email = normalize_email(data.get("email"))
        phone = (data.get("phone") or "").strip()
        message = (data.get("message") or "").strip()

        if not full_name or not email or not message:
            return jsonify({"error": "Nom, e-mail et message sont obligatoires."}), 400

        if not is_valid_email(email):
            return jsonify({"error": "Adresse e-mail invalide."}), 400

        db = get_db()
        db.execute(
            """
            INSERT INTO contact_requests (full_name, email, phone, message)
            VALUES (?, ?, ?, ?)
            """,
            (full_name, email, phone, message),
        )
        db.commit()
        return jsonify({"message": "Votre message a bien ete envoye."}), 201

    @app.post("/api/bookings")
    @login_required
    def api_create_booking(user):
        data = request.get_json(silent=True) or {}
        service_type = (data.get("serviceType") or "garde").strip()
        animal_type = (data.get("animalType") or "").strip().lower()
        animal_name = (data.get("animalName") or "").strip()
        notes = (data.get("notes") or "").strip()
        time_slot = (data.get("timeSlot") or "").strip().lower()

        try:
            start_date = parse_iso_date(data.get("startDate"))
            end_date = parse_iso_date(data.get("endDate"))
        except ValueError:
            return jsonify({"error": "Dates invalides."}), 400

        if animal_type not in ANIMAL_TYPES or time_slot not in TIME_SLOTS:
            return jsonify({"error": "Merci de renseigner le type d'animal et le creneau."}), 400

        if end_date < start_date:
            return jsonify({"error": "La date de fin doit etre apres la date de debut."}), 400

        if booking_has_conflict(start_date, end_date):
            return jsonify({"error": "Le creneau choisi n'est plus disponible."}), 409

        db = get_db()
        cursor = db.execute(
            """
            INSERT INTO booking_requests (
                user_id, service_type, animal_type, animal_name,
                start_date, end_date, time_slot, notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user["id"],
                service_type,
                animal_type,
                animal_name,
                start_date.isoformat(),
                end_date.isoformat(),
                time_slot,
                notes,
            ),
        )
        db.commit()

        booking = query_one(
            """
            SELECT booking_requests.*, users.full_name, users.email
            FROM booking_requests
            JOIN users ON users.id = booking_requests.user_id
            WHERE booking_requests.id = ?
            """,
            (cursor.lastrowid,),
        )
        return jsonify({"message": "Demande envoyee a l'administration.", "booking": serialize_booking(booking)}), 201

    @app.delete("/api/bookings/<int:booking_id>")
    @login_required
    def api_cancel_booking(user, booking_id):
        booking = query_one("SELECT * FROM booking_requests WHERE id = ?", (booking_id,))
        if booking is None:
            return jsonify({"error": "Demande introuvable."}), 404

        if booking["user_id"] != user["id"] and user["role"] != "admin":
            return jsonify({"error": "Acces refuse."}), 403

        db = get_db()
        db.execute(
            """
            UPDATE booking_requests
            SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (booking_id,),
        )
        db.commit()
        return jsonify({"message": "Demande annulee."}), 200

    @app.get("/api/admin/dashboard")
    @admin_required
    def api_admin_dashboard(_user):
        return jsonify(build_admin_payload()), 200

    @app.put("/api/admin/members/<int:member_id>")
    @admin_required
    def api_admin_update_member(_user, member_id):
        member = query_one("SELECT * FROM users WHERE id = ?", (member_id,))
        if member is None:
            return jsonify({"error": "Membre introuvable."}), 404

        data = request.get_json(silent=True) or {}
        payload, error_message = validate_profile_payload(data, require_password=False)
        if error_message:
            return jsonify({"error": error_message}), 400

        role = (data.get("role") or member["role"]).strip().lower()
        if role not in {"client", "admin"}:
            return jsonify({"error": "Role invalide."}), 400

        existing = query_one(
            "SELECT id FROM users WHERE email = ? AND id != ?",
            (payload["email"], member_id),
        )
        if existing is not None:
            return jsonify({"error": "Cet e-mail est deja utilise par un autre compte."}), 409

        if member["role"] == "admin" and role != "admin":
            admin_count = query_one("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'")["count"]
            if admin_count <= 1:
                return jsonify({"error": "Impossible de retrograder le dernier administrateur."}), 409

        db = get_db()
        db.execute(
            """
            UPDATE users
            SET full_name = ?, email = ?, phone = ?, animal_type = ?, animal_name = ?, role = ?
            WHERE id = ?
            """,
            (
                payload["fullName"],
                payload["email"],
                payload["phone"],
                payload["animalType"],
                payload["animalName"],
                role,
                member_id,
            ),
        )
        db.commit()

        updated_member = query_one("SELECT * FROM users WHERE id = ?", (member_id,))
        return jsonify({"message": "Membre mis a jour.", "member": serialize_user(updated_member)}), 200

    @app.delete("/api/admin/members/<int:member_id>")
    @admin_required
    def api_admin_delete_member(_user, member_id):
        member = query_one("SELECT * FROM users WHERE id = ?", (member_id,))
        if member is None:
            return jsonify({"error": "Membre introuvable."}), 404

        if member["role"] == "admin":
            admin_count = query_one("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'")["count"]
            if admin_count <= 1:
                return jsonify({"error": "Impossible de supprimer le dernier administrateur."}), 409

        db = get_db()
        db.execute("DELETE FROM users WHERE id = ?", (member_id,))
        db.commit()
        return jsonify({"message": "Membre supprime."}), 200

    @app.put("/api/admin/bookings/<int:booking_id>")
    @admin_required
    def api_admin_update_booking(_user, booking_id):
        booking = query_one("SELECT * FROM booking_requests WHERE id = ?", (booking_id,))
        if booking is None:
            return jsonify({"error": "Demande introuvable."}), 404

        data = request.get_json(silent=True) or {}
        status = (data.get("status") or "").strip().lower()
        admin_note = (data.get("adminNote") or "").strip()

        if status not in BOOKING_STATUSES:
            return jsonify({"error": "Statut invalide."}), 400

        if status == "approved":
            if booking_has_conflict(
                parse_iso_date(booking["start_date"]),
                parse_iso_date(booking["end_date"]),
                exclude_booking_id=booking["id"],
            ):
                return jsonify({"error": "Ce creneau est deja bloque ou confirme."}), 409

        db = get_db()
        db.execute(
            """
            UPDATE booking_requests
            SET status = ?, admin_note = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (status, admin_note, booking_id),
        )
        db.commit()

        updated_booking = query_one(
            """
            SELECT booking_requests.*, users.full_name, users.email
            FROM booking_requests
            JOIN users ON users.id = booking_requests.user_id
            WHERE booking_requests.id = ?
            """,
            (booking_id,),
        )
        return jsonify({"message": "Demande mise a jour.", "booking": serialize_booking(updated_booking)}), 200

    @app.post("/api/admin/blocked-dates")
    @admin_required
    def api_admin_create_blocked_date(_user):
        data = request.get_json(silent=True) or {}
        reason = (data.get("reason") or "").strip()

        try:
            blocked_date = parse_iso_date(data.get("date"))
        except ValueError:
            return jsonify({"error": "Date invalide."}), 400

        if query_one("SELECT id FROM blocked_dates WHERE block_date = ?", (blocked_date.isoformat(),)) is not None:
            return jsonify({"error": "Cette date est deja bloquee."}), 409

        if booking_has_conflict(blocked_date, blocked_date):
            return jsonify({"error": "Cette date est deja occupee par une garde confirmee."}), 409

        db = get_db()
        cursor = db.execute(
            """
            INSERT INTO blocked_dates (block_date, reason)
            VALUES (?, ?)
            """,
            (blocked_date.isoformat(), reason),
        )
        db.commit()

        row = query_one("SELECT * FROM blocked_dates WHERE id = ?", (cursor.lastrowid,))
        return jsonify({"message": "Date bloquee.", "blockedDate": serialize_blocked_date(row)}), 201

    @app.delete("/api/admin/blocked-dates/<int:block_id>")
    @admin_required
    def api_admin_delete_blocked_date(_user, block_id):
        if query_one("SELECT id FROM blocked_dates WHERE id = ?", (block_id,)) is None:
            return jsonify({"error": "Date bloquee introuvable."}), 404

        db = get_db()
        db.execute("DELETE FROM blocked_dates WHERE id = ?", (block_id,))
        db.commit()
        return jsonify({"message": "Date debloquee."}), 200

    @app.post("/api/admin/activities")
    @admin_required
    def api_admin_create_activity(_user):
        data = request.get_json(silent=True) or {}
        title = (data.get("title") or "").strip()
        category = (data.get("category") or "").strip() or "Accompagnement"
        description = (data.get("description") or "").strip()
        sort_order = int(data.get("sortOrder") or 0)

        if not title or not description:
            return jsonify({"error": "Titre et description sont obligatoires."}), 400

        db = get_db()
        cursor = db.execute(
            """
            INSERT INTO activities (title, category, description, sort_order)
            VALUES (?, ?, ?, ?)
            """,
            (title, category, description, sort_order),
        )
        db.commit()

        row = query_one("SELECT * FROM activities WHERE id = ?", (cursor.lastrowid,))
        return jsonify({"message": "Activite ajoutee.", "activity": serialize_activity(row)}), 201

    @app.put("/api/admin/activities/<int:activity_id>")
    @admin_required
    def api_admin_update_activity(_user, activity_id):
        if query_one("SELECT id FROM activities WHERE id = ?", (activity_id,)) is None:
            return jsonify({"error": "Activite introuvable."}), 404

        data = request.get_json(silent=True) or {}
        title = (data.get("title") or "").strip()
        category = (data.get("category") or "").strip() or "Accompagnement"
        description = (data.get("description") or "").strip()
        sort_order = int(data.get("sortOrder") or 0)

        if not title or not description:
            return jsonify({"error": "Titre et description sont obligatoires."}), 400

        db = get_db()
        db.execute(
            """
            UPDATE activities
            SET title = ?, category = ?, description = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (title, category, description, sort_order, activity_id),
        )
        db.commit()

        row = query_one("SELECT * FROM activities WHERE id = ?", (activity_id,))
        return jsonify({"message": "Activite mise a jour.", "activity": serialize_activity(row)}), 200

    @app.delete("/api/admin/activities/<int:activity_id>")
    @admin_required
    def api_admin_delete_activity(_user, activity_id):
        if query_one("SELECT id FROM activities WHERE id = ?", (activity_id,)) is None:
            return jsonify({"error": "Activite introuvable."}), 404

        db = get_db()
        db.execute("DELETE FROM activities WHERE id = ?", (activity_id,))
        db.commit()
        return jsonify({"message": "Activite supprimee."}), 200

    @app.put("/api/admin/contacts/<int:contact_id>")
    @admin_required
    def api_admin_update_contact(_user, contact_id):
        if query_one("SELECT id FROM contact_requests WHERE id = ?", (contact_id,)) is None:
            return jsonify({"error": "Demande de contact introuvable."}), 404

        data = request.get_json(silent=True) or {}
        status = (data.get("status") or "").strip().lower()
        if status not in CONTACT_STATUSES:
            return jsonify({"error": "Statut invalide."}), 400

        db = get_db()
        db.execute(
            "UPDATE contact_requests SET status = ? WHERE id = ?",
            (status, contact_id),
        )
        db.commit()

        row = query_one("SELECT * FROM contact_requests WHERE id = ?", (contact_id,))
        return jsonify({"message": "Contact mis a jour.", "contact": serialize_contact(row)}), 200

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
