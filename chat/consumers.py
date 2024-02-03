# work with data in and out
import json
# to talk with database
from asgiref.sync import sync_to_async
# Consumer Websocket itself
from channels.generic.websocket import AsyncWebsocketConsumer

from account.models import User
from .models import Message, Room
from django.utils.timesince import timesince

from .templatetags.chatextras import initials


class ChatConsumer(AsyncWebsocketConsumer):
    #1-----   connect to WebSocket   ----------------
    async def connect(self):
        # we assign room_name
        # scope is the request parameter (access url route and argument of that request)
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}' # or 'chat_%s' % self.room_name
        
        
        #------ prepare the 'room-object' for chatting in DB-------------------
        await self.get_room()
        #------ Join room group (wait before we will finish and then go to the next line)
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()     #------ user connects to the Websocket
    
    #2 function for disconnection
    async def disconnect(self, close_code):
        #Leave room
        self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    #--- 1a Receive information from Fronend and send other information from backend
    #--- text_data contains all information about the agent, message 
    async def receive(self, text_data):
        # information we get from WebSocket (front_end)
        text_data_json = json.loads(text_data)
        # from chat message if it updates we will start chatting
        type = text_data_json['type'] 
        message = text_data_json['message']
        name = text_data_json['name']
        agent = text_data_json.get('agent','')  # default value

        print('Receive',type)

        if type == 'message':
            # we create a new_message by agent
            new_message = await self.create_message(name, message, agent)
            #---------------------------------------------------------
            # Send message to group or room
            # initials(name) create the initials from user name
            # filtering by timestamp 'created_at' file in DB (show how long time ago message has been sent)
            #--------------------------------------------------------
            await self.channel_layer.group_send(
                self.room_group_name,{
                    'type':'chat_message',
                    'message':message,
                    'name':name,
                    'agent':agent,
                    'initials':initials(name),
                    'created_at':timesince(new_message.created_at),
                }
            )
#---- 2b 'type':'chat_message' function has the same name as type field in group_send
    async def chat_message(self, event):
        # -- Send message to frontend (WebSockets)
        # -- send is built in method (AsyncWebsocketConsumer)
        await self.send(text_data=json.dumps({
            'type':event['type'],
            'message':event['message'],
            'name':event['name'],
            'agent':event['agent'],
            'initials':event['initials'],
            'created_at':event['created_at'],



        }))
    # Get the room object from DB by uuid (assigned in chat_bubble)
    @sync_to_async
    def get_room(self):
        self.room = Room.objects.get(uuid = self.room_name)

    #------Create object Messages in DB and save it (when user chatting with agent)-----   
    @sync_to_async
    def create_message(self, sent_by, message, agent):
        #--create new instance of message
        message = Message.objects.create(body=message, sent_by=sent_by)

        #--check out if we are agent(admin)
        if agent:
            message.created_by = User.objects.get(pk=agent)
            message.save()

        self.room.messages.add(message)

        return message


    



