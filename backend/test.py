import sys
import datetime
import json
from pprint import pprint

from backend.config import Config 
from utils.database import Database

def add( db ):
    data = {}
    data["timestamp"] = datetime.datetime.now() 
    data["facility_id"] = "1"
    data["court_id"] = "1"
    data["user_id"] = "heydar"
    data["status"] = "reserved"
    data["data"] = {'name':'heydar'}

    db.reservation_cal.add( data )

def fetch( db, user_id ):
    

    out = db.reservation_cal.fetch_user_id( user_id )

    print( out )

if __name__=="__main__" :
    cfg = Config()
    db = Database(cfg)

    #add( db ) 

    fetch( db, "heydar" )


