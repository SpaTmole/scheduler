__author__ = 'Konstantin Oficerov'
__email__ = 'konstantin.oficerov@gmail.com'
from django.conf.urls import patterns, include, url
from views import *

urlpatterns = patterns('',
                       url(r'^home/$', MainHandler.as_view(), name="home"),
                       url(r'^calendar/$', CalendarHandler.as_view(), name="calendar")
                      )