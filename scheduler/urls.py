from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin

admin.autodiscover()

urlpatterns = patterns('',
                       url(r'^$', 'calendar_scheduler.views.main_view', name='gateway'),
                       url(r'^scheduler/', include('calendar_scheduler.core.urls')),

                       # Uncomment the admin/doc line below to enable admin documentation:
                       url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

                       # Uncomment the next line to enable the admin:
                       url(r'^admin/', include(admin.site.urls)),
                       # Authentication with google account
                       url(r'^google/login/$', 'django_openid_auth.views.login_begin', name='openid-login'),
                       url(r'^google/login-complete/$', 'django_openid_auth.views.login_complete',
                           name='openid-complete'),
                       url(r'^logout/$', 'django.contrib.auth.views.logout', {'next_page': '/', }, name='logout'),
                       )
