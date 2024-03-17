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


    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )

    def receive(self, text_data):
        data = json.loads(text_data)
        print(text_data)
        message = data["message"]
        type=data['type'] 
        if type=='call.recvd':
            status=message.get("status")
            remote_user=message.get("remote_user")
            message['remote_user']=self.scope['user'].username
            async_to_sync(self.channel_layer.group_send)(
                f"signal_{remote_user}",{
                    "type":'call.recvd',"message":message
                }
            )

        if type=='call.initiate':
            self.call_initiate(data["message"])

    def call_incoming(self,data):
        sender=data.get('message').get('sender')
        recvr=data.get('message').get('recvr')
        print(f"Call from {sender} to {recvr}")
        self.send(json.dumps({
            "type":"videocall.notification",
            'message':{
            'content':'incoming video call from ...',
            "remote_user":sender
            }
        }))

    def call_recvd(self,data):
        data['message']['sender']=self.scope['user'].username
        self.send(json.dumps(data))
        print(data)

    def call_initiate(self,data):
        recvr=data['recvr']
        print(recvr," from call_initiate")
        data['sender']=self.scope['user'].username
        if self.is_remote_online:
            async_to_sync(self.channel_layer.group_send)(
                f"signal_{recvr}", {"type": "call.incoming", "message": data}
            )
        else:
            self.send(json.dumps({
                "type":'initiate_call_res',
                "message":{
                "content":'remote_offline',
                "status":'success',
                }
            }))
        
    def call_notification(self,event):
        message = "Hello"
        self.send(text_data=json.dumps({"message": message}))

    # Receive message from room group
    def chat_message(self, event):
        message = event["message"]
        self.send(text_data=json.dumps({"message": message}))

class RTCconsumer(WebsocketConsumer):
    def connect(self):
        self.remote_user = self.scope["url_route"]["kwargs"]["recvr"]
        self.room_group_name = f"call_{self.scope['user'].username}"

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        type=text_data_json.get("type")
        print(type,message)

        if type=='offer':
            async_to_sync(self.channel_layer.group_send)(
                f"call_{self.remote_user}", {"type": "call.offer", "message": message})

        elif type=='answer':
            async_to_sync(self.channel_layer.group_send)(
                f"call_{self.remote_user}", {"type": "call.answer", "message": message})

        elif type=='candidate':
            async_to_sync(self.channel_layer.group_send)(
                f"call_{self.remote_user}", {"type": "call.candidate", "message": message})

        elif type=='end':
            async_to_sync(self.channel_layer.group_send)(
                f"call_{self.remote_user}", {"type": "call.end", "message": message})
    
    def call_candidate(self,data):
        print('candidate sent')
        self.send(json.dumps(data))

    def call_offer(self,data):
        print('offer sent')
        self.send(json.dumps(data))

    def call_end(self,data):
        self.send(json.dumps(data))

    def call_answer(self,data):
        print('answer sent')
        self.send(json.dumps(data))
