__author__ = 'Konstantin Oficerov'
__email__ = 'konstantin.oficerov@gmail.com'

from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect


def main_view(request):
    if request.user.is_authenticated():
        return HttpResponseRedirect(reverse('calendar_scheduler:home'))
    else:
        return HttpResponseRedirect(reverse('openid-login'))