from django.db import models
from django.db.models.deletion import CASCADE
from django.db.models.fields.related import ForeignKey
from django.utils import timezone
import datetime
from django.contrib.auth.models import User

# Create your models here.
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    #id = models.IntegerField(default=0, primary_key=True)
    #name = models.CharField(max_length=20)         These are handled by using this as a profile model
    #password = models.CharField(max_length=16)
    season_clicks = models.IntegerField(default=0)
    lifetime_clicks = models.IntegerField(default=0)
    mouse_clicks = models.IntegerField(default=0)
    click_value = models.IntegerField(default=1)
    ban_status = models.BooleanField(default=False)
    last_login_date = models.DateTimeField(auto_now=True)
    pwr_1 = models.IntegerField(default=0)
    pwr_2 = models.IntegerField(default=0)
    pwr_3 = models.IntegerField(default=0)
    upgrade_1 = models.BooleanField(default=False)
    upgrade_2 = models.BooleanField(default=False)
    upgrade_3 = models.BooleanField(default=False)
    def __str__(self):
        return self.user.username

class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    #id = models.IntegerField(default=0, primary_key=True, auto_increment=True)
    content = models.CharField(max_length=200)
    publish_datetime = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.content
    def was_published_recently(self):
        return self.publish_datetime >= timezone.now() - datetime.timedelta(hours=1)

