import datetime

from django.http import JsonResponse
from django.shortcuts import render, HttpResponse, get_object_or_404

# Create your views here.
from post.models import Record, School

from .forms import RecordForm


def record_list(request):
    try:
        items = Record.objects.all()
        no_item = items.count()

        return render(request, 'record_list.html', {
            'items': items,
            'no_item': no_item == 0,
        })

    except Exception as ex:
        print(ex)


def record_form(request, id:int = None):
    try:
        item = get_object_or_404(Record, id=id) if id else Record()
        if request.method == 'POST':
            try:
                result = {
                    'success': False,
                    'message': 'İşlem Yok!'
                }
                form = RecordForm(request.POST or None, instance=item)
                if form.is_valid():
                    m = form.save(commit=False)
                    if Record.objects.filter(tc_number=request.POST['tc_number']).first() and not id:
                        result['message'] = 'Zaten Kaydınız Bulunmaktadır.'
                    else:
                        m.save()
                        result['success'] = True
                        result['message'] = 'Erkek Başvurusu alınmıştır.' if m.gender == 0 else 'Kız Başvurusu alınmıştır.'
                else:
                    result['message'] = 'Eksik Alanları Doldurunuz.'
                return JsonResponse(result)
            except Exception as ex:
                print(ex)

        return render(request, 'record_form.html', {
            'form': item,
            'schools': School.objects.all(),
            'gender': Record.GENDER_CHOICES,
        })
    except Exception as ex:
        print(ex)


def record_delete(request, id):
    try:
        result = {
                'success': False,
                'message': 'İşlem Yok!'
            }
        item = Record.objects.get(pk=id)

        if item:
            item.delete()
            result['success'] = True
            result['message'] = 'Burs Kaydı Silindi'

        return JsonResponse(result)

    except Exception as ex:
        print(ex)
