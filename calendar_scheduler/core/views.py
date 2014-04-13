__author__ = 'konstantin'

from django.views.generic import TemplateView
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required, user_passes_test


class LoginRequiredView(object):
    @method_decorator(login_required())
    def dispatch(self, request, *args, **kwargs):
        return super(LoginRequiredView, self).dispatch(request, *args, **kwargs)


class MainHandler(LoginRequiredView, TemplateView):
    template_name = 'base.html'