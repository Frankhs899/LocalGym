from rest_framework.exceptions import NotAuthenticated
from rest_framework.views import exception_handler


def force_401_for_unauthenticated(exc, context):
    """Return 401 (not DRF's coerced 403) for unauthenticated requests.

    DRF coerces NotAuthenticated to 403 when no authenticator provides a
    WWW-Authenticate challenge header, which is always the case for
    SessionAuthentication. The user-auth contract requires 401 for
    anonymous callers, so it is restored here. CSRF failures still
    return 403 (they raise PermissionDenied, not NotAuthenticated).
    """
    response = exception_handler(exc, context)
    if isinstance(exc, NotAuthenticated) and response is not None:
        response.status_code = 401
    return response
