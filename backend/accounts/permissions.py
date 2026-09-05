from rest_framework.permissions import BasePermission


class IsSuperUser(BasePermission):
    """Allow only authenticated superusers.

    Unlike DRF's IsAdminUser (which checks `is_staff`), the user-auth
    contract requires `is_superuser` for user creation.
    """

    message = "Only superusers may create users."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )
