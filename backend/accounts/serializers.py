from django.contrib.auth.models import User
from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class MeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "is_superuser")


class CreateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "password")
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        # Created users are never superusers, regardless of input.
        return User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            is_superuser=False,
        )
