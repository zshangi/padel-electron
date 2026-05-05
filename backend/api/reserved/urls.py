from django.urls import path, include

from . import views

urlpatterns = [
    path('fetch/', views.fetch.as_view()),
    path('fetch-with-couch/', views.fetch_with_couch.as_view()),
    path('fetch-selected-day/', views.fetch_selcted_day.as_view(), name='get-seelcted_day'),
    path('fetch-selected-day-time-status/', views.fetch_selcted_day_time_status.as_view(), name='get-seelcted_day'),
    path('fetch-selected-day-except-wailinglist/', views.fetch_selcted_day_except_waitinglist.as_view(), name='get-seelcted_day'),
    path('fetch-selected-day-with-couch/', views.fetch_selcted_day_with_couch.as_view(), name='get-seelcted_day'),
    path('fetch-status/', views.fetch_status.as_view(), name='get-seelcted_day'),
    path('fetch-couch/<int:couch_id>/', views.fetch_couch.as_view(), name='get-cocuh-reservation'),
    path('add/', views.add.as_view()),
    path('add-bulk/', views.add_bulk.as_view()),
    path('fetch_user/', views.fetch_user.as_view()),
    path('update/<int:reservation_id>/', views.update.as_view(), name='update-reservation'),
    path('remove/', views.remove_reserved.as_view(), name='remove_court'),
    path('remove-with-package-id/', views.remove_reserved_by_package_id.as_view(), name='remove_package'),
    path('send-sms-waiting-list/', views.Send_SMS_waitingliast.as_view(), name='send_sms'),


]
