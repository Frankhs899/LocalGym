from django.conf import settings
from django.db import models


class DocumentType(models.TextChoices):
    CC = "CC", "Cedula de ciudadania"
    TI = "TI", "Tarjeta de identidad"
    CE = "CE", "Cedula de extranjeria"
    PA = "PA", "Pasaporte"
    RC = "RC", "Registro civil"


class Member(models.Model):
    document_type = models.CharField(max_length=2, choices=DocumentType.choices)
    document_number = models.CharField(max_length=32, db_index=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    birth_date = models.DateField()
    phone = models.CharField(max_length=32)
    email = models.EmailField(blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    emergency_contact_name = models.CharField(max_length=100)
    emergency_contact_phone = models.CharField(max_length=32)
    medical_conditions = models.TextField(blank=True, default="")
    notes = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="+",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="+",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["document_type", "document_number"],
                name="unique_member_document",
            )
        ]
        indexes = [
            models.Index(fields=["last_name", "first_name"]),
        ]

    def save(self, *args, **kwargs):
        if self.document_type:
            self.document_type = self.document_type.upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.document_type}-{self.document_number})"
