from rest_framework import permissions, viewsets
from rest_framework.exceptions import NotFound

from courses.models import Course
from reviews.models import Review
from reviews.serializers import ReviewSerializer


class CourseReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_course(self) -> Course:
        course_id = self.kwargs.get("course_id")
        try:
            return Course.objects.get(pk=course_id)
        except Course.DoesNotExist as exc:
            raise NotFound("Course not found") from exc

    def get_queryset(self):
        course = self.get_course()
        return Review.objects.filter(course=course).select_related("user")

    def perform_create(self, serializer):
        course = self.get_course()
        serializer.save(course=course, user=self.request.user)
