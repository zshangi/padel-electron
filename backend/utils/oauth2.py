import requests
import json

class OAuth2 :
    def __init__( self, cfg ):
        self.cfg = cfg 

    def get_token( self, code ):
        data = {}
        data["client_id"] = self.cfg.client_id;
        data["client_secret"] = self.cfg.client_secret;
        data["code"] = code;
        data["grant_type"] = "authorization_code";
        data["redirect_uri"] = self.cfg.redirect_uri;

        response = requests.post( self.cfg.token_uri, params=data )
        assert response.status_code == 200, "Invalid authorization code"
        response = json.loads( response.text )

        return response

    def user_info( self, access_token ):

        headers = {}
        headers['Authorization'] = f'Bearer {access_token}'
        headers['Client-Id'] = self.cfg.client_id

        res = requests.get( self.cfg.user_info_uri, headers=headers ) 

        assert res.status_code == 200, res['error']

        res = json.loads( res.text )

        assert not 'error' in res, res['error']
        return res

