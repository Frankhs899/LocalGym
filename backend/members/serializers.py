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

    def to_internal_value(self, data):
        # Uppercase before ChoiceField validation: DRF validates choices
        # before validate_<field> runs, so "cc" would 400 without this.
        if hasattr(data, "get") and isinstance(data.get("document_type"), str):
            data = data.copy() if hasattr(data, "copy") else dict(data)
            data["document_type"] = data["document_type"].upper()
        return super().to_internal_value(data)

    def validate_document_type(self, value):
        return value.upper() if value else value
