import {
  Task,
  Quotation,
  Contract,
  DocumentItem,
  InvoiceDispute,
  AutomationRule,
  DataSourceItem,
  TeamMember,
  SystemSettings,
  DeliveryTrackerItem,
  CreditCheckRecord,
  ExpenseDiscrepancyItem,
  CustomerPortalRequest
} from '../types';

export const initialTeamMembers: TeamMember[] = [
  { id: 'usr-1', name: 'Deniz Yılmaz', role: 'Kıdemli Satış Destek Uzmanı', email: 'deniz.yilmaz@demo-fleet.com', activeTasks: 5, avatarColor: 'bg-blue-600' },
  { id: 'usr-2', name: 'Burak Kaya', role: 'Sözleşme & Yenileme Yöneticisi', email: 'burak.kaya@demo-fleet.com', activeTasks: 4, avatarColor: 'bg-emerald-600' },
  { id: 'usr-3', name: 'Selin Arslan', role: 'Kredi Tahsis & Operasyon Analisti', email: 'selin.arslan@demo-fleet.com', activeTasks: 3, avatarColor: 'bg-violet-600' },
  { id: 'usr-4', name: 'Can Demir', role: 'Müşteri Mutabakat Uzmanı', email: 'can.demir@demo-fleet.com', activeTasks: 4, avatarColor: 'bg-amber-600' },
  { id: 'usr-5', name: 'Zeynep Koç', role: 'Operasyon Direktörü', email: 'zeynep.koc@demo-fleet.com', activeTasks: 2, avatarColor: 'bg-rose-600' }
];

export const initialSettings: SystemSettings = {
  renewalWarningDays: 90,
  slaExternalResponseDays: 3,
  slaApprovalHours: 24,
  fastTrackMaxVehicles: 5,
  fastTrackMinMarginPercent: 14.0,
  mileageOverageThresholdPercent: 15.0,
  // Section 16.I Configurable Demo Pricing Engine defaults
  excessMileageRatePerKm: 4.50, // 4.50 TL / excess km
  earlyReturnCompensationRatePercent: 35.0, // 35% of remaining rent
  earlyReturnFixedProcessingFee: 7500, // 7.500 TL fixed processing/logistics fee
  earlyReturnRefurbishmentProvision: 12000, // 12.000 TL refurbishment/wear provision
  defaultRenewalDurationMonths: 24,
  defaultRenewalAdjustmentPercent: 18.0, // +18% price adjustment for renewal
  quotationValidityDays: 15,
  vatTaxRatePercent: 20 // %20 KDV
};

