__author__ = 'Konstantin Oficerov'
__email__ = 'konstantin.oficerov@gmail.com'

import wtforms
from calendar_scheduler.core.models import CalendarEvent, User
from wtforms.ext.django.orm import model_form
from itertools import chain
from urlparse import urljoin
from wtforms import validators
from scheduler import settings
from utils import ValidateUser

MEDIA_TYPES = ('js', 'css')


class Media(object):
    def __init__(self, media=None, **kwargs):
        if media:
            media_attrs = media.__dict__
        else:
            media_attrs = kwargs

        self._css = {}
        self._js = []

        for name in MEDIA_TYPES:
            getattr(self, 'add_' + name)(media_attrs.get(name, None))

    def __unicode__(self):
        return self.render()

    def render(self):
        return u'\n'.join(chain(*[getattr(self, 'render_' + name)() for name in MEDIA_TYPES]))

    def render_js(self):
        return [u'<script type="text/javascript" src="%s"></script>' % self.absolute_path(path) for path in self._js]

    def render_css(self):
        # To keep rendering order consistent, we can't just iterate over items().
        # We need to sort the keys, and iterate over the sorted list.
        media = self._css.keys()
        media.sort()
        return chain(*[
            [u'<link href="%s" type="text/css" media="%s" rel="stylesheet" />' % (self.absolute_path(path), medium)
             for path in self._css[medium]]
            for medium in media])

    def absolute_path(self, path):
        if path.startswith(u'http://') or path.startswith(u'https://') or path.startswith(u'/'):
            return path
        return urljoin(settings.MEDIA_URL, path)

    def __getitem__(self, name):
        "Returns a Media object that only contains media of the given type"
        if name in MEDIA_TYPES:
            return Media(**{str(name): getattr(self, '_' + name)})
        raise KeyError('Unknown media type "%s"' % name)

    def add_js(self, data):
        if data:
            for path in data:
                if path not in self._js:
                    self._js.append(path)

    def add_css(self, data):
        if data:
            for medium, paths in data.items():
                for path in paths:
                    if not self._css.get(medium) or path not in self._css[medium]:
                        self._css.setdefault(medium, []).append(path)

    def __add__(self, other):
        combined = Media()
        for name in MEDIA_TYPES:
            getattr(combined, 'add_' + name)(getattr(self, '_' + name, None))
            getattr(combined, 'add_' + name)(getattr(other, '_' + name, None))
        return combined


class MediaForm(wtforms.Form):

    @property
    def media(self):
        """
        Provide a description of all media required to render the widgets on this form
        """
        media = Media()
        for field in self._fields.values():
            if hasattr(field.widget, 'media'):
                media = media + field.widget.media
        definition = getattr(self, 'Media', None)
        if definition:
            media = media + Media(definition)
        return media


BaseCalendarForm = model_form(CalendarEvent, base_class=MediaForm,
                              only=('title', 'color',
                                    'privateMode', 'allDay',
                                    'description'))


class CalendarForm(BaseCalendarForm):
    start = wtforms.DateTimeField(format='%d-%m-%Y %H:%M:%S', validators=[validators.Required()])
    end = wtforms.DateTimeField(format='%d-%m-%Y %H:%M:%S', validators=[validators.Required()])
    owner = wtforms.HiddenField(validators=[validators.Required(), ValidateUser(), ])

    def __init__(self, *args, **kwargs):
        super(CalendarForm, self).__init__(*args, **kwargs)
        self.obj = kwargs.get('obj')