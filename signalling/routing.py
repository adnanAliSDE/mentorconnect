from django.urls import path,re_path

from . import consumers

websocket_urlpatterns = [
    path("wss/signalling/", consumers.SignallingConsumer.as_asgi()),
    re_path(r"wss/RTC/(?P<recvr>\w+)/$", consumers.RTCconsumer.as_asgi()),
]