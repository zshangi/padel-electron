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
from utils.sms_sender import send_verification_sms

from config import config
from utils import database


class fetch( APIView ):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JWTAuthentication, )

    def get( self, request ):
        try :

            cfg = config()
            db = database( cfg )

            assets = db.reserved.get()
            reserved = db.reserved.get()

            params = {}
         
            params['reserved'] = reserved 

            return JsonResponse(params)
        except :
            traceback.print_exc()
            return JsonResponse({},status=500)

class fetch_with_couch( APIView ):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JWTAuthentication, )

    def get( self, request ):
        try :

            cfg = config()
            db = database( cfg )

            assets = db.reserved.get_with_couch()
            reserved = db.reserved.get_with_couch()

            params = {}
         
            params['reserved'] = reserved 

            return JsonResponse(params)
        except :
            traceback.print_exc()
            return JsonResponse({},status=500)


class add(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)
    
    def post(self, request):
        try:
            userID = request.user.id

            # Get extra info from backend only
            name = request.user.first_name  + request.user.last_name

            # Parse basic request (day, time, ids)
            if request.content_type.startswith("text/plain"):
                req = json.loads(request.body.decode("utf-8"))
            else:
                req = request.data

            cfg = config()
            db = database(cfg)
            
            member_user_id = req.get("user_id") or userID
            member = db.members.get_by_django_user_id(member_user_id)
            if member:
                name = member["name"]
                
            couch_name = ''
            couch_id = 0
            court_name = db.court.get_by_id(req.get("court_id"))
            if isinstance(court_name, list):
                court_name = court_name[0] if court_name else {}
            if req.get("couch_id"):
                couch_id = req.get("couch_id")
                couch_name = db.couch.get_by_id(req.get("couch_id"))
                couch_name = couch_name['name'] if couch_name else ''
                
             
            extra_data = {
                "name": name,
                "court_name": court_name.get('name', ''),
                "couch_name": couch_name,
                "totalPrice": req.get("totalPrice"),
                "payment": req.get("payment", 0)  # Add payment field
            }

            db.reserved.add(
                selected_day=req.get("selected_day"),
                selected_time=req.get("selected_time"),
                user_id=userID,
                court_id=req.get("court_id"),
                couch_id=couch_id,
                data=extra_data,
                get_by_who=req.get("get_by_who", "user"),
                status="waitingList" if req.get("is_waiting_list") else req.get("status", "confirm"),
            )

            return JsonResponse({
                "success": True,
                "reserved": {
                    "selected_day": req.get("selected_day"),
                    "selected_time": req.get("selected_time"),
                    "court_id": req.get("court_id"),
                    "couch_id": couch_id,
                    "user_id": userID,
                    "data": extra_data
                }
            }, status=200)

        except Exception as e:
            traceback.print_exc()
            return JsonResponse({"error_message": str(e)}, status=500)


