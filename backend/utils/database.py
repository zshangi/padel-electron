

import psycopg2
from datetime import datetime
import json
from easydict import EasyDict as edict
import random
import string
import codecs
import json

class base_table :
    def __init__( self, cfg, conn ):
        self._cfg = cfg
        self._conn = conn

    def run_query( self, query, params=None, has_commit=False, has_fetch=False ):
        cur = self._conn.cursor()
        if params is None :
            cur.execute(query)
        else :
            cur.execute(query, params)
        if has_commit :
            self._conn.commit()
        if has_fetch :
            return cur.fetchall()

    def commit( self, query, params=() ):
        cur = self._conn.cursor()
        cur.execute( query, params )
        self._conn.commit()

    def fetch( self, query, params=() ):
        cur = self._conn.cursor()
        cur.execute( query, params )
        return cur.fetchall()


class setting(base_table):
    def __init__(self, cfg, conn):
        super().__init__(cfg, conn)

        query = """
        CREATE TABLE IF NOT EXISTS setting (
            id SERIAL PRIMARY KEY,
            name TEXT,
            data BYTEA
        )
        """
        self.run_query(query, has_commit=True)

    def add(self, name, data):
        data = json.dumps(data).encode('utf-8')
        query = """
        INSERT INTO setting (name, data) 
        VALUES (%s, %s)
        """
        self.run_query(query, (name, data), has_commit=True)
        return True

    def get(self):
        query = "SELECT id, name, data FROM setting"
        rows = self.run_query(query, has_fetch=True)

        out = []
        for r in rows:
            out.append({
                "id": r[0],
                "name": r[1],
                "data": json.loads(r[2].tobytes()) if r[2] else {}
            })

        return out

    def update(self,  name, data):
        if type(data) != bytes:
            data = json.dumps(data).encode('utf-8')

        query = """
        UPDATE setting 
        SET name = %s, data = %s 
        
        """
        self.run_query(query, (name, data), has_commit=True)
        return True


class category(base_table):
    def __init__(self, cfg, conn):
        super().__init__(cfg, conn)
        query = """
        CREATE TABLE IF NOT EXISTS category (
            id SERIAL PRIMARY KEY,
            name TEXT,
            maincategory_id Text
        )
        """
        self.run_query(query, has_commit=True)

    def add(self, name, maincategory_id):
        query = "INSERT INTO category (name,maincategory_id) VALUES (%s,%s)"
        self.run_query(query, (name,maincategory_id), has_commit=True)

    def update(self, id, name):
        query = "UPDATE category SET name = %s WHERE id = %s"
        self.run_query(query, (name, id), has_commit=True)

    def get(self):
        query = "SELECT id, name,maincategory_id FROM category"
        rows = self.run_query(query, has_fetch=True)
        return [{"id": r[0], "name": r[1], "maincategory_id": r[2]} for r in rows]
    
    def get_by_miancategory(self, maincategory_id):
        query = """
        SELECT id, name FROM category WHERE maincategory_id= %s::text
        """
        rows = self.run_query(query, (maincategory_id,), has_fetch=True)
        return [{"id": r[0], "name": r[1]} for r in rows]
    
    def get_by_id(self, id):
        query = "SELECT id, name, maincategory_id FROM category WHERE id = %s"
        rows = self.run_query(query, (id,), has_fetch=True)
        if rows:
            r = rows[0]
            return {"id": r[0], "name": r[1], "maincategory_id": r[2]}
        return None

    def delete(self, id):
        query = "DELETE FROM category WHERE id = %s"
        self.run_query(query, (id,), has_commit=True)

class subcategory(base_table):
    def __init__(self, cfg, conn):
        super().__init__(cfg, conn)
        query = """
        CREATE TABLE IF NOT EXISTS subcategory (
            id SERIAL PRIMARY KEY,
            category_id TEXT,
            name TEXT
        )
        """
        self.run_query(query, has_commit=True)

    def add(self, category_id, name):
        query = "INSERT INTO subcategory (category_id, name) VALUES (%s, %s)"
        self.run_query(query, (category_id, name), has_commit=True)
    
    def update(self, id, name):
        query = "UPDATE subcategory SET name = %s WHERE id = %s"
        self.run_query(query, (name, id), has_commit=True)

    def get(self):
        query = "SELECT id, name,category_id FROM subcategory"
        rows = self.run_query(query, has_fetch=True)
        return [{"id": r[0], "name": r[1], "category_id": r[2]} for r in rows]
    
    def get_by_category(self, category_id):
        query = """
        SELECT id, name FROM subcategory WHERE category_id=%s
        """
        rows = self.run_query(query, (category_id,), has_fetch=True)
        return [{"id": r[0], "name": r[1]} for r in rows]
    def get_by_id(self, id):
        query = "SELECT id, name, category_id FROM subcategory WHERE id = %s"
        rows = self.run_query(query, (id,), has_fetch=True)
        if rows:
            r = rows[0]
            return {"id": r[0], "name": r[1], "category_id": r[2]}
        return None

    def delete(self, id):
        query = "DELETE FROM subcategory WHERE id = %s"
        self.run_query(query, (id,), has_commit=True)

