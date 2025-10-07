from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "users"

    def ready(self) -> None:
        # Import signal handlers to ensure related objects are provisioned.
        from users import signals  # noqa: F401
