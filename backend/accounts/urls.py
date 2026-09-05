from django.urls import path

from .views import CreateUserView, LoginView, LogoutView, MeView

urlpatterns = [
    path("login/", LoginView.as_view(), name="auth-login"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("users/", CreateUserView.as_view(), name="auth-users"),
]
