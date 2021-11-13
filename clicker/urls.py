from django.urls import path, include

from . import views

urlpatterns = [
    #ex: /chat/
    path('index/', views.index, name='index'),
    path('chat/', views.chat, name='chat'),
]