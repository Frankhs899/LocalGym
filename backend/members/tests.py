from django.contrib.auth.models import User
from django.db import IntegrityError
from django.test import TestCase
from rest_framework.test import APIClient

from members.models import Member


def make_member(**overrides):
    fields = {
        "document_type": "CC",
        "document_number": "123456",
        "first_name": "Juan",
        "last_name": "Perez",
        "birth_date": "1990-05-15",
        "phone": "3001234567",
        "emergency_contact_name": "Ana Perez",
        "emergency_contact_phone": "3007654321",
    }
    fields.update(overrides)
    return Member.objects.create(**fields)


class MemberModelTests(TestCase):
    def test_document_type_uppercased_on_save(self):
        member = make_member(document_type="cc")

        assert member.document_type == "CC"
        assert Member.objects.get(pk=member.pk).document_type == "CC"

    def test_duplicate_document_pair_rejected_when_active(self):
        make_member(document_type="CC", document_number="123")

        with self.assertRaises(IntegrityError):
            make_member(document_type="CC", document_number="123")

    def test_duplicate_document_pair_rejected_when_inactive(self):
        make_member(document_type="CC", document_number="123", is_active=False)

        with self.assertRaises(IntegrityError):
            make_member(document_type="CC", document_number="123")

    def test_different_document_type_allowed(self):
        make_member(document_type="CC", document_number="123")
        other = make_member(document_type="TI", document_number="123")

        assert other.pk is not None
        assert Member.objects.count() == 2

    def test_different_document_number_allowed(self):
        make_member(document_type="CC", document_number="123")
        other = make_member(document_type="CC", document_number="456")

        assert other.pk is not None
        assert Member.objects.count() == 2


def make_payload(**overrides):
    payload = {
        "document_type": "CC",
        "document_number": "123456",
        "first_name": "Juan",
        "last_name": "Perez",
        "birth_date": "1990-05-15",
        "phone": "3001234567",
        "emergency_contact_name": "Ana Perez",
        "emergency_contact_phone": "3007654321",
    }
    payload.update(overrides)
    return payload


class MemberApiMixin:
    def setUp(self):
        super().setUp()
        self.user = User.objects.create_user(username="staff", password="secret123")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.anonymous = APIClient()


class MemberListTests(MemberApiMixin, TestCase):
    def test_default_list_paginates_20_of_25(self):
        for i in range(25):
            make_member(document_number=f"1000{i:02d}")

        response = self.client.get("/api/members/")

        assert response.status_code == 200
        assert response.data["count"] == 25
        assert len(response.data["results"]) == 20
        assert response.data["next"] is not None

    def test_search_by_name(self):
        make_member(first_name="Juan", last_name="Perez", document_number="111")
        make_member(first_name="Ana", last_name="Lopez", document_number="222")

        response = self.client.get("/api/members/", {"search": "juan"})

        assert response.status_code == 200
        assert response.data["count"] == 1
        assert response.data["results"][0]["first_name"] == "Juan"

    def test_search_by_document(self):
        make_member(document_type="CC", document_number="12345")
        make_member(document_type="CC", document_number="99999")

        response = self.client.get("/api/members/", {"search": "12345"})

        assert response.status_code == 200
        assert response.data["count"] == 1
        assert response.data["results"][0]["document_number"] == "12345"

    def test_status_filter_active(self):
        make_member(document_number="111")
        make_member(document_number="222", is_active=False)

        response = self.client.get("/api/members/", {"status": "active"})

        assert response.status_code == 200
        assert response.data["count"] == 1
        assert response.data["results"][0]["is_active"] is True

    def test_status_filter_inactive(self):
        make_member(document_number="111")
        make_member(document_number="222", is_active=False)

        response = self.client.get("/api/members/", {"status": "inactive"})

        assert response.status_code == 200
        assert response.data["count"] == 1
        assert response.data["results"][0]["is_active"] is False

    def test_status_filter_all(self):
        make_member(document_number="111")
        make_member(document_number="222", is_active=False)

        response = self.client.get("/api/members/", {"status": "all"})

        assert response.status_code == 200
        assert response.data["count"] == 2

    def test_anonymous_list_returns_401(self):
        response = self.anonymous.get("/api/members/")

        assert response.status_code == 401


class MemberRetrieveTests(MemberApiMixin, TestCase):
    def test_retrieve_returns_full_record(self):
        member = make_member()

        response = self.client.get(f"/api/members/{member.pk}/")

        assert response.status_code == 200
        assert response.data["document_number"] == "123456"
        assert response.data["first_name"] == "Juan"
        assert response.data["is_active"] is True

    def test_retrieve_nonexistent_returns_404(self):
        response = self.client.get("/api/members/9999/")

        assert response.status_code == 404

    def test_anonymous_retrieve_returns_401(self):
        member = make_member()

        response = self.anonymous.get(f"/api/members/{member.pk}/")

        assert response.status_code == 401


