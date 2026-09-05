from django.conf import settings
from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient


class LoginTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="ana", password="secret123")

    def test_valid_credentials_return_200_with_public_fields(self):
        response = self.client.post(
            "/api/auth/login/", {"username": "ana", "password": "secret123"}
        )

        assert response.status_code == 200
        assert response.data["username"] == "ana"
        assert response.data["id"] == self.user.id
        assert "password" not in response.data

    def test_valid_login_sets_session_and_csrf_cookies(self):
        response = self.client.post(
            "/api/auth/login/", {"username": "ana", "password": "secret123"}
        )

        assert response.status_code == 200
        assert "sessionid" in response.cookies
        assert "csrftoken" in response.cookies

    def test_invalid_credentials_return_400_with_identical_generic_message(self):
        wrong_password = self.client.post(
            "/api/auth/login/", {"username": "ana", "password": "wrongpass"}
        )
        unknown_user = self.client.post(
            "/api/auth/login/", {"username": "ghost", "password": "wrongpass"}
        )

        assert wrong_password.status_code == 400
        assert unknown_user.status_code == 400
        # Identical body proves the message does not reveal whether the user exists.
        assert wrong_password.data == unknown_user.data

    def test_inactive_user_returns_400_and_no_session(self):
        self.user.is_active = False
        self.user.save()

        response = self.client.post(
            "/api/auth/login/", {"username": "ana", "password": "secret123"}
        )

        assert response.status_code == 400
        session_cookie = response.cookies.get("sessionid")
        assert session_cookie is None or session_cookie.value == ""

    def test_anonymous_post_is_csrf_exempt_and_sets_csrf_cookie(self):
        csrf_client = APIClient(enforce_csrf_checks=True)

        response = csrf_client.post(
            "/api/auth/login/", {"username": "ana", "password": "secret123"}
        )

        assert response.status_code == 200
        assert "csrftoken" in response.cookies


class LogoutTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="ana", password="secret123")
        self.client = APIClient()
        self.client.login(username="ana", password="secret123")

    def _authenticated_csrf_client(self):
        csrf_client = APIClient(enforce_csrf_checks=True)
        login_response = csrf_client.post(
            "/api/auth/login/", {"username": "ana", "password": "secret123"}
        )
        assert login_response.status_code == 200
        csrf_client.credentials(
            HTTP_X_CSRFTOKEN=csrf_client.cookies["csrftoken"].value
        )
        return csrf_client

    def test_logout_clears_session_and_me_returns_401(self):
        csrf_client = self._authenticated_csrf_client()

        response = csrf_client.post("/api/auth/logout/")

        assert response.status_code == 200
        assert csrf_client.get("/api/auth/me/").status_code == 401

    def test_anonymous_logout_returns_401(self):
        response = APIClient().post("/api/auth/logout/")

        assert response.status_code == 401


class CurrentUserTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="ana", password="secret123")
        self.client = APIClient()

    def test_authenticated_me_returns_public_fields(self):
        self.client.login(username="ana", password="secret123")

        response = self.client.get("/api/auth/me/")

        assert response.status_code == 200
        assert response.data == {
            "id": self.user.id,
            "username": "ana",
            "is_superuser": False,
        }
        assert "password" not in response.data

    def test_anonymous_me_returns_401(self):
        response = self.client.get("/api/auth/me/")

        assert response.status_code == 401


class HealthTests(TestCase):
    def test_health_is_public(self):
        response = APIClient().get("/api/health/")

        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


class SessionExpiryTests(TestCase):
    def test_session_expires_on_browser_close(self):
        assert settings.SESSION_EXPIRE_AT_BROWSER_CLOSE is True


class CreateUserTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            username="root", password="admin123", email="root@example.com"
        )
        self.member = User.objects.create_user(username="ana", password="secret123")

    def _admin_client(self):
        csrf_client = APIClient(enforce_csrf_checks=True)
        login_response = csrf_client.post(
            "/api/auth/login/", {"username": "root", "password": "admin123"}
        )
        assert login_response.status_code == 200
        csrf_client.credentials(
            HTTP_X_CSRFTOKEN=csrf_client.cookies["csrftoken"].value
        )
        return csrf_client

    def test_superuser_creates_regular_user(self):
        response = self._admin_client().post(
            "/api/auth/users/",
            {"username": "luis", "password": "gympass123"},
        )

        assert response.status_code == 201
        assert response.data["username"] == "luis"
        assert "password" not in response.data
        created = User.objects.get(username="luis")
        assert created.is_superuser is False
        assert created.check_password("gympass123") is True

    def test_non_superuser_gets_403(self):
        member_client = APIClient()
        member_client.login(username="ana", password="secret123")

        response = member_client.post(
            "/api/auth/users/",
            {"username": "luis", "password": "gympass123"},
        )

        assert response.status_code == 403
        assert User.objects.filter(username="luis").exists() is False

    def test_anonymous_gets_401(self):
        response = APIClient().post(
            "/api/auth/users/",
            {"username": "luis", "password": "gympass123"},
        )

        assert response.status_code == 401
        assert User.objects.filter(username="luis").exists() is False

    def test_duplicate_username_returns_400(self):
        response = self._admin_client().post(
            "/api/auth/users/",
            {"username": "ana", "password": "otherpass123"},
        )

        assert response.status_code == 400
