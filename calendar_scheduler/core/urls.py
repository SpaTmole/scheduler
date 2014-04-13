__author__ = 'konstantin'
from django.conf.urls import patterns, include, url
from views import *

urlpatterns = patterns('',
                       url(r'^home/$', MainHandler.as_view(), name="home")
                      )