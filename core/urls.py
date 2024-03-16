from django.urls import path
from . import views

app_name='core'
urlpatterns = [
    path("", views.index,name='home'),
    path("login", views.handle_login,name='login'),
    path("logout", views.handle_logout,name='logout'),
    path("wait-for-call/<str:remote_user>", views.wait_for_call,name='wait_for_call'),
    path("videocall/<str:remote_user>", views.videocall,name='videocall'),
]
