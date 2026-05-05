from django.shortcuts import render

# Create your views here.

# Create your views here.

import traceback
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
import json
from django.http import HttpResponse, JsonResponse

from config import config
from utils import database



class fetch(APIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JWTAuthentication, )

    def get(self, request):
        try:

            cfg = config()
            db = database(cfg)

            assets = db.couch.get()
            couchs = db.couch.get()

            params = {}

            params['couchs'] = couchs

            return JsonResponse(params)
        except:
            traceback.print_exc()
            return JsonResponse({}, status=500)


class fetch_by_id(APIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JWTAuthentication, )

    def get(self, request,id):
        try:

            cfg = config()
            db = database(cfg)

            assets = db.couch.get_by_id(id)
            couch = db.couch.get_by_id(id)

            params = {}

            params['couch'] = couch

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

            db.couch.add(name, status, data)

            couch = db.couch.get()

            params = {}

            params['couchs'] = couch

            return JsonResponse(params)
        except:
            traceback.print_exc()
            return JsonResponse({}, status=500)


class update(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def post(self, request, id):
        try:

            data = json.loads(request.body.decode('utf-8'))
            
            name = data.get('name', '')
            status = data.get("status", "active")
            couch_data = data.get('data', {})

            cfg = config()
            db = database(cfg)

            db.couch.update(id, name, status, couch_data)
            couch = db.couch.get()

            params = {}

            params['couchs'] = couch

            return JsonResponse(params)
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    
class remove_couch(APIView):
    # permission_classes = (IsAuthenticated, )
    # authentication_classes = (JWTAuthentication,)

    def post(self, request):
        try:
            couch_id = request.data.get('id')
            if not couch_id:
                return JsonResponse({'success': False, 'error': 'Court ID is required'}, status=400)

            cfg = config()
            db = database(cfg)

            db.couch.remove_with_id(couch_id)

            couch = db.couch.get()

            params = {}

            params['couchs'] = couch

            return JsonResponse(params)
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

class update_working_hours(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def post(self, request):
        try:
            data = json.loads(request.body.decode('utf-8'))

            couch_id = data.get('id')
            working_hours = data.get('workingHours', {})

            if not couch_id:
                return JsonResponse({'success': False, 'error': 'Coach ID is required'}, status=400)

            cfg = config()
            db = database(cfg)

            db.couch.update_working_hours(couch_id, working_hours)

            couch = db.couch.get()

            params = {}

            params['couchs'] = couch

            return JsonResponse(params)
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({'success': False, 'error': str(e)}, status=500)