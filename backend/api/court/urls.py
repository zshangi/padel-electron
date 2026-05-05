from django.urls import path
from . import views

urlpatterns = [
    path('fetch-all/', views.fetchAll.as_view(), name='fetch_all'),
    path('fetch/', views.fetch.as_view(), name='fetch_court'),
    path('add/', views.add.as_view(), name='add_court'),
    path('update/<int:id>/', views.update.as_view(), name='update_court'),
    path('remove/', views.remove_court.as_view(), name='remove_court'),
    path('update-working-hours/', views.update_working_hours.as_view(), name='update_working_hours'),
]