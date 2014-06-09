__author__ = 'Konstantin Oficerov'
__email__ = 'konstantin.oficerov@gmail.com'

from django.contrib import admin
from calendar_scheduler.core.models import *

admin.site.register(CalendarEvent)
admin.site.register(Profile)
