# SEYMEN Ortak Web Verisi Tasarımı

## Amaç

SEYMEN Hesaplama Merkezi yalnız web üzerinden kullanılmaya devam eder. Her ziyaretçi mevcut hesaplama ekranlarını kullanabilir. Ortak yetkili şifresiyle giriş yapan iki yetkili, ürün yoğunluklarını ve EK-11 korelasyon verilerini düzenleyebilir. Kaydedilen değişiklikler kalıcı olur ve tüm ziyaretçiler tarafından kullanılır.

Mevcut yayın adresi değişmez. Kalıcı veri ve yetki doğrulaması, web sayfasının arkasında çalışan ayrı bir HTTPS veri hizmeti tarafından sağlanır.

## Kullanıcı Akışları

### Ziyaretçi

1. Sayfa açıldığında yayımlanmış son ürün ve EK-11 verileri alınır.
2. Litre-tonaj ve fire hesaplamaları bu ortak verilerle çalışır.
3. Ziyaretçi ürün veya EK-11 değerlerini değiştiremez.

### Yetkili girişi

1. Yetkili mevcut ortak şifreyi girer.
2. Şifre tarayıcıda doğrulanmaz; HTTPS üzerinden veri hizmetinde kontrol edilir.
3. Başarılı girişten sonra süreli bir yetkili oturumu açılır.
4. Çıkış yapıldığında veya oturum süresi dolduğunda düzenleme yetkisi kapanır.

Ortak şifre iki kişi tarafından kullanılacağı için sistem hangi kişinin işlem yaptığını ayırt etmez. Değişiklik geçmişindeki işlem sahibi `Yetkili` olarak gösterilir.

### Ürün yoğunluğu düzenleme

1. Yetkili, Ürünler sekmesinde bir ürün satırına çift tıklar.
2. Ürün adı ve yoğunluk alanlarını içeren sade düzenleme bölümü açılır.
3. `Kaydet` işlemi seçilen ürün kaydını ortak veride günceller.
4. Başarılı kayıt sonrasında hesaplama seçimleri ve ürün tablosu yeni değeri kullanır.
5. Ürün fire oranı bu ekrandan değiştirilmez; A/B fire oranlarının tek yönetim yeri EK-11 ekranıdır.

Ürün ekleme ve silme işlemleri mevcut yetkili denetimleriyle korunur. Silme işlemi açık onay ister. Ekleme, güncelleme ve silme işlemlerinin tamamı ortak veriye yazılır.

### EK-11 düzenleme

1. Yetkili mevcut EK-11 panelinden kayıt seçer veya yeni kayıt açar.
2. `Güncelle`, `Yeni` ve `Sil` işlemleri ortak veriye yazılır.
3. Başarılı işlemden sonra Fire ve 90+ Günlük Fire ekranları yeni A/B oranlarını kullanır.
4. Başarısız işlem yerel ekranda yayımlanmış gibi gösterilmez.

## Değişiklik Geçmişi

Her başarılı ürün veya EK-11 ekleme, güncelleme ve silme işlemiyle aynı anda bir denetim kaydı oluşturulur. Kayıt, veri değişikliğiyle aynı veritabanı işlemi içinde yazılır; ana değişiklik kaydedilip geçmiş kaydının eksik kalmasına izin verilmez.

Her geçmiş kaydı şunları içerir:

- Sunucunun ürettiği tarih ve saat; veritabanında UTC, ekranda Europe/Istanbul biçimi
- Kayıt türü: `Ürün` veya `EK-11`
- İşlem türü: `Ekleme`, `Güncelleme` veya `Silme`
- Ürün/kayıt adı
- Önceki değerler
- Yeni değerler
- İşlem sahibi: `Yetkili`

Mevcut Geçmiş Hesaplamalar sekmesi iki bölüme ayrılır:

- `Hesaplama Geçmişi`: Mevcut davranış korunur ve yalnız kullanılan tarayıcıdaki hesaplamaları gösterir.
- `Veri Değişiklikleri`: Yalnız yetkili oturumunda görünür ve ortak sunucu geçmişini gösterir.

Değişiklik geçmişi web arayüzünden silinemez veya düzenlenemez. Ürün adı değişirse geçmiş kaydında hem eski hem yeni ad görünür. Eklemede önceki değer, silmede yeni değer boş gösterilir.

## Veri Yapısı ve Hizmet

Arka plan veri hizmeti küçük bir HTTP API ve ilişkisel veritabanından oluşur. Veri kümeleri:

