# Masaüstü ve Web Hesaplama Uygulaması Tasarımı

**Tarih:** 28 Ağustos 2026  
**Durum:** Kullanıcı tarafından onaylanan mimari, erişim modeli ve görsel yaklaşımın yazılı şartnamesi

## 1. Amaç

İki kaynak Excel dosyasındaki tablo içeriklerini, ürün listesini ve hesaplama formüllerini değiştirmeden kullanan bir Windows masaüstü uygulaması ve web uygulaması geliştirilecektir.

Masaüstü uygulaması ana yönetim uygulamasıdır. Ürün ve hesaplama geçmişi üzerinde kalıcı değişiklik yapabilir, internet olmadığında çalışmaya devam eder ve değişiklikleri internet geldiğinde web sistemine tek yönlü olarak aktarır. Web uygulaması mevcut ürünlerle hesaplama yapar ve masaüstünden gönderilen ana verileri görüntüler. Parola doğrulayan kullanıcı, yalnızca açık tarayıcı sekmesinde geçerli olacak biçimde ürün verileri üzerinde geçici ekleme, düzenleme ve silme yapabilir; bu değişiklikler aynı sekmedeki hesaplamalara anında yansır, sunucuya veya masaüstüne yazılmaz ve sekme kapanınca kaybolur. Excel formülleri hiçbir platformda düzenlenemez.

## 2. Kesin Menü Yapısı

Sol menüde seçenekler aşağıdaki sırayla ve metinlerle gösterilecektir:

1. **Litre - Tonaj**
2. **Tonaj - Litre**
3. **Fire Hesaplama**
4. **Ürünler**
5. **Geçmiş Hesaplamalar**

Masaüstü ve web aynı menü sırasını kullanır. Yetki farkları ekranların içinde uygulanır:

- Masaüstündeki **Ürünler** ekranında ekleme, düzenleme, kaydetme ve silme bulunur.
- Web’deki **Ürünler** ekranı başlangıçta salt okunurdur. Parola doğrulandığında aynı sekme için geçici ekleme, düzenleme ve silme düğmeleri gösterilir.
- Masaüstündeki **Geçmiş Hesaplamalar** ekranında ayrıntı görüntüleme ve silme bulunur.
- Web’deki **Geçmiş Hesaplamalar** ekranı parola doğrulandıktan sonra salt okunur açılır.

## 3. Görsel ve Etkileşim Tasarımı

Uygulama, kaynak Excel dosyalarının okunaklı tablo dilini koruyarak modern bir masaüstü/web arayüzüne uyarlanacaktır:

- Masaüstü ve web uygulamalarının her ekranında, içerik başlığının üzerinde tam genişlikte sarı bir marka bandı bulunur.
- Marka bandının birinci satırında koyu mavi, kalın ve büyük harflerle `SEYMEN` etiketi gösterilir.
- Etiketin hemen altında aynı koyu mavi rengin daha küçük ve zarif yazı biçimiyle **Ş. Melih KARABAY için özenle hazırlanmıştır.** notu yer alır.
- Marka bandı için erişilebilir kontrast sağlayan sarı `#F4C542` ve koyu mavi `#123A63` temel renkleri kullanılır.
- Marka bandı ve iki metin, beş menü ekranının tamamında görünür; masaüstü ve web sürümlerinde kaldırılmaz veya farklı metinle değiştirilmez.
- Sol tarafta sabit menü, sağ tarafta seçili ekran bulunur.
- Başlıklar Excel’deki koyu mavi görsel dili izler.
- Düzenlenebilir giriş alanları açık sarı renkle belirtilir.
- **Litre - Tonaj** ve **Tonaj - Litre** ekranlarındaki dolum oranı alanının başında `%` işareti gösterilir. Kullanıcı `0,95` yerine `95` yazar; arayüz bu değeri mevcut Excel hesabına göndermeden önce `95 ÷ 100 = 0,95` oranına dönüştürür.
- Otomatik hesaplanan sonuçlar açık yeşil renkle ve salt okunur olarak gösterilir.
- Durum ve önemli toplam satırları kaynak tablodaki vurgu renklerini korur.
- Kullanıcı bir giriş değerine tıkladığında yalnızca o değer düzenlenir; formül hiçbir ekranda düzenlenemez.
- Geçerli bir değer değiştiğinde sonuçlar düğmeye basılmasını beklemeden anında yeniden hesaplanır.
- Web’de parola ile açılan geçici yönetim modunda ürün adı ve yoğunluk değişiklikleri yalnızca ilgili sekmedeki hesaplamaları etkiler. Geçici durum, kalıcı masaüstü verisinden görsel olarak ayırt edilir.
- Web üst çubuğunda **Yetkili Modu Aç** işlemi bulunur. Doğrulama sonrasında aynı yerde **Geçici Yetkili Modu** göstergesi ile **Oturumu Kapat** işlemi gösterilir; oturumu kapatmak parola bilgisini ve tüm geçici ürün değişikliklerini hemen temizler.
- Hatalı veya eksik girişte eski/geçersiz sonuç gösterilmez; ilgili alanın altında kısa Türkçe hata mesajı gösterilir.
- Masaüstünde çevrimdışı çalışma ve eşitleme durumu her ekranda küçük bir durum göstergesiyle belirtilir: **Eşitlendi**, **İnternet yok** veya **Bekleyen değişiklikler**.
- Masaüstü genişliği daraltıldığında sol menü simgeli dar moda geçebilir; web küçük ekranlarda açılır/kapanır menü kullanır.

