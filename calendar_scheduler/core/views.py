__author__ = 'Konstantin Oficerov'
__email__ = 'konstantin.oficerov@gmail.com'

from calendar_scheduler.core.mainhandlers import *
from calendar_scheduler.core.forms import BaseCalendarForm


class CalendarHandler(MainHandler):
    template_name = 'calendar.html'

    def get_context_data(self, **kwargs):
        form = BaseCalendarForm()
        kwargs['form'] = form
        return super(MainHandler, self).get_context_data(**kwargs)