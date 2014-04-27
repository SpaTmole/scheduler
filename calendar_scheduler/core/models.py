__author__ = 'Konstantin Oficerov'
__email__ = 'konstantin.oficerov@gmail.com'

from django.db import models
from django.contrib.auth.models import User


class CalendarEvent(models.Model):
    title = models.CharField(max_length=50)
    owner = models.ForeignKey(User)
    guests = models.ManyToManyField(User, default=[])
    start = models.DateTimeField(auto_now=False, auto_now_add=False)
    end = models.DateTimeField(auto_now=False, auto_now_add=False)
    allDay = models.BooleanField(default=True)
    privateMode = models.BooleanField(default=False)  # False - public, True - private
    description = models.TextField(max_length=255)
    color = models.CharField(choices=["red", "blue", "yellow", "green", "violet", "pink", "gray", "brown"])
    #repeat = ???


class Profile(models.Model):
    _user = models.ForeignKey(User)
    username = models.CharField(max_length=50)
    birthday = models.DateField(default=None)
    photo = models.BinaryField()
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    phone = models.CharField(max_length=15)
    contacts = models.TextField(max_length=255)
    #tags = models.ManyToManyField()
    about = models.TextField(max_length=500)
    _friends = models.ManyToManyField('self')