### 3.1. Sayfa Görselleri ve İkonlar

Görseller, hesaplama alanlarını veya tablo sonuçlarını örtmeyen destekleyici bir katman olarak kullanılacaktır. Her ana ekranda marka bandının altında, ekran başlığının yanında veya üstünde yaklaşık `16:5` oranında alçak bir görsel alan bulunur. Görsele koyu mavi, yarı saydam bir katman uygulanır; sayfa başlığı ve kısa açıklama okunaklı kalır. Dar ekranlarda görsel yüksekliği azaltılır, ancak hesap tablosunun önüne geçirilmez.

İlk sürüm için seçilen görsel yönleri ve kaynak adayları şunlardır:

- **Litre - Tonaj:** endüstriyel depolama tankları — Bruno Guerrero, Unsplash: <https://unsplash.com/photos/large-industrial-storage-tanks-under-a-clear-blue-sky-0cuSWPG8CL8>
- **Tonaj - Litre:** endüstriyel tesis ve tankerler — Robert So, Pexels: <https://www.pexels.com/photo/industrial-structure-and-fuel-tankers-parked-11003992/>
- **Fire Hesaplama:** boru, tank ve tesis görünümü — Hazel J, Unsplash: <https://unsplash.com/photos/vast-industrial-complex-with-pipes-tanks-and-buildings-9KeG7W4cI5U>
- **Ürünler:** varil bulunan depo ortamı — Martin Zapata, Pexels: <https://www.pexels.com/photo/worker-in-warehouse-with-barrels-20379378/>
- **Geçmiş Hesaplamalar:** raporlama ve veri analizi görünümü — Jakub Żerdzicki, Unsplash: <https://unsplash.com/photos/someone-analyzes-financial-data-on-a-tablet-EL16ACtwLxg>

Görseller dış adresten çalışırken yüklenmeyecek; uygun çözünürlükte indirilip optimize edilmiş yerel uygulama varlıkları olarak paketlenecektir. Böylece masaüstü çevrimdışıyken de tasarım bozulmaz ve üçüncü taraf izleme isteği oluşmaz. Orijinal dosya, kaynak sayfası, fotoğrafçı ve lisans kaydı `THIRD_PARTY_NOTICES.md` içinde tutulur; uygulamanın **Görsel Kaynakları** penceresinden de erişilebilir.

Unsplash görselleri Unsplash lisansı, Pexels görselleri Pexels lisansı altında kullanılacaktır. Sol menü, işlem düğmeleri ve özet kartlarında sade Lucide ikonları kullanılacaktır. Fotoğrafın içine metin gömülmez; her görselin Türkçe alternatif açıklaması bulunur. Görsel kırpma odak noktaları masaüstü ve mobil için ayrı tanımlanır.

### 3.2. Raporlama Görünümü

