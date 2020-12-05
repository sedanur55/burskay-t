from django.db import models

# Create your models here.


class Record(models.Model):
    GENDER_CHOICES = (
        (0, 'Erkek'),
        (1, 'Kız'),
    )
    full_name = models.CharField(max_length=255, verbose_name='Ad Soyad')
    birth_date = models.DateField(verbose_name='Doğum Tarihi')
    tc_number = models.BigIntegerField(verbose_name='Tc. No')
    gender = models.IntegerField(choices=GENDER_CHOICES, default=0, verbose_name='Cinsiyet')
    school = models.ForeignKey('School', on_delete=models.CASCADE, verbose_name='Okul')
    approval = models.BooleanField(default=True, verbose_name='Sözleşmeyi Onaylıyorum')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Oluşturulma Tarihi')

    def __str__(self):
        return self.full_name


class School(models.Model):
    TYPE_CHOICE = (
        (0, 'İlkokul'),
        (1, 'İlkögretim'),
        (2, 'Lise'),
        (3, 'Meslek Okulu'),
        (4, 'Lisans'),
        (5, 'Yüksek Lisans'),
    )
    name = models.CharField(max_length=255, verbose_name='Okul Adı')
    type = models.IntegerField(choices=TYPE_CHOICE, default=0, verbose_name='Eğitim Seviyesi')

    def __str__(self):
        return self.name

