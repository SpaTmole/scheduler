__author__ = 'Konstantin Oficerov'
__email__ = 'konstantin.oficerov@gmail.com'

from django.contrib.auth.models import User
from wtforms import ValidationError


class ValidateUser(object):
    """
    Validator of User model instances
    """
    def __init__(self):
        self.message = "User doesn\'t exist."

    def __call__(self, form, field):
        if field.data:
            if User.objects.get(pk=field.data):
                return
        raise ValidationError(self.message)


class ValidateStartEndDatetimeProps(object):
    def __init__(self, message=None):
        self.message = message if message else "Start should be less than end."

    def __call__(self, form, field):
        if hasattr(form, 'start') and hasattr(form, 'end'):
            if form.start.data and form.end.data:
                if form.start.data < form.end.data:
                    return
            raise ValidationError(self.message)


class ValidatePermission(object):
    def __init__(self, user, message=None):
        self.user = user
        self.message = message if message else "Permission denied for %s" % user.username

    def __call__(self, form, field):
        if form.privateMode.data and str(self.user.pk) != form.owner.data:
            raise ValidationError(self.message)