**Geçmiş Hesaplamalar** sayfasında, kayıt listesinin üzerinde aşağıdaki kompakt raporlama bileşenleri bulunur:

- Seçili tarih aralığındaki toplam hesaplama sayısı
- `Litre - Tonaj`, `Tonaj - Litre` ve `Fire Hesaplama` kayıt sayıları
- Son 30 gündeki günlük kayıt adetlerini gösteren sade çizgi/sütun grafik
- En sık kullanılan ürünleri gösteren en fazla beş satırlık özet

Bu özetler yalnızca kaydedilmiş geçmiş verilerinden türetilir; Excel formüllerine, hesap sonuçlarına veya ürün yoğunluklarına müdahale etmez. Masaüstünde filtre değiştiğinde kartlar ve grafik de aynı filtreyi izler. Web’de parola ile açılan salt okunur geçmişte aynı raporlar görüntülenebilir. Web’deki geçici ürün değişiklikleri daha önce kaydedilmiş geçmiş anlık görüntülerini değiştirmez. Grafiklerin yanında sayısal karşılıkları bulunur; renk tek başına bilgi taşımaz.

## 4. Hesaplama Motoru ve Formül Koruması

Hesaplamalar Excel dosyalarındaki mevcut kuralların uygulama kodundaki birebir karşılığı olacaktır. Formül metinleri kullanıcıya düzenleme alanı olarak sunulmayacaktır. Masaüstü ve web aynı ortak hesaplama paketini kullanacağı için aynı girdiler iki platformda da aynı sonucu üretir.

Ondalık hesaplarda görüntüleme yuvarlamasından kaynaklanan farkları azaltmak için ondalık sayı kütüphanesi kullanılacaktır. Tarih farkı, saat dilimi ve yaz/kış saati değişimlerinden etkilenmemesi için takvim günü üzerinden hesaplanacaktır.

### 4.1. Litre - Tonaj

Kaynak: `Litre ve Tonaj Hesaplama .xlsx`, `Hesap!A1:B11`.

**Düzenlenebilir değerler:**

- Tank Hacmi (L)
- Dolum Oranı (%) — kullanıcı örneğin `95` girer
- Ürün Seçimi
- ADR Max (ton)

**Otomatik değerler ve formüller:**

- Yoğunluk (kg/L) = seçilen ürünün ürün listesindeki yoğunluğu
- Güvenli Hacim (L) = Tank Hacmi × Dolum Oranı
- Yüklenebilir (kg) = Güvenli Hacim × Yoğunluk
- Yüklenebilir (ton) = Yüklenebilir (kg) ÷ 1000
- Durum = Yüklenebilir (ton) > ADR Max ise `ASIM VAR`, değilse `UYGUN`

Arayüzde girilen dolum yüzdesi formül çalışmadan önce 100’e bölünür; kaynak formüldeki **Dolum Oranı** değeri yine `0,95` olarak kullanılır. Kaynak dosyadaki `ASIM VAR` metni Türkçe karakter eklenmeden aynen korunur.

### 4.2. Tonaj - Litre

Kaynak: `Litre ve Tonaj Hesaplama .xlsx`, `Hesap!D1:E10`.

**Düzenlenebilir değerler:**

- Ürün Seçimi
- Dolum Oranı (%) — kullanıcı örneğin `95` girer
- Yüklenmek İstenen Tonaj
- ADR Max (ton)

**Otomatik değerler ve formüller:**

- Yoğunluk (kg/L) = seçilen ürünün ürün listesindeki yoğunluğu
- Gerekli Net Hacim (L) = Yüklenmek İstenen Tonaj × 1000 ÷ Yoğunluk
- Gerekli Tank Hacmi (L) = Gerekli Net Hacim ÷ Dolum Oranı
- Durum = Yüklenmek İstenen Tonaj > ADR Max ise `AŞIM VAR`, değilse `UYGUN`

Arayüzde girilen dolum yüzdesi formül çalışmadan önce 100’e bölünür; kaynak formüldeki **Dolum Oranı** değeri yine `0,95` olarak kullanılır. Alan adı, birimi ve formülü kaynak dosyada olduğu gibi korunur; uygulama bu formül üzerinde düzeltme veya yorum değişikliği yapmaz.

