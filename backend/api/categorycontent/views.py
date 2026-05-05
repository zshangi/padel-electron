# category_content/views.py
from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
import traceback
import json

from config import config
from utils import database


def normalize_id(value):
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return str(value)


def normalize_subcategorycontent_list(items):
    if not isinstance(items, list):
        return []

    deduped = {}
    for item in items:
        if not isinstance(item, dict):
            continue
        sub_id = normalize_id(item.get("subcategory_id"))
        if sub_id is None:
            continue
        deduped[sub_id] = {**item, "subcategory_id": sub_id}

    return list(deduped.values())

class fetch(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def get(self, request):
        try:
            cfg = config()
            db = database(cfg)
            categorycontent = db.categorycontent.get()

            return JsonResponse({"categorycontent": categorycontent}, status=200)
        except:
            traceback.print_exc()
            return JsonResponse({}, status=500)

class add_or_update(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def post(self, request):
        try:
            cfg = config()
            db = database(cfg)
            data = json.loads(request.body.decode())

            assert 'maincategory_id' in data, "Maincategory_id was not provided."
            assert 'category_id' in data, "Category_id was not provided."

            maincategory_id = data.get("maincategory_id")
            category_id = data.get("category_id")
            subcategory_id = normalize_id(data.get("subcategory_id"))  # This can be None
            categorycontent = data.get("categorycontent", {})
            subcategorycontent = data.get("subcategorycontent", None)

            existing_content = db.categorycontent.get_by_combination(maincategory_id, category_id)
            
            if existing_content:
                current_subcategorycontent = normalize_subcategorycontent_list(
                    existing_content.get("subcategorycontent", [])
                )
                
                if subcategory_id is None:
                    db.categorycontent.update(existing_content["id"], categorycontent=categorycontent)
                    return JsonResponse({"success": True, "message": "categorycontent updated"})
                else:
                    content_to_save = subcategorycontent if isinstance(subcategorycontent, dict) else {}
                    subcat_map = {item["subcategory_id"]: item for item in current_subcategorycontent}
                    subcat_map[subcategory_id] = {
                        "subcategory_id": subcategory_id,
                        **content_to_save
                    }
                    
                    db.categorycontent.update(
                        existing_content["id"],
                        subcategorycontent=list(subcat_map.values())
                    )
                    return JsonResponse({"success": True, "message": "subcategorycontent updated"})
            else:
                if subcategory_id is None:
                    db.categorycontent.add(maincategory_id, category_id, categorycontent)
                    return JsonResponse({"success": True, "message": "categorycontent added"})
                else:
                    content_to_save = subcategorycontent if isinstance(subcategorycontent, dict) else {}
                    subcategorycontent_list = [{
                        "subcategory_id": subcategory_id,
                        **content_to_save
                    }]
                    db.categorycontent.add(maincategory_id, category_id, categorycontent, subcategorycontent_list)
                    return JsonResponse({"success": True, "message": "subcategorycontent added"})
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({"success": False, "error": str(e)}, status=500)

class fetch_content(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def post(self, request):
        try:
            cfg = config()
            db = database(cfg)
            data = json.loads(request.body.decode())

            assert 'maincategory_id' in data, "Maincategory_id was not provided."
            assert 'category_id' in data, "Category_id was not provided."

            maincategory_id = data.get("maincategory_id")
            category_id = data.get("category_id")
            subcategory_id = normalize_id(data.get("subcategory_id", None))

            content = db.categorycontent.get_by_combination(maincategory_id, category_id)
            
            if content:
                if subcategory_id is not None and content.get("subcategorycontent"):
                    subcategory_data = None
                    for subcat in content["subcategorycontent"]:
                        if normalize_id(subcat.get("subcategory_id")) == subcategory_id:
                            subcategory_data = subcat
                            break
                    
                    if subcategory_data:
                        return JsonResponse({
                            "content": {
                                "id": content["id"],
                                "maincategory_id": content["maincategory_id"],
                                "category_id": content["category_id"],
                                "subcategory_id": subcategory_id,
                                "categorycontent": content["categorycontent"],
                                "subcategorycontent": subcategory_data
                            }
                        }, status=200)
                    else:
                        return JsonResponse({
                            "content": {
                                "id": content["id"],
                                "maincategory_id": content["maincategory_id"],
                                "category_id": content["category_id"],
                                "subcategory_id": subcategory_id,
                                "categorycontent": content["categorycontent"],
                                "subcategorycontent": {}
                            }
                        }, status=200)
                else:
                    return JsonResponse({"content": content}, status=200)
            else:
                return JsonResponse({"content": None}, status=200)
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({"success": False, "error": str(e)}, status=500)
