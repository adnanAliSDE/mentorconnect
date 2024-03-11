from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path("wss/signalling/", consumers.SignallingConsumer.as_asgi()),
]