### 4.3. Fire Hesaplama

Kaynak: `ek11_fire_hesap_tablosuu.xlsx`, `Ek11_Fire_Hesabi!A1:J24`.

**Düzenlenebilir değerler:**

- Giriş miktarı (kg)
- A oranı (ilk 90 gün)
- B oranı (90 gün sonrası günlük)
- Geliş Tarihi
- 90 gün sonu kalan miktar (kg)

**Otomatik değerler ve formüller:**

- Güncel Tarih = cihazın güncel takvim tarihi
- Fark / Toplam kalış süresi = Güncel Tarih − Geliş Tarihi
- İlk 90 gün dikkate alınan süre = `MIN(Toplam kalış süresi, 90)`
- 90 gün sonrası aşan gün = `MAX(Toplam kalış süresi − 90, 0)`
- İlk 90 gün fire = Giriş miktarı × A oranı
- 90 gün sonrası ek fire = 90 gün sonu kalan miktar × `[1 − (1 − B oranı) ^ aşan gün]`
- Toplam izin verilebilir fire = İlk 90 gün fire + 90 gün sonrası ek fire
- 90 gün sonrası ek fire – lineer = 90 gün sonu kalan miktar × B oranı × aşan gün
- Toplam fire – lineer = İlk 90 gün fire + lineer ek fire

Kaynak tablodaki **Alternatif (Basit lineer yaklaşım)** ve **Kopyala-yapıştır Excel formülleri** bölümleri görünür tutulur. Bu bölümlerdeki otomatik sonuçlar düzenlenemez. Ana tablodaki “90 gün sonu kalan miktar” alanının elle girilebilir olması ve referans bölümündeki B10 karşılığının `Giriş miktarı − İlk 90 gün fire` olarak hesaplanması kaynak dosyadaki mevcut davranışa uygun biçimde ayrı ayrı korunur.

## 5. Ürün Yönetimi

Başlangıç ürünleri `Litre ve Tonaj Hesaplama .xlsx` dosyasındaki `Urunler!A1:B63` aralığından alınır. İlk kurulumda başlık dışındaki 62 ürün ve yoğunluk değeri veritabanına eklenir.

Her ürün aşağıdaki alanlara sahiptir:

- Benzersiz kimlik
- Ürün adı
- Yoğunluk (kg/L)
- Oluşturulma ve güncellenme zamanı
- Silinme işareti/zamanı (tek yönlü eşitleme için)

Masaüstünde:

- Ürün adına göre arama yapılabilir.
- Yeni ürün eklenebilir.
- Seçili ürünün adı ve yoğunluğu düzenlenebilir.
- Değişiklik açık bir **Kaydet** işlemiyle kalıcılaştırılır.
- Silme öncesinde ürün adı gösterilen bir onay penceresi açılır.
- Ürün adı boş olamaz ve büyük/küçük harf farkı gözetilmeden benzersiz olmalıdır.
- Yoğunluk sıfırdan büyük geçerli bir sayı olmalıdır.

Web’de aynı liste aranabilir ve görüntülenebilir. Parola doğrulanmadığında değiştirme işlemleri gösterilmez. Parola doğrulandığında kullanıcı açık sekmede geçerli olmak üzere ürün ekleyebilir, düzenleyebilir veya silebilir. Bu geçici ürün katmanı tarayıcının `sessionStorage` alanında tutulur; web veritabanına, API’ye veya masaüstüne gönderilmez. Geçici ekleme, düzenleme ve silmeler aynı sekmedeki Litre - Tonaj ve Tonaj - Litre ürün seçicilerine ve yeni hesaplamalara anında yansır. Sekme kapatıldığında geçici ürün katmanı ve yetki bilgisi silinir; uygulama yeniden açıldığında masaüstünden gelen ana liste yüklenir.

Litre - Tonaj ve Tonaj - Litre ekranlarındaki ürün seçicileri o anda etkin olan listeyi alfabetik olarak gösterir. Bir ürün kalıcı olarak masaüstünden güncellendiğinde veya silindiğinde yeni web oturumları güncel ana listeyi kullanır. Geçici ya da kalıcı hiçbir ürün değişikliği geçmiş kayıtların ürün adı ve yoğunluk anlık görüntüsünü değiştirmez.

