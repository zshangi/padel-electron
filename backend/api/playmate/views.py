from cv2 import resize
from django.shortcuts import render

# Create your views here.

import traceback
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication

from django.http import HttpResponse, JsonResponse

import pickle
import datetime

from config import config
from utils import AssetMananger
from utils import database
from utils import tools
from utils import giphy
import json
import base64

def create_avatar( cfg, db, username, is_default ):
    while True :
        rand_uid = tools.random_name( 10,10 )
        if not db.avatar.uid_exists( rand_uid ) :
            uid = rand_uid 
            break 

    db.avatar.create( username, uid, is_default ) 
    return uid

class create(APIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JWTAuthentication, )

    def post( self, request ):
        try :
            username = request.user.username

            cfg = config()
            db = database( cfg )

            default = 0
            avatars = db.avatar.fetch( username )

            if len(avatars) == 0 :
                default = 1

            uid = create_avatar( cfg, db, username, default )
            avatars = db.avatar.fetch( username )

            params = {}
            params['avatars'] = avatars
            params['uid'] = uid
            
            return JsonResponse(params)
        except :
            traceback.print_exc()
            return JsonResponse({},status=500)


class fetch( APIView ):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JWTAuthentication, )

    def get( self, request ):
        try :
            username = request.user.username

            cfg = config()
            db = database( cfg )

            assets = db.avatar_asset_bank.get()
            avatars = db.avatar.fetch( username )

            params = {}
            params['assets'] = assets 
            params['meta'] = cfg.avatar['meta']
            params['avatars'] = avatars 

            return JsonResponse(params)
        except :
            traceback.print_exc()
            return JsonResponse({},status=500)

class fetch_asset( APIView ):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication, )

    def post( self, request ):
        try :
            username = request.user.username

            data = json.loads( request.body )

            assert 'name' in data, "Name was not provied"

            cfg = config()
            db = database( cfg )

            asset = db.avatar_asset_bank.get_asset( data['name'] )

            print( asset.keys() )

            params = {}
            params['asset'] = asset 

            return JsonResponse(params)
        except :
            traceback.print_exc()
            return JsonResponse({},status=500)

class fetch_old( APIView ):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication, )

    def post( self, request ):
        try :
            username = request.user.username

            with open('avatar.pkl','rb') as ff :
                assets = pickle.load(ff)
            
            cfg = config()
            db = database( cfg )

            avatar_config = db.avatar.get_config( username )
            avatar_config = json.loads( avatar_config )

            #widgets = db.widgets.get( username )

            #print( widgets )
            
            params = {}
            params['assets'] = assets
            params['config'] = avatar_config

            #params['widgets'] = json.loads(widgets)

            return JsonResponse(params)
        except :
            traceback.print_exc()
            return JsonResponse({},status=500)

class update( APIView ):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication, )

    def post( self, request ):
        try :
            username = request.user.username
            data = json.loads( request.body )

            assert 'avatar_id' in data, "Avatar ID was not provided"
            assert 'config' in data, "Config was not provided."
            assert 'img' in data, "Image was not provided."

            tag = datetime.datetime.now()
            tag = tag.strftime('%Y%m%d%H%M%S%f')

            cfg = config()
            db = database( cfg )

            db.avatar.update( username,
                              data['avatar_id'],
                              json.dumps(data['config']),  
                              data['img']['img'],
                              tag ) 

            avatars = db.avatar.fetch( username )


            params = {}
            params['avatars'] = avatars
            return JsonResponse(params)
        except :
            traceback.print_exc()
            return JsonResponse({},status=500)

class set_default( APIView ):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication, )

    def post( self, request ):
        try :
            username = request.user.username
            data = json.loads( request.body )

            assert 'avatar_id' in data, "Avatar ID was not provided"

            cfg = config()
            db = database( cfg )

            db.avatar.set_default( username, data['avatar_id'] )

            avatars = db.avatar.fetch( username )

            params = {}
            params['avatars'] = avatars
            return JsonResponse(params)
        except :
            traceback.print_exc()
            return JsonResponse({},status=500)

class remove( APIView ):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication, )

    def post( self, request ):
        try :
            username = request.user.username
            data = json.loads( request.body )

            assert 'avatar_id' in data, "Avatar ID was not provided"

            cfg = config()
            db = database( cfg )

            db.avatar.remove( username, data['avatar_id'] )

            avatars = db.avatar.fetch( username )

            params = {}
            params['avatars'] = avatars
            return JsonResponse(params)
        except :
            traceback.print_exc()
            return JsonResponse({},status=500)

class get( APIView ):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication, )

    def post( self, request ):
        try :
            username = request.user.username
            data = json.loads( request.body )

            cfg = config()
            db = database( cfg )

            tag = ""
            if 'tag' in data :
                tag = data['tag']

            uname = None 

            if 'twitch' in data :
                 uname = db.oauth.get_username_for_platform('twitch', data['twitch'] )

            assert uname != None, "Username not found"
            assert tag != db.avatar.get_tag(uname), "Tag has not changed."

            img_data = db.avatar.get_img( uname )

            params = {}
            params.update( img_data )
            return JsonResponse(params)
        except AssertionError as e :
            traceback.print_exc()
            params = {}
            if len( e.args ) > 0 :
                params['error_message'] = e.args[0]
            else :
                params['error_message'] = "Something went wrong."
            return JsonResponse( params, status=400 )
        except :
            traceback.print_exc()
            return JsonResponse({},status=500)

class get_avatar( APIView ):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication, )

    def get( self, request ):
        try :
            username = request.user.username

            cfg = config()
            db = database( cfg )

            avatar = db.avatar.get_img( username )

            params = {}
            params['avatar'] = avatar
            return JsonResponse(params)
        except :
            traceback.print_exc()
            return JsonResponse({},status=500)


