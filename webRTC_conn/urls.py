from django.urls import path
from . import views

app_name='webrtc'
urlpatterns = [
    path("<str:remote_user>", views.index,name='home'),
]
