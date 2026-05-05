"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.http import FileResponse, HttpResponseNotFound
from django.views.static import serve as static_serve


def spa_index(request):
    """Serve the React build so Electron can use normal browser routing."""
    index_path = settings.FRONTEND_BUILD / "index.html"
    if index_path.exists():
        return FileResponse(open(index_path, "rb"), content_type="text/html")
    return HttpResponseNotFound("React build not found. Run: npm run build:frontend")


urlpatterns = [
    path("api/", include("api.urls")),
]

if settings.DEBUG:
    urlpatterns.append(path("admin/", admin.site.urls))

if settings.FRONTEND_BUILD.exists():
    urlpatterns += [
        re_path(
            r"^(?P<path>(static|images|fonts)/.*)$",
            static_serve,
            {"document_root": str(settings.FRONTEND_BUILD)},
        ),
        re_path(
            r"^(?P<path>(favicon.ico|manifest.json|logo192.png|logo512.png|robots.txt))$",
            static_serve,
            {"document_root": str(settings.FRONTEND_BUILD)},
        ),
    ]

urlpatterns.append(re_path(r"^.*$", spa_index))