export const initialTasks: Task[] = [
  {
    id: 'TSK-1041',
    title: 'Borusan Lojistik - 12 Araçlık Filo Yenileme Teklif Hazırlığı',
    processType: 'Sözleşme Yenileme',
    customerRef: 'Borusan Lojistik Dağıtım A.Ş.',
    customerCode: 'CUST-104',
    sourceSystem: 'Otomasyon Motoru',
    owner: 'Burak Kaya',
    priority: 'Kritik',
    status: 'İşlemde',
    createdAt: '2026-10-12',
    dueDate: '2026-10-21',
    nextAction: 'Müşteri filo yöneticisi Ahmet Bey ile model ikame alternatifleri görüşülecek',
    waitingDuration: '2 gün',
    waitingDays: 2,
    blocker: 'Müşteri yeni dönem için hibrit model opsiyonlarını talep etti',
    whatNeedsToBeDone: 'Mevcut Megane sözleşmesinin süresi 68 gün sonra doluyor. Müşteriye Corolla Hybrid ve Megane EDC teklif karşılaştırması hazırlanmalı.',
    checklist: [
      { id: 'chk-1', text: 'Mevcut araçların telematik KM okuma raporu çıkarıldı', completed: true },
      { id: 'chk-2', text: 'İkinci el piyasa tahmini ve artık değer hesaplandı', completed: true },
      { id: 'chk-3', text: 'Yenileme kiralama teklif taslağı hazırlandı', completed: false },
      { id: 'chk-4', text: 'Finans biriminden fonlama maliyeti teyidi alındı', completed: false }
    ],
    notes: [
      { id: 'nt-1', author: 'Burak Kaya', timestamp: '2026-10-12 11:30', text: 'Otomasyon motoru tarafından T-90 günü kapsamında otomatik oluşturuldu.' },
      { id: 'nt-2', author: 'Burak Kaya', timestamp: '2026-10-15 14:10', text: 'Müşteri Ahmet Bey ile telefonda görüşüldü; sedan yerine hafif ticari Courier ihtiyacı da doğabilir dedi.' }
    ],
    history: [
      { id: 'h-1', timestamp: '2026-10-12 09:00', user: 'Otomasyon Motoru', action: 'Kural 1 uyarınca görev oluşturuldu' },
      { id: 'h-2', timestamp: '2026-10-14 10:15', user: 'Burak Kaya', action: 'Durum "Yeni"den "İşlemde"ye alındı' }
    ],
    relatedContractId: 'KNT-7821',
    relatedQuoteId: 'TKF-2026-089',
    isOverdue: false,
    isSlaBreached: false
  },
  {
    id: 'TSK-1042',
    title: 'Ekol Tedarik - Erken Araç İadesi Ekspertiz ve Ceza Mutabakatı',
    processType: 'Erken İade',
    customerRef: 'Ekol Uluslararası Taşımacılık',
    customerCode: 'CUST-218',
    sourceSystem: 'Miles',
    owner: 'Deniz Yılmaz',
    priority: 'Yüksek',
    status: 'Dış Yanıt Bekliyor',
    createdAt: '2026-10-10',
    dueDate: '2026-10-17',
    nextAction: 'Müşteri operasyon müdürüne ekspertiz raporu teyit maili hatırlatması atılacak',
    waitingDuration: '5 gün',
    waitingDays: 5,
    blocker: 'Müşteri tarafından yetkili servis hasar ekspertiz raporu henüz onaylanmadı',
    whatNeedsToBeDone: '34 EKL 491 plakalı Peugeot 3008 aracın sözleşme bitimine 9 ay kala erken iadesi talep edildi. Ekspertiz fark bedeli (18.400 TL) ve erken fesih tazminat hesaplaması teyit edilmeli.',
    checklist: [
      { id: 'chk-5', text: 'Bağımsız ekspertiz raporu incelendi', completed: true },
      { id: 'chk-6', text: 'Erken iade zeyilnamesi taslağı oluşturuldu', completed: true },
      { id: 'chk-7', text: 'Müşteri onay yazısı alındı', completed: false },
      { id: 'chk-8', text: 'Finans birimine yansıtma faturası onayı iletildi', completed: false }
    ],
    notes: [
      { id: 'nt-3', author: 'Deniz Yılmaz', timestamp: '2026-10-11 15:45', text: 'Müşteriye ekspertiz fotoları ve 18.400 TL tutarındaki amortisman fark tablosu yollandı. Cevap bekleniyor.' }
    ],
    history: [
      { id: 'h-3', timestamp: '2026-10-10 14:00', user: 'Deniz Yılmaz', action: 'Görev oluşturuldu' },
      { id: 'h-4', timestamp: '2026-10-11 16:00', user: 'Deniz Yılmaz', action: 'Durum "Dış Yanıt Bekliyor" olarak güncellendi' }
    ],
    relatedContractId: 'KNT-7822',
    isOverdue: true,
    isSlaBreached: true
  },
  {
    id: 'TSK-1043',
    title: 'Trendyol Express - 25 Adet Courier Aşırı KM Zeyilname Düzenlemesi',
    processType: 'Aşırı KM',
    customerRef: 'Trendyol Express Filo Operasyonları',
    customerCode: 'CUST-405',
    sourceSystem: 'Otomasyon Motoru',
    owner: 'Deniz Yılmaz',
    priority: 'Yüksek',
    status: 'İşlemde',
    createdAt: '2026-10-14',
    dueDate: '2026-10-23',
    nextAction: 'Ekstra KM birim maliyeti üzerinden zeyilname revizyon teklifi sunulacak',
    waitingDuration: '3 gün',
    waitingDays: 3,
    blocker: 'Filo telematik verisinde 4 aracın son bakım kayıtları netleştirilmeyi bekliyor',
    whatNeedsToBeDone: 'Yıllık 40.000 KM sözleşme limiti olan araçlar ortalama 54.200 KM bandında ilerliyor (%35 aşım). Dönem sonu sürpriz fatura yerine aylık kiralama tutarı revize edilmeli.',
    checklist: [
      { id: 'chk-9', text: 'Telematik odometre verileri analiz edildi', completed: true },
      { id: 'chk-10', text: 'Tahmini aşım tutarı (620.000 TL) modellendi', completed: true },
      { id: 'chk-11', text: 'Yeni aylık kira zeyilnamesi oluşturuldu', completed: false }
    ],
    notes: [
      { id: 'nt-4', author: 'Deniz Yılmaz', timestamp: '2026-10-14 16:20', text: 'Telematik kuralı tetiklendi. Aşım oranı %35,5 seviyesinde.' }
    ],
    history: [
      { id: 'h-5', timestamp: '2026-10-14 11:20', user: 'Otomasyon Motoru', action: 'KM erken uyarı kuralı görevi oluşturdu' }
    ],
    relatedContractId: 'KNT-7824',
    isOverdue: false,
    isSlaBreached: false
  },
  {
    id: 'TSK-1044',
    title: 'Arçelik Servis Ağı - Vergi Levhası ve KKB Onay Formu Eksikliği',
    processType: 'Evrak Takibi',
    customerRef: 'Arçelik Yetkili Servis Ağı A.Ş.',
    customerCode: 'CUST-312',
    sourceSystem: 'Otomasyon Motoru',
    owner: 'Selin Arslan',
    priority: 'Yüksek',
    status: 'Dış Yanıt Bekliyor',
    createdAt: '2026-10-13',
    dueDate: '2026-10-20',
    nextAction: 'Mali işler sorumlusuna otomatik evrak tamamlama bağlantısı tekrar iletilecek',
    waitingDuration: '4 gün',
    waitingDays: 4,
    blocker: 'Müşterinin güncel noter onaylı imza sirküleri ve 2025/12 mizan tablosu eksik',
    whatNeedsToBeDone: 'Kabul edilen 8 araçlık sözleşmenin teslimat onayı için risk komitesi eksik evrakların tamamlanmasını şart koştu.',
    checklist: [
      { id: 'chk-12', text: 'Vergi Levhası (2025) kontrol edildi', completed: true },
      { id: 'chk-13', text: 'İmza sirküleri geçerlilik tarihi incelendi', completed: false },
      { id: 'chk-14', text: 'KKB yetki ve sorgu formu onaylatıldı', completed: false }
    ],
    notes: [
      { id: 'nt-5', author: 'Selin Arslan', timestamp: '2026-10-13 10:00', text: 'Evrak uyarı kuralı tetiklendi. Risk skoru %45 (Orta-Yüksek).' }
    ],
    history: [
      { id: 'h-6', timestamp: '2026-10-13 09:30', user: 'Otomasyon Motoru', action: 'Eksik evrak takip görevi açıldı' }
    ],
    isOverdue: false,
    isSlaBreached: true
  },
  {
    id: 'TSK-1045',
    title: 'Şişecam Pazarlama - HGS ve İkame Araç Fatura İtiraz İncelemesi',
    processType: 'Fatura İtirazı',
    customerRef: 'Şişecam Cam Pazarlama A.Ş.',
    customerCode: 'CUST-520',
    sourceSystem: 'Manuel',
    owner: 'Can Demir',
    priority: 'Orta',
    status: 'Onay Bekliyor',
    createdAt: '2026-10-15',
    dueDate: '2026-10-24',
    nextAction: 'Operasyon direktörü Zeynep Hanım onayına sunulan 14.250 TL iptal fişi onaylanacak',
    waitingDuration: '1 gün',
    waitingDays: 1,
    blocker: 'İkame araç segment farkı faturasında servis onay slipi teyidi tamamlandı, direktör onayı bekleniyor',
    whatNeedsToBeDone: 'Müşteri sözleşmesinde D-segment ikame araç taahhüdü olmasına rağmen C-segment faturalandığı ve HGS geçişinin mükerrer kesildiği iddia edildi.',
    checklist: [
      { id: 'chk-15', text: 'HGS geçiş logları Karayolları portalından indirildi', completed: true },
      { id: 'chk-16', text: 'Mükerrer 2.100 TL geçiş tespit edildi ve teyit edildi', completed: true },
      { id: 'chk-17', text: 'Düzeltme faturası / iade dekontu hazırlandı', completed: true },
      { id: 'chk-18', text: 'Direktör onayı alındı', completed: false }
    ],
    notes: [
      { id: 'nt-6', author: 'Can Demir', timestamp: '2026-10-16 11:20', text: 'Mükerrerlik teyit edildi. 2.100 TL + 12.150 TL ikame telafisi için 14.250 TL iade önerildi.' }
    ],
    history: [
      { id: 'h-7', timestamp: '2026-10-15 14:00', user: 'Can Demir', action: 'İtiraz görevi oluşturuldu' },
      { id: 'h-8', timestamp: '2026-10-16 16:30', user: 'Can Demir', action: 'Onay Bekliyor statüsüne alındı' }
    ],
    relatedDisputeId: 'ITR-501',
    isOverdue: false,
    isSlaBreached: false
  },
  {
    id: 'TSK-1046',
    title: 'Kordsa Teknik Tekstil - 4 Adet Passat Variant Fast-Track Teklif İncelemesi',
    processType: 'Teklif Hazırlama',
    customerRef: 'Kordsa Teknik Tekstil A.Ş.',
    customerCode: 'CUST-611',
    sourceSystem: 'Qlik',
    owner: 'Burak Kaya',
    priority: 'Düşük',
    status: 'Tamamlandı',
    createdAt: '2026-10-08',
    dueDate: '2026-10-15',
    nextAction: 'Sözleşme taslağı hazırlandı, imza aşamasına geçildi',
    waitingDuration: '0 gün',
    waitingDays: 0,
    blocker: 'Yok - Tamamlandı',
    whatNeedsToBeDone: 'Yönetici araçları için 4 adet Passat teklifi. Kredi skoru A+ ve brüt marj %16,2 olduğundan Fast-track kuralı ile onaylandı.',
    checklist: [
      { id: 'chk-19', text: 'Araç teslim tarihleri teyit edildi', completed: true },
      { id: 'chk-20', text: 'Finansal marj hesaplaması yapıldı (%16,2)', completed: true },
      { id: 'chk-21', text: 'Otomatik Fast-track onayı tamamlandı', completed: true },
      { id: 'chk-22', text: 'Teklif PDF müşteriye iletildi', completed: true }
    ],
    notes: [
      { id: 'nt-7', author: 'Burak Kaya', timestamp: '2026-10-09 17:00', text: 'Müşteri teklifi aynı gün kabul etti. Sözleşme aşamasına aktarıldı.' }
    ],
    history: [
      { id: 'h-9', timestamp: '2026-10-08 10:00', user: 'Burak Kaya', action: 'Teklif görevi oluşturuldu' },
      { id: 'h-10', timestamp: '2026-10-09 14:00', user: 'Burak Kaya', action: 'Görev tamamlandı olarak kapatıldı' }
    ],
    relatedQuoteId: 'TKF-2026-092',
    isOverdue: false,
    isSlaBreached: false
  },
  {
    id: 'TSK-1047',
    title: 'Hayat Kimya - Satış Saha Filosu 18 Araç Ek Sözleşme Teklifi',
    processType: 'Teklif Hazırlama',
    customerRef: 'Hayat Kimya Sanayi A.Ş.',
    customerCode: 'CUST-709',
    sourceSystem: 'Manuel',
    owner: 'Deniz Yılmaz',
    priority: 'Yüksek',
    status: 'Onay Bekliyor',
    createdAt: '2026-10-16',
    dueDate: '2026-10-22',
    nextAction: 'Kredi komitesi limit artış onayı bekleniyor',
    waitingDuration: '2 gün',
    waitingDays: 2,
    blocker: 'Araç sayısı 18 olduğu için Fast-track kapsamı dışı; yönetim kurulu onay limiti gerekiyor',
    whatNeedsToBeDone: '18 adet Fiat Egea Cross 36 ay 30.000 KM kiralama teklifi hazırlandı. Özel filo iskonto oranı (%8,5) direktör onayı gerektiriyor.',
    checklist: [
      { id: 'chk-23', text: 'Distribütör araç tedarik teyidi alındı', completed: true },
      { id: 'chk-24', text: 'Kasko ve bakım maliyetleri güncellendi', completed: true },
      { id: 'chk-25', text: 'Satış direktörü onayı bekleniyor', completed: false }
    ],
    notes: [
      { id: 'nt-8', author: 'Deniz Yılmaz', timestamp: '2026-10-16 17:30', text: 'Distribütör kasım ayı teslimatı için kota ayırdı. Komite onayı acil.' }
    ],
    history: [
      { id: 'h-11', timestamp: '2026-10-16 11:00', user: 'Deniz Yılmaz', action: 'Teklif oluşturuldu ve onaya gönderildi' }
    ],
    relatedQuoteId: 'TKF-2026-095',
    isOverdue: false,
    isSlaBreached: false
  },
  {
    id: 'TSK-1048',
    title: 'Getir Perakende - Hasar Yansıtma İtirazı ve Trafik Cezaları',
    processType: 'Fatura İtirazı',
    customerRef: 'Getir Perakende Lojistik A.Ş.',
    customerCode: 'CUST-814',
    sourceSystem: 'Miles',
    owner: 'Can Demir',
    priority: 'Kritik',
    status: 'Dış Yanıt Bekliyor',
    createdAt: '2026-10-09',
    dueDate: '2026-10-16',
    nextAction: 'Sürücü tutanağı için kurye operasyon müdürü ile görüşülecek',
    waitingDuration: '6 gün',
    waitingDays: 6,
    blocker: 'Müşteri filo departmanı trafik cezasının tebliğ tarihi ile kiralama dönemi uyuşmazlığı bildirdi',
    whatNeedsToBeDone: '34 GTR 901 plakalı hafif ticari araca ait 8.400 TL hasar onarımı ve 3.200 TL emniyet kemeri cezası yansıtması inceleniyor.',
    checklist: [
      { id: 'chk-26', text: 'Trafik ceza tutanağı e-Devletten çekildi', completed: true },
      { id: 'chk-27', text: 'Kiralama başlangıç saati ile ceza saati karşılaştırıldı', completed: true },
      { id: 'chk-28', text: 'Düzeltilmiş mutabakat ekstresi yollandı', completed: true },
      { id: 'chk-29', text: 'Müşteri itiraz feragat yazısı bekleniyor', completed: false }
    ],
    notes: [
      { id: 'nt-9', author: 'Can Demir', timestamp: '2026-10-14 10:00', text: 'Ceza saatinde araç ikame parkurundaymış; 3.200 TL ceza iptal edilmeli, hasar bedeli ise müşteriye ait.' }
    ],
    history: [
      { id: 'h-12', timestamp: '2026-10-09 13:00', user: 'Can Demir', action: 'Görev açıldı' },
      { id: 'h-13', timestamp: '2026-10-12 15:00', user: 'Can Demir', action: 'Durum Dış Yanıt Bekliyor yapıldı' }
    ],
    relatedDisputeId: 'ITR-502',
    isOverdue: true,
    isSlaBreached: true
  }
];

