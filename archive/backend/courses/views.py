from rest_framework import filters, viewsets

from courses.models import Course
from courses.serializers import CourseSerializer


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CourseSerializer
    queryset = Course.objects.select_related("publisher", "teacher").order_by("-published_at", "title")
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("title", "description", "language", "publisher__name", "teacher__name")
    ordering_fields = (
        "title",
        "created_at",
        "price_amount",
        "published_at",
        "participants_count",
        "rating_avg",
    )

    def get_queryset(self):
        queryset = super().get_queryset()
        publisher_slug = self.request.query_params.get("publisher")
        teacher_id = self.request.query_params.get("teacher")
        language = self.request.query_params.get("language")

        if publisher_slug:
            queryset = queryset.filter(publisher__slug=publisher_slug)
        if teacher_id:
            queryset = queryset.filter(teacher_id=teacher_id)
        if language:
            queryset = queryset.filter(language__iexact=language)

        return queryset
