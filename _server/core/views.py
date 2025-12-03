from django.shortcuts import render
from django.conf  import settings
import json
import os
import datetime
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.forms.models import model_to_dict
from .models import Category, SubCategory, purchaseItem, Month, Budget, Purchase

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
    get_categories = [model_to_dict(c) for c in Category.objects.filter(user=req.user)]
    return JsonResponse({"categories": get_categories})

@login_required
def subCategories(req):
    subs = SubCategory.objects.filter(category__user=req.user)
    subcategories = [model_to_dict(s) for s in subs]
    return JsonResponse({"subcategories": subcategories})


@login_required
def tableInfo(req, year, month):
    if req.method == "POST":
        return None

#GET
    if year == 0 or month == 0:
        year, month, day = getToday()

    getMonth = Month.objects.filter(user=req.user, year=year, month=month).first()
       
    base = Purchase.objects.filter(
        user=req.user, 
        description="Base Entry-Do Not Delete",
        date=datetime.date(year, month, 1)
         ).first()

    if not base or not getMonth:
        getMonth, base = createBase(req.user, year, month)

     # Use helper functions instead of calling views
    categories = [model_to_dict(c) for c in Category.objects.filter(user=req.user)]
    subcategories = [model_to_dict(s) for s in SubCategory.objects.filter(category__user=req.user)]
    # Get month name
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


def createBase(user, year, month):
    getMonth, _ = Month.objects.get_or_create(user=user, year=year, month=month, total_budget=0)
    base, _ = Purchase.objects.get_or_create(
        user=user,
        description="Base Entry-Do Not Delete",
        date=datetime.date(year, month, 1),
        total=0,
        pic=None,
    )

    # Predefined Categories
    categories = ["Income","Housing","Transportation","Food","Utilities","Savings",
        "Entertainment","Miscellaneous"
    ]

    # Predefined SubCategories
    subcategories = {
        "Income": ["Salary"],
        "Housing": ["Rent"],
        "Transportation": ["Gas", "Insurance"],
        "Food": ["Groceries", "Dining Out", "Snacks"],
        "Utilities": ["Electricity", "Water", "Internet", "Phone", "Gas"],
        "Savings": ["Emergency Fund", "Retirement", "Investments"],
        "Entertainment": ["Movies", "Concerts", "Hobbies"],
        "Miscellaneous": ["Gifts", "Donations", "Subscriptions"]
    }
    for cat_name, subcat_list in subcategories.items():
        cat_obj, _ = Category.objects.get_or_create(user=user, name=cat_name)
        for subcat in subcat_list:
            subcat_obj, _ = SubCategory.objects.get_or_create(name=subcat, category=cat_obj)
            #Add Budget to each subcategory with 0 amount
            Budget.objects.get_or_create(
                user=user,
                month=getMonth,
                category=cat_obj,
                subcategory=subcat_obj,
                budget=0
            )
            # Add categories and subcategories to item connected to base purchase
            purchaseItem.objects.get_or_create(
                user=user,
                purchase=base,
                category=cat_obj,
                subcategory=subcat_obj,
                amount=0
            )
    return getMonth, base

def getToday():
    today = datetime.date.today()
    return today.year, today.month, today.day

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