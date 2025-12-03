from django.urls import path
from . import views

urlpatterns = [
    path('', view=views.index, name="index"),
    path("tableInfo/<int:year>/<int:month>/", view=views.tableInfo, name="tableInfo"),
    path("categories/", view=views.categories, name="categories"),
    path("subCategories/", view=views.subCategories, name="subCategories"),
    path("purchases/", view=views.purchases, name="purchases")
]