from rest_framework import serializers

from .models import Member


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = (
            "id",
            "document_type",
            "document_number",
            "first_name",
            "last_name",
            "birth_date",
            "phone",
            "email",
            "address",
            "emergency_contact_name",
            "emergency_contact_phone",
            "medical_conditions",
            "notes",
            "is_active",
            "created_at",
            "created_by",
            "updated_at",
            "updated_by",
        )
        read_only_fields = (
            "id",
            "created_at",
            "created_by",
            "updated_at",
            "updated_by",
        )

    def validate_document_type(self, value):
        return value.upper() if value else value