class categorycontent(base_table):
    
    def __init__(self, cfg, conn):
        super().__init__(cfg, conn)
        query = """
        CREATE TABLE IF NOT EXISTS category_content (
            id SERIAL PRIMARY KEY,
            maincategory_id TEXT,
            category_id INTEGER,
            categorycontent BYTEA,
            subcategorycontent BYTEA,
            UNIQUE(maincategory_id, category_id)
        )
        """
        self.run_query(query, has_commit=True)

    @staticmethod
    def _normalize_subcategory_id(value):
        if value is None:
            return None
        try:
            return int(value)
        except (TypeError, ValueError):
            return str(value)

    @classmethod
    def _normalize_subcategorycontent_list(cls, items):
        if not isinstance(items, list):
            return []

        deduped = {}
        for item in items:
            if not isinstance(item, dict):
                continue
            subcategory_id = cls._normalize_subcategory_id(item.get("subcategory_id"))
            if subcategory_id is None:
                continue
            deduped[subcategory_id] = {**item, "subcategory_id": subcategory_id}

        return list(deduped.values())

    def add(self, maincategory_id, category_id, categorycontent, subcategorycontent=None):
        categorycontent_bytes = json.dumps(categorycontent).encode("utf-8")
        normalized_subcategorycontent = None
        if subcategorycontent is not None:
            normalized_subcategorycontent = self._normalize_subcategorycontent_list(subcategorycontent)
        subcategorycontent_bytes = json.dumps(normalized_subcategorycontent).encode("utf-8") if normalized_subcategorycontent is not None else None
        
        query = """
        INSERT INTO category_content (maincategory_id, category_id, categorycontent, subcategorycontent)
        VALUES (%s, %s, %s, %s)
        """
        self.run_query(query, (maincategory_id, category_id, categorycontent_bytes, subcategorycontent_bytes), has_commit=True)

    def update(self, id, categorycontent=None, subcategorycontent=None):
        updates = []
        params = []
        
        if categorycontent is not None:
            updates.append("categorycontent = %s")
            params.append(json.dumps(categorycontent).encode("utf-8"))
            
        if subcategorycontent is not None:
            updates.append("subcategorycontent = %s")
            normalized_subcategorycontent = self._normalize_subcategorycontent_list(subcategorycontent)
            params.append(json.dumps(normalized_subcategorycontent).encode("utf-8"))
            
        if not updates:
            return
            
        params.append(id)
        query = f"UPDATE category_content SET {', '.join(updates)} WHERE id = %s"
        self.run_query(query, params, has_commit=True)

    def get_by_combination(self, maincategory_id, category_id):
        query = """
        SELECT id, maincategory_id, category_id, categorycontent, subcategorycontent
        FROM category_content 
        WHERE maincategory_id = %s AND category_id = %s
        """
        rows = self.run_query(query, (maincategory_id, category_id), has_fetch=True)
        
        if rows:
            r = rows[0]
            subcategorycontent = json.loads(r[4].tobytes()) if r[4] else []
            normalized_subcategorycontent = self._normalize_subcategorycontent_list(subcategorycontent)
            return {
                "id": r[0],
                "maincategory_id": r[1],
                "category_id": r[2],
                "categorycontent": json.loads(r[3].tobytes()) if r[3] else {},
                "subcategorycontent": normalized_subcategorycontent
            }
        return None
    def get_category_content(self, maincategory_id, category_id):
        # Get the category-level content (subcategory_id is null)
        query = """
        SELECT id, maincategory_id, category_id, subcategory_id, categorycontent, subcategorycontent
        FROM category_content 
        WHERE maincategory_id = %s AND category_id = %s AND subcategory_id IS NULL
        """
        rows = self.run_query(query, (maincategory_id, category_id), has_fetch=True)
        
        if rows:
            r = rows[0]
            return {
                "id": r[0],
                "maincategory_id": r[1],
                "category_id": r[2],
                "subcategory_id": r[3],
                "categorycontent": json.loads(r[4].tobytes()) if r[4] else {},
                "subcategorycontent": json.loads(r[5].tobytes()) if r[5] else None
            }
        return None

    def get_subcategory_content(self, maincategory_id, category_id, subcategory_id):
        # Get the subcategory-level content
        query = """
        SELECT id, maincategory_id, category_id, subcategory_id, categorycontent, subcategorycontent
        FROM category_content 
        WHERE maincategory_id = %s AND category_id = %s AND subcategory_id = %s
        """
        rows = self.run_query(query, (maincategory_id, category_id, subcategory_id), has_fetch=True)
        
        if rows:
            r = rows[0]
            return {
                "id": r[0],
                "maincategory_id": r[1],
                "category_id": r[2],
                "subcategory_id": r[3],
                "categorycontent": json.loads(r[4].tobytes()) if r[4] else {},
                "subcategorycontent": json.loads(r[5].tobytes()) if r[5] else None
            }
        return None

    def get(self):
        query = "SELECT id, maincategory_id, category_id, categorycontent, subcategorycontent FROM category_content"
        rows = self.run_query(query, has_fetch=True)

        out = []
        for r in rows:
            subcategorycontent = json.loads(r[4].tobytes()) if r[4] else []
            normalized_subcategorycontent = self._normalize_subcategorycontent_list(subcategorycontent)
            out.append({
                "id": r[0],
                "maincategory_id": r[1],
                "category_id": r[2],
                "categorycontent": json.loads(r[3].tobytes()) if r[3] else {},
                "subcategorycontent": normalized_subcategorycontent
            })
        return out
    def delete_by_category_id(self, category_id):
        query = "DELETE FROM category_content WHERE category_id = %s"
        self.run_query(query, (category_id,), has_commit=True)

    def remove_subcategory(self, subcategory_id):
        # This is more complex as we need to update the JSON in the subcategorycontent field
        # First, get all records that might contain this subcategory
        query = "SELECT id, subcategorycontent FROM category_content WHERE subcategorycontent IS NOT NULL"
        rows = self.run_query(query, has_fetch=True)
        
        for row in rows:
            id = row[0]
            subcategorycontent = json.loads(row[1].tobytes()) if row[1] else []
            target_subcategory_id = self._normalize_subcategory_id(subcategory_id)
            
            # Filter out the subcategory to be removed
            updated_subcategorycontent = [
                sub for sub in subcategorycontent 
                if self._normalize_subcategory_id(sub.get("subcategory_id")) != target_subcategory_id
            ]
            updated_subcategorycontent = self._normalize_subcategorycontent_list(updated_subcategorycontent)
            
            # Update the record
            query = "UPDATE category_content SET subcategorycontent = %s WHERE id = %s"
            self.run_query(
                query, 
                (json.dumps(updated_subcategorycontent).encode("utf-8"), id), 
                has_commit=True
            )

