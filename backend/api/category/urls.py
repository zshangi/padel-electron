from django.urls import path
from . import views

urlpatterns = [
    path('fetch/', views.Fetch.as_view(), name='fetch-all'),
    path('fetch/<int:id>/', views.Fetch.as_view(), name='fetch-by-main-category'),
    path('add/', views.add.as_view(), name='add'),
    path('update/', views.update.as_view(), name='add'),
    path('delete/', views.delete.as_view(), name='category-delete'),


]