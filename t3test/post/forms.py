from django import forms
from .models import Record

class RecordForm(forms.ModelForm):
    class Meta:
        model = Record
        fields = ['full_name', 'birth_date', 'tc_number', 'gender', 'school', 'approval']
