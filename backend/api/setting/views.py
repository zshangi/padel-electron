from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
import traceback
import json

from config import config
from utils import database

class fetch(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def get(self, request):
        try:
            cfg = config()
            db = database(cfg)
            settings = db.setting.get()

            return JsonResponse({"settings": settings}, status=200)
        except:
            traceback.print_exc()
            return JsonResponse({}, status=500)


class add(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def post(self, request):
        try:
            cfg = config()
            db = database(cfg)

            body = json.loads(request.body.decode())
            name = body.get("name", "default")
            data = body.get("data", {})

            db.setting.add(name, data)

            return JsonResponse({"success": True, "message": "Setting added"})
        except:
            traceback.print_exc()
            return JsonResponse({"success": False}, status=500)


class update(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def post(self, request):
        try:
            cfg = config()
            db = database(cfg)

            body = json.loads(request.body.decode())

            name = body.get("name")
            data = body.get("data", {})

         
            db.setting.update( name, data)

            return JsonResponse({"success": True, "message": "Setting updated"})
        except:
            traceback.print_exc()
            return JsonResponse({"success": False}, status=500)
