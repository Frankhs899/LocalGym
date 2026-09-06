from django.contrib.auth.models import User
from django.db import IntegrityError
from django.test import TestCase

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
