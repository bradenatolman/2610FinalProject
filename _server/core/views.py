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
    if req.method == "POST":
        # Expect JSON body: { "name": "Category Name" }
        try:
            payload = json.loads(req.body.decode("utf-8") or "{}")
        except Exception:
            payload = {}

        name = payload.get("name") or req.POST.get("name")
        if not name:
            return JsonResponse({"error": "name is required"}, status=400)

        # create category for this user, avoid duplicates
        cat_obj, created = Category.objects.get_or_create(user=req.user, name=name)

        # return the created category and the updated list
        get_categories = [model_to_dict(c) for c in Category.objects.filter(user=req.user)]
        return JsonResponse({"category": model_to_dict(cat_obj), "categories": get_categories}, status=201 if created else 200)
    else:
        get_categories = [model_to_dict(c) for c in Category.objects.filter(user=req.user)]
        return JsonResponse({"categories": get_categories})

@login_required
def subCategories(req):
    if req.method == "POST":
        # Expect JSON body: { "name": "Category Name" }
        try:
            payload = json.loads(req.body.decode("utf-8") or "{}")
        except Exception:
            payload = {}

        name = payload.get("name") or req.POST.get("name")
        category_id = payload.get("categoryId") or payload.get("category") or req.POST.get("category") or req.POST.get("categoryId")
        if not name or not category_id:
            return JsonResponse({"error": "name and categoryId are required"}, status=400)

        # Ensure the category belongs to this user
        cat = Category.objects.filter(user=req.user, id=category_id).first()
        if not cat:
            return JsonResponse({"error": "category not found or not allowed"}, status=404)

        # create subcategory (SubCategory model does not have a user field)
        sub_obj, created = SubCategory.objects.get_or_create(name=name, category=cat)

        # return the created subcategory and the updated list for this user's categories
        get_subcategories = [model_to_dict(c) for c in SubCategory.objects.filter(category__user=req.user)]
        return JsonResponse({"subcategory": model_to_dict(sub_obj), "subcategories": get_subcategories}, status=201 if created else 200)
    else:
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
        "month": model_to_dict(getMonth),
        "budgets": getBudgetDict(req, getMonth),
        "actuals": getActualDict(req, getMonth),
        "categories": categories, 
        "subcategories": subcategories
    })

@login_required
def getActualDict(req, month):
    purchases = Purchase.objects.filter(user=req.user, date__year=month.year, date__month=month.month)
    actual_dict = {}
    for p in purchases:
        for item in purchaseItem.objects.filter(purchase=p):
            # subcategory actuals
            key = f"{item.subcategory.id}"
            actual_dict[key] = actual_dict.get(key, 0) + float(item.amount)

            # category actuals
            key_cat = f"{item.category.id}"
            actual_dict[key_cat] = actual_dict.get(key_cat, 0) + float(item.amount)

            # total month actual
            actual_dict["actual_total"] = actual_dict.get("actual_total", 0) + float(item.amount)
    
    return actual_dict

@login_required
def getBudgetDict(req, month):
    budgets = Budget.objects.filter(user=req.user, month=month)
    budget_dict = {}
    for b in budgets:
        # subcategory budgets
        key = f"{b.subcategory.id}"
        budget_dict[key] = float(b.budget)

        # category budgets
        key_cat = f"{b.category.id}"
        budget_dict[key_cat] = budget_dict.get(key_cat, 0) + float(b.budget)

        # total month budget and expected budget
        budget_dict["total_budget"] = float(month.total_budget)
        budget_dict["expected_total"] = budget_dict.get("expected_total", 0) + float(b.budget)
    
    return budget_dict

def createBase(user, year, month):
    getMonth, _ = Month.objects.get_or_create(user=user, year=year, month=month, total_budget=0)
    base, _ = Purchase.objects.get_or_create(
        user=user,
        description="Base Entry-Do Not Delete",
        date=datetime.date(year, month, 1),
        total=0,
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
def today(req):
    today = datetime.date.today()
    return JsonResponse({"today": today.isoformat()})

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
            notes = entry.get("notes")

            if amount is None or cat_id is None or not date_str:
                raise ValueError("Missing required fields")

            date_obj = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()

            # ensure month exists and base is created
            getMonth = Month.objects.filter(user=req.user, year=date_obj.year, month=date_obj.month).first()
            if not getMonth:
                getMonth, _ = createBase(req.user, date_obj.year, date_obj.month)

            # Create the purchase (model uses `total` and `user`)
            purchase = Purchase.objects.create(
                user=req.user,
                description=notes or "User Entry",
                total=amount,
                date=date_obj
            )

            # Attach as purchaseItem(s) linking purchase -> category/subcategory with amount
            cat_obj = Category.objects.filter(user=req.user, id=cat_id).first()
            if not cat_obj:
                raise ValueError(f"Category id {cat_id} not found for user")

            sub_obj = None
            if sub_id:
                sub_obj = SubCategory.objects.filter(id=sub_id, category=cat_obj).first()
                if not sub_obj:
                    raise ValueError(f"Subcategory id {sub_id} not found for category {cat_id}")

            # create purchaseItem record
            purchaseItem.objects.create(
                user=req.user,
                purchase=purchase,
                category=cat_obj,
                subcategory=sub_obj,
                amount=amount
            )

            created.append(model_to_dict(purchase))
        except Exception as e:
            import traceback as _tb
            tb = _tb.format_exc()
            errors.append({"index": i, "error": str(e), "trace": tb})

    status = 200 if not errors else 207
    return JsonResponse({"created": created, "errors": errors}, status=status)

@login_required
def change(req):
    if req.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    body = json.loads(req.body)
    obj_type = body.get("type")
    obj_id = body.get("id")
    content = body.get("content")

    if body.get("month"):
        obj = Month.objects.filter(id=obj_id, user=req.user).first()
        obj.total_budget = content
        obj.save()
        return JsonResponse({"success": True, "id": obj_id, "type": obj_type, "new_number": content})
    elif obj_type == "cat":
        obj = Category.objects.filter(id=obj_id, user=req.user).first()
    elif obj_type == "sub":
        obj = SubCategory.objects.filter(id=obj_id, category__user=req.user).first()
    elif obj_type == "number":
        obj = Budget.objects.filter(subcategory__id=obj_id, user=req.user).first()
    else:
        return JsonResponse({"error": "Invalid type"}, status=400)

    if not obj:
        return JsonResponse({"error": "Object not found"}, status=404)

    if body.get("type") == "number":
        obj.budget = content
        obj.save()
        return JsonResponse({"success": True, "id": obj_id, "type": obj_type, "new_number": content})
    else:
        obj.name = content
        obj.save()
        return JsonResponse({"success": True, "id": obj_id, "type": obj_type, "new_name": content})