class court(base_table):
    def __init__(self, cfg, conn):
        super().__init__(cfg, conn)

        query = """
        CREATE TABLE IF NOT EXISTS court (
                id SERIAL PRIMARY KEY,
                name TEXT,
                status TEXT,
                data BYTEA
        )
        """
        
        self.run_query(query, has_commit=True)

    def add(self, name,status, data):
        data = json.dumps(data).encode('utf-8')
        query = """
        INSERT INTO court (name, status, data) 
        VALUES (%s, %s, %s)
        """
        self.run_query(query, (name,status, data), has_commit=True)
        return True

    def get(self):
        query = """
        SELECT id, name,status, data FROM court WHERE status = 'active'
        """

        entries = self.run_query(query, has_fetch=True)

        out = []
        for e in entries:

            out.append({
                'id': e[0],
                'name': e[1],
                'status':e[2],
                "data": json.loads(e[3].tobytes()) if e[3] else {}
            })

        return out

    def get_by_id(self, id):
        query = """
        SELECT id, name,status, data FROM court WHERE id=%s
        """

        entries = self.run_query(query, (id,), has_fetch=True)

        out = []
        for e in entries:

            out.append({
                'id': e[0],
                'name': e[1],
                'status':e[2],
                "data": json.loads(e[3].tobytes()) if e[3] else {}
            })

        return out
    
    def update(self, id, name, status, data):

        data = json.dumps(data).encode('utf-8')
        
        query = """
        UPDATE court SET name=%s,status=%s, data=%s WHERE id=%s
        """
        
        self.run_query(query, (name, status, data, id), has_commit=True)
        return True


    def remove_with_id(self, id):
        query = """
        DELETE FROM court WHERE id=%s
        """

        self.run_query(query, (id,), has_commit=True)


