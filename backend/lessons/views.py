from rest_framework import filters, viewsets

from lessons.models import Lesson
from lessons.serializers import LessonSerializer


class LessonViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LessonSerializer
    filter_backends = (filters.OrderingFilter,)
    ordering_fields = ("order", "id")
    ordering = ("order", "id")
    pagination_class = None

    def get_queryset(self):
        queryset = Lesson.objects.select_related("course")
        course_id = self.request.query_params.get("course")
        if not course_id:
            return queryset.none()
        return queryset.filter(course_id=course_id)