export const initialQuotations: Quotation[] = [
  {
    id: 'TKF-2026-089',
    customerRef: 'Borusan Lojistik Dağıtım A.Ş.',
    customerCode: 'CUST-104',
    quotationType: 'Sözleşme Yenileme',
    vehicleCount: 12,
    vehicleModel: 'Renault Megane Sedan 1.3 TCe Touch EDC',
    termMonths: 36,
    annualKm: 30000,
    monthlyRentPerVehicle: 28500,
    totalMonthlyAmount: 342000,
    grossMarginPercent: 13.8,
    customerCreditScore: 'Düşük Risk / A+',
    owner: 'Burak Kaya',
    status: 'İnceleniyor',
    createdAt: '2026-10-12',
    lastUpdatedAt: '2026-10-15',
    validityDate: '2026-11-12',
    notes: 'KNT-7821 sözleşmesinin yenilenmesi kapsamında kurgulanmıştır. Hibrit seçeneği de görüşülmektedir.',
    versions: [
      { version: 1, date: '2026-10-12', vehicleCount: 12, monthlyRentPerVehicle: 29800, grossMarginPercent: 15.2, status: 'Taslak', notes: 'İlk çalışma yapıldı', author: 'Burak Kaya' },
      { version: 2, date: '2026-10-15', vehicleCount: 12, monthlyRentPerVehicle: 28500, grossMarginPercent: 13.8, status: 'İnceleniyor', notes: 'Müşteri hacim iskontosu talebi üzerine revize edildi', author: 'Burak Kaya' }
    ],
    isFastTrackEligible: false
  },
  {
    id: 'TKF-2026-092',
    customerRef: 'Kordsa Teknik Tekstil A.Ş.',
    customerCode: 'CUST-611',
    quotationType: 'Yeni Teklif',
    vehicleCount: 4,
    vehicleModel: 'Volkswagen Passat Variant 1.5 eTSI Elegance',
    termMonths: 24,
    annualKm: 20000,
    monthlyRentPerVehicle: 46200,
    totalMonthlyAmount: 184800,
    grossMarginPercent: 16.2,
    customerCreditScore: 'Düşük Risk / A+',
    owner: 'Burak Kaya',
    status: 'Onaylandı (Fast-Track)',
    createdAt: '2026-10-08',
    lastUpdatedAt: '2026-10-09',
    validityDate: '2026-11-08',
    notes: 'Yönetim ekibi araçları. Araç sayısı <= 5, marj %16.2 >= 14% ve kredi skoru A+ olduğu için Fast-Track kuralı devrede onaylandı.',
    versions: [
      { version: 1, date: '2026-10-08', vehicleCount: 4, monthlyRentPerVehicle: 46200, grossMarginPercent: 16.2, status: 'Onaylandı (Fast-Track)', notes: 'Otomasyon kuralı ile onaylandı', author: 'Sistem' }
    ],
    isFastTrackEligible: true
  },
  {
    id: 'TKF-2026-093',
    customerRef: 'Ekol Uluslararası Taşımacılık',
    customerCode: 'CUST-218',
    quotationType: 'Erken Araç İadesi',
    vehicleCount: 1,
    vehicleModel: 'Peugeot 3008 Allure 1.5 BlueHDi',
    termMonths: 12,
    annualKm: 25000,
    monthlyRentPerVehicle: 36000,
    totalMonthlyAmount: 36000,
    grossMarginPercent: 12.0,
    customerCreditScore: 'Orta Risk / B',
    owner: 'Deniz Yılmaz',
    status: 'Onay Bekliyor',
    createdAt: '2026-10-10',
    lastUpdatedAt: '2026-10-14',
    validityDate: '2026-10-25',
    notes: 'KNT-7822 sözleşmesi için 9 ay erken fesih zeyilnamesi. Amortisman ve tazminat tutarı 18.400 TL.',
    versions: [
      { version: 1, date: '2026-10-10', vehicleCount: 1, monthlyRentPerVehicle: 36000, grossMarginPercent: 12.0, status: 'Onay Bekliyor', notes: 'Fesih komisyon hesaplaması eklendi', author: 'Deniz Yılmaz' }
    ],
    isFastTrackEligible: false
  },
  {
    id: 'TKF-2026-094',
    customerRef: 'Trendyol Express Filo Operasyonları',
    customerCode: 'CUST-405',
    quotationType: 'Aşırı KM Zeyilnamesi',
    vehicleCount: 25,
    vehicleModel: 'Ford Transit Courier Trend 1.5 TDCi',
    termMonths: 36,
    annualKm: 55000,
    monthlyRentPerVehicle: 23400,
    totalMonthlyAmount: 585000,
    grossMarginPercent: 14.5,
    customerCreditScore: 'Düşük Risk / A+',
    owner: 'Deniz Yılmaz',
    status: 'Gönderildi',
    createdAt: '2026-10-14',
    lastUpdatedAt: '2026-10-16',
    validityDate: '2026-11-14',
    notes: 'Yıllık KM limiti 40.000 den 55.000 KM ye revize edildi. Birim araç kira artışı 3.100 TL/ay.',
    versions: [
      { version: 1, date: '2026-10-14', vehicleCount: 25, monthlyRentPerVehicle: 24200, grossMarginPercent: 15.5, status: 'Taslak', notes: 'Standart ek KM tarifesi uygulandı', author: 'Deniz Yılmaz' },
      { version: 2, date: '2026-10-16', vehicleCount: 25, monthlyRentPerVehicle: 23400, grossMarginPercent: 14.5, status: 'Gönderildi', notes: 'Filo büyüklüğü sebebiyle %3 iskonto ile müşteriye iletildi', author: 'Deniz Yılmaz' }
    ],
    isFastTrackEligible: false
  },
  {
    id: 'TKF-2026-095',
    customerRef: 'Hayat Kimya Sanayi A.Ş.',
    customerCode: 'CUST-709',
    quotationType: 'Yeni Teklif',
    vehicleCount: 18,
    vehicleModel: 'Fiat Egea Cross Lounge 1.6 Multijet DCT',
    termMonths: 36,
    annualKm: 30000,
    monthlyRentPerVehicle: 21900,
    totalMonthlyAmount: 394200,
    grossMarginPercent: 11.8,
    customerCreditScore: 'Düşük Risk / A+',
    owner: 'Deniz Yılmaz',
    status: 'Onay Bekliyor',
    createdAt: '2026-10-16',
    lastUpdatedAt: '2026-10-17',
    validityDate: '2026-11-16',
    notes: 'Saha satış ekibi araçları. Marj %11.8 olup filo iskonto yetkisi aşımı nedeniyle direktör onayı bekliyor.',
    versions: [
      { version: 1, date: '2026-10-16', vehicleCount: 18, monthlyRentPerVehicle: 21900, grossMarginPercent: 11.8, status: 'Onay Bekliyor', notes: 'Direktör onayına yollandı', author: 'Deniz Yılmaz' }
    ],
    isFastTrackEligible: false
  },
  {
    id: 'TKF-2026-085',
    customerRef: 'Şişecam Cam Pazarlama A.Ş.',
    customerCode: 'CUST-520',
    quotationType: 'Teklif Revizyonu',
    vehicleCount: 6,
    vehicleModel: 'Škoda Octavia Combi 1.5 e-TEC',
    termMonths: 36,
    annualKm: 25000,
    monthlyRentPerVehicle: 39500,
    totalMonthlyAmount: 237000,
    grossMarginPercent: 15.0,
    customerCreditScore: 'Düşük Risk / A+',
    owner: 'Burak Kaya',
    status: 'Kabul Edildi',
    createdAt: '2026-09-28',
    lastUpdatedAt: '2026-10-04',
    validityDate: '2026-10-28',
    notes: 'Müşteri teklifi onayladı, evrak toplama ve sözleşme imza aşamasına geçildi.',
    versions: [
      { version: 1, date: '2026-09-28', vehicleCount: 6, monthlyRentPerVehicle: 41000, grossMarginPercent: 16.5, status: 'Gönderildi', notes: 'İlk teklif', author: 'Burak Kaya' },
      { version: 2, date: '2026-10-03', vehicleCount: 6, monthlyRentPerVehicle: 39500, grossMarginPercent: 15.0, status: 'Kabul Edildi', notes: 'Revize ve nihai anlaşma', author: 'Burak Kaya' }
    ],
    isFastTrackEligible: false
  },
  {
    id: 'TKF-2026-081',
    customerRef: 'Getir Perakende Lojistik A.Ş.',
    customerCode: 'CUST-814',
    quotationType: 'Yeni Teklif',
    vehicleCount: 30,
    vehicleModel: 'Ford Transit Courier Trend 1.5 TDCi',
    termMonths: 24,
    annualKm: 45000,
    monthlyRentPerVehicle: 22800,
    totalMonthlyAmount: 684000,
    grossMarginPercent: 10.5,
    customerCreditScore: 'Orta Risk / B',
    owner: 'Can Demir',
    status: 'Reddedildi',
    lossReason: 'Yüksek Fiyat',
    createdAt: '2026-09-15',
    lastUpdatedAt: '2026-09-25',
    validityDate: '2026-10-15',
    notes: 'Müşteri rakip firmanın sunduğu aylık 21.400 TL teklifini tercih ettiğini bildirdi.',
    versions: [
      { version: 1, date: '2026-09-15', vehicleCount: 30, monthlyRentPerVehicle: 22800, grossMarginPercent: 10.5, status: 'Reddedildi', notes: 'Fiyat farkı nedeniyle kayıp', author: 'Can Demir' }
    ],
    isFastTrackEligible: false
  }
];

