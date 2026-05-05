from django.urls import path, include

from . import views



urlpatterns = [
    path('fetch/', views.fetch.as_view(), name='fetch_couch'),
    path('fetch-by-id/<int:id>/', views.fetch_by_id.as_view(), name='fetch_couch_by_id'),
    path('add/', views.add.as_view(), name='add_couch'),
    path('update/<int:id>/', views.update.as_view(), name='update_couch'),
    path('remove/', views.remove_couch.as_view(), name='remove_couch'),
    path('update-working-hours/', views.update_working_hours.as_view(), name='update_working_hours'),
]
