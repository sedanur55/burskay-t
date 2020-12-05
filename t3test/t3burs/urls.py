"""t3burs URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from post.views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', record_list, name='record_list'),
    path('record/form/', record_form, name='record_form'),
    path('record/form/<int:id>/', record_form, name='record_form_id'),
    path('record/delete/<int:id>/', record_delete, name='record_delete'),
]
