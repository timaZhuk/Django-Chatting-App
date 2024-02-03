from django.urls import path
from . import views

#------------------------------------------------------------------------------------------
# <str:uuid>  -- uuid we creating in min.js file when generating uuid for chat room
app_name = 'chat'
#------------------------------------------------------------------------------------------
urlpatterns = [
    path("api/create-room/<str:uuid>/", views.create_room, name="create_room"),
    path("chat-admin/",views.admin,name='admin'),
    path('chat-admin/add-user/',views.add_user, name='add_user'),
    path("chat-admin/<str:uuid>/",views.room,name='room'),

]

