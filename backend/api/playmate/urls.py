from django.urls import path, include

from . import views

urlpatterns = [
    path('fetch/', views.fetch.as_view()),
    path('create/', views.create.as_view()),
    path('fetch-asset/', views.fetch_asset.as_view()),
    path('update/', views.update.as_view()),
    path('set-default/', views.set_default.as_view()),
    path('remove/', views.remove.as_view()),
    path('get/', views.get.as_view()),
    path('get-avatar/', views.get_avatar.as_view()),
]
