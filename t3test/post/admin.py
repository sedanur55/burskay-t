from django.contrib import admin
from .models import Record, School

# Register your models here.


class RecordAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'school', 'created_at']
    list_display_links = ['full_name']
    list_filter = ['created_at']
    search_fields = ['full_name']

    class Meta:
        model = Record


admin.site.register(Record, RecordAdmin)
admin.site.register(School)
