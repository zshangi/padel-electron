from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import EtdUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = EtdUser
        exclude = ('password', )
