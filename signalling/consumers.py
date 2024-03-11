# chat/consumers.py
import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer


class SignallingConsumer(WebsocketConsumer):
    def connect(self):
        self.is_remote_online=True
        self.room_name = self.scope['user'].username
        self.room_group_name = f"signal_{self.room_name}"

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )

        self.accept()
        text_data=json.dumps({
            "type":"videocall.notification",
            "message":{
            "content":"Call from server",
            "remote_user":"adnann3077"
            }
        })
        if self.is_remote_online:
            self.send(text_data)

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {"type": "chat_message", "message": message}
        )

    # Receive message from room group
    def chat_message(self, event):
        message = event["message"]
        self.send(text_data=json.dumps({"message": message}))