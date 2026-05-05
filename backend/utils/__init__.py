from .oauth2 import OAuth2


def database(cfg):
    """Return the configured business-data database backend."""
    if getattr(cfg, "use_sqlite", False):
        from .database_sqlite import database as DB
    else:
        from .database import database as DB

    return DB(cfg)
