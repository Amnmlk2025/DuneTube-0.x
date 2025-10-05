from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from core.views import (
    ActivateRoleView,
    ActiveRoleView,
    CourseViewSet,
    HealthCheckView,
    LessonNoteViewSet,
    LessonViewSet,
    StudioCourseViewSet,
    StudioLessonViewSet,
    WalletInvoicesView,
    WalletTransactionsView,
)

router = DefaultRouter()
router.register(r"courses", CourseViewSet, basename="course")
router.register(r"lessons", LessonViewSet, basename="lesson")
router.register(r"notes", LessonNoteViewSet, basename="lesson-note")
router.register(r"studio/courses", StudioCourseViewSet, basename="studio-course")
router.register(r"studio/lessons", StudioLessonViewSet, basename="studio-lesson")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/roles/", ActiveRoleView.as_view(), name="auth-roles"),
    path("api/auth/roles/activate", ActivateRoleView.as_view(), name="auth-roles-activate"),
    path("api/wallet/transactions/", WalletTransactionsView.as_view(), name="wallet-transactions"),
    path("api/wallet/invoices/", WalletInvoicesView.as_view(), name="wallet-invoices"),
    path("api/", include(router.urls)),
    path("healthz", HealthCheckView.as_view(), name="healthz"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