class couch(base_table):
    def __init__(self, cfg, conn):
        super().__init__(cfg, conn)

        query = """
        CREATE TABLE IF NOT EXISTS couch (
                id SERIAL PRIMARY KEY,
                name TEXT,
                status TEXT,
                data BYTEA
        )
        """
        
        self.run_query(query, has_commit=True)

    def add(self, name, status, data):
        data = json.dumps(data).encode('utf-8')

        query = """
        INSERT INTO couch (name,status, data) VALUES (%s, %s, %s)
        """

        self.run_query(query, (name, status, data), has_commit=True)

    def get(self):
        query = """
        SELECT id, name, status, data FROM couch 
        """

        entries = self.run_query(query, has_fetch=True)

        out = []
        for e in entries:

            out.append({
                'id': e[0],
                'name': e[1],
                'status': e[2],
                "data": json.loads(e[3].tobytes()) if e[3] else {}
            })
        return out
    
    def get_by_status(self,status):
        query = """
        SELECT id, name, status, data FROM couch WHERE status=%s
        """

        entries = self.run_query(query, (status,), has_fetch=True)

        out = []
        for e in entries:

            out.append({
                'id': e[0],
                'name': e[1],
                'status': e[2],
                "data": json.loads(e[3].tobytes()) if e[3] else {}
            })
        return out
    
    def get_by_id(self, id):
        query = """
        SELECT id, name, status, data FROM couch WHERE id=%s
        """
        entries = self.run_query(query, (id,), has_fetch=True)

        if not entries:
            return None  

        e = entries[0]  
        return {
            'id': e[0],
            'name': e[1],
            'status': e[2],
            "data": json.loads(e[3].tobytes()) if e[3] else {}
        }
    
    def update(self, id, name,status, data):

        data = json.dumps(data).encode('utf-8')
        
        query = """
        UPDATE couch SET name=%s, status=%s, data=%s WHERE id=%s
        """
        
        self.run_query(query, (name, status, data, id), has_commit=True)
        return True

    def update_working_hours(self, id, working_hours):
        couch_data = self.get_by_id(id)
        if not couch_data:
            return False  # now correctly handles missing couch

        # Merge new working hours into existing data
        current_data = couch_data.get('data', {})
        current_data['workingHours'] = working_hours

        # Update the row
        updated_data_bytes = json.dumps(current_data).encode('utf-8')
        query = "UPDATE couch SET data=%s WHERE id=%s"
        self.run_query(query, (updated_data_bytes, id), has_commit=True)
        return True


    def remove_with_id(self, id):
        query = """
        DELETE FROM couch WHERE id=%s
        """

        self.run_query(query, (id,), has_commit=True)

class level( base_table ):
    def __init__( self, cfg, conn ):
        super().__init__( cfg, conn )

        query = """
        CREATE TABLE IF NOT EXISTS level (
                id SERIAL PRIMARY KEY,
                name TEXT
        )
        """
        
        self.run_query( query, has_commit=True )


    def add( self, name, data ):
        data = json.dumps( data ).encode()

        query = """
        INSERT INTO level ( name ) VALUES ( %s)
        """

        self.run_query( query, ( name ), has_commit=True )

    def get( self ):

        query = """
        SELECT id,name FROM level 
        """

        entries = self.run_query( query, has_fetch=True )

        out = []
        for e in entries:
            out.append({
                'id': e[0],
                'name': e[1],

            })
        return out



    def update_name( self, id, name ):
        query = """
        UPDATE level SET name=%s WHERE id=%s
        """

        self.run_query( query, (name, id), has_commit=True )

    def remove_with_id( self, id ):
        query = """
        DELETE FROM level WHERE id=%s
        """

        self.run_query( query, (id,), has_commit=True )


