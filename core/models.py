from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    is_online=models.BooleanField(default=True)