## 6. Geçmiş Hesaplamalar

Geçmişe kayıt yalnızca masaüstünde ve kullanıcı **Hesaplamayı Kaydet** düğmesine bastığında oluşturulur. Her tuş vuruşunda otomatik kayıt yapılmaz; böylece eksik ve yinelenen geçmiş satırları oluşmaz.

Her geçmiş kaydı şunları içerir:

- Benzersiz kimlik
- Hesap türü: `Litre - Tonaj`, `Tonaj - Litre` veya `Fire Hesaplama`
- Kayıt tarihi ve saati
- Hesaplamada kullanılan tüm giriş değerleri
- Hesaplanan tüm sonuç değerleri
- Seçili ürünün kayıt anındaki adı ve yoğunluğu (ürün kullanılan hesaplarda)

Geçmiş ekranında:

- En yeni kayıt en üstte gösterilir.
- Tarih aralığına, hesap türüne ve ürün adına göre filtreleme yapılabilir.
- Bir satır açıldığında girişler ve sonuçlar kaynak tablo düzenine yakın bir ayrıntı görünümünde gösterilir.
- Masaüstünde tek kayıt silinebilir; silme onay gerektirir.
- Web’de masaüstünden eşitlenen kayıtlar parola doğrulamasından sonra görüntülenebilir ancak eklenemez, düzenlenemez veya silinemez.
- Web’de yapılan anlık hesaplamalar geçmişe kaydedilmez ve masaüstü verisini değiştirmez.

## 7. Veri Sahipliği ve Tek Yönlü Eşitleme

Veri akışı yalnızca aşağıdaki yöndedir:

`Masaüstü yerel veritabanı → Güvenli API → Web veritabanı → Web ana veri ekranları`

Web’in parola ile açılan geçici ürün katmanı bu akışın dışında ve yalnızca tarayıcı sekmesinde bulunur. Web’den masaüstüne veya web veritabanına yazma yolu oluşturmaz.

### 7.1. Masaüstü Yerel Verisi

- Masaüstü ürünleri ve geçmişi yerel SQLite veritabanında tutar.
- Hesaplamalar ve ürün yönetimi internet olmadan çalışır.
- Her ekleme, güncelleme veya silme aynı yerel işlem içinde bir eşitleme kuyruğu kaydı oluşturur.
- Uygulama kapanıp açılsa bile bekleyen kuyruk korunur.

### 7.2. Eşitleme

- İnternet bağlantısı bulunduğunda masaüstü bekleyen kayıtları sırayla API’ye gönderir.
- Başarılı kayıtlar kuyruktan işaretlenir; başarısız kayıtlar veri kaybetmeden daha sonra tekrar denenir.
- Kayıtlar benzersiz kimlik taşıdığı için aynı değişiklik tekrar gönderilse bile mükerrer ürün veya geçmiş oluşmaz.
- Silinen ürünler ve geçmiş kayıtları web tarafına silinme işaretiyle aktarılır ve web listelerinden kaldırılır.
- Web’den masaüstüne veri eşitleme yolu bulunmaz.

### 7.3. Web Verisi

- Web ve API tarafında PostgreSQL kullanılır.
- Web kalıcı ürün ve geçmiş verileri için sadece okuma uçlarına erişir.
- Yazma uçları masaüstüne ait kimlik doğrulaması olmadan istek kabul etmez.
- Web paketi içinde masaüstü yazma anahtarı veya yazma yetkisi bulunmaz.

### 7.4. Web Geçici Yönetim Oturumu

- Kullanıcı parolayı gönderdiğinde doğrulama sunucuda yapılır.
- Başarılı doğrulama, yalnızca ilgili sekmenin `sessionStorage` alanında tutulan, en fazla sekiz saat geçerli imzalı bir yetki belirteci üretir.
- Geçici ürün değişiklikleri ana veri kümesinin üzerine uygulanan bir sekme içi katmandır; sunucuya kaydedilmez.
- Aynı sekme yenilendiğinde yetki ve geçici katman korunur.
- Sekme veya tarayıcı kapatıldığında yetki ve geçici katman kaybolur. Uygulama tekrar açıldığında masaüstünden eşitlenen ana veri yeniden gösterilir.
- Masaüstünden daha sonra gelen değişiklikler ana web verisini günceller. Açık yetkili sekmede aynı ürüne ait geçici değişiklik sekme kapanana kadar önceliklidir; diğer ana veri güncellemeleri normal biçimde görünür. Yeni web oturumlarında her zaman son masaüstü verisi esas alınır.