class Reserved(base_table):
    def __init__(self, cfg, conn):
        super().__init__(cfg, conn)

        query = """
        CREATE TABLE IF NOT EXISTS reserved (
            id SERIAL PRIMARY KEY,
            selected_day TEXT,
            selected_time TEXT,
            user_id INTEGER,
            court_id INTEGER,
            couch_id INTEGER,
            data BYTEA,
            package_id TEXT, 
            get_by_who TEXT,
            status TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        )
        """
        self.run_query(query, has_commit=True)

    def add(self, selected_day, selected_time, user_id, court_id, couch_id, data,get_by_who,status):
        data = json.dumps(data).encode('utf-8')


        query = """
        INSERT INTO reserved (selected_day, selected_time, user_id, court_id, couch_id, data,get_by_who,status)
        VALUES (%s, %s, %s, %s, %s, %s,%s,%s)
        """
        self.run_query(query, (selected_day, selected_time, user_id, court_id, couch_id, data,get_by_who,status), has_commit=True)

    def add_bulk(self, reservations):

        if not reservations:
            return

        first_res = reservations[0]
        user_id = first_res.get("user_id")
        selected_day = first_res.get("selected_day")
        
        random_str = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
        package_id = f"{user_id}{random_str}"

        query = """
        INSERT INTO reserved (
            selected_day, selected_time, user_id, court_id, couch_id, data, package_id,status
        ) VALUES (%s, %s, %s, %s, %s, %s, %s,%s)
        """
        cur = self._conn.cursor()
        try:
            for res in reservations:
                data = res.get("data", {})
                if isinstance(data, (dict, list)):
                    data_str = json.dumps(data)
                elif isinstance(data, bytes):
                    data_str = data.decode('utf-8')
                else:
                    data_str = str(data)

                data_bytes = data_str.encode('utf-8')

                cur.execute(query, (
                    res["selected_day"],
                    res["selected_time"],
                    res["user_id"],
                    res.get("court_id"),
                    res.get("couch_id"),
                    data_bytes,
                    package_id,
                    res.get("status"),

                ))

            self._conn.commit()
        except Exception as e:
            self._conn.rollback()
            raise e

    def update(self,  id,selected_day, selected_time, user_id, court_id, couch_id, data):
        if type(data) != bytes:
            data = json.dumps(data).encode('utf-8')

        query = """
        UPDATE reserved 
        SET selected_day = %s,selected_time= %s,user_id=%s,court_id=%s,couch_id=%s, data = %s  WHERE id=%s
        
        """
        self.run_query(query, (selected_day, selected_time, user_id, court_id, couch_id, data,id), has_commit=True)
        return True
    
    
    
    def get(self):
        query = """SELECT id,selected_day, selected_time, user_id, court_id, couch_id, package_id,get_by_who,status,created_at,data FROM reserved ORDER BY created_at DESC"""
        entries = self.run_query(query, has_fetch=True)
        out = []

        for e in entries:
            out.append({
                "id": e[0],
                "selected_day": e[1],
                "selected_time": e[2],
                "user_id": e[3],
                "court_id": e[4],
                "couch_id": e[5],
                "package_id": e[6],
                "get_by_who": e[7],
                "status" :e[8],
                "created_at": e[9],
                "data": json.loads(e[10].tobytes()) if e[10] else {}
            })

        return out
    
    def get_with_couch(self):
        query = """SELECT id,selected_day, selected_time, user_id, court_id, couch_id, package_id,get_by_who,status,created_at,data FROM reserved WHERE couch_id is not null ORDER BY created_at DESC"""
        entries = self.run_query(query, has_fetch=True)
        out = []

        for e in entries:
            out.append({
                "id": e[0],
                "selected_day": e[1],
                "selected_time": e[2],
                "user_id": e[3],
                "court_id": e[4],
                "couch_id": e[5],
                "package_id": e[6],
                "get_by_who": e[7],
                "status" :e[8],
                "created_at": e[9],
                "data": json.loads(e[10].tobytes()) if e[10] else {}
            })

        return out

    def get_by_id(self,reservation_id):
        query = """SELECT id,selected_day, selected_time, user_id, court_id, couch_id, package_id,get_by_who,status,created_at,data FROM reserved WHERE id=%s"""
        entries = self.run_query(query, (reservation_id,), has_fetch=True)
        out = []

        for e in entries:
            out.append({
                "id": e[0],
                "selected_day": e[1],
                "selected_time": e[2],
                "user_id": e[3],
                "court_id": e[4],
                "couch_id": e[5],
                "package_id": e[6],
                "get_by_who": e[7],
                "status" :e[8],
                "created_at": e[9],
                "data": json.loads(e[10].tobytes()) if e[10] else {}
            })

        return out


    def get_selected_day(self,selected_day,status):
        query = """SELECT id,selected_day, selected_time, user_id, court_id, couch_id, package_id,get_by_who,status,created_at,data FROM reserved WHERE selected_day=%s and status=%s"""
        entries = self.run_query(query, (selected_day,status,), has_fetch=True)
        out = []

        for e in entries:
            out.append({
                "id": e[0],
                "selected_day": e[1],
                "selected_time": e[2],
                "user_id": e[3],
                "court_id": e[4],
                "couch_id": e[5],
                "package_id": e[6],
                "get_by_who": e[7],
                "status" :e[8],
                "created_at": e[9],
                "data": json.loads(e[10].tobytes()) if e[10] else {}
            })

        return out
    def get_selected_day_time_status(self,selected_day,selected_time,status):
        query = """SELECT id,selected_day, selected_time, user_id, court_id, couch_id, package_id,get_by_who,status,created_at,data FROM reserved WHERE selected_day=%s and selected_time=%s and status=%s"""
        entries = self.run_query(query, (selected_day,selected_time,status,), has_fetch=True)
        out = []

        for e in entries:
            out.append({
                "id": e[0],
                "selected_day": e[1],
                "selected_time": e[2],
                "user_id": e[3],
                "court_id": e[4],
                "couch_id": e[5],
                "package_id": e[6],
                "get_by_who": e[7],
                "status" :e[8],
                "created_at": e[9],
                "data": json.loads(e[10].tobytes()) if e[10] else {}
            })

        return out

    def get_selected_day_except_waitinglist(self,selected_day):
        query = """SELECT id,selected_day, selected_time, user_id, court_id, couch_id, package_id,get_by_who,status,created_at,data FROM reserved WHERE selected_day=%s and (status='confirm' or status='offerPackage') """
        entries = self.run_query(query, (selected_day,), has_fetch=True)
        out = []

        for e in entries:
            out.append({
                "id": e[0],
                "selected_day": e[1],
                "selected_time": e[2],
                "user_id": e[3],
                "court_id": e[4],
                "couch_id": e[5],
                "package_id": e[6],
                "get_by_who": e[7],
                "status" :e[8],
                "created_at": e[9],
                "data": json.loads(e[10].tobytes()) if e[10] else {}
            })

        return out


    def get_selected_day_with_couch(self,selected_day,status):
        query = """SELECT id,selected_day, selected_time, user_id, court_id, couch_id, package_id,get_by_who,status,created_at,data FROM reserved WHERE couch_id is not null and selected_day=%s and status=%s"""
        entries = self.run_query(query, (selected_day,status,), has_fetch=True)
        out = []

        for e in entries:
            out.append({
                "id": e[0],
                "selected_day": e[1],
                "selected_time": e[2],
                "user_id": e[3],
                "court_id": e[4],
                "couch_id": e[5],
                "package_id": e[6],
                "get_by_who": e[7],
                "status" :e[8],
                "created_at": e[9],
                "data": json.loads(e[10].tobytes()) if e[10] else {}
            })

        return out
    
        
    def get_status(self,status):
        query = """SELECT id,selected_day, selected_time, user_id, court_id, couch_id, package_id,get_by_who,status,created_at,data FROM reserved WHERE status=%s"""
        entries = self.run_query(query, (status,), has_fetch=True)
        out = []

        for e in entries:
            out.append({
                "id": e[0],
                "selected_day": e[1],
                "selected_time": e[2],
                "user_id": e[3],
                "court_id": e[4],
                "couch_id": e[5],
                "package_id": e[6],
                "get_by_who": e[7],
                "status" :e[8],
                "created_at": e[9],
                "data": json.loads(e[10].tobytes()) if e[10] else {}
            })

        return out


    def get_user(self, user_id):
        query = """
            SELECT id, selected_day, selected_time, user_id, court_id,
                couch_id, package_id,get_by_who,status, created_at, data
            FROM reserved 
            WHERE user_id = %s 
            ORDER BY id DESC
        """
        entries = self.run_query(query, (user_id,), has_fetch=True)
        out = []

        for e in entries:
            raw_data = e[6]  # bytea column (index changed to match query)

            # 1. If PostgreSQL returns memoryview → convert to bytes
            if isinstance(raw_data, memoryview):
                raw_data = raw_data.tobytes()

            # 2. Decode the escaped hex string -> e.g. \x7b2266...
            if isinstance(raw_data, bytes):
                raw_data = raw_data.decode("utf-8")   # bytes -> text

            # Sometimes PostgreSQL returns a string like: "\x7b2266..."
            if isinstance(raw_data, str) and raw_data.startswith("\\x"):
                raw_data = codecs.decode(raw_data[2:], "hex").decode("utf-8")

            # 3. Parse JSON
            try:
                parsed_data = json.loads(raw_data)
            except:
                parsed_data = {}

            out.append({
                "id": e[0],
                "selected_day": e[1],
                "selected_time": e[2],
                "user_id": e[3],
                "court_id": e[4],
                "couch_id": e[5],
                "package_id": e[6],
                "get_by_who": e[7],
                "status" :e[8],
                "created_at": e[9],
                "data": json.loads(e[10].tobytes()) if e[10] else {}
            })

        return out
    def get_couch(self, couch_id):
        query = """
            SELECT id, selected_day, selected_time, user_id, court_id,
                couch_id, package_id,get_by_who,status, created_at, data
            FROM reserved 
            WHERE couch_id = %s 
            ORDER BY id DESC
        """

        entries = self.run_query(query, (couch_id,), has_fetch=True)
        out = []

        for e in entries:
            out.append({
                "id": e[0],
                "selected_day": e[1],
                "selected_time": e[2],
                "user_id": e[3],
                "court_id": e[4],
                "couch_id": e[5],
                "package_id": e[6],
                "get_by_who": e[7],
                "status" :e[8],
                "created_at": e[9],
                "data": json.loads(e[10].tobytes()) if e[10] else {}
            })

        return out

    def get_court(self, court_id):
        query = """
            SELECT id, selected_day, selected_time, user_id, court_id,
                couch_id, package_id,get_by_who,status, created_at, data
            FROM reserved 
            WHERE court_id = %s 
            ORDER BY id DESC
        """

        entries = self.run_query(query, (court_id,), has_fetch=True)
        out = []

        for e in entries:
            out.append({
                "id": e[0],
                "selected_day": e[1],
                "selected_time": e[2],
                "user_id": e[3],
                "court_id": e[4],
                "couch_id": e[5],
                "package_id": e[6],
                "get_by_who": e[7],
                "status" :e[8],
                "created_at": e[9],
                "data": json.loads(e[10].tobytes()) if e[10] else {}
            })

        return out


    def remove_with_id(self, id):
        query = """
        DELETE FROM reserved WHERE id=%s
        """

        self.run_query(query, (id,), has_commit=True)
    
    def remove_with_package_id(self, package_id):
        query = """
        DELETE FROM reserved WHERE package_id=%s
        """

        self.run_query(query, (package_id,), has_commit=True)

