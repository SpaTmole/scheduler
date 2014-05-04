__author__ = 'Konstantin Oficerov'
__email__ = 'konstantin.oficerov@gmail.com'

from calendar_scheduler.core.mainhandlers import RESTfulHandler
from calendar_scheduler.core.models import CalendarEvent
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
        """
        here will be handled post request
        """

    def delete_result(self):
        """
        and here will be handled delete request
        """

    def read(self):
        """
        returns list of dict stored calendar events
        """
        start_date = datetime.datetime.fromtimestamp(float(self.request.params.get('start')))
        end_date = datetime.datetime.fromtimestamp(float(self.request.params.get('end')))
        event_list = CalendarEvent.all() # add filter
        return event_list

    def create(self):
        """
        return 'success' or list of errors
        """

    def edit(self):
        """
        includes direct changing, drag'n'drop and resize as well
        """