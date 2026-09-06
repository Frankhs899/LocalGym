from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Member
from .serializers import MemberSerializer


class MemberPagination(PageNumberPagination):
    page_size = 20


class MemberListView(APIView):
    def get(self, request):
        queryset = Member.objects.all().order_by("-created_at", "id")

        status_filter = request.query_params.get("status", "active")
        if status_filter == "active":
            queryset = queryset.filter(is_active=True)
        elif status_filter == "inactive":
            queryset = queryset.filter(is_active=False)

        search = request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(document_number__icontains=search)
            )

        paginator = MemberPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = MemberSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = MemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # New members are always born active; clients cannot birth
        # inactive rows. Reactivation happens via PATCH on update.
        member = serializer.save(
            created_by=request.user, updated_by=request.user, is_active=True
        )
        return Response(MemberSerializer(member).data, status=status.HTTP_201_CREATED)


class MemberDetailView(APIView):
    def get(self, request, pk):
        member = get_object_or_404(Member, pk=pk)
        return Response(MemberSerializer(member).data)

    def put(self, request, pk):
        return self._update(request, pk, partial=False)

    def patch(self, request, pk):
        return self._update(request, pk, partial=True)

    def _update(self, request, pk, partial):
        member = get_object_or_404(Member, pk=pk)
        serializer = MemberSerializer(member, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        return Response(serializer.data)


class MemberDeactivateView(APIView):
    def post(self, request, pk):
        member = get_object_or_404(Member, pk=pk)
        # Idempotent: deactivating an already-inactive member is a no-op 200.
        member.is_active = False
        member.updated_by = request.user
        member.save()
        return Response(MemberSerializer(member).data)