class MemberCreateTests(MemberApiMixin, TestCase):
    def test_create_returns_201_with_audit(self):
        response = self.client.post("/api/members/", make_payload(), format="json")

        assert response.status_code == 201
        assert response.data["is_active"] is True
        assert response.data["created_by"] == self.user.id
        assert response.data["updated_by"] == self.user.id
        assert response.data["created_at"] is not None
        member = Member.objects.get(pk=response.data["id"])
        assert member.created_by == self.user
        assert member.updated_by == self.user

    def test_create_lowercase_document_type_saved_uppercase(self):
        response = self.client.post(
            "/api/members/", make_payload(document_type="cc"), format="json"
        )

        assert response.status_code == 201
        assert response.data["document_type"] == "CC"

    def test_create_invalid_document_type_returns_400(self):
        response = self.client.post(
            "/api/members/", make_payload(document_type="XX"), format="json"
        )

        assert response.status_code == 400

    def test_create_duplicate_active_pair_returns_400(self):
        make_member(document_type="CC", document_number="123")

        response = self.client.post(
            "/api/members/",
            make_payload(document_type="CC", document_number="123"),
            format="json",
        )

        assert response.status_code == 400

    def test_create_duplicate_inactive_pair_returns_400(self):
        make_member(document_type="CC", document_number="123", is_active=False)

        response = self.client.post(
            "/api/members/",
            make_payload(document_type="CC", document_number="123"),
            format="json",
        )

        assert response.status_code == 400

    def test_create_ignores_client_is_active(self):
        response = self.client.post(
            "/api/members/", make_payload(is_active=False), format="json"
        )

        assert response.status_code == 201
        assert response.data["is_active"] is True

    def test_anonymous_create_returns_401(self):
        response = self.anonymous.post("/api/members/", make_payload(), format="json")

        assert response.status_code == 401


class MemberUpdateTests(MemberApiMixin, TestCase):
    def test_full_update_returns_200_with_audit(self):
        creator = User.objects.create_user(username="creator", password="secret123")
        member = make_member(created_by=creator, updated_by=creator)

        response = self.client.put(
            f"/api/members/{member.pk}/",
            make_payload(first_name="Carlos", phone="3119998888"),
            format="json",
        )

        assert response.status_code == 200
        member.refresh_from_db()
        assert member.first_name == "Carlos"
        assert member.phone == "3119998888"
        assert member.created_by == creator
        assert member.updated_by == self.user
        assert response.data["updated_by"] == self.user.id
        assert response.data["created_by"] == creator.id

    def test_partial_update_changes_only_phone(self):
        member = make_member()

        response = self.client.patch(
            f"/api/members/{member.pk}/", {"phone": "3119998888"}, format="json"
        )

        assert response.status_code == 200
        member.refresh_from_db()
        assert member.phone == "3119998888"
        assert member.first_name == "Juan"

    def test_update_to_duplicate_pair_returns_400(self):
        make_member(document_type="CC", document_number="123")
        other = make_member(document_type="CC", document_number="456")

        response = self.client.put(
            f"/api/members/{other.pk}/",
            make_payload(document_number="123"),
            format="json",
        )

        assert response.status_code == 400

    def test_update_nonexistent_returns_404(self):
        response = self.client.put(
            "/api/members/9999/", make_payload(), format="json"
        )

        assert response.status_code == 404

    def test_anonymous_update_returns_401(self):
        member = make_member()

        response = self.anonymous.patch(
            f"/api/members/{member.pk}/", {"phone": "3119998888"}, format="json"
        )

        assert response.status_code == 401


class MemberDeactivateTests(MemberApiMixin, TestCase):
    def test_deactivate_sets_inactive(self):
        member = make_member()

        response = self.client.post(f"/api/members/{member.pk}/deactivate/")

        assert response.status_code == 200
        assert response.data["is_active"] is False
        member.refresh_from_db()
        assert member.is_active is False
        assert member.updated_by == self.user

    def test_deactivate_is_idempotent(self):
        member = make_member(is_active=False)

        response = self.client.post(f"/api/members/{member.pk}/deactivate/")

        assert response.status_code == 200
        assert response.data["is_active"] is False

    def test_deactivate_nonexistent_returns_404(self):
        response = self.client.post("/api/members/9999/deactivate/")

        assert response.status_code == 404

    def test_anonymous_deactivate_returns_401(self):
        member = make_member()

        response = self.anonymous.post(f"/api/members/{member.pk}/deactivate/")

        assert response.status_code == 401


class MemberReactivateTests(MemberApiMixin, TestCase):
    def test_reactivate_via_patch(self):
        member = make_member(is_active=False)

        response = self.client.patch(
            f"/api/members/{member.pk}/", {"is_active": True}, format="json"
        )

        assert response.status_code == 200
        assert response.data["is_active"] is True
        member.refresh_from_db()
        assert member.is_active is True
