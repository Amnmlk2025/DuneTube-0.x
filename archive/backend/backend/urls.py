from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from core.views import HealthCheckView

router = DefaultRouter()
# در آینده: router.register('courses', CourseViewSet, basename='course')

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/healthz", HealthCheckView.as_view(), name="api-healthz"),
    path("api/token", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/schema", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
]
