from django.shortcuts import render
from django.conf  import settings
import json
import os
import datetime
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.forms.models import model_to_dict
from .models import Category, SubCategory, Receipt, Month, Budget, Purchase

# Load manifest when server launches
MANIFEST = {}
if not settings.DEBUG:
    f = open(f"{settings.BASE_DIR}/core/static/manifest.json")
    MANIFEST = json.load(f)

# Create your views here.
@login_required
def index(req):
    context = {
        "asset_url": os.environ.get("ASSET_URL", ""),
        "debug": settings.DEBUG,
        "manifest": MANIFEST,
        "js_file": "" if settings.DEBUG else MANIFEST["src/main.ts"]["file"],
        "css_file": "" if settings.DEBUG else MANIFEST["src/main.ts"]["css"][0]
    }
    return render(req, "core/index.html", context)

@login_required
def tableInfo(req, year, month):
    if req.method == "POST":
        return null

#GET
    if year == 0 or month == 0:
        today = datetime.date.today()
        year = today.year
        month = today.month

    getMonth = Month.objects.filter(year=year, month=month).first()
    if not getMonth:
        getMonth = Month(year=year, month=month, budget=0)
        getMonth.save() 

        base = Purchase(spent=0, date=datetime.date(year, month, 1), description="Base Entry-Do Not Delete")
        base.save()
        base.categories.set(Category.objects.all())
        base.subcategories.set(SubCategory.objects.all())
        base.save()

    base = Purchase.objects.filter(description="Base Entry-Do Not Delete", date=datetime.date(year, month, 1)).first()
    categories = [model_to_dict(c) for c in Category.objects.all()]
    subcategories = [model_to_dict(s) for s in SubCategory.objects.all()]

    temp_date = datetime.date(2000, month, 1)
    monthName = temp_date.strftime("%B")

    return JsonResponse({
        "monthName": monthName,
        "month": getMonth.month,
        "year": getMonth.year,
        "budget": getMonth.budget,
        "categories": categories, 
        "subcategories": subcategories
    })