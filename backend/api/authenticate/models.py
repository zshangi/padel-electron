from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractUser

ROLES = (
    ('0','Admin - Access Level 0'),
        ('1','Physician - Access Level 1'),
        ('1','Monitor - Access Level 1'),
        ('2','Nurse - Access Level 2'),
        ('3','Staff - Access Level 3'),
        ('4','Others - Access Level 4')
    )

class EtdUser(AbstractUser):
    roles = models.CharField(max_length=50, choices=ROLES, null=True)
    can_submit = models.BooleanField(default=False)
