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