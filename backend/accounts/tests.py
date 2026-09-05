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
