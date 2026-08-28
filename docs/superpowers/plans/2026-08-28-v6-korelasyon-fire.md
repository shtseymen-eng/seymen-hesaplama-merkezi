# SEYMEN V6 Korelasyon Fire Implementation Plan

**Goal:** V5'i koruyarak EK 11 ürün bazlı fire oranları ve gizli yetkili veri yönetimini eklemek.

**Architecture:** Saf hesaplama fonksiyonları `logic.js` içinde test edilebilir tutulur. `app.js` UI, oturum ve veri tablosunu yönetir. EK 11 başlangıç verisi statik web paketine gömülür; kalıcı masaüstü senkronizasyonu sonraki backend entegrasyonudur.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Node assert testleri.

**Spec:** `docs/superpowers/specs/2026-08-28-v6-korelasyon-fire-design.md`

- [x] Saf tarih/fire/korelasyon seçim fonksiyonları ve testleri
- [x] EK 11 verisini V6 başlangıç veri kümesine aktarma
- [x] Fire ekranına ürün seçimi ve otomatik A/B oranı bağlama
- [x] 90+ ekranını korelasyon B oranına bağlama
- [x] Gizli veri girişi ikonu ve yeni yetkili şifresi
- [x] Excel benzeri CRUD korelasyon tablosu
- [x] Oturum içi değişiklikleri fire ekranlarına anlık yansıtma
- [x] Sözdizimi, DOM id ve hesap testi doğrulamaları
