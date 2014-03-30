__author__ = 'Konstantin Oficerov'

from wsgiref.handlers import BaseHandler as BH


class BaseHandler(object):
    
    def __init__(self, *args, **kwargs):
        pass
    
    def get(self, *args, **kwargs):
        f = open('templates/base.html')
        html = f.read()
        f.close()
        return html
