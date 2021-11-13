from django.contrib import admin

# Register your models here.
from .models import Profile, Comment

admin.site.register(Profile)
admin.site.register(Comment)