## 8. Yetkilendirme ve Güvenlik

- Masaüstü uygulaması, eşitleme API’sine ait yazma kimliğini işletim sisteminin güvenli kimlik bilgisi alanında saklar.
- Web’deki **Litre - Tonaj**, **Tonaj - Litre**, **Fire Hesaplama** ve **Ürünler** ekranları herkes tarafından hesap açmadan kullanılabilir.
- Web’deki **Geçmiş Hesaplamalar** menü seçeneği herkes tarafından görülür; içerik açılırken parola ile yetki doğrulaması istenir. Aynı parola webdeki geçici ürün yönetim modunu da açar.
- Parola sunucuda ortam değişkeni üzerinden doğrulanır; tarayıcıya, masaüstü paketine, GitHub deposuna veya kaynak koda açık metin olarak yerleştirilmez.
- Başarılı doğrulamada sunucunun imzaladığı kısa ömürlü belirteç sekmenin `sessionStorage` alanında tutulur. Geçmiş okuma isteklerinde belirteç sunucuda yeniden doğrulanır.
- Parolasız web ziyaretçisi ürün, formül ve geçmiş bakımından salt okunur role sahiptir; geçmiş içeriğini göremez.
- Parolalı web ziyaretçisi yalnızca kendi açık sekmesinde geçici ürün değişiklikleri yapabilir. Formül ve kalıcı geçmiş verisi bakımından salt okunur kalır.
- API, istemciden gelen sayısal değerleri ve metinleri yeniden doğrular.
- Ürün veya geçmiş verisi için web tarayıcısından kalıcı yazma isteği gönderilse bile sunucu bunu reddeder.
- Parola denemeleri IP ve tarayıcı oturumu temelinde hız sınırına tabi tutulur; 15 dakika içinde beş başarısız denemeden sonra yeni deneme geçici olarak engellenir. Hata mesajı parolanın hangi kısmının yanlış olduğunu açıklamaz.
- İlk sürümde kullanıcı/rol yönetim ekranı bulunmaz; masaüstü kalıcı yazma rolü, web misafir rolü ve sekmeye bağlı geçici web yetkisi sabittir.

## 9. Hata ve Bağlantı Davranışı

- Geçersiz hesap girdileri alan bazında açıklanır ve geçerli sonuç üretilmez.
- Ürün yoğunluğu bulunamazsa hesaplama durur ve kullanıcıdan geçerli ürün seçmesi istenir.
- Dolum oranı arayüzde `%1` ile `%100` arasında girilir; sistem hesaplamadan önce değeri 100’e böler ve sıfıra bölmeyi engeller.
- Negatif hacim, tonaj, yoğunluk, ADR limiti veya fire oranı kabul edilmez.
- Geliş tarihi güncel tarihten sonraysa fire hesabı yapılmaz.
- Masaüstünde yerel kaydetme başarısız olursa kullanıcıya açık hata gösterilir; kayıt yapılmış gibi bildirim verilmez.
- Eşitleme başarısızlığı yerel çalışmayı engellemez; durum **Bekleyen değişiklikler** olarak kalır.
- Web API’ye erişemezse son başarılı okuma zamanı gösterilir ve veri güncelliği açıkça belirtilir.
- Web geçici yönetim oturumu doğrulanamaz veya süresi dolarsa yönetim düğmeleri kapanır; geçici katman temizlenir ve masaüstünden gelen ana veriye dönülür.

## 10. Teknik Mimari

Tek depo içinde aşağıdaki birimler bulunacaktır:

