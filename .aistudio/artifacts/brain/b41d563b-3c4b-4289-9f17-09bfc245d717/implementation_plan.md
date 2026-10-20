# Revize Sadeleştirilmiş Plan: Mevcut Alarm Takvimine Taahhüt Entegrasyonu

## 1. Sadeleştirme Amacı ve Kapsam
Kullanıcının geri bildirimi doğrultusunda, demoyu karmaşıklaştırmamak ve menüde yeni bir sekme kalabalığı yaratmamak adına:
- Yeni bir sekme **açılmayacaktır**.
- Agiloft ve Ironclad CLM'den alınan **sözleşme taahhütleri ve periyodik yükümlülük takibi** (Obligation & Milestone Tracking), mevcut **"Kritik Süre & Alarm Takvimi"** (`ComplianceCalendarView.tsx`) içerisine doğal bir filtreleme ve zenginleştirme olarak entegre edilecektir.

---

## 2. Uygulama Adımları

### A. Alarm Takvimi Veri Modelini Genişletme (`src/types/index.ts`)
Mevcut `ContractComplianceAlert` tipine taahhüt ve taraf türleri eklenir:
- `alertType`: `'guarantee_expiry' | 'interim_km_audit' | 'option_deadline' | 'contract_expiry' | 'maintenance_sla' | 'indexation_notice'`
- `partyType`?: `'customer' | 'supplier' | 'internal'`
- `penaltyOrRisk`?: Yükümlülüğün mali/hukuki etkisi (örn. "₺250.000 teminat mektubu riski", "Aşırı KM tolerans kaybı")

### B. İlk Veri Zenginleştirmesi (`src/data/initialData.ts`)
Mevcut `initialComplianceAlerts` listesine Agiloft/Ironclad modelinden 3 adet gerçekçi filo taahhüdü eklenir:
1. **Brisa Lastik & Otel Hizmeti (Tedarikçi SLA Taahhüdü):** 2026-2027 kış sezonu öncesi 650 montaj noktasında randevu kotası açma taahhüdü.
2. **Trendyol Express (Müşteri Ara KM Taahhüdü):** 3. Çeyrek telematik odometre verilerinin onaylanması ve aşırı KM tolerans mutabakatı.
3. **Arçelik Yetkili Servis (Mali Taahhüt):** Yıllık TÜFE/ÜFE endeksleme ve kira artış bildiriminin müşteriye tebliği.

### C. Alarm Takvimi Arayüzü İyileştirmesi (`src/components/clm/ComplianceCalendarView.tsx`)
- Üst filtre çubuğuna sade kategori butonları eklenir:
  - *Tümü*
  - *Teminat & Hukuk*
  - *Ara KM & Telematik*
  - *Tedarikçi SLA & Bakım*
- Her uyarı kartında Agiloft/Ironclad mantığıyla:
  - İlgili taraf etiketi (*Müşteri* veya *Tedarikçi*)
  - Hukuki/mali risk veya cezai şart açıklaması
  - Tek tıkla "Çözümlendi / Taahhüt Sağlandı" aksiyonu
  - Tek tıkla "Görev Oluştur" veya "Teklif Motoruna Aktar" bağlantısı

---

## 3. Doğrulama
- Mevcut sekmeler (Portföy, Tedarikçiler, Kanban, Kütüphane, Kasa, Alarm Takvimi) korunacak, yeni sekme eklenmeyecektir.
- `compile_applet` ve `lint_applet` ile sıfır hata doğrulaması yapılacaktır.