class members(base_table):
    def __init__(self, cfg, conn):
        super().__init__(cfg, conn)

        query = """
        CREATE TABLE IF NOT EXISTS members (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            mobile TEXT UNIQUE NOT NULL,
            level_id TEXT,
            birth_date TEXT,
            status TEXT DEFAULT 'pending', -- pending, approved, rejected
            django_user_id INTEGER,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            data BYTEA
        )
        """
        self.run_query(query, has_commit=True)

    def add(self, name, mobile, level_id, birth_date, data={}, django_user_id=None):
        # Check if mobile already exists
        check_query = "SELECT id FROM members WHERE mobile = %s"
        existing = self.run_query(check_query, (mobile,), has_fetch=True)
        
        if existing:
            return {"success": False, "message": "Mobile number already registered"}
        
        data_bytes = json.dumps(data).encode('utf-8')
        
        query = """
        INSERT INTO members (name, mobile, level_id, birth_date, data, django_user_id)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id
        """
        
        result = self.run_query(query, (name, mobile, level_id, birth_date, data_bytes, django_user_id), has_fetch=True)
        self._conn.commit()
        
        return {"success": True, "id": result[0][0]}

    def add_approved(self, name, mobile, level_id, birth_date, django_user_id=None):
        # Check if mobile already exists
        check_query = "SELECT id FROM members WHERE mobile = %s"
        existing = self.run_query(check_query, (mobile,), has_fetch=True)
        
        if existing:
            return {"success": False, "message": "Mobile number already registered"}
        
        
        query = """
        INSERT INTO members (name, mobile, level_id, birth_date, django_user_id, status)
        VALUES (%s, %s, %s, %s, %s, 'approved')
        RETURNING id
        """
        
        result = self.run_query(query, (name, mobile, level_id, birth_date, django_user_id), has_fetch=True)
        self._conn.commit()
        
        return {"success": True, "id": result[0][0]}

    def update(self, member_id, name=None, mobile=None, level_id=None, birth_date=None):
        # Check if member exists
        check_query = "SELECT id FROM members WHERE id = %s"
        existing = self.run_query(check_query, (member_id,), has_fetch=True)
        
        if not existing:
            return {"success": False, "message": "Member not found"}
        
        # Check if mobile already exists for another member
        if mobile:
            mobile_check_query = "SELECT id FROM members WHERE mobile = %s AND id != %s"
            mobile_existing = self.run_query(mobile_check_query, (mobile, member_id), has_fetch=True)
            
            if mobile_existing:
                return {"success": False, "message": "Mobile number already registered to another member"}
        
        # Build update query dynamically based on provided parameters
        update_fields = []
        params = []
        
        if name is not None:
            update_fields.append("name = %s")
            params.append(name)
            
        if mobile is not None:
            update_fields.append("mobile = %s")
            params.append(mobile)
            
        if level_id is not None:
            update_fields.append("level_id = %s")
            params.append(level_id)
            
        if birth_date is not None:
            update_fields.append("birth_date = %s")
            params.append(birth_date)
            
        # Always update the updated_at timestamp
        update_fields.append("updated_at = NOW()")
        
        # Add member_id to params
        params.append(member_id)
        
        query = f"""
        UPDATE members 
        SET {', '.join(update_fields)}
        WHERE id = %s
        """
        
        self.run_query(query, params, has_commit=True)
        return {"success": True}

    def get_pending(self):
        query = """
        SELECT m.id, m.name, m.mobile, m.birth_date, m.level_id, m.created_at, m.django_user_id
        FROM members m
        WHERE m.status = 'pending'
        ORDER BY m.created_at DESC
        """
        
        entries = self.run_query(query, has_fetch=True)
        
        out = []
        for e in entries:
            out.append({
                'id': e[0],
                'name': e[1],
                'mobile': e[2],
                'birth_date': e[3],
                'level_id': e[4],
                'created_at': e[5],
                'django_user_id': e[6]
            })
        return out

    def get_approved(self):
        query = """
        SELECT m.id, m.name, m.mobile, m.birth_date, m.level_id, m.created_at, m.django_user_id
        FROM members m
        WHERE m.status = 'approved'
        ORDER BY m.created_at DESC
        """
        
        entries = self.run_query(query, has_fetch=True)
        
        out = []
        for e in entries:
            out.append({
                'id': e[0],
                'name': e[1],
                'mobile': e[2],
                'birth_date': e[3],
                'level_id': e[4],
                'created_at': e[5],
                'django_user_id': e[6]
            })
        return out

    def approve(self, member_id, django_user_id):
        query = """
        UPDATE members 
        SET status = 'approved', django_user_id = %s, updated_at = NOW()
        WHERE id = %s
        """
        
        self.run_query(query, (django_user_id, member_id), has_commit=True)
        return {"success": True}

    def reject(self, member_id):
        query = """
        UPDATE members 
        SET status = 'rejected', updated_at = NOW()
        WHERE id = %s
        """
        
        self.run_query(query, (member_id,), has_commit=True)
        return {"success": True}

    def get_by_mobile(self, mobile):
        query = """
        SELECT id, name, mobile, level_id, birth_date, status, django_user_id, created_at
        FROM members
        WHERE mobile = %s
        """
        
        entries = self.run_query(query, (mobile,), has_fetch=True)
        
        if not entries:
            return None
            
        e = entries[0]
        return {
            'id': e[0],
            'name': e[1],
            'mobile': e[2],
            'level_id': e[3],
            'birth_date': e[4],
            'status': e[5],
            'django_user_id': e[6],
            'created_at': e[7]
        }
    
    def get_by_id(self, member_id):
        query = """
        SELECT id, name, mobile, level_id, birth_date, status, django_user_id, created_at
        FROM members
        WHERE id = %s
        """
        
        entries = self.run_query(query, (member_id,), has_fetch=True)
        
        if not entries:
            return None
            
        e = entries[0]
        return {
            'id': e[0],
            'name': e[1],
            'mobile': e[2],
            'level_id': e[3],
            'birth_date': e[4],
            'status': e[5],
            'django_user_id': e[6],
            'created_at': e[7]
        }

    def get_by_django_user_id(self, django_user_id):
        query = """
        SELECT id, name, mobile, level_id, birth_date, status, django_user_id, created_at
        FROM members
        WHERE django_user_id = %s
        """
        
        entries = self.run_query(query, (django_user_id,), has_fetch=True)
        
        if not entries:
            return None
            
        e = entries[0]
        return {
            'id': e[0],
            'name': e[1],
            'mobile': e[2],
            'level_id': e[3],
            'birth_date': e[4],
            'status': e[5],
            'django_user_id': e[6],
            'created_at': e[7]
        }


class database:
    def __init__(self, cfg):
        conn = psycopg2.connect(
            host=cfg.postgresql["address"],
            port=cfg.postgresql["port"],
            database=cfg.postgresql["database"],
            user=cfg.postgresql["username"],
            password=cfg.postgresql["password"]
        )
        self.court = court(cfg, conn)
        self.couch = couch(cfg, conn)
        self.reserved = Reserved(cfg, conn)
        self.level = level(cfg, conn)
        self.members = members(cfg, conn)  
        self.setting = setting(cfg, conn)  
        self.category = category(cfg, conn)  
        self.subcategory = subcategory(cfg, conn)  
        self.categorycontent = categorycontent(cfg, conn)  


 





 


