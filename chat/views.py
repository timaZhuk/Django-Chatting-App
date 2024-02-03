#from django.shortcuts import render
import json
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth.models import Group
from django.http import JsonResponse 
from django.views.decorators.http import require_POST
from django.shortcuts import render, redirect
from account.models import User
# import Models 
from account.forms import AddUserForm, EditUserForm
from .models import Room

# -------THRE IS CHAT APP VIEWS

#------CREATING ROOM-----------------------
def create_room(request, uuid):
    #---get name from input (id="chat_name" inside chat_welcom)
    name = request.POST.get('name','')
    url = request.POST.get('url','')

    #---creates user chat room object
    Room.objects.create(uuid=uuid,client=name, urls=url)

    return JsonResponse({'message':'room created'})


#-------for logined admin-----
@login_required
def admin(request):
    rooms=Room.objects.all()
    users = User.objects.filter(is_staff=True)

    return render(request,'chat/admin.html',{
        'rooms':rooms,
        'users':users
    })

#-------for room page-----
@login_required
def room(request, uuid):
    room = Room.objects.get(uuid=uuid)

    # if agent click the room then status will be changed
    if room.status == Room.WAITING:
        room.status = Room.ACTIVE
        room.agent = request.user
        room.save()

    return render(request, 'chat/room.html',
                  {
                      'room':room
                  })

#----Adding the new user------------
@login_required
def add_user(request):

    form = AddUserForm()
    # we check out if user have permision to add_user(method) 
    if request.user.has_perm('user.add_user'):
        if request.method == 'POST':
            form = AddUserForm(request.POST)
            if form.is_valid():
            #we need to create the instance of the user not send it to the data base
                user = form.save(commit=False)
                #we need a permission to login in Admin interface
                user.is_staff=True
                # we have to check password consistency (because feild just a text)
                user.set_password(request.POST.get('password'))
                user.save() # save in DB

                if user.role == User.MANAGER:
                    group = Group.objects.get(name = 'Managers')
                    group.user_set.add(user)

        else:
            form = AddUserForm()

        return render(request,'chat/add_user.html',{
        'form':form
        }) 
    else:
        messages.error(request, 'You don\'t have access to add users!')
        return redirect('/chat-admin/')

