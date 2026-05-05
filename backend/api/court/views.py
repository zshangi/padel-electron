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

class fetchAll(APIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JWTAuthentication, )

    def get(self, request):
        try:
            cfg = config()
            db = database(cfg)
            
            params = {}
            params["courts"] = db.court.get()
            params["couchs"]= db.couch.get()
            params["settings"] = db.setting.get()
            params["categories"] = db.category.get()
            params["subcategories"] = db.subcategory.get() 
            params["categorycontent"] =db.categorycontent.get()
            params["members"] = db.members.get_approved()
            params["reserved"] = db.reserved.get()
            params["reservedwithcouch"]= db.reserved.get_with_couch()
            return JsonResponse(params)
        except:
            traceback.print_exc()
            return JsonResponse({}, status=500)




class fetch(APIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JWTAuthentication, )

    def get(self, request):
        try:
            cfg = config()
            db = database(cfg)
            courts = db.court.get()
            params = {'courts': courts}
            return JsonResponse(params)
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
            status = body.get("status", "active")
            data = body.get("data", {})

            db.court.add(name, status, data)

            return JsonResponse({"success": True, "message": "Court added"})
        except:
            traceback.print_exc()
            return JsonResponse({"success": False}, status=500)

class update(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def post(self, request, id):
        try:

            data = json.loads(request.body.decode('utf-8'))
            
            name = data.get('name', '')
            status = data.get('status', 'active')
            court_data = data.get('data', {})

            cfg = config()
            db = database(cfg)

            status = data.get('status', 'active')
            db.court.update(id, name, status, court_data)

            return JsonResponse({'success': True, 'message': 'Court updated successfully'})

        except Exception as e:
            traceback.print_exc()
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
        
class remove_court(APIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JWTAuthentication, )

    def post(self, request):
        try:
            court_id = request.data.get('id')
            if not court_id:
                return JsonResponse({'success': False, 'error': 'Court ID is required'}, status=400)

            cfg = config()
            db = database(cfg)
            getreserved = db.reserved.get_court(court_id)
            getcourt = db.court.get_by_id(court_id)

            if not getreserved:
                db.court.remove_with_id(court_id)
                return JsonResponse({'success': True, 'message': 'Court removed successfully'})

            data = getcourt[0]

            db.court.update(court_id, data["name"], 'deactive', data["data"])

            return JsonResponse({'success': True, 'message': 'Court removed successfully'})

        except Exception as e:
            traceback.print_exc()
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

class update_working_hours(APIView):
    # permission_classes = (IsAuthenticated, )
    # authentication_classes = (JWTAuthentication, )

    def post(self, request):
        try:
            court_id = request.data.get("id")
            day_key = request.data.get("dayKey")
            slot = request.data.get("slot")
            action = request.data.get("action")
            cfg = config()
            db = database(cfg)
            court_data = db.court.get_by_id(court_id)

            if not court_data:
                return Response({"success": False, "message": "court not found"}, status=404)

            datacourt = court_data[0]
            data = datacourt['data']
            if "workingHours" not in data:
                data["workingHours"] = {}
            if day_key not in data["workingHours"]:
                data["workingHours"][day_key] = []

            slots = data["workingHours"][day_key]

            if action == "remove":
                data["workingHours"][day_key] = [s for s in slots if s != slot]

            elif action == "add":
                if slot not in slots:
                    slots.append(slot)
                    slots.sort(key=lambda s: int(s.split(':')[0]))
            print(data)
            db.court.update(court_id, datacourt['name'],'active', data)

            return Response({"success": True})

        except Exception as e:
            return Response({"success": False, "error": str(e)}, status=500)