- `products`: ürün kimliği, ürün adı, yoğunluk, güncelleme zamanı
- `correlations`: EK-11 kimliği, ürün adı, GTİP, korelasyon yılı/GTİP, A ve B oranları, güncelleme zamanı
- `audit_log`: değişiklik türü, kayıt kimliği/adı, önceki değerler, yeni değerler, sunucu zamanı

Mevcut gömülü 62 ürün ve EK-11 kayıtları ilk kurulumda veritabanına aktarılır. Ürünler kalıcı kimlikle tutulur; ürün adı değişikliği başka bir ürünü yanlışlıkla güncellemez.

Genel veri okuma uçları herkese açıktır. Ekleme, güncelleme, silme ve geçmişi okuma uçları geçerli yetkili oturumu gerektirir. Sadece mevcut GitHub Pages adresinden gelen tarayıcı isteklerine izin verilir.

## Güvenlik

- Ortak şifre sayfanın kaynak dosyasında veya tarayıcı kodunda tutulmaz.
- Şifre, veri hizmetinde gizli değer olarak saklanır ve güvenli özet karşılaştırmasıyla doğrulanır.
- Yetkili oturum belirteci kısa ömürlü ve imzalıdır.
- Yazma istekleri sunucuda alan, sayı aralığı ve yetki kontrolünden geçer.
- Yoğunluk sıfırdan büyük sonlu bir sayı olmalıdır; A/B oranları boş olabilir veya sıfırdan büyük/eşit sonlu sayı olmalıdır.
- Sunucu zamanı kullanılarak istemci saatinin yanlış geçmiş oluşturması engellenir.

## Dayanıklılık ve Hata Durumları

- Sayfa son başarıyla aldığı ortak veriyi tarayıcıda önbelleğe alır.
- Veri hizmetine geçici olarak ulaşılamazsa ziyaretçi son alınan veriyle hesaplama yapabilir; bunun eski olabileceği açıkça belirtilir.
- Hiç önbellek yoksa gömülü başlangıç verisi kullanılır ve bağlantı uyarısı gösterilir.
- Yetkili kaydı başarısız olursa ekrandaki yayımlanmış veri değiştirilmez ve kullanıcı yeniden deneyebilir.
- Aynı kaydı iki yetkili eş zamanlı değiştirirse daha eski ekranın yeni kaydı sessizce ezmesine izin verilmez; kullanıcı güncel veriyi yükleyip tekrar düzenler.

## Kullanıcı Arayüzü

Mevcut görünüm ve hesaplama alanları korunur. Yeni arayüz yalnız gerekli kontrolleri ekler:

- Ürün satırında yetkiliye özel çift tıklama davranışı
- Sade ürün düzenleme alanı ve `Kaydet` düğmesi
- Kayıt sırasında `Kaydediliyor`, başarıda `Yayınlandı`, hatada açık hata durumu
- Geçmiş sayfasında yetkiliye özel `Veri Değişiklikleri` tablosu

Masaüstü kaynağı, geçici oturum ve yalnız bu sekmede geçerli olduğuna dair eski metinler kaldırılır. Genel ziyaretçi ekranına yönetim ayrıntısı eklenmez.

## Test ve Kabul Ölçütleri

- Yetkisiz kullanıcı yazma uçlarına erişemez.
- Hatalı şifre yetkili oturumu oluşturmaz; doğru şifre oluşturur.
- Ürüne çift tıklama yalnız yetkili oturumunda düzenleyiciyi açar.
- Ürün yoğunluğu kaydedildiğinde yeni sayfa oturumu aynı değeri görür ve hesaplamalarda kullanır.
- EK-11 güncellemesi yeni sayfa oturumunda görünür ve fire hesaplarına yansır.
- Her ekleme, güncelleme ve silme tam bir önceki/yeni değer geçmişi oluşturur.
- Başarısız kayıt geçmiş oluşturmaz ve eski yayımlanmış değeri korur.
- Eş zamanlı eski düzenleme uyarıyla durdurulur.
- Veri hizmeti kapalıyken hesaplama yedek veriyle açılır ve uyarı gösterir.
- Mevcut hesaplama formülleri ve sonuçları değişmez.
- Masaüstü/Web seçimleri veya masaüstü indirme bağlantısı geri gelmez.

## Kapsam Dışı

- Yetkililer için ayrı kullanıcı adları veya ayrı şifreler
- Değişiklik kaydında hangi yetkili kişinin işlem yaptığını gösterme
- Sıcaklığa bağlı otomatik yoğunluk düzeltmesi
- Mevcut hesaplama geçmişini cihazlar arasında ortaklaştırma
- Genel ziyaretçilere ürün veya EK-11 düzenleme izni verme