class update(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def post(self, request,reservation_id):
        try:
            cfg = config()
            db = database(cfg)

            payload_data = json.loads(request.body.decode('utf-8'))

            reservations = payload_data["reservations"]
            selected_day = payload_data["selectedDate"]
            
            
            selected_day =reservations.get("selected_day")
            selected_time = reservations.get("selected_time")
            user_id= reservations.get("user_id")
            court_id=reservations.get("court_id")
            couch_id=reservations.get("couch_id")
            data = reservations.get("data", {})

            getdata = db.reserved.get_by_id(reservation_id)
            reservation_record = getdata[0]
            print(getdata)
            db.reserved.update( reservation_id,selected_day,selected_time,user_id,court_id,couch_id, data)
            reserved = db.reserved.get_selected_day(selected_day,reservation_record["status"])

            params = {}
            params['reserved'] = reserved 

            return JsonResponse(params)
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({"error_message": str(e)}, status=500)


class add_bulk(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def post(self, request):
        try:

            payload_data = json.loads(request.body.decode('utf-8'))

            reservations = payload_data["reservations"]
            selected_day = payload_data["selectedDate"]

            cfg = config()
            db = database(cfg)
            
            reservations_to_save = []
            for res in reservations:

                reservation_to_save = {
                    'selected_day': res.get("selected_day"),
                    'selected_time': res.get("selected_time"),
                    'user_id': res.get("user_id"),
                    'court_id': res.get("court_id"),
                    'couch_id': res.get("couch_id"),
                    'status': res.get("status"),
                    'data': res.get("data", {}),
                }
                
                reservations_to_save.append(reservation_to_save)

            db.reserved.add_bulk(reservations_to_save)
            if res.get("couch_id"): 
                reserved = db.reserved.get_selected_day_with_couch(selected_day,res.get("status"))
            else:
                if res.get("status") == 'confirm' or res.get("status")=='waitingList' :
                    reserved = db.reserved.get_selected_day(selected_day,'confirm')
                else:
                    reserved = db.reserved.get_status(res.get("status"))
   
            params = {}
            params['reserved'] = reserved 

            return JsonResponse(params)
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({"error_message": str(e)}, status=500)
       

class fetch_user(APIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JWTAuthentication, )

    def get(self, request):
        try:
            cfg = config()
            db = database(cfg)
            
            user_id = request.user.id
            print(user_id)
            if not user_id and hasattr(request, 'user') and request.user.is_authenticated:
                user_id = request.user.id
                
            if not user_id:
                return JsonResponse({"error_message": "User ID is required"}, status=400)
            
            reserved = db.reserved.get_user(user_id)

            params = {}
            params['reserved'] = reserved 

            return JsonResponse(params)
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({"error_message": str(e)}, status=500)

class fetch_couch(APIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JWTAuthentication, )

    def get(self, request,couch_id):
        try:
            cfg = config()
            db = database(cfg)
            

            reserved = db.reserved.get_couch(couch_id)

            params = {}
            params['reserved'] = reserved 

            return JsonResponse(params)
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({"error_message": str(e)}, status=500)


class fetch_selcted_day(APIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JWTAuthentication, )

    def post(self, request,):
        try:
            cfg = config()
            db = database(cfg)
            
            payload_data = json.loads(request.body.decode('utf-8'))

        
            selected_day = payload_data["selected_day"]
            status = payload_data["status"]

            reserved = db.reserved.get_selected_day(selected_day,status)

            params = {}
            params['reserved'] = reserved 

            return JsonResponse(params)
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({"error_message": str(e)}, status=500)

class fetch_selcted_day_time_status(APIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JWTAuthentication, )

    def post(self, request,):
        try:
            cfg = config()
            db = database(cfg)
            
            payload_data = json.loads(request.body.decode('utf-8'))

        
            selected_day = payload_data["selected_day"]
            status = payload_data["status"]
            selected_time = payload_data["selected_time"]

            reserved = db.reserved.get_selected_day_time_status(selected_day,selected_time,status)

            params = {}
            params['reserved'] = reserved 

            return JsonResponse(params)
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({"error_message": str(e)}, status=500)

class fetch_selcted_day_except_waitinglist(APIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JWTAuthentication, )

    def post(self, request,):
        try:
            cfg = config()
            db = database(cfg)
            
            payload_data = json.loads(request.body.decode('utf-8'))

        
            selected_day = payload_data["selected_day"]

            reserved = db.reserved.get_selected_day_except_waitinglist(selected_day)

            params = {}
            params['reserved'] = reserved 

            return JsonResponse(params)
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({"error_message": str(e)}, status=500)

class fetch_selcted_day_with_couch(APIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JWTAuthentication, )

    def post(self, request,):
        try:
            cfg = config()
            db = database(cfg)
            
            payload_data = json.loads(request.body.decode('utf-8'))

        
            selected_day = payload_data["selected_day"]
            status = payload_data["status"]

            reserved = db.reserved.get_selected_day_with_couch(selected_day,status)

            params = {}
            params['reserved'] = reserved 

            return JsonResponse(params)
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({"error_message": str(e)}, status=500)
 
     
class fetch_status(APIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JWTAuthentication, )

    def post(self, request,):
        try:
            cfg = config()
            db = database(cfg)
            
            payload_data = json.loads(request.body.decode('utf-8'))

        
            status = payload_data["status"]
            reserved = db.reserved.get_status(status)

            params = {}
            params['reserved'] = reserved 

            return JsonResponse(params)
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({"error_message": str(e)}, status=500)
    
         
class remove_reserved(APIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JWTAuthentication, )

    def post(self, request):
        try:
            payload_data = json.loads(request.body.decode('utf-8'))

        
            selected_day = payload_data["selected_day"]
            status = payload_data["status"]
            id = payload_data["id"]
            if not id:
                return JsonResponse({'success': False, 'error_message': 'Court ID is required'}, status=400)

            cfg = config()
            db = database(cfg)
            db.reserved.remove_with_id(id)
            reserved = db.reserved.get_selected_day(selected_day,status)

            params = {}
            params['reserved'] = reserved 

            return JsonResponse(params)
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({"error_message": str(e)}, status=500)

class remove_reserved_by_package_id(APIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JWTAuthentication, )

    def post(self, request):
        try:
            payload_data = json.loads(request.body.decode('utf-8'))

        
    
            package_id = payload_data["package_id"]
    
            cfg = config()
            db = database(cfg)
            db.reserved.remove_with_package_id(package_id)
            reserved = db.reserved.get_status('offerPackage')

            params = {}
            params['reserved'] = reserved 

            return JsonResponse(params)
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({"error_message": str(e)}, status=500)



class Send_SMS_waitingliast(APIView):
    # permission_classes = (IsAuthenticated,)
    # authentication_classes = (JWTAuthentication,)

    def post(self, request):
        try:
            cfg = config()
            db = database(cfg)
            payload_data = json.loads(request.body.decode('utf-8'))

            id = payload_data["id"]
            # Get member details
            member = db.members.get_by_id(id)
            if not member:
                return JsonResponse({
                    'success': False,
                    'message': 'عضویت یافت نشد'
                }, status=404)

        
     
            message="سلام زمان درخواستی شما در لیست انتظار در دسترس است ((باشگاه پدلوند)"

            send_verification_sms(member['mobile'], message)

            return JsonResponse({
                'success': True,
                'message': 'عضویت تایید شد و پیامک ارسال گردید'
            })

        except Exception as e:
            traceback.print_exc()
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
