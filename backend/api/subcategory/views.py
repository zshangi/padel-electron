from django.shortcuts import render
import traceback
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.http import HttpResponse, JsonResponse
from config import config
from utils import database
import json

class fetch(APIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JWTAuthentication, )

    def get(self, request):
        try:
            cfg = config()
            db = database(cfg)
            subcategories = db.subcategory.get()
            params = {'subcategories': subcategories}
            return JsonResponse(params)
        except:
            traceback.print_exc()
            return JsonResponse({}, status=500)

class add(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def post(self, request):
        try:
            data = json.loads(request.body.decode())

            cfg = config()
            db = database(cfg)
            assert 'name' in data, "Name was not provided."
            assert 'category_id' in data, "category_id was not provided."

            name = data.get("name")
            category_id = data.get("category_id")

            db.subcategory.add(category_id, name)

            return JsonResponse({"success": True, "message": "Sub Category added"})
        except:
            traceback.print_exc()
            return JsonResponse({"success": False}, status=500)

# subcategory/views.py

class update(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def post(self, request):
        try:
            data = json.loads(request.body.decode())

            cfg = config()
            db = database(cfg)
            assert 'id' in data, "ID was not provided."
            assert 'name' in data, "Name was not provided."

            id = data.get("id")
            name = data.get("name")

            db.subcategory.update(id, name)

            return JsonResponse({"success": True, "message": "Subcategory updated"})
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({"success": False, "error": str(e)}, status=500)
        
class delete(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def post(self, request):
        try:
            data = json.loads(request.body.decode())

            cfg = config()
            db = database(cfg)
            assert 'id' in data, "ID was not provided."

            id = data.get("id")

            subcategory = db.subcategory.get_by_id(id)
            
            db.subcategory.delete(id)
            
            db.categorycontent.remove_subcategory(id)

            return JsonResponse({"success": True, "message": "Subcategory deleted"})
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({"success": False, "error": str(e)}, status=500)        