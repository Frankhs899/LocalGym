from django.urls import path

from .views import MemberDeactivateView, MemberDetailView, MemberListView

urlpatterns = [
    path("", MemberListView.as_view(), name="member-list"),
    path("<int:pk>/", MemberDetailView.as_view(), name="member-detail"),
    path(
        "<int:pk>/deactivate/",
        MemberDeactivateView.as_view(),
        name="member-deactivate",
    ),
]
