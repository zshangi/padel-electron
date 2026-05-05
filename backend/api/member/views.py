import traceback
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string
from django.utils import timezone
import json
from config import config
from utils import database
import traceback
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.http import JsonResponse
from django.utils.crypto import get_random_string
from django.contrib.auth import get_user_model  
from utils.sms_sender import send_verification_sms
import random

from config import config
from utils import database

class MembershipRequest(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        try:
            def convert_to_english_digits(s):
                if not isinstance(s, str):
                    return s
                persian_digits = "۰۱۲۳۴۵۶۷۸۹"
                english_digits = "0123456789"
                translation_table = str.maketrans(persian_digits, english_digits)
                return s.translate(translation_table)

            try:
                data = json.loads(request.body.decode('utf-8'))
            except:
                return JsonResponse({
                    'success': False,
                    'message': 'Invalid JSON payload'
                }, status=400)

            name = data.get('name')
            mobile = convert_to_english_digits(data.get('mobile'))
            level_id = data.get('level_id')
            birth_date = convert_to_english_digits(data.get('birth_date'))
            django_user_id = data.get('django_user_id')  # Get django_user_id from request

            if not all([name, mobile, level_id, birth_date]):
                return JsonResponse({
                    'success': False,
                    'message': 'تمام فیلدها الزامی هستند'
                }, status=400)

            cfg = config()
            db = database(cfg)

            if db.members.get_by_mobile(mobile):
                return JsonResponse({
                    'success': False,
                    'message': 'این شماره موبایل قبلا ثبت شده است'
                }, status=400)

            result = db.members.add(name, mobile, level_id, birth_date, django_user_id=django_user_id)
            return JsonResponse(result)

        except Exception as e:
            traceback.print_exc()
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
class PendingMemberships(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def get(self, request):
        try:
            cfg = config()
            db = database(cfg)

            pending_members = db.members.get_pending()
            return JsonResponse({
                'success': True,
                'data': pending_members
            })

        except Exception as e:
            traceback.print_exc()
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)

class ApprovedMemberships(APIView):

    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def get(self, request):
        try:
            cfg = config()
            db = database(cfg)

            approved_members = db.members.get_approved()
            params = {}
         
            params['approved_members'] = approved_members 

            return JsonResponse(params)
        except :
            traceback.print_exc()
            return JsonResponse({},status=500)




class ApproveMembership(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def post(self, request, member_id):
        try:
            cfg = config()
            db = database(cfg)

            # Get member details
            member = db.members.get_by_id(member_id)
            if not member:
                return JsonResponse({
                    'success': False,
                    'message': 'عضویت یافت نشد'
                }, status=404)

            # Generate random password
            password = get_random_string(length=8)
            print("Generated password:", password)

            verification_code = random.randint(100000, 999999)  # 6-digit code
            User = get_user_model()

            user = User.objects.create_user(
                username=member['mobile'],
                password=password,
                first_name=member['name'].split()[0],
                last_name=' '.join(member['name'].split()[1:]) if len(member['name'].split()) > 1 else '',
                is_active=True
            )

            db.members.approve(member_id, user.id)

            send_verification_sms(member['mobile'], password)

            return JsonResponse({
                'success': True,
                'message': 'عضویت تایید شد و پیامک ارسال گردید'
            })

        except Exception as e:
            traceback.print_exc()
            return JsonResponse({'success': False, 'message': str(e)}, status=500)



class RejectMembership(APIView):

    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def post(self, request, member_id):
        try:
            cfg = config()
            db = database(cfg)

            db.members.reject(member_id)
            return JsonResponse({
                'success': True,
                'message': 'عضویت رد شد'
            })

        except Exception as e:
            traceback.print_exc()
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)


class FirstLoginActivation(APIView):

    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def post(self, request):
        try:
            user = request.user
            
            if not user.last_login:
                user.is_active = True
                user.save()
                
                cfg = config()
                db = database(cfg)
                member = db.members.get_by_django_user_id(user.id)
                
                return JsonResponse({
                    'success': True,
                    'message': 'حساب کاربری شما با موفقیت فعال شد',
                    'first_login': True,
                    'member_info': member
                })
            
            return JsonResponse({
                'success': True,
                'message': 'خوش آمدید',
                'first_login': False
            })

        except Exception as e:
            traceback.print_exc()
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
            
class AddApprovedMember(APIView):

    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def post(self, request):
        try:
            def convert_to_english_digits(s):
                if not isinstance(s, str):
                    return s
                persian_digits = "۰۱۲۳۴۵۶۷۸۹"
                english_digits = "0123456789"
                translation_table = str.maketrans(persian_digits, english_digits)
                return s.translate(translation_table)

            try:
                data = json.loads(request.body.decode('utf-8'))
            except:
                return JsonResponse({
                    'success': False,
                    'message': 'Invalid JSON payload'
                }, status=400)

            name = data.get('name')
            mobile = convert_to_english_digits(data.get('mobile'))
            level_id = data.get('level_id')
            birth_date = convert_to_english_digits(data.get('birth_date'))
            password = data.get('password')  # Optional password, will generate if not provided

            if not all([name, mobile, level_id, birth_date]):
                return JsonResponse({
                    'success': False,
                    'message': 'تمام فیلدها الزامی هستند'
                }, status=400)

            cfg = config()
            db = database(cfg)

            # Check duplication
            if db.members.get_by_mobile(mobile):
                return JsonResponse({
                    'success': False,
                    'message': 'این شماره موبایل قبلا ثبت شده است'
                }, status=400)

            if not password:
                password = get_random_string(length=8)

            User = get_user_model()

            user = User.objects.create_user(
                username=mobile,
                password=password,
                first_name=name.split()[0],
                last_name=' '.join(name.split()[1:]) if len(name.split()) > 1 else '',
                is_active=True
            )
            result = db.members.add_approved(name, mobile, level_id, birth_date, user.id)

            # Send SMS with password
            # send_verification_sms(mobile, password)

            return JsonResponse({
                'success': True,
                'message': 'عضو با موفقیت اضافه و تایید شد',
                'data': result
            })

        except Exception as e:
            traceback.print_exc()
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)            
            
class update(APIView):

    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def post(self, request, member_id):
        try:
            def convert_to_english_digits(s):
                if not isinstance(s, str):
                    return s
                persian_digits = "۰۱۲۳۴۵۶۷۸۹"
                english_digits = "0123456789"
                translation_table = str.maketrans(persian_digits, english_digits)
                return s.translate(translation_table)

            try:
                data = json.loads(request.body.decode('utf-8'))
            except:
                return JsonResponse({
                    'success': False,
                    'message': 'Invalid JSON payload'
                }, status=400)

            name = data.get('name')
            mobile = convert_to_english_digits(data.get('mobile'))
            level_id = data.get('level_id')
            birth_date = convert_to_english_digits(data.get('birth_date'))

            cfg = config()
            db = database(cfg)

            result = db.members.update(
                member_id=member_id,
                name=name,
                mobile=mobile,
                level_id=level_id,
                birth_date=birth_date
            )

            return JsonResponse(result)

        except Exception as e:
            traceback.print_exc()
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)            