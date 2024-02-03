from django import forms
from django.contrib.auth.forms import AuthenticationForm
from .models import User

#-----LOGIN FORM----------------------------------------------------
class LoginForm(AuthenticationForm):
    class Meta:
        model = User
        fields = ('username', 'password',)

#----REGISTRATION FORM--------------------------------------------------
class AddUserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ('email', 'name', 'role', 'password',)
        widgets = {
            'email': forms.TextInput(attrs={
                'class': 'mb-2 w-full py-4 px-6 rounded-xl border border-black'
            }),
            'name': forms.TextInput(attrs={
                'class': 'mb-2 w-full py-4 px-6 rounded-xl border border-black'
            }),
            'role': forms.Select(attrs={
                'class': 'mb-2 w-full py-4 px-6 rounded-xl border border-black'
            }),
            'password': forms.TextInput(attrs={
                'class': 'mb-2 w-full py-4 px-6 rounded-xl border border-black'
            })
        }

#------------------------------------------------------------------------------
class EditUserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ('email', 'name', 'role',)
        widgets = {
            'email': forms.TextInput(attrs={
                'class': 'w-full py-4 px-6 rounded-xl border'
            }),
            'name': forms.TextInput(attrs={
                'class': 'w-full py-4 px-6 rounded-xl border'
            }),
            'role': forms.Select(attrs={
                'class': 'w-full py-4 px-6 rounded-xl border'
            })
        }