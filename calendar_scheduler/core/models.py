__author__ = 'Konstantin Oficerov'
__email__ = 'konstantin.oficerov@gmail.com'

from django.db import models
from django.contrib.auth.models import User

AVAILABLE_COLORS = ["red", "blue", "yellow", "green", "violet", "pink", "gray", "brown"]


class CalendarEvent(models.Model):
    title = models.CharField(max_length=50, default='')
    owner = models.ForeignKey(User, db_index=True, blank=False)
    #guests = models.ManyToManyField(User, default=[])
    start = models.DateTimeField(auto_now=False, auto_now_add=False, db_index=True, blank=False)
    end = models.DateTimeField(auto_now=False, auto_now_add=False, db_index=True, blank=False)
    allDay = models.BooleanField(default=False)
    privateMode = models.BooleanField(default=False)  # False - public, True - private
    description = models.TextField(max_length=255, default='')
    color = models.CharField(default="yellow", choices=[(color, color) for color in AVAILABLE_COLORS])
    #repeat = ???

    @property
    def to_json(self):
        return {
            'title': self.title,
            'owner': self.owner.pk,
            'start': str(self.start),
            'end': str(self.end),
            'allDay': self.allDay,
            'privateMode': self.privateMode,
            'description': self.description,
            'color': self.color,
            'key': self.pk
        }


class Profile(models.Model):
    _user = models.ForeignKey(User, db_index=True)
    username = models.CharField(max_length=50, db_index=True)
    birthday = models.DateField(default=None)
    photo = models.BinaryField()
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    phone = models.CharField(max_length=15)
    contacts = models.TextField(max_length=255)
    #tags = models.ManyToManyField()
    about = models.TextField(max_length=500)
    _friends = models.ManyToManyField(User)