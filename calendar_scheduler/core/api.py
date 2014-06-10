__author__ = 'Konstantin Oficerov'
__email__ = 'konstantin.oficerov@gmail.com'

from calendar_scheduler.core.mainhandlers import RESTfulHandler
from calendar_scheduler.core.models import CalendarEvent
from calendar_scheduler.core.forms import CalendarForm
import datetime
import json
import logging
import itertools


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
        form = CalendarForm(self.request.REQUEST, request=self.request)
        if form.validate():
            key = self.request.REQUEST.get('key')
            if not key:
                return self.create(form)
            obj = CalendarEvent.objects.get(pk=key)
            form.populate_obj(obj)
            obj.save()
            return json.dumps(obj.to_json)
        else:
            return json.dumps({'form': form.errors, 'status': 'error'})

    def delete_result(self):
        key = self.request.REQUEST.get('key')
        if key:
            obj = CalendarEvent.objects.get(pk=key)
            obj.delete()
            return {'status': 'success'}
        return {'status', 'error'}

    def read(self):
        """
        returns list of dict stored calendar events
        """
        start_date = datetime.datetime.fromtimestamp(float(self.request.REQUEST.get('start')))
        end_date = datetime.datetime.fromtimestamp(float(self.request.REQUEST.get('end')))
        try:
            owners_events = CalendarEvent.objects.filter(owner=self.request.user).filter(start__gte=start_date).filter(end__lte=end_date)
            invited_events = self.request.user.calendar_guests.filter(start__gte=start_date).filter(end__lte=end_date)
            return [e.to_json for e in itertools.chain(owners_events, invited_events)]
        except Exception as e:
            logging.error(e)
            return []

    def create(self, form):
        result = CalendarEvent()
        form.populate_obj(result)
        result.save()
        return result.to_json