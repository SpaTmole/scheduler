__author__ = 'Konstantin Oficerov'
__email__ = 'konstantin.oficerov@gmail.com'

from calendar_scheduler.core.mainhandlers import RESTfulHandler
from calendar_scheduler.core.models import CalendarEvent
from calendar_scheduler.core.forms import CalendarForm
import datetime
import json


class BaseCalendarAPI(RESTfulHandler):

    def get_result(self):
        """
        here will be handled read request
        """
        try:
            return json.dumps(self.read())
        except KeyError:
            return self.abort()

    def post_result(self):
        form = CalendarForm(self.request.REQUEST)
        if form.validate():
            key = self.request.REQUEST.get('key')
            if key:
                return self.create(form)
            obj = CalendarEvent.objects.get(key)
            form.populate_obj(obj)
            obj.save()
            return json.dumps(obj.to_json)
        else:
            return json.dumps({'errors': form.errors, 'status': 'fail'})

    def delete_result(self):
        """
        and here will be handled delete request
        """

    def read(self):
        """
        returns list of dict stored calendar events
        """
        start_date = datetime.datetime.fromtimestamp(float(self.request.REQUEST.get('start')))
        end_date = datetime.datetime.fromtimestamp(float(self.request.REQUEST.get('end')))
        try:
            event_list = list(CalendarEvent.objects.filter(start_date__gte=start_date).filter(end_date__lte=end_date))
        except Exception:
            event_list = []
        return event_list

    @staticmethod
    def create(form):
        return CalendarEvent.objects.create(form.data)