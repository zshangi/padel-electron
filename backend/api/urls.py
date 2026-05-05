from django.urls import path, include

from . import views

urlpatterns = [
    path('auth/', include('api.authenticate.urls') ),
    path('reserved/', include('api.reserved.urls') ),
    path('court/', include('api.court.urls') ),
    path('couch/', include('api.couch.urls') ),
    # path('match/', include('api.match.urls') ),
    path('members/', include('api.member.urls') ),
    path('setting/', include('api.setting.urls') ),
    path('category/', include('api.category.urls') ),
    path('subcategory/', include('api.subcategory.urls') ),
    path('categorycontent/', include('api.categorycontent.urls') )



]

