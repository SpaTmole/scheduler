__author__ = 'Konstantin Oficerov'
__email__ = 'konstantin.oficerov@gmail.com'

import wtforms
from calendar_scheduler.core.models import CalendarEvent
from wtforms.ext.django.orm import model_form


BaseCalendarForm = model_form(CalendarEvent, exclude=('owner', 'guests', ))


class CalendarForm(BaseCalendarForm):
    pass