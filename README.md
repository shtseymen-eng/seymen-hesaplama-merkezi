# SEYMEN Hesaplama Merkezi V6

V6, V5 hesaplama modüllerini korur ve EK 11 korelasyon verisini ürün bazlı fire hesaplarına bağlar.

## V6 yenilikleri
- Fire Hesaplama ekranında ürün seçimi sonrası A/B fire oranları EK 11 verisinden otomatik gelir.
- İlk giriş tarihi ve hesaplama tarihi üzerinden toplam gün otomatik hesaplanır.
- 90+ Günlük Fire ekranı ürünün B oranını otomatik kullanır; ara hareketler ve Excel uyumlu günlük rapor korunur.
- Sağ üstte küçük kutuya giren ok simgesi Veri Girişi kapısıdır.
- Yetkili giriş sonrası EK 11 Excel düzenine yakın tablo açılır; yeni kayıt, güncelleme ve silme yapılabilir.
- Yetkili oturumundaki korelasyon değişiklikleri Fire ve 90+ Fire ekranlarına anlık yansır.
- Ana Litre/Tonaj ve Tonaj/Litre hesapları V5 mantığıyla korunur.

## Dosyalar
GitHub Pages köküne şu dosyaları yükleyin:
- `index.html`
- `styles.css`
- `logic.js`
- `app.js`
- `README.md`

## Veri mimarisi
Statik web V6 bir prototiptir. EK 11 başlangıç verisi pakete gömülüdür. Yetkili web değişiklikleri oturum boyunca saklanır. Kalıcı ana veri merkezi masaüstü uygulaması olarak tasarlanmıştır.

Yeni Excel dosyasının kalıcı içe aktarımı, masaüstü veri katmanı/backend bağlantısında işlenecektir. V6 web ekranındaki Excel Yükle kontrolü bu akış için hazırlanmış arayüzdür.

## Güvenlik
Statik prototip şifrenin kendisini kaynakta tutmaz, yalnız SHA-256 özetini karşılaştırır. Üretimde yetki doğrulamasının masaüstü/sunucu tarafında yapılması gerekir.
