import tempfile
import unittest
from pathlib import Path

from app import DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD, create_app


class ClubDesPattesTestCase(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.database_path = Path(self.temp_dir.name) / "test.db"
        self.legacy_clients_path = Path(self.temp_dir.name) / "missing-clients.json"

        self.app = create_app(
            {
                "TESTING": True,
                "DATABASE": str(self.database_path),
                "CLIENTS_FILE": str(self.legacy_clients_path),
                "SECRET_KEY": "test-secret-key",
            }
        )
        self.client = self.app.test_client()
        self.admin_client = self.app.test_client()

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_register_and_update_profile_flow(self):
        register_response = self.client.post(
            "/api/register",
            json={
                "firstName": "Marie",
                "lastName": "Martin",
                "email": "marie@example.com",
                "password": "secret123",
                "phone": "0601020304",
                "animalType": "chien",
                "animalName": "Nala",
            },
        )

        self.assertEqual(register_response.status_code, 201)
        register_data = register_response.get_json()
        self.assertEqual(register_data["user"]["role"], "client")
        self.assertEqual(register_data["user"]["email"], "marie@example.com")
        self.assertEqual(register_data["user"]["firstName"], "Marie")
        self.assertEqual(register_data["user"]["lastName"], "Martin")

        update_response = self.client.put(
            "/api/account",
            json={
                "fullName": "Marie Martin",
                "email": "marie@example.com",
                "phone": "0601020305",
                "animalType": "chat",
                "animalName": "Pixel",
            },
        )

        self.assertEqual(update_response.status_code, 200)

        bootstrap_response = self.client.get("/api/bootstrap")
        bootstrap_data = bootstrap_response.get_json()
        self.assertEqual(bootstrap_data["user"]["animalType"], "chat")
        self.assertEqual(bootstrap_data["user"]["animalName"], "Pixel")

    def test_homepage_renders_main_sections(self):
        response = self.client.get("/")
        html = response.get_data(as_text=True)

        self.assertEqual(response.status_code, 200)
        self.assertIn("Club des Pattes", html)
        self.assertIn("Educatrice canine et gardes chien chat", html)
        self.assertIn("Choisir un creneau pour une garde", html)
        self.assertIn("Prochaine date disponible", html)
        self.assertIn("Gestion de l'activite, des membres et des demandes de garde", html)
        self.assertIn('id="memberNavLink" hidden', html)
        self.assertIn('id="adminNavLink" hidden', html)
        self.assertIn('id="loginModal" hidden', html)
        self.assertIn('id="registerModal" hidden', html)
        self.assertIn('id="contactModal" hidden', html)
        self.assertIn('id="bookingModal" hidden', html)
        self.assertIn('id="dashboard" hidden', html)
        self.assertIn('id="adminPanel" hidden', html)
        self.assertIn('static/app.js', html)
        self.assertNotIn(">Services<", html)
        self.assertNotIn(">Infos<", html)
        self.assertNotIn(">Reservation<", html)
        self.assertNotIn("Comment cela se passe", html)

    def test_booking_approval_and_calendar_blocking(self):
        login_response = self.admin_client.post(
            "/api/login",
            json={"email": DEFAULT_ADMIN_EMAIL, "password": DEFAULT_ADMIN_PASSWORD},
        )
        self.assertEqual(login_response.status_code, 200)

        register_response = self.client.post(
            "/api/register",
            json={
                "firstName": "Client",
                "lastName": "Test",
                "email": "client@example.com",
                "password": "secret123",
                "animalType": "chien",
                "animalName": "Rocket",
            },
        )
        self.assertEqual(register_response.status_code, 201)

        booking_response = self.client.post(
            "/api/bookings",
            json={
                "serviceType": "garde-a-domicile",
                "animalType": "chien",
                "animalName": "Rocket",
                "startDate": "2030-05-10",
                "endDate": "2030-05-12",
                "timeSlot": "journee",
                "notes": "Test de reservation",
            },
        )
        self.assertEqual(booking_response.status_code, 201)
        booking_id = booking_response.get_json()["booking"]["id"]

        approval_response = self.admin_client.put(
            f"/api/admin/bookings/{booking_id}",
            json={"status": "approved", "adminNote": "Reservation validee."},
        )
        self.assertEqual(approval_response.status_code, 200)

        bootstrap_response = self.client.get("/api/bootstrap")
        bootstrap_data = bootstrap_response.get_json()
        self.assertEqual(bootstrap_data["myBookings"][0]["status"], "approved")

        unavailable_dates = {item["date"] for item in bootstrap_data["unavailableDates"]}
        self.assertTrue({"2030-05-10", "2030-05-11", "2030-05-12"}.issubset(unavailable_dates))

    def test_admin_can_manage_blocked_dates_and_activities(self):
        login_response = self.admin_client.post(
            "/api/login",
            json={"email": DEFAULT_ADMIN_EMAIL, "password": DEFAULT_ADMIN_PASSWORD},
        )
        self.assertEqual(login_response.status_code, 200)

        blocked_response = self.admin_client.post(
            "/api/admin/blocked-dates",
            json={"date": "2030-08-15", "reason": "Jour ferie"},
        )
        self.assertEqual(blocked_response.status_code, 201)

        activity_response = self.admin_client.post(
            "/api/admin/activities",
            json={
                "title": "Education douce",
                "category": "Conseil",
                "description": "Accompagnement ponctuel pour les routines du quotidien.",
                "sortOrder": 5,
            },
        )
        self.assertEqual(activity_response.status_code, 201)

        dashboard_response = self.admin_client.get("/api/admin/dashboard")
        self.assertEqual(dashboard_response.status_code, 200)
        dashboard_data = dashboard_response.get_json()

        blocked_dates = [item["date"] for item in dashboard_data["blockedDates"]]
        activity_titles = [item["title"] for item in self.admin_client.get("/api/bootstrap").get_json()["activities"]]

        self.assertIn("2030-08-15", blocked_dates)
        self.assertIn("Education douce", activity_titles)


if __name__ == "__main__":
    unittest.main()
