from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

from users.models import RoleAssignment, UserProfile

User = get_user_model()


@receiver(post_save, sender=User)
def create_user_profile(sender, instance: User, created: bool, **kwargs):
    if not created:
        return
    UserProfile.objects.get_or_create(user=instance)
    RoleAssignment.objects.get_or_create(user=instance, role="student")