- `apps/desktop`: Electron ve React tabanlı Windows masaüstü uygulaması
- `apps/web`: React tabanlı web uygulaması
- `apps/api`: Masaüstü yazma ve web okuma uçlarını sağlayan API
- `packages/calculations`: Üç Excel hesabının ortak, arayüzden bağımsız hesaplama motoru
- `packages/ui`: Masaüstü ve web tarafından paylaşılan menü, tablo, form ve geçmiş bileşenleri
- `packages/contracts`: Ürün, geçmiş, eşitleme ve API veri sözleşmeleri
- `packages/test-fixtures`: Excel kaynaklarından çıkarılan doğrulama örnekleri

Web uygulamasında ayrıca sunucu doğrulamalı geçici yetki belirteci ve `sessionStorage` tabanlı ürün üst-katmanı bulunur. Bu katman ortak hesaplama paketine yalnızca etkin ürün listesini verir; formül koduna veya kalıcı API uçlarına erişmez.

Ana teknoloji seçimi:

- TypeScript
- React
- Electron
- SQLite (masaüstü)
- PostgreSQL (web/API)
- GitHub Actions (Windows EXE oluşturma ve web/API doğrulama)

Masaüstü ve web aynı hesaplama paketini ve mümkün olan en geniş ölçüde aynı arayüz bileşenlerini kullanır. Platforma özel yetkiler ayrı adaptörlerle uygulanır; web paketine masaüstü veritabanı veya yazma kodu dahil edilmez.

## 11. Test ve Doğrulama

### 11.1. Formül Doğrulaması

- Kaynak Excel dosyalarındaki örnek giriş ve sonuçlar test verisi olarak alınır.
- Her üç hesap motoru için formül bazlı birim testleri yazılır.
- Sıfır, sınır, negatif ve tarih eşik durumları ayrıca test edilir.
- Masaüstü ve web aynı girişlerde aynı sonuçları üretmek zorundadır.

### 11.2. Veri ve Eşitleme Testleri

- Ürün ekleme, düzenleme, silme ve doğrulama test edilir.
- Geçmiş kaydetme, filtreleme, ayrıntı görüntüleme ve silme test edilir.
- Çevrimdışı kuyruk, yeniden deneme, mükerrer istek ve silme aktarımı test edilir.
- Web’in kalıcı yazma uçlarına erişemediği otomatik yetki testleriyle doğrulanır.
- Geçici ürün katmanının API’ye gönderilmediği, masaüstü verisini değiştirmediği ve yeni sekmede bulunmadığı doğrulanır.

### 11.3. Arayüz Testleri

- Menü sırası ve adları doğrulanır.
- Yalnızca giriş alanlarının düzenlenebilir olduğu doğrulanır.
- Girdi değiştiğinde sonuçların otomatik hesaplandığı doğrulanır.
- Her iki dolum oranı alanında `%` ön eki ve varsayılan `95` değeri bulunduğu; `95` girişinin hesap motoruna `0,95` olarak aktarıldığı doğrulanır.
- Masaüstü ve web yetki farkları uçtan uca test edilir.
- Her ekranın sarı marka bandında mavi `SEYMEN` etiketi ile **Ş. Melih KARABAY için özenle hazırlanmıştır.** notunun bulunduğu doğrulanır.
- Beş ekranın her birinde doğru yerel görselin, Türkçe alternatif açıklamanın ve kaynak kaydının bulunduğu doğrulanır.
- Görseller yüklenemese bile hesap alanlarının ve sonuçların eksiksiz çalıştığı doğrulanır.
- Geçmiş rapor kartları ve grafiklerinin aktif filtrelerle aynı kayıt kümesini kullandığı doğrulanır.
- Herkese açık web hesaplama sayfalarının giriş istemediği, geçmiş içeriğinin ise yetkisiz kullanıcıya açılmadığı doğrulanır.
- Doğru parola ile geçici ürün yönetiminin açıldığı; yanlış parola ile açılmadığı doğrulanır.
- Geçici ürün ekleme, düzenleme ve silmelerinin aynı sekmedeki ürün seçicilerine ve hesap sonuçlarına anında yansıdığı doğrulanır.
- Aynı sekme yenilendiğinde geçici durumun korunduğu, yeni sekmede veya sekme kapatılıp yeniden açıldığında masaüstünden gelen ana veriye dönüldüğü doğrulanır.
- Web arayüzünün geçmişi, formülleri veya kalıcı ürün verisini değiştiremediği güvenlik testleriyle doğrulanır.
- Windows EXE temiz bir Windows ortamında kurulum/açılış testiyle doğrulanır.

