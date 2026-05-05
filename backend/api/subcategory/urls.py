from django.urls import path
from . import views

urlpatterns = [
    path('fetch/', views.fetch.as_view(), name='fetch'),
    path('add/', views.add.as_view(), name='add'),
    path('update/', views.update.as_view(), name='update'),
    path('delete/', views.delete.as_view(), name='subcategory-delete'),

]