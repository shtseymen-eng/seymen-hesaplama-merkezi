# SEYMEN Hesaplama Merkezi

Windows masaüstü ve web üzerinden çalışacak; litre-tonaj, tonaj-litre ve fire hesaplamalarını tek uygulamada birleştirecek proje.

> **Ş. Melih KARABAY için özenle hazırlanmıştır.**

## Menü

1. Litre - Tonaj
2. Tonaj - Litre
3. Fire Hesaplama
4. Ürünler
5. Geçmiş Hesaplamalar

## Temel Kurallar

- Kaynak Excel tablolarındaki içerik ve hesaplama formülleri korunacaktır.
- Formüller arka planda otomatik çalışacak; kullanıcı yalnızca giriş değerlerini değiştirecektir.
- Masaüstü uygulaması ürün ve geçmiş verilerinin ana yönetim merkezidir.
- Masaüstünde yapılan değişiklikler web sistemine tek yönlü aktarılacaktır.
- Web hesaplama ve ürün ekranları herkese açık, geçmiş ekranı parola korumalı ve salt okunur olacaktır.
- Windows kurulum paketi herkese açık yayınlanmayacak, yalnızca yetkili kişilerle paylaşılacaktır.
- Her ekranda sarı bant üzerinde mavi **SEYMEN** etiketi bulunacaktır.

## Durum

Tasarım, mimari, yetkilendirme ve görsel yaklaşım onaylanmıştır. Ayrıntılı şartname:

- [`docs/superpowers/specs/2026-08-28-desktop-web-calculation-app-design.md`](docs/superpowers/specs/2026-08-28-desktop-web-calculation-app-design.md)

Uygulama kodu, testler ve Windows kurulum paketi sonraki geliştirme aşamalarında bu depoya eklenecektir.
