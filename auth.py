__author__ = 'Konstantin Oficerov'
__email__ = 'konstantin.oficerov@gmail.com'


from django.contrib.auth.models import User
from openid.consumer.consumer import SUCCESS


class GoogleBackend:
    @staticmethod
    def authenticate(openid_response):
        if openid_response is None:
            return None
        if openid_response.status != SUCCESS:
            return None

        google_email = openid_response.getSigned('http://openid.net/srv/ax/1.0',  'value.email')
        google_firstname = openid_response.getSigned('http://openid.net/srv/ax/1.0', 'value.firstname')
        google_lastname = openid_response.getSigned('http://openid.net/srv/ax/1.0', 'value.lastname')
        try:
            # Make sure that the e-mail is unique.
            user = User.objects.get(email=google_email)
        except User.DoesNotExist:
            username = ""
            if google_email.endswith("@gmail.com"):
                if len(google_lastname) < 2:
                    username = google_email.replace("@gmail.com", "")
            else:
                username = google_firstname[0]+google_lastname
            if User.objects.filter(username=username):
                ok = False
                num = 0
                while not ok:
                    if len(username+str(num)) > 29:
                        new_username = username[:30-len(str(num)):]+str(num)
                    else:
                        new_username = username+str(num)
                    if User.objects.filter(username=new_username):
                        num += 1
                    else:
                        ok = True
                        username = new_username
            user = User.objects.create_user(username, google_email,
                                            first_name=google_firstname, last_name=google_lastname,)
            user.save()
            return user

        return user

    @staticmethod
    def get_user(user_id):

        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None