export const initialContracts: Contract[] = [
  {
    id: 'KNT-7821',
    customerRef: 'Borusan Lojistik Dağıtım A.Ş.',
    customerCode: 'CUST-104',
    vehicleModel: 'Renault Megane Sedan 1.3 TCe Touch EDC',
    plate: '34 BRS 812 (Filo: 12 Araç)',
    vehicleCount: 12,
    startDate: '2023-12-25',
    endDate: '2026-12-25',
    renewalStatus: 'Görüşülüyor',
    assignedOwner: 'Burak Kaya',
    nextAction: 'TSK-1041 üzerinden hibrit alternatifli teklif sunulacak',
    daysUntilRenewal: 67,
    contractLimitKm: 90000,
    currentOdometerKm: 78400,
    projectedOverKmPercent: 4.2,
    churnRisk: 'Düşük',
    hasRenewalTask: true,
    renewalTaskId: 'TSK-1041',
    monthlyRentAmount: 312000
  },
  {
    id: 'KNT-7822',
    customerRef: 'Ekol Uluslararası Taşımacılık',
    customerCode: 'CUST-218',
    vehicleModel: 'Peugeot 3008 Allure 1.5 BlueHDi',
    plate: '34 EKL 491',
    vehicleCount: 1,
    startDate: '2024-07-15',
    endDate: '2027-07-15',
    renewalStatus: 'İade Edilecek',
    assignedOwner: 'Deniz Yılmaz',
    nextAction: 'Erken iade ekspertiz fark bedeli onayı bekleniyor',
    daysUntilRenewal: 635,
    contractLimitKm: 75000,
    currentOdometerKm: 34100,
    projectedOverKmPercent: 0,
    churnRisk: 'Orta',
    hasRenewalTask: false,
    monthlyRentAmount: 36000
  },
  {
    id: 'KNT-7823',
    customerRef: 'Arçelik Yetkili Servis Ağı A.Ş.',
    customerCode: 'CUST-312',
    vehicleModel: 'Ford Transit Courier 1.5 TDCi',
    plate: '06 ARC 119 (Filo: 8 Araç)',
    vehicleCount: 8,
    startDate: '2024-01-10',
    endDate: '2026-11-20',
    renewalStatus: 'Yenileme Bekliyor',
    assignedOwner: 'Burak Kaya',
    nextAction: 'Otomasyon kuralı: T-32 gün kaldı, henüz yenileme görevi açılmamış',
    daysUntilRenewal: 32,
    contractLimitKm: 80000,
    currentOdometerKm: 74200,
    projectedOverKmPercent: 6.5,
    churnRisk: 'Düşük',
    hasRenewalTask: false,
    monthlyRentAmount: 184000
  },
  {
    id: 'KNT-7824',
    customerRef: 'Trendyol Express Filo Operasyonları',
    customerCode: 'CUST-405',
    vehicleModel: 'Ford Transit Courier Trend 1.5 TDCi',
    plate: '34 TYL 300 (Filo: 25 Araç)',
    vehicleCount: 25,
    startDate: '2024-06-01',
    endDate: '2027-06-01',
    renewalStatus: 'Görüşülüyor',
    assignedOwner: 'Deniz Yılmaz',
    nextAction: 'Aşırı KM zeyilnamesi imzalatılacak',
    daysUntilRenewal: 590,
    contractLimitKm: 120000,
    currentOdometerKm: 89000,
    projectedOverKmPercent: 35.5,
    churnRisk: 'Düşük',
    hasRenewalTask: true,
    renewalTaskId: 'TSK-1043',
    monthlyRentAmount: 510000
  },
  {
    id: 'KNT-7825',
    customerRef: 'Şişecam Cam Pazarlama A.Ş.',
    customerCode: 'CUST-520',
    vehicleModel: 'Renault Megane Sedan 1.3 TCe',
    plate: '34 SCM 441 (Filo: 6 Araç)',
    vehicleCount: 6,
    startDate: '2024-02-15',
    endDate: '2026-12-01',
    renewalStatus: 'Yenileme Bekliyor',
    assignedOwner: 'Burak Kaya',
    nextAction: 'T-43 gün kaldı: Yenileme teklifi için müşteri talepleri toplanacak',
    daysUntilRenewal: 43,
    contractLimitKm: 90000,
    currentOdometerKm: 81200,
    projectedOverKmPercent: 8.0,
    churnRisk: 'Düşük',
    hasRenewalTask: false,
    monthlyRentAmount: 165000
  },
  {
    id: 'KNT-7826',
    customerRef: 'Kordsa Teknik Tekstil A.Ş.',
    customerCode: 'CUST-611',
    vehicleModel: 'Volkswagen Passat Variant 1.5 TSI',
    plate: '41 KRD 701 (Filo: 4 Araç)',
    vehicleCount: 4,
    startDate: '2024-11-01',
    endDate: '2026-11-01',
    renewalStatus: 'Teklif İletildi',
    assignedOwner: 'Burak Kaya',
    nextAction: 'Yeni teklif TKF-2026-092 onaylandı, sözleşme yenileme aşamasında',
    daysUntilRenewal: 13,
    contractLimitKm: 60000,
    currentOdometerKm: 57800,
    projectedOverKmPercent: 1.2,
    churnRisk: 'Düşük',
    hasRenewalTask: false,
    monthlyRentAmount: 172000
  },
  {
    id: 'KNT-7827',
    customerRef: 'Hayat Kimya Sanayi A.Ş.',
    customerCode: 'CUST-709',
    vehicleModel: 'Toyota Corolla Sedan 1.8 Hybrid',
    plate: '34 HYT 980 (Filo: 10 Araç)',
    vehicleCount: 10,
    startDate: '2024-04-10',
    endDate: '2027-04-10',
    renewalStatus: 'Görüşülüyor',
    assignedOwner: 'Deniz Yılmaz',
    nextAction: 'Araç bakım ve telematik KM periyotları inceleniyor',
    daysUntilRenewal: 538,
    contractLimitKm: 90000,
    currentOdometerKm: 42100,
    projectedOverKmPercent: 18.2,
    churnRisk: 'Orta',
    hasRenewalTask: false,
    monthlyRentAmount: 290000
  }
];

