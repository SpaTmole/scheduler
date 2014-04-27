__author__ = 'Konstantin Oficerov'
__email__ = 'konstantin.oficerov@gmail.com'

from django.views.generic import TemplateView, FormView, ListView, RedirectView, DetailView
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required, user_passes_test


class LoginRequiredView(object):
    @method_decorator(login_required())
    def dispatch(self, request, *args, **kwargs):
        return super(LoginRequiredView, self).dispatch(request, *args, **kwargs)


class MainHandler(LoginRequiredView, TemplateView):
    template_name = 'base.html'

    def get_context_data(self, **kwargs):
        context = {'request': self.request}
        return super(MainHandler, self).get_context_data(**context)


class RESTfulHandler(LoginRequiredView, ):
    pass;