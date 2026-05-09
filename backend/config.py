import os
from pathlib import Path
from easydict import EasyDict as edict


BASE_DIR = Path(__file__).resolve().parent


def use_sqlite():
    """Use SQLite for offline/Electron unless PostgreSQL data env vars are set."""
    flag = os.environ.get("DATA_USE_SQLITE", "").strip().lower()
    return flag in ("1", "true", "yes", "on") or not os.environ.get("DATA_SQL_HOST")

class config :
    def _postgresql_cfg( self ):
        cfg = {}

        cfg["address"] = os.environ.get("DATA_SQL_HOST")
        cfg["port"] = os.environ.get("DATA_SQL_PORT")
        cfg["database"] = os.environ.get("DATA_SQL_DATABASE")
        cfg["username"] = os.environ.get("DATA_SQL_USERNAME")
        cfg["password"] = os.environ.get("DATA_SQL_PASSWORD")

        return cfg
 
    def _sqlite_path(self):
        return os.environ.get("DATA_SQLITE_PATH", str(BASE_DIR / "data.sqlite3"))

    def __init__( self ):
        self._postgresql = self._postgresql_cfg()
        self._use_sqlite = use_sqlite()
        self._sqlite_path = self._sqlite_path()

    @property
    def postgresql( self ):
        return self._postgresql

    @property
    def use_sqlite(self):
        return self._use_sqlite

    @property
    def sqlite_path(self):
        return self._sqlite_path
    
    
    
    
