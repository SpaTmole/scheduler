__author__ = 'Konstantin Oficerov'
__email__ = 'konstantin.oficerov@gmail.com'

from django.views.generic import TemplateView, FormView, ListView, RedirectView, DetailView, View
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import HttpResponseBadRequest, HttpResponse
import collections
import json


class LoginRequiredView(TemplateView):
    @method_decorator(login_required())
    def dispatch(self, request, *args, **kwargs):
        return super(LoginRequiredView, self).dispatch(request, *args, **kwargs)


class MainHandler(LoginRequiredView):
    template_name = 'base.html'

    def get_context_data(self, **kwargs):
        kwargs['request'] = self.request
        return super(MainHandler, self).get_context_data(**kwargs)


class RESTfulHandler(LoginRequiredView):
    @staticmethod
    def abort():
        return HttpResponseBadRequest()

    @staticmethod
    def serialize_object(obj):
        if isinstance(obj, (collections.Sequence, collections.Mapping)):
            return json.dumps(obj, ensure_ascii=False, encoding='utf8')
        else:
            return json.dumps([obj, ], ensure_ascii=False, encoding='utf8')

    def make_response(self, body):
        if not isinstance(body, basestring):
            body = self.serialize_object(body)
        cb = self.request.GET.get('callback', None)
        if cb:
            self.content_type = 'application/javascript'
            body = "{0}({1});".format(cb, body)
        else:
            self.content_type = 'application/json'
        return HttpResponse(body, content_type=self.content_type)

    def get_result(self):
        raise NotImplementedError

    def post_result(self):
        raise NotImplementedError

    def delete_result(self):
        raise NotImplementedError

    def put_result(self):
        raise NotImplementedError

    def get(self, *args, **kwargs):
        self.args = args
        self.kwargs = kwargs
        try:
            result = self.get_result()
        except Exception:
             return self.abort()
        return self.make_response(result)

    def post(self, *args, **kwargs):
        self.args = args
        self.kwargs = kwargs
        try:
            result = self.post_result()
        except Exception:
            return self.abort()
        return self.make_response(result)

    def delete(self, *args, **kwargs):
        self.args = args
        self.kwargs = kwargs
        try:
            result = self.delete_result()
        except Exception:
            return self.abort()
        return self.make_response({'success': result is True and 1})

    def put(self, *args, **kwargs):
        self.args = args
        self.kwargs = kwargs
        try:
            result = self.put_result()
        except Exception:
            return self.abort()
        return self.make_response(result)

    # def dispatch(self, request, *args, **kwargs):
    #     return super(RESTfulHandler, self).dispatch(request, *args, **kwargs)