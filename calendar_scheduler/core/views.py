__author__ = 'Konstantin Oficerov'
__email__ = 'konstantin.oficerov@gmail.com'

from calendar_scheduler.core.mainhandlers import *
from calendar_scheduler.core.forms import CalendarForm


class CalendarHandler(MainHandler):
    template_name = 'calendar.html'

    def get_context_data(self, **kwargs):
        form = CalendarForm(owner=self.request.user.pk)
        kwargs['form'] = form
        return super(CalendarHandler, self).get_context_data(**kwargs)


class FeedbackHandler(MainHandler):
    template_name = 'feed.html'

    def get_context_data(self, **kwargs):
        feed = None  # TODO: add feedback
        kwargs['feed'] = feed
        return super(FeedbackHandler, self).get_context_data(**kwargs)