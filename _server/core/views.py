from django.shortcuts import render
from django.conf  import settings
import json
import os
import datetime
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.forms.models import model_to_dict
from django.db import transaction
from decimal import Decimal
from .models import Category, SubCategory, PurchaseItem, Month, Budget, Purchase

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
        for item in PurchaseItem.objects.filter(purchase=p):
            key = f"{item.subcategory.name}"
            actual_dict[key] = actual_dict.get(key, 0) + float(item.amount)

            # category actuals
            key_cat = f"{item.category.name}"
            actual_dict[key_cat] = actual_dict.get(key_cat, 0) + float(item.amount)

            if item.category.name == "Income":
                # total month income
                actual_dict["income_actual"] = actual_dict.get("income_actual", 0) + float(item.amount)
            else:
                # total month actual
                actual_dict["actual_total"] = actual_dict.get("actual_total", 0) + float(item.amount)
    
    return actual_dict

@login_required
def getBudgetDict(req, month):
    budgets = Budget.objects.filter(user=req.user, month=month)
    budget_dict = {}
    # Set total_budget once, outside the loop
    budget_dict["total_budget"] = float(month.total_budget)
    for b in budgets:
        key = f"{b.subcategory.name}"
        budget_dict[key] = float(b.budget)

        # category budgets
        key_cat = f"{b.category.name}"
        budget_dict[key_cat] = budget_dict.get(key_cat, 0) + float(b.budget)
       

        if b.category.name == "Income":
            budget_dict["income_expected"] = budget_dict.get("income_expected", 0) + float(b.budget)
        else:
            # total month expected budget
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
    if not Category.objects.filter(user=user).first():
        # Predefined categories and subcategories
        subcategories = {
            "Income": ["Salary"],
            "Housing": ["Rent"],
            "Transportation": ["Gas", "Insurance"],
            "Food": ["Groceries", "Dining Out", "Snacks"],
            "Utilities": ["Electricity", "Water", "Internet", "Phone", "Gas"],
            "Savings": ["Emergency Fund", "Retirement", "Investments"],
            "Entertainment": ["Movies", "Concerts", "Hobbies"],
            "Miscellaneous": ["Gifts", "Donations", "Subscriptions"],
            'Uncategorized': []

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
                PurchaseItem.objects.get_or_create(
                    user=user,
                    purchase=base,
                    category=cat_obj,
                    subcategory=subcat_obj,
                    amount=0
                )
    else:
        for sub in subcategories:
            # Ensure Budget exists for each subcategory with 0 amount
            Budget.objects.get_or_create(
                user=user,
                month=getMonth,
                category=sub.category,
                subcategory=sub,
                budget=0
            )
            # Ensure PurchaseItem exists for each subcategory under base purchase
            PurchaseItem.objects.get_or_create(
                user=user,
                purchase=base,
                category=sub.category,
                subcategory=sub,
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
def yearInfo(req, year):
    if req.method == "POST":
        return None

    #GET
    getMonthObjs = Month.objects.filter(user=req.user, year=year).order_by('month')
    monthData = []
    for monthObj in getMonthObjs:
        monthName = datetime.date(2000, monthObj.month, 1).strftime("%B")
        budget_dict = getBudgetDict(req, monthObj)
        actual_dict = getActualDict(req, monthObj)
        monthData.append({
            "month": model_to_dict(monthObj),
            "monthName": monthName,
            "planned": budget_dict.get("total_budget", 0),
            "expected": budget_dict.get("expected_total", 0),
            "actual": actual_dict.get("actual_total", 0),
        })

    return JsonResponse({
        "year": year,
        "months": monthData,
        "missing_months": [datetime.date(2000, m, 1).strftime("%B") for m in range(1,13) if m not in [mo.month for mo in getMonthObjs]],
        "planned_total": sum([md["planned"] for md in monthData]),
        "expected_total": sum([md["expected"] for md in monthData]),
        "actual_total": sum([md["actual"] for md in monthData])
    })

@login_required
def purchases(req):
    # Accept batch purchase entries: creates Purchase objects and associates categories/subcategories
    if req.method == "GET":
        purchases = Purchase.objects.filter(user=req.user)
        purchase_list = [model_to_dict(p) for p in purchases]
        return JsonResponse({"purchases": purchase_list})

    payload = json.loads(req.body.decode("utf-8") or "{}")
    entries = payload.get("entries") or []
    if not isinstance(entries, list) or len(entries) == 0:
        return JsonResponse({"error": "entries must not be empty"}, status=400)

    # Optional top-level purchase fields: date, notes/description
    top_date = payload.get("date")
    top_notes = payload.get("notes") or payload.get("description")

    # Validate entries first
    validated = []
    errors = []
    for i, entry in enumerate(entries):
        try:
            cat_id = entry.get("categoryId")
            sub_id = entry.get("subcategoryId")
            amount = entry.get("amount")
            date_str = entry.get("date") or top_date
            notes = entry.get("notes") or top_notes

            if amount is None or cat_id is None or not date_str:
                raise ValueError("Each entry requires categoryId, amount, and date (or provide top-level date)")

            # parse date
            date_obj = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()

            # check category belongs to user
            cat_obj = Category.objects.filter(user=req.user, id=cat_id).first()
            if not cat_obj:
                raise ValueError(f"Category id {cat_id} not found for user")

            sub_obj = None
            if sub_id:
                sub_obj = SubCategory.objects.filter(id=sub_id, category=cat_obj).first()
                if not sub_obj:
                    raise ValueError(f"Subcategory id {sub_id} not found for category {cat_id}")
            else: # Allow null subcategory
                sub_obj = SubCategory.objects.get_or_create(name="Uncategorized", category=cat_obj)[0]


            validated.append({
                "category": cat_obj,
                "subcategory": sub_obj,
                "amount": float(amount),
                "date": date_obj,
                "notes": notes,
            })
        except Exception as e:
            import traceback as _tb
            tb = _tb.format_exc()
            errors.append({"index": i, "error": str(e), "trace": tb})

    if errors:
        return JsonResponse({"errors": errors}, status=400)

    # Ensure all entries share the same date (single purchase). If not, return error.
    first_date = validated[0]["date"]
    for v in validated:
        if v["date"] != first_date:
            return JsonResponse({"error": "All entries must share the same date for a single purchase. Group entries by date."}, status=400)

    # Ensure month exists and base is created for the purchase date
    getMonth = Month.objects.filter(user=req.user, year=first_date.year, month=first_date.month).first()
    if not getMonth:
        getMonth, _ = createBase(req.user, first_date.year, first_date.month)

    # Create one Purchase for this batch
    total_amount = sum([v["amount"] for v in validated])
    purchase = Purchase.objects.create(
        user=req.user,
        description=validated[0].get("notes") or "User Entry",
        total=total_amount,
        date=first_date
    )

    # Create PurchaseItem records
    created_items = []
    for v in validated:
        it = PurchaseItem.objects.create(
            user=req.user,
            purchase=purchase,
            category=v["category"],
            subcategory=v["subcategory"],
            amount=v["amount"]
        )
        created_items.append({
            "id": it.id,
            "purchaseId": purchase.id,
            "categoryId": it.category.id if it.category else None,
            "categoryName": it.category.name if it.category else None,
            "subcategoryId": it.subcategory.id if it.subcategory else None,
            "subcategoryName": it.subcategory.name if it.subcategory else None,
            "amount": float(it.amount)
        })

    # Build JSON-serializable purchase dict
    purchase_dict = {
        "id": purchase.id,
        "description": purchase.description,
        "total": float(purchase.total) if getattr(purchase, "total", None) is not None else None,
        "date": purchase.date.isoformat() if getattr(purchase, "date", None) is not None else None,
        "created_at": purchase.created_at.isoformat() if getattr(purchase, "created_at", None) is not None else None,
        }

    return JsonResponse({"created": purchase_dict, "items": created_items}, status=201)

@login_required
def purchase_items(req):
    items = PurchaseItem.objects.filter(user=req.user)
    item_list = [model_to_dict(i) for i in items]
    return JsonResponse({"purchaseItems": item_list})


@login_required
def purchase_detail(req, purchase_id):
    # Support DELETE to remove a purchase (and its items via cascade)
    if req.method == "DELETE":
        p = Purchase.objects.filter(id=purchase_id, user=req.user).first()
        if not p:
            return JsonResponse({"error": "Purchase not found"}, status=404)
        p.delete()
        return JsonResponse({"success": True, "id": purchase_id})

    return JsonResponse({"error": "Method not allowed"}, status=405)


@login_required
def purchase_item_detail(req, item_id):
    # DELETE a single purchaseItem and update its parent Purchase total
    if req.method == "DELETE":
        it = PurchaseItem.objects.filter(id=item_id, user=req.user).first()
        if not it:
            return JsonResponse({"error": "Item not found"}, status=404)
        with transaction.atomic():
            parent = Purchase.objects.filter(id=it.purchase.id, user=req.user).first()
            amount = float(it.amount) if getattr(it, "amount", None) is not None else 0
            it.delete()
            if parent:
                parent.total = parent.total - Decimal(amount)
                parent.save()
        return JsonResponse({"success": True, "id": item_id})

    return JsonResponse({"error": "Method not allowed"}, status=405)

@login_required
def change(req):
    if req.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    body = json.loads(req.body)
    obj_type = body.get("type")
    obj_id = body.get("id")
    content = body.get("content")
    month = body.get("month")

    if body.get("ismonth"):
        obj = Month.objects.filter(id=obj_id, user=req.user).first()
        obj.total_budget = content
        obj.save()
        return JsonResponse({"success": True, "id": obj_id, "type": obj_type, "new_number": content})
    elif obj_type == "cat":
        obj = Category.objects.filter(id=obj_id, user=req.user).first()
    elif obj_type == "sub":
        obj = SubCategory.objects.filter(id=obj_id, category__user=req.user).first()
    elif obj_type == "number":
        month = Month.objects.filter(user=req.user, id=month.get("id")).first()
        sub = SubCategory.objects.filter(id=obj_id).first()
        cat = sub.category if sub else None
        obj = Budget.objects.get_or_create(month=month, category= cat, subcategory=sub, user=req.user)[0]

    elif obj_type == "color":
        obj = Category.objects.filter(id=obj_id, user=req.user).first()
        obj.color = content
        obj.save()
        return JsonResponse({"success": True, "id": obj_id, "type": obj_type, "new_color": content})
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

@login_required
def delete(req):
    if req.method == "POST":
        body = json.loads(req.body)
        obj_type = body.get("type")
        obj_id = body.get("id")

        if obj_type == "cat":
            obj = Category.objects.filter(id=obj_id, user=req.user).first()
        elif obj_type == "sub":
            obj = SubCategory.objects.filter(id=obj_id, category__user=req.user).first()
        else:
            return JsonResponse({"error": "Invalid type"}, status=400)

        if not obj:
            return JsonResponse({"error": "Object not found"}, status=404)

        obj.delete()
        return JsonResponse({"success": True, "id": obj_id, "type": obj_type})