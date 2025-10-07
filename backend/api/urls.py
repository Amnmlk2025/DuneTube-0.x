from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from api.views import healthz
from courses.views import CourseViewSet
from lessons.views import LessonViewSet
from reviews.views import CourseReviewViewSet
from users.views import ProfileMeView, RoleActivationView, RoleListView

router = DefaultRouter()
router.register(r"courses", CourseViewSet, basename="course")
router.register(r"lessons", LessonViewSet, basename="lesson")
router.register(r"courses/(?P<course_id>\d+)/reviews", CourseReviewViewSet, basename="course-reviews")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/profile/me/", ProfileMeView.as_view(), name="profile-me"),
    path("api/auth/roles/", RoleListView.as_view(), name="auth-roles"),
    path("api/auth/roles/activate/", RoleActivationView.as_view(), name="auth-roles-activate"),
    path("api/", include(router.urls)),
    path("api/healthz/", healthz, name="healthz"),
]
