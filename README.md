# SEYMEN Hesaplama Merkezi - Web V1

Bu sürüm ilk görsel/işlev kontrolü içindir.

## Açılış
`index.html` dosyasını Chrome/Safari/Edge ile açın. Kurulum gerekmez.

## Menüler
- Litre - Tonaj
- Tonaj - Litre
- Fire Hesaplama
- Ürünler
- Geçmiş Hesaplamalar

## Hesaplama kaynakları
- `Litre ve Tonaj Hesaplama .xlsx`: ürün yoğunlukları ve litre/tonaj formülleri.
- `ek11_fire_hesap_tablosuu.xlsx`: ilk 90 gün ve 90 gün sonrası bileşik fire formülü.

## Fire kuralı
90 gün sonrası ek fire:
`90 gün sonu kalan miktar × [1 - (1 - günlük B oranı) ^ aşan gün]`

Bu nedenle her gün fire, azalan kalan bakiye üzerinden devam eder.

## Masaüstü bağlantısı
Bu V1'de gerçek sunucu bağlantısı henüz yoktur. Ön yüz, `seymen_desktop_sources`
kaynağını okuyacak şekilde hazırlanmıştır. Backend aşamasında masaüstü uygulaması bu
kaynak durumunu sunucu üzerinden besleyecektir.

Birden fazla masaüstü kaynak algılanırsa web üst bölümünde:
`Hesaplama verilerinde hata olabilir. 2 kullanıcı verisi çekilmektedir.`
uyarısı görünür.

Kalıcı ürün verisinin merkezi masaüstü uygulaması olacaktır.

## Yetkili Modu
- Ürünler sayfasında `Yetkili Modu Aç` düğmesi vardır.
- Doğru şifre girildiğinde ürün ekleme, düzenleme ve silme kontrolleri açılır.
- Yetki ve geçici ürün değişiklikleri yalnızca açık sekmede tutulur (`sessionStorage`).
- Sayfa yenilenirse aynı sekmede korunur.
- Sekme kapanınca veya `Oturumu Kapat` seçilince yetki ve geçici değişiklikler silinir.
- Bu V1 statik prototiptir; üretim sürümünde parola doğrulaması sunucu tarafına taşınacaktır.

## Fire V4
- Ürünün ilk giriş tarihi ve fire hesaplama tarihi kullanıcı tarafından seçilir.
- Toplam kalış süresi iki tarih arasından otomatik hesaplanır.
- İlk 90 gün ve 90 gün sonrası süre ayrı gösterilir.
- A ve B oranları kullanıcıya yüzde biçiminde gösterilir:
  - `%0,40` -> hesaplamada `0,004`
  - `%0,002` -> hesaplamada `0,00002`
- Sonuç ekranında tarihler, süreler ve kullanılan oranlar birlikte görüntülenir.

## V5
- Dolum oranı alanları yüzde olarak girilir: 95 = %95.
- Tank Hacmi, Araç Kapasitesi (L) olarak adlandırıldı.
- ADR Max yerine Alınmak İstenen Tonaj ve araç kapasitesi mantığı kullanılır.
- Yeni 4. menü: % - 90+ Üzeri Günlük Hesaplama.
- Ürün bazlı 90+ günlük fire oranı Yetkili Modu'nda değiştirilebilir.
- Referans gün kalan tonajı ile hesap yeniden başlatılabilir.
- Araç çıkışı / kalan toplam tonaj hareketleri günlük rapora eklenebilir.
- Excel uyumlu .xls günlük rapor indirilebilir.