export const initialDocuments: DocumentItem[] = [
  {
    id: 'DOC-301',
    title: 'Güncel Vergi Levhası (2025)',
    category: 'Sözleşme',
    relatedEntityId: 'KNT-7823',
    customerRef: 'Arçelik Yetkili Servis Ağı A.Ş.',
    status: 'Onaylandı',
    requiredByDate: '2026-10-18',
    uploadedAt: '2026-10-14 14:20',
    fileName: 'arcelik_vergi_levhasi_2025.pdf',
    fileSize: '1.2 MB',
    notes: 'Maliye barkod teyidi sağlandı.',
    isMandatory: true,
    riskScoreImpact: 0
  },
  {
    id: 'DOC-302',
    title: 'Noter Onaylı İmza Sirküleri',
    category: 'Sözleşme',
    relatedEntityId: 'KNT-7823',
    customerRef: 'Arçelik Yetkili Servis Ağı A.Ş.',
    status: 'Eksik',
    requiredByDate: '2026-10-20',
    notes: 'Mevcut sirkülerin geçerlilik süresi dolmuş. Güncel genel kurul tescili bekleniyor.',
    isMandatory: true,
    riskScoreImpact: 25
  },
  {
    id: 'DOC-303',
    title: 'KKB Kurumsal Sorgulama Muvafakatnamesi',
    category: 'Teklif',
    relatedEntityId: 'TKF-2026-095',
    customerRef: 'Hayat Kimya Sanayi A.Ş.',
    status: 'Kontrol Ediliyor',
    requiredByDate: '2026-10-22',
    uploadedAt: '2026-10-16 09:10',
    fileName: 'hayat_kimya_kkb_onay_imzali.pdf',
    fileSize: '840 KB',
    notes: 'Hukuk departmanı kaşe ve imza yetkisini doğruluyor.',
    isMandatory: true,
    riskScoreImpact: 10
  },
  {
    id: 'DOC-304',
    title: 'Mali Tablolar (Son 2 Yıl Bilanço & Gelir Tablosu)',
    category: 'Sözleşme',
    relatedEntityId: 'KNT-7823',
    customerRef: 'Arçelik Yetkili Servis Ağı A.Ş.',
    status: 'Bekleniyor',
    requiredByDate: '2026-10-21',
    notes: 'Mali müşavir onaylı 2024 ve 2025 geçici vergi beyannameleri istendi.',
    isMandatory: true,
    riskScoreImpact: 20
  },
  {
    id: 'DOC-305',
    title: 'Yetkili Servis Erken İade Ekspertiz Raporu',
    category: 'Erken İade',
    relatedEntityId: 'KNT-7822',
    customerRef: 'Ekol Uluslararası Taşımacılık',
    status: 'Alındı',
    requiredByDate: '2026-10-15',
    uploadedAt: '2026-10-11 11:00',
    fileName: 'peugeot3008_ekspertiz_hasar_raporu.pdf',
    fileSize: '4.8 MB',
    notes: 'TÜV onaylı bağımsız ekspertiz. 18.400 TL amortisman farkı saptandı.',
    isMandatory: true,
    riskScoreImpact: 0
  },
  {
    id: 'DOC-306',
    title: 'Aşırı KM Telematik & Servis Odometre Teyit Formu',
    category: 'Zeyilname',
    relatedEntityId: 'KNT-7824',
    customerRef: 'Trendyol Express Filo Operasyonları',
    status: 'Onaylandı',
    requiredByDate: '2026-10-15',
    uploadedAt: '2026-10-14 16:00',
    fileName: 'telematik_odometre_dökümü_25arac.xlsx',
    fileSize: '320 KB',
    notes: 'Ford Otosan yetkili servis ve OBD telematik verileri örtüşüyor.',
    isMandatory: true,
    riskScoreImpact: 0
  },
  {
    id: 'DOC-307',
    title: 'HGS Geçiş Logları ve İtiraz Detay Dokümanı',
    category: 'Fatura İtirazı',
    relatedEntityId: 'ITR-501',
    customerRef: 'Şişecam Cam Pazarlama A.Ş.',
    status: 'Onaylandı',
    requiredByDate: '2026-10-17',
    uploadedAt: '2026-10-15 15:30',
    fileName: 'hgs_gecis_detay_mukerrer_tespit.pdf',
    fileSize: '1.9 MB',
    notes: 'Mükerrer çekilen 2.100 TL Karayolları sorgusu ile doğrulandı.',
    isMandatory: false,
    riskScoreImpact: 0
  }
];

