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
def categories(req):
    # Return categories and subcategories for client-side forms
    cats = [model_to_dict(c) for c in Category.objects.all()]
    subs = [model_to_dict(s) for s in SubCategory.objects.all()]
    # normalize keys to match front-end expectations
    for c in cats:
        c["id"] = c.pop("id")
        c["name"] = c.pop("category")
    for s in subs:
        s["id"] = s.pop("id")
        s["name"] = s.pop("subcategory")
        s["categoryId"] = s.pop("category")
        # model_to_dict gives a dict for the FK; make it id only
        if isinstance(s["categoryId"], dict):
            s["categoryId"] = s["categoryId"].get("id")

    return JsonResponse({"categories": cats, "subcategories": subs})

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
        print("Creating base for", year, month)
        getMonth = createBase(year, month)
       
    base = Purchase.objects.filter(description="Base Entry-Do Not Delete", date=datetime.date(year, month, 1)).first()
    categories = [model_to_dict(c) for c in base.categories.all()]
    subcategories = [model_to_dict(s) for s in base.subcategories.all()]

    temp_date = datetime.date(2000, month, 1)
    monthName = temp_date.strftime("%B")

    return JsonResponse({
        "monthName": monthName,
        "month": getMonth.month,
        "year": getMonth.year,
        "total_budget": getMonth.total_budget,
        "categories": categories, 
        "subcategories": subcategories
    })


def createBase(year, month):
    cats = []
    subs = []

    # Predefined Categories
    categories = ["Income","Housing","Transportation","Food","Utilities","Savings",
        "Entertainment","Miscellaneous"
    ]
    for cat in categories:
        cat_obj, _ = Category.objects.get_or_create(category=cat)
        cats.append(cat_obj)

    # Predefined SubCategories
    subcategories = {
        "Housing": ["Rent"],
        "Transportation": ["Gas", "Insurance"],
        "Food": ["Groceries", "Dining Out", "Snacks"],
        "Utilities": ["Electricity", "Water", "Internet", "Phone", "Gas"],
        "Savings": ["Emergency Fund", "Retirement", "Investments"],
        "Entertainment": ["Movies", "Concerts", "Hobbies"],
        "Miscellaneous": ["Gifts", "Donations", "Subscriptions"]
    }
    for cat_name, subcat_list in subcategories.items():
        cat_obj, _ = Category.objects.get_or_create(category=cat_name)
        for subcat in subcat_list:
            subcat_obj, _ = SubCategory.objects.get_or_create(subcategory=subcat, category=cat_obj)
            subs.append(subcat_obj)

    getMonth, _ = Month.objects.get_or_create(year=year, month=month, defaults={'total_budget': 0})

    base, _ = Purchase.objects.get_or_create(
        description="Base Entry-Do Not Delete",
        date=datetime.date(year, month, 1),
        defaults={'spent': 0}
    )
    base.categories.set(cats)
    base.subcategories.set(subs)
    return getMonth


@login_required
def purchases(req):
    # Accept batch purchase entries: creates Purchase objects and associates categories/subcategories
    if req.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    payload = json.loads(req.body.decode("utf-8") or "{}")
    entries = payload.get("entries") or []
    if not isinstance(entries, list):
        return JsonResponse({"error": "entries must be a list"}, status=400)

    created = []
    errors = []
    for i, entry in enumerate(entries):
        try:
            cat_id = entry.get("categoryId")
            sub_id = entry.get("subcategoryId")
            amount = entry.get("amount")
            date_str = entry.get("date")
            notes = entry.get("notes") or entry.get("description") or ""

            if amount is None or cat_id is None or not date_str:
                raise ValueError("Missing required fields")

            date_obj = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()

            # ensure month exists and base is created
            getMonth = Month.objects.filter(year=date_obj.year, month=date_obj.month).first()
            if not getMonth:
                getMonth = createBase(date_obj.year, date_obj.month)

            purchase = Purchase.objects.create(
                description=notes or "User Entry",
                spent=amount,
                date=date_obj
            )

            # Attach category and optional subcategory
            cat_obj = Category.objects.filter(id=cat_id).first()
            if cat_obj:
                purchase.categories.add(cat_obj)
            if sub_id:
                sub_obj = SubCategory.objects.filter(id=sub_id).first()
                if sub_obj:
                    purchase.subcategories.add(sub_obj)

            created.append(model_to_dict(purchase))
        except Exception as e:
            errors.append({"index": i, "error": str(e)})

    status = 200 if not errors else 207
    return JsonResponse({"created": created, "errors": errors}, status=status)