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

    def create(self):
        """
        return 'success' or list of errors
        """

    def edit(self):
        """
        includes direct changing, drag'n'drop and resize as well
        """