from django.urls import path
from . import views

urlpatterns = [
    path('fetch/', views.fetch.as_view(), name='fetch'),
    path('fetch_content/', views.fetch_content.as_view(), name='fetch'),
    path('add_or_update/', views.add_or_update.as_view(), name='add'),
]