export const initialDisputes: InvoiceDispute[] = [
  {
    id: 'ITR-501',
    customerRef: 'Şişecam Cam Pazarlama A.Ş.',
    customerCode: 'CUST-520',
    invoiceRef: 'FAT-2026-9481',
    category: 'Sözleşme Uyuşmazlığı',
    amountUnderReview: 14250,
    dateOpened: '2026-10-15',
    assignedTeamOrOwner: 'Can Demir',
    status: 'Onay Bekliyor',
    nextAction: 'Operasyon direktöründen 14.250 TL tutarındaki düzeltme fişi onayı bekleniyor',
    dueDate: '2026-10-24',
    notes: [
      { id: 'dn-1', author: 'Can Demir', date: '2026-10-15 14:30', text: 'Müşteri ikame araç segment farkı (12.150 TL) ve mükerrer HGS (2.100 TL) için itiraz açtı.' },
      { id: 'dn-2', author: 'Can Demir', date: '2026-10-16 11:00', text: 'İnceleme tamamlandı; itiraz haklı bulundu, iade dekontu hazırlandı.' }
    ],
    resolutionDetails: '14.250 TL tutarındaki düzeltme iade faturası kesilecek ve cari hesaptan mahsup edilecek.',
    relatedTaskId: 'TSK-1045'
  },
  {
    id: 'ITR-502',
    customerRef: 'Getir Perakende Lojistik A.Ş.',
    customerCode: 'CUST-814',
    invoiceRef: 'FAT-2026-8812',
    category: 'Hatalı Tutar',
    amountUnderReview: 11600,
    dateOpened: '2026-10-09',
    assignedTeamOrOwner: 'Can Demir',
    status: 'Müşteri Görüşmesi',
    nextAction: '3.200 TL ceza iptal edilirken 8.400 TL hasar bedelinin müşteri tarafından karşılanması kabul ettirilecek',
    dueDate: '2026-10-16',
    notes: [
      { id: 'dn-3', author: 'Can Demir', date: '2026-10-09 13:40', text: 'Trafik cezası parkur saatine denk geldiği için şirketimizce iptal edilecek.' }
    ],
    relatedTaskId: 'TSK-1048'
  },
  {
    id: 'ITR-503',
    customerRef: 'Borusan Lojistik Dağıtım A.Ş.',
    customerCode: 'CUST-104',
    invoiceRef: 'FAT-2026-7910',
    category: 'Çift Fatura',
    amountUnderReview: 28500,
    dateOpened: '2026-10-02',
    assignedTeamOrOwner: 'Can Demir',
    status: 'Çözümlendi (İptal/Düzeltme)',
    nextAction: 'Dosya kapandı. İptal faturası muhasebeye işlendi.',
    dueDate: '2026-10-10',
    notes: [
      { id: 'dn-4', author: 'Can Demir', date: '2026-10-02 16:00', text: 'Aylık kira faturası entegrasyon tekerrürü sebebiyle iki defa düzenlenmiş.' },
      { id: 'dn-5', author: 'Zeynep Koç', date: '2026-10-04 10:15', text: 'Mükerrer fatura iptal edildi, müşteri mutabakat mektubu imzalandı.' }
    ],
    resolutionDetails: 'FAT-2026-7910 nolu mükerrer fatura GİB e-Fatura iptal portalından iptal edildi.'
  },
  {
    id: 'ITR-504',
    customerRef: 'Ekol Uluslararası Taşımacılık',
    customerCode: 'CUST-218',
    invoiceRef: 'FAT-2026-9022',
    category: 'Eksik Destekleyici Belge',
    amountUnderReview: 6750,
    dateOpened: '2026-10-12',
    assignedTeamOrOwner: 'Deniz Yılmaz',
    status: 'İncelemede',
    nextAction: 'Anlaşmalı lastik bayisinden kışlık lastik değişim fişi temin edilip faturaya eklenecek',
    dueDate: '2026-10-21',
    notes: [
      { id: 'dn-6', author: 'Deniz Yılmaz', date: '2026-10-12 17:00', text: 'Müşteri lastik oteli depolama faturasında plaka detay dökümünü talep ediyor.' }
    ]
  }
];

export const initialAutomationRules: AutomationRule[] = [
  {
    id: 'RULE-1',
    name: 'Proaktif Sözleşme Bitişi & Otomatik Teklif',
    trigger: 'Sözleşme bitişine T-120, T-90 veya T-60 gün kalması',
    conditions: 'Aktif yenileme teklifi veya açık görevi bulunmayan, kara listede olmayan sözleşmeler',
    suggestedAction: 'İş kuyruğunda "Öncelikli Yenileme" görevi aç, muadil araçlı taslak teklif oluştur ve portföy yöneticisine ata',
    enabled: true,
    lastEvaluated: '2026-10-19 09:00',
    matchedCount: 2,
    category: 'Yenileme',
    parameters: {
      alertDaysThreshold: 90,
      autoAssignRole: 'Sözleşme & Yenileme Yöneticisi'
    },
    description: 'Sözleşmesi bitmek üzere olan müşterileri zamanında yakalayarak portföy kaybını önler.',
    estimatedHoursSavedPerMonth: 18
  },
  {
    id: 'RULE-2',
    name: 'Aşırı KM Erken Uyarı & Zeyilname Önerisi',
    trigger: 'Servis bakımı veya telematik OBD üzerinden yeni odometre KM okuması kaydedildiğinde',
    conditions: 'Yıllık sözleşme limitinin projeksiyon bazında %15 üzerinde seyretmesi',
    suggestedAction: '"Aşırı KM Zeyilname Önerisi" görevi aç, finansal aşım bedelini hesapla ve müşteriye ek kira sözleşme taslağı hazırla',
    enabled: true,
    lastEvaluated: '2026-10-19 09:00',
    matchedCount: 2,
    category: 'KM Aşımı',
    parameters: {
      overagePercentageThreshold: 15,
      calculatePenaltyExposure: 'Aktif'
    },
    description: 'Dönem sonu tahsilat risklerini önler ve erken aşamada karlı zeyilname dönüşümü sağlar.',
    estimatedHoursSavedPerMonth: 14
  },
  {
    id: 'RULE-3',
    name: 'Akıllı Evrak Takip & Uyumluluk Risk Skoru',
    trigger: 'Teklif "Kabul Edildi" durumuna geçtiğinde veya sözleşme taslak olarak açıldığında',
    conditions: 'Zorunlu kurumsal evraklardan (Vergi Levhası, İmza Sirküleri, Bilanço, KKB) herhangi birinin eksik veya süresinin dolmuş olması',
    suggestedAction: 'Eksik Evrak Risk Skoru hesapla, kategorize kontrol görevi aç ve müşteriye tek tıkla evrak yükleme bağlantı taslağı üret',
    enabled: true,
    lastEvaluated: '2026-10-19 09:00',
    matchedCount: 2,
    category: 'Evrak',
    parameters: {
      mandatoryDocCount: 4,
      escalateIfRiskAbove: 30
    },
    description: 'Eksik evrak kaynaklı operasyonel teslimat gecikmelerini ve hukuki riskleri ortadan kaldırır.',
    estimatedHoursSavedPerMonth: 12
  },
  {
    id: 'RULE-4',
    name: 'Hızlı Teklif Onayı (Fast-Track Approval)',
    trigger: 'Yeni bir teklif dahili onaya gönderildiğinde',
    conditions: 'Araç sayısı <= 5, hesaplanan brüt kar marjı >= %14.0 ve müşteri kredi skoru "Düşük Risk / A+"',
    suggestedAction: 'Teklif durumunu anında "Onaylandı (Fast-Track)" olarak güncelle, yönetici onay kuyruğunu atla ve müşteri PDF teklifini oluştur',
    enabled: true,
    lastEvaluated: '2026-10-19 09:00',
    matchedCount: 1,
    category: 'Teklif',
    parameters: {
      maxVehicles: 5,
      minGrossMarginPercent: 14.0
    },
    description: 'Düşük riskli standart tekliflerin onay süresini 24 saatten 0 saniyeye indirir.',
    estimatedHoursSavedPerMonth: 22
  },
  {
    id: 'RULE-5',
    name: 'Darboğaz & SLA Eskalasyonu',
    trigger: 'Görev "Dış Yanıt Bekliyor" durumunda > 3 iş günü veya "Onay Bekliyor" durumunda > 24 saat kaldığında',
    conditions: 'Görev önceliği "Yüksek" veya "Kritik" olan kayıtlar',
    suggestedAction: 'Görev önceliğini yükselt, görsel SLA rozeti ekle, eskalasyon notu düş ve operasyon direktörüne bildirim oluştur',
    enabled: true,
    lastEvaluated: '2026-10-19 09:00',
    matchedCount: 3,
    category: 'SLA',
    parameters: {
      externalWaitDaysLimit: 3,
      internalApprovalHoursLimit: 24
    },
    description: 'Müşteri yanıtında veya iç onayda takılan kritik süreçlerin unutulmasını engeller.',
    estimatedHoursSavedPerMonth: 16
  },
  {
    id: 'RULE-6',
    name: 'Ön Fatura İtiraz Önleme & Gider Mutabakatı',
    trigger: 'Aylık ek gider dökümleri (HGS, ceza, hasar, ikame araç) sisteme yüklendiğinde',
    conditions: 'Ek gider kalemi sözleşme dahilinde değilse veya müşteri ön onay limitini aşıyorsa',
    suggestedAction: 'Fatura resmileşmeden önce "Ön Fatura Mutabakatı" görevi aç ve müşteriyle düzeltme taslağı üzerinden eşleş',
    enabled: true,
    lastEvaluated: '2026-10-19 09:00',
    matchedCount: 2,
    category: 'Fatura',
    parameters: {
      preBillingToleranceTRY: 500,
      autoCrossCheckHGS: 'Aktif'
    },
    description: 'Hatalı veya mutabakatsız faturaların müşteriye gitmesini engelleyerek itiraz oranını %70 düşürür.',
    estimatedHoursSavedPerMonth: 15
  }
];

