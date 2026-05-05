import requests
import json

class Google :
    def __init__( self, cfg ):
        self.cfg = cfg 

    def get_token( self, code, redirect_uri ):
        data = {}
        data["client_id"] = self.cfg.client_id
        data["client_secret"] = self.cfg.client_secret
        data["code"] = code
        data["grant_type"] = "authorization_code"
        data["redirect_uri"] = redirect_uri 

        response = requests.post( self.cfg.token_uri, params=data )
        
        status_code = response.status_code
        response = json.loads( response.text )

        assert status_code == 200, response['error'] + " " + response["error_description"]

        return response

    def refresh_token( self, refresh_token ):
        data = {}
        data["client_id"] = self.cfg.client_id
        data['client_secret'] = self.cfg.client_secret 
        data['grant_type'] = "refresh_token"
        data['refresh_token'] = refresh_token

        response = requests.post( self.cfg.token_uri, params=data )

        response = json.loads( response.text )
        assert response.status_code == 200, response['error'] + " " + response["error_description"]

        return response

    def user_info( self, access_token ):

        uri = "%s&access_token=%s" % ( self.cfg.user_info_uri, access_token )

        res = requests.get( uri ) 

        assert res.status_code == 200, res['error']

        res = json.loads( res.text )

        assert not 'error' in res, res['error']

        return res



