import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create the local offline admin account if no superuser exists."

    def handle(self, *args, **options):
        username = os.environ.get("OFFLINE_ADMIN_USERNAME", "admin")
        password = os.environ.get("OFFLINE_ADMIN_PASSWORD", "admin12345")
        email = os.environ.get("OFFLINE_ADMIN_EMAIL", "admin@localhost")

        User = get_user_model()
        existing_superuser = User.objects.filter(is_superuser=True).first()
        if existing_superuser:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Offline admin already exists: {existing_superuser.username}"
                )
            )
            return

        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": email,
                "first_name": "Offline",
                "last_name": "Admin",
                "is_staff": True,
                "is_superuser": True,
                "is_active": True,
                "roles": "0",
                "can_submit": True,
            },
        )
        user.email = user.email or email
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        if hasattr(user, "roles"):
            user.roles = user.roles or "0"
        if hasattr(user, "can_submit"):
            user.can_submit = True
        user.set_password(password)
        user.save()

        action = "Created" if created else "Updated"
        self.stdout.write(self.style.SUCCESS(f"{action} offline admin: {username}"))
        self.stdout.write("Default password comes from OFFLINE_ADMIN_PASSWORD or admin12345.")