export const initialDataSources: DataSourceItem[] = [
  {
    id: 'DS-1',
    name: 'Qlik Sense BI Engine',
    status: 'Bağlı değil',
    lastSync: 'Yapılandırılmadı',
    dataFreshness: 'Gerçek zamanlı planlanıyor',
    plannedMethod: 'Qlik Sense REST & Engine API Connector (OAuth2 / Client Cert)',
    notes: 'Kurumsal Qlik sunucusu bağlantısı bu demo ortamında aktif değildir. Satış analitiği simüle edilmiş veriler üzerinden gösterilmektedir.',
    recordCount: 0
  },
  {
    id: 'DS-2',
    name: 'Miles Fleet Core ERP',
    status: 'Bağlı değil',
    lastSync: 'Yapılandırılmadı',
    dataFreshness: 'Günde 4 kez batch sync planlanıyor',
    plannedMethod: 'Miles SOAP/REST Web Service Entegrasyon Katmanı',
    notes: 'Filo yönetim ERP sistemi ile doğrudan API bağlantısı bulunmamaktadır. Sözleşme ve araç telematik verileri prototip lokal veri setinden beslenir.',
    recordCount: 0
  },
  {
    id: 'DS-3',
    name: 'Manuel Operasyon Girişi & Zeyilnameler',
    status: 'Aktif',
    lastSync: 'Canlı (Reaktif)',
    dataFreshness: 'Anlık',
    plannedMethod: 'Web Formları, Satış Operasyon Portalı ve CSV/Excel İçe Aktarım',
    notes: 'Operasyon personeli tarafından oluşturulan anlık görevler, teklif revizyonları ve fatura itiraz kayıtları.',
    recordCount: 42
  },
  {
    id: 'DS-4',
    name: 'SalesOps Intelligence Demo Veri Seti',
    status: 'Aktif (Yerel Depolama)',
    lastSync: 'Şimdi',
    dataFreshness: 'Anlık Lokal Senkronize',
    plannedMethod: 'Tarayıcı Yerel Depolaması (localStorage) & Otomasyon Simülasyon Motoru',
    notes: 'Tüm metrikler, görev akışları, Fast-track kural değerlendirmeleri ve KPI hesaplamaları bu tutarlı veri havuzundan üretilmektedir.',
    recordCount: 128
  }
];

export const initialDeliveryItems: DeliveryTrackerItem[] = [
  {
    id: 'DEL-2026-01',
    orderRef: 'SIP-8821',
    customerRef: 'Borusan Lojistik Dağıtım A.Ş.',
    customerCode: 'CUST-104',
    vehicleModel: 'Renault Megane Sedan 1.3 TCe Touch EDC',
    quantity: 12,
    assignedPlates: ['34 BRS 812', '34 BRS 813', '34 BRS 814', '34 BRS 815'],
    estimatedDeliveryDate: '2026-11-05',
    overallStatus: 'Hazırlıkta (PDI/Ruhsat)',
    trackingToken: 'TRK-BRS-9912',
    steps: [
      { id: 'st-1', name: 'Distribütör Fabrika/Bayi Sipariş Onayı', status: 'Tamamlandı', completedDate: '2026-10-14', responsible: 'Burak Kaya' },
      { id: 'st-2', name: 'Yetkili Servis PDI Muayenesi & Donanım Kontrolü', status: 'Tamamlandı', completedDate: '2026-10-18', responsible: 'Deniz Yılmaz' },
      { id: 'st-3', name: 'Noter Tescil, Ruhsat & Plaka Basımı', status: 'İşlemde', responsible: 'Deniz Yılmaz' },
      { id: 'st-4', name: 'Filo Kasko & Trafik Poliçesi Tanzimi', status: 'Bekliyor', responsible: 'Selin Arslan' },
      { id: 'st-5', name: 'HGS Etiketi & Telematik OBD Montajı', status: 'Bekliyor', responsible: 'Can Demir' },
      { id: 'st-6', name: 'Lojistik Sevkiyat & Teslim Tesellüm Tutanağı', status: 'Bekliyor', responsible: 'Burak Kaya' }
    ]
  },
  {
    id: 'DEL-2026-02',
    orderRef: 'SIP-8824',
    customerRef: 'Kordsa Teknik Tekstil A.Ş.',
    customerCode: 'CUST-611',
    vehicleModel: 'Volkswagen Passat Variant 1.5 eTSI Elegance',
    quantity: 4,
    assignedPlates: ['41 KRD 701', '41 KRD 702', '41 KRD 703', '41 KRD 704'],
    estimatedDeliveryDate: '2026-10-28',
    overallStatus: 'Sevkiyatta',
    trackingToken: 'TRK-KRD-4402',
    steps: [
      { id: 'st-7', name: 'Distribütör Fabrika/Bayi Sipariş Onayı', status: 'Tamamlandı', completedDate: '2026-10-09', responsible: 'Burak Kaya' },
      { id: 'st-8', name: 'Yetkili Servis PDI Muayenesi & Donanım Kontrolü', status: 'Tamamlandı', completedDate: '2026-10-12', responsible: 'Deniz Yılmaz' },
      { id: 'st-9', name: 'Noter Tescil, Ruhsat & Plaka Basımı', status: 'Tamamlandı', completedDate: '2026-10-15', responsible: 'Deniz Yılmaz' },
      { id: 'st-10', name: 'Filo Kasko & Trafik Poliçesi Tanzimi', status: 'Tamamlandı', completedDate: '2026-10-16', responsible: 'Selin Arslan' },
      { id: 'st-11', name: 'HGS Etiketi & Telematik OBD Montajı', status: 'Tamamlandı', completedDate: '2026-10-17', responsible: 'Can Demir' },
      { id: 'st-12', name: 'Lojistik Sevkiyat & Teslim Tesellüm Tutanağı', status: 'İşlemde', responsible: 'Burak Kaya' }
    ]
  },
  {
    id: 'DEL-2026-03',
    orderRef: 'SIP-8830',
    customerRef: 'Şişecam Cam Pazarlama A.Ş.',
    customerCode: 'CUST-520',
    vehicleModel: 'Škoda Octavia Combi 1.5 e-TEC',
    quantity: 6,
    assignedPlates: ['34 SCM 441', '34 SCM 442'],
    estimatedDeliveryDate: '2026-11-20',
    overallStatus: 'Sipariş Alındı',
    trackingToken: 'TRK-SCM-1108',
    steps: [
      { id: 'st-13', name: 'Distribütör Fabrika/Bayi Sipariş Onayı', status: 'Tamamlandı', completedDate: '2026-10-18', responsible: 'Burak Kaya' },
      { id: 'st-14', name: 'Yetkili Servis PDI Muayenesi & Donanım Kontrolü', status: 'Bekliyor', responsible: 'Deniz Yılmaz' },
      { id: 'st-15', name: 'Noter Tescil, Ruhsat & Plaka Basımı', status: 'Bekliyor', responsible: 'Deniz Yılmaz' },
      { id: 'st-16', name: 'Filo Kasko & Trafik Poliçesi Tanzimi', status: 'Bekliyor', responsible: 'Selin Arslan' },
      { id: 'st-17', name: 'HGS Etiketi & Telematik OBD Montajı', status: 'Bekliyor', responsible: 'Can Demir' },
      { id: 'st-18', name: 'Lojistik Sevkiyat & Teslim Tesellüm Tutanağı', status: 'Bekliyor', responsible: 'Burak Kaya' }
    ]
  }
];