## 12. GitHub ve Dağıtım

- Kaynak kod GitHub’a hazır tek depo halinde tutulur.
- GitHub Actions, Windows üzerinde masaüstü kurulum paketi/EXE üretir.
- EXE ve kurulum paketi herkese açık web sayfasına veya herkese açık GitHub sürümüne eklenmez.
- Masaüstü indirmesi yalnızca yetkilendirilmiş kullanıcıların ulaşabildiği özel sürüm deposu ya da süreli/korumalı indirme bağlantısı üzerinden sağlanır.
- Web uygulamasında genel bir **Masaüstünü İndir** bağlantısı gösterilmez.
- Web ve API için sağlayıcıdan bağımsız üretim derlemeleri ve ortam değişkeni örnekleri hazırlanır.
- Veritabanı parolaları, masaüstü eşitleme kimliği ve diğer gizli değerler repoya eklenmez.
- İnternetten kullanılan fotoğraf ve ikonların kaynak/lisans kayıtları dağıtım paketlerine eklenir.
- İlk teslimatta sürüm oluşturma adımları README içinde açıklanır.

## 13. İlk Sürüm Dışında Kalanlar

- Web’den kalıcı ürün veya geçmiş değiştirme
- Excel formülü düzenleme ekranı
- Excel içe/dışa aktarma
- Çoklu masaüstü yazma çatışması çözümü
- Kullanıcı ve rol yönetim paneli
- Otomatik geçmiş kaydı
- Kaynak Excel formüllerini değiştiren veya “düzelten” hesap mantığı

## 14. Kabul Kriterleri

1. Windows masaüstü uygulaması EXE/kurulum paketi olarak çalışır.
2. Web uygulaması aynı beş menü seçeneğini aynı sırada gösterir.
3. Hesaplama sayfaları kaynak Excel içerik ve formüllerini korur.
4. Hesap ekranında kullanıcı yalnızca giriş değerlerini değiştirebilir ve sonuçlar otomatik hesaplanır; Excel formülleri hiçbir rolde düzenlenemez.
5. Masaüstünde ürün CRUD işlemleri çevrimdışı çalışır.
6. Web, parolasız kullanımda ürünleri salt okunur görüntüler ve mevcut ürünlerle hesaplama yapar.
7. Masaüstünde açıkça kaydedilen hesaplar geçmiş listesine eklenir.
8. Masaüstü değişiklikleri internet geldiğinde web’e aktarılır.
9. Doğru parola webde yalnızca ilgili sekmeye ait geçici ürün ekleme, düzenleme ve silme işlemlerini açar; değişiklikler hesaplamalara anında yansır ancak sunucuya veya masaüstüne yazılmaz.
10. Kaynak Excel örnekleriyle yapılan formül doğrulama testleri geçer.
11. Masaüstü ve web’deki beş ekranın tamamında sarı bant üzerinde mavi `SEYMEN` etiketi ve altında **Ş. Melih KARABAY için özenle hazırlanmıştır.** notu görünür.
12. Beş ana ekranda ilgili, yerel paketlenmiş ve kaynak bilgisi kayıtlı görseller bulunur; geçmiş ekranında filtrelerle uyumlu rapor kartları ve grafik gösterilir.
13. Web hesaplama ve ürün ekranları herkese açıktır; geçmiş içeriği yalnızca parola doğrulamasından sonra salt okunur açılır.
14. Windows kurulum paketi herkese açık web veya GitHub sürümünden indirilemez; yalnızca yetkilendirilmiş dağıtım kanalında bulunur.
15. Kullanıcı her iki dolum oranı alanına `%` işaretiyle birlikte `95` yazar; hesaplama mevcut Excel formülünde `0,95` oranını kullanır.
16. Aynı sekme yenilendiğinde geçici yetki ve ürün değişiklikleri korunur; sekme kapatılıp uygulama tekrar açıldığında parola unutulur ve masaüstünden eşitlenen ana veriler geri gelir.
