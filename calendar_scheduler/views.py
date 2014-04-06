__author__ = 'Konstantin Oficerov'
__email__ = 'konstantin.oficerov@gmail.com'

from wsgiref.handlers import BaseHandler as BH


class BaseHandler(BH):
    
    def __init__(self, *args, **kwargs):
        pass
    
    def get(self, *args, **kwargs):
        f = open('templates/base.html')
        html = f.read()
        f.close()
        return html