export const initialCreditRecords: CreditCheckRecord[] = [
  {
    id: 'KKB-401',
    vkn: '1800293810',
    companyName: 'Borusan Lojistik Dağıtım A.Ş.',
    inquiryDate: '2026-10-18',
    kkbScore: 1740,
    riskTier: 'Düşük Risk / A+',
    recommendedLimitTRY: 12000000,
    existingExposureTRY: 4200000,
    availableLimitTRY: 7800000,
    requiredCollateralType: 'Teminatsız / Açık Limit',
    requiredCollateralAmountTRY: 0,
    financialSummary: {
      turnoverTRY: 840000000,
      equityTRY: 290000000,
      netProfitTRY: 62000000,
      year: 2025
    },
    evaluationOutcome: 'Fast-Track Onaylandı'
  },
  {
    id: 'KKB-402',
    vkn: '3310892019',
    companyName: 'Ekol Uluslararası Taşımacılık',
    inquiryDate: '2026-10-17',
    kkbScore: 1480,
    riskTier: 'Orta Risk / B',
    recommendedLimitTRY: 6500000,
    existingExposureTRY: 5100000,
    availableLimitTRY: 1400000,
    requiredCollateralType: 'Doğrudan Borçlandırma (DBS)',
    requiredCollateralAmountTRY: 1500000,
    financialSummary: {
      turnoverTRY: 410000000,
      equityTRY: 85000000,
      netProfitTRY: 18000000,
      year: 2025
    },
    evaluationOutcome: 'Ek Teminat Şartlı'
  },
  {
    id: 'KKB-403',
    vkn: '0710294821',
    companyName: 'Arçelik Yetkili Servis Ağı A.Ş.',
    inquiryDate: '2026-10-15',
    kkbScore: 1610,
    riskTier: 'Düşük Risk / A+',
    recommendedLimitTRY: 8000000,
    existingExposureTRY: 2200000,
    availableLimitTRY: 5800000,
    requiredCollateralType: 'Banka Teminat Mektubu',
    requiredCollateralAmountTRY: 1000000,
    financialSummary: {
      turnoverTRY: 320000000,
      equityTRY: 110000000,
      netProfitTRY: 28000000,
      year: 2025
    },
    evaluationOutcome: 'Komite Onayı Bekliyor'
  },
  {
    id: 'KKB-404',
    vkn: '8100293049',
    companyName: 'Getir Perakende Lojistik A.Ş.',
    inquiryDate: '2026-10-12',
    kkbScore: 1320,
    riskTier: 'Yüksek Risk / C',
    recommendedLimitTRY: 4000000,
    existingExposureTRY: 4500000,
    availableLimitTRY: 0,
    requiredCollateralType: 'Müşterek Senet / Gayrimenkul İpoteği',
    requiredCollateralAmountTRY: 3000000,
    financialSummary: {
      turnoverTRY: 650000000,
      equityTRY: 42000000,
      netProfitTRY: -14000000,
      year: 2025
    },
    evaluationOutcome: 'Reddedildi'
  }
];

export const initialExpenseDiscrepancies: ExpenseDiscrepancyItem[] = [
  {
    id: 'EXP-101',
    batchId: 'BATCH-2026-10-A',
    plate: '34 TYL 300',
    expenseType: 'HGS Otoyol Geçişi',
    eventDateTime: '2026-10-12 14:22',
    amountTRY: 485.50,
    contractRef: 'KNT-7824',
    customerRef: 'Trendyol Express Filo Operasyonları',
    isVehicleInCustomerCustody: true,
    reconciliationStatus: 'Müşteriye Faturalanacak',
    notes: 'Kuzey Marmara Otoyolu geçişi. Kiralama saatleriyle birebir örtüşüyor.'
  },
  {
    id: 'EXP-102',
    batchId: 'BATCH-2026-10-A',
    plate: '34 EKL 491',
    expenseType: 'Trafik İdari Para Cezası',
    eventDateTime: '2026-10-08 09:15',
    amountTRY: 3135.00,
    contractRef: 'KNT-7822',
    customerRef: 'Ekol Uluslararası Taşımacılık',
    isVehicleInCustomerCustody: false,
    reconciliationStatus: 'Şirket İçi İptal (İkame/Parkur)',
    notes: 'Ceza saatinde araç yetkili serviste bakımda ve şirket test sürüşündeydi. Müşteriye yansıtılamaz.'
  },
  {
    id: 'EXP-103',
    batchId: 'BATCH-2026-10-B',
    plate: '34 SCM 441',
    expenseType: 'İkame Araç Segment Farkı',
    eventDateTime: '2026-10-14 11:00',
    amountTRY: 8400.00,
    contractRef: 'KNT-7825',
    customerRef: 'Şişecam Cam Pazarlama A.Ş.',
    isVehicleInCustomerCustody: true,
    reconciliationStatus: 'İnceleme Gerektiriyor',
    notes: 'Müşteri sözleşmesinde C-segment yerine D-segment ikame tahsis edilmiş. Faturaya eklenmeden önce onay gerekiyor.'
  },
  {
    id: 'EXP-104',
    batchId: 'BATCH-2026-10-B',
    plate: '06 ARC 119',
    expenseType: 'HGS Otoyol Geçişi',
    eventDateTime: '2026-10-16 18:40',
    amountTRY: 620.00,
    contractRef: 'KNT-7823',
    customerRef: 'Arçelik Yetkili Servis Ağı A.Ş.',
    isVehicleInCustomerCustody: true,
    reconciliationStatus: 'Müşteriye Faturalanacak',
    notes: 'Osmangazi Köprüsü geçişi; müşteri onaylı filo kartına kaydedildi.'
  }
];

export const initialCustomerPortalRequests: CustomerPortalRequest[] = [
  {
    id: 'REQ-901',
    customerRef: 'Borusan Lojistik Dağıtım A.Ş.',
    requestType: 'Ek Araç Talebi',
    dateSubmitted: '2026-10-17 10:30',
    status: 'Yeni',
    details: 'Marmara bölgesi dağıtım filosu için acil 5 adet hafif ticari Ford Courier ihtiyacı doğmuştur.',
    contactPerson: 'Ahmet Karaca (Lojistik Filo Müdürü)'
  },
  {
    id: 'REQ-902',
    customerRef: 'Trendyol Express Filo Operasyonları',
    requestType: 'KM Limiti Yükseltme',
    plate: '34 TYL 300',
    dateSubmitted: '2026-10-16 15:45',
    status: 'Teklif Hazırlandı',
    details: '25 araçlık filo için yıllık 40.000 KM limiti 55.000 KM ye revize edilmek isteniyor. TKF-2026-094 inceleniyor.',
    contactPerson: 'Merve Aydın (Operasyon Satın Alma)'
  },
  {
    id: 'REQ-903',
    customerRef: 'Ekol Uluslararası Taşımacılık',
    requestType: 'Erken İade Başvurusu',
    plate: '34 EKL 491',
    dateSubmitted: '2026-10-10 11:20',
    status: 'Değerlendiriliyor',
    details: '3008 aracın proje bitişi sebebiyle 9 ay erken iadesi ve zeyilname düzenlenmesi talebi.',
    contactPerson: 'Serdar Güven (İdari İşler Müdürü)'
  }
];

