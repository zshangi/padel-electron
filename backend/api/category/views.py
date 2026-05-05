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

class Fetch(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def get(self, request, id=None):
        try:
            cfg = config()
            db = database(cfg)

            if id:
                categories = db.category.get_by_miancategory(id)
            else:
                categories = db.category.get()

            return JsonResponse({'categories': categories})
        except Exception:
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
            assert 'maincategory_id' in data, "Maincategory_id was not provided."

            name = data.get("name")
            maincategory_id = data.get("maincategory_id")

            db.category.add(name,maincategory_id)

            return JsonResponse({"success": True, "message": "Category added"})
        except:
            traceback.print_exc()
            return JsonResponse({"success": False}, status=500)


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

            db.category.update(id, name)

            return JsonResponse({"success": True, "message": "Category updated"})
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

            # Get the category before deletion to find related subcategories
            category = db.category.get_by_id(id)
            
            # Delete the category (this should cascade delete subcategories in the database)
            db.category.delete(id)
            
            # Also need to delete any categorycontent related to this category
            # This would need to be implemented in your database class
            db.categorycontent.delete_by_category_id(id)

            return JsonResponse({"success": True, "message": "Category and related data deleted"})
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({"success": False, "error": str(e)}, status=500)        