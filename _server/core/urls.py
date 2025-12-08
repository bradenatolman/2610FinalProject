from django.urls import path
from . import views

urlpatterns = [
    path('', view=views.index, name="index"),
    path("tableInfo/<int:year>/<int:month>/", view=views.tableInfo, name="tableInfo"),
    path("yearInfo/<int:year>/", view=views.yearInfo, name="yearInfo"),
    path("categories/", view=views.categories, name="categories"),
    path("subCategories/", view=views.subCategories, name="subCategories"),
    path("purchases/", view=views.purchases, name="purchases"),
    path("change/", view=views.change, name="change"),
    path("today/", view=views.today, name="today"),
    path("purchaseItems/", view=views.purchase_items, name="purchaseItems"),
    path("purchaseItems/<int:item_id>/", view=views.purchase_item_detail, name="purchase_item_detail"),
    path("purchases/<int:purchase_id>/", view=views.purchase_detail, name="purchase_detail"),
]