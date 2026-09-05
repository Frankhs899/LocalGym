from django.contrib.auth import authenticate, login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import CreateUserSerializer, LoginSerializer, MeSerializer

INVALID_CREDENTIALS_MESSAGE = "Invalid username or password."


@method_decorator(ensure_csrf_cookie, name="dispatch")
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"detail": INVALID_CREDENTIALS_MESSAGE},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = authenticate(
            request,
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )
        if user is None:
            # Generic message: never reveal whether the username exists
            # or whether the account is inactive.
            return Response(
                {"detail": INVALID_CREDENTIALS_MESSAGE},
                status=status.HTTP_400_BAD_REQUEST,
            )
        login(request, user)
        return Response(MeSerializer(user).data)


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({"detail": "Logged out."})


class MeView(APIView):
    def get(self, request):
        return Response(MeSerializer(request.user).data)


class CreateUserView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = CreateUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(MeSerializer(user).data, status=status.HTTP_201_CREATED)
