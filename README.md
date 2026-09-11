# SEYMEN Fire/Tonaj Hesaplama Sistemi

Web uygulaması; litre-tonaj, tonaj-litre ve EK-11 fire hesaplarını tek adreste sunar. Hesaplama ekranları tüm ziyaretçilere açıktır.

## Yetkili işlemleri

- Yetkili girişinden sonra ürün satırına çift tıklanarak ürün adı ve yoğunluğu düzenlenebilir.
- EK-11 panelinde yeni kayıt oluşturulabilir, mevcut kayıt güncellenebilir veya silinebilir.
- Başarılı değişiklikler ortak veri hizmetine kaydedilir ve tüm kullanıcılara yayınlanır.
- Her ekleme, güncelleme ve silme işlemi; sunucu tarih-saati, önceki değer ve yeni değerle birlikte yetkili geçmişinde tutulur.
- Fire hesapları, yayınlanan güncel EK-11 A/B oranlarını kullanır.

## Veri mimarisi

GitHub Pages arayüzü ortak HTTPS veri hizmetinden yayınlanmış ürün ve EK-11 kayıtlarını alır. Hizmete geçici olarak ulaşılamazsa son başarılı veri kopyası, o da yoksa gömülü başlangıç verisi kullanılır.

## Güvenlik

Yetkili şifresi tarayıcı kodunda tutulmaz. Doğrulama veri hizmetinde yapılır; başarılı girişten sonra süreli ve imzalı bir oturum belirteci kullanılır. Yazma istekleri yetki, alan ve sürüm denetiminden geçer.

## Geliştirme

- `npm test`: hesaplama, veri hizmeti, yetkilendirme ve arayüz testlerini çalıştırır.
- `npm run build`: veri hizmetinin yayın paketini `dist/` klasörüne hazırlar.
