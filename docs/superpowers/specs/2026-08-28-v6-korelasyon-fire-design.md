# SEYMEN V6 Korelasyon ve Fire Tasarımı

V5 hesaplama mantıkları korunur. Fire ekranlarında ürün seçimi EK 11 korelasyon tablosundaki A/B oranlarını otomatik kullanır. Hesaplama tarihine göre ürün kaydı seçilir; geçerli oran bulunamazsa hesap durdurulur.

Yetkili Veri Girişi ana navigasyonda büyük bir sekme değildir. Sağ üstte küçük kutuya giren ok ikonu ile açılır, şifreli giriş sonrası Excel benzeri EK 11 tablosu gösterilir. Yetkili kullanıcı kayıt ekleyebilir, düzenleyebilir, güncelleyebilir ve silebilir. Değişiklikler oturum boyunca tüm fire ekranlarına yansır; kalıcı veri merkezi masaüstü uygulamasıdır.

Yeni yetkili şifresi kullanıcı tarafından MS.2026 olarak belirlenmiştir. Statik web prototipinde yalnız SHA-256 özeti tutulur; üretimde doğrulama sunucu/masaüstü katmanına taşınmalıdır.
