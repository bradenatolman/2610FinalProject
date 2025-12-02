from django.urls import path
from . import views

urlpatterns = [
    path('', view=views.index, name="index"),
    path("tableInfo/<int:year>/<int:month>/", view=views.tableInfo, name="tableInfo")
]