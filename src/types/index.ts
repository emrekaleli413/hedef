export type ProcessType =
  | 'Teklif Hazırlama'
  | 'Sözleşme Yenileme'
  | 'Erken İade'
  | 'Aşırı KM'
  | 'Evrak Takibi'
  | 'Fatura İtirazı'
  | 'Müşteri Takibi';

export type TaskPriority = 'Düşük' | 'Orta' | 'Yüksek' | 'Kritik';

export type TaskStatus =
  | 'Yeni'
  | 'İşlemde'
  | 'Onay Bekliyor'
  | 'Dış Yanıt Bekliyor'
  | 'Tamamlandı'
  | 'İptal';

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskNote {
  id: string;
  author: string;
  timestamp: string;
  text: string;
}

export interface TaskHistoryItem {
  id: string;
  timestamp: string;
  user: string;
  action: string;
}

export type PortfolioMode = 'B2B' | 'B2C';

export interface Task {
  id: string;
  title: string;
  processType: ProcessType;
  customerRef: string;
  customerCode: string;
  sourceSystem: 'Miles' | 'Qlik' | 'Manuel' | 'Otomasyon Motoru';
  owner: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  dueDate: string;
  nextAction: string;
  waitingDuration: string;
  waitingDays: number;
  blocker: string;
  whatNeedsToBeDone: string;
  checklist: TaskChecklistItem[];
  notes: TaskNote[];
  history: TaskHistoryItem[];
  relatedQuoteId?: string;
  relatedContractId?: string;
  relatedDisputeId?: string;
  isOverdue?: boolean;
  isSlaBreached?: boolean;
  // B2B vs. B2C Portfolio Mode
  segment?: 'B2B' | 'B2C';
  tckn?: string;
  creditCardStatus?: 'Provizyon Başarılı' | 'Limit Yetersiz' | 'Kart Kapalı' | 'Provizyon Bekliyor';
  drivingLicenseYears?: number;
  rightOfWithdrawalDaysRemaining?: number;
  findeksScore?: number;
}

export type QuotationType =
  | 'Yeni Teklif'
  | 'Teklif Revizyonu'
  | 'Erken Araç İadesi'
  | 'Aşırı KM Zeyilnamesi'
  | 'Sözleşme Yenileme';

export type QuotationStatus =
  | 'Taslak'
  | 'İnceleniyor'
  | 'Onay Bekliyor'
  | 'Onaylandı (Fast-Track)'
  | 'Onaylandı'
  | 'Gönderildi'
  | 'Kabul Edildi'
  | 'Reddedildi'
  | 'Süresi Doldu';

export type QuotationLossReason =
  | 'Yüksek Fiyat'
  | 'Teslimat Süresi Uzun'
  | 'Rakip Tercih Edildi'
  | 'Bütçe İptali'
  | 'Özellik Uyumsuzluğu'
  | 'Kredi Skoru Yetersiz';

export interface QuotationVersion {
  version: number;
  date: string;
  vehicleCount: number;
  monthlyRentPerVehicle: number;
  grossMarginPercent: number;
  status: string;
  notes: string;
  author: string;
}

export interface QuotationCalculationDetails {
  formulaDescription: string;
  parametersApplied: Record<string, string | number | undefined>;
  itemizedCharges: {
    description: string;
    calculationNote?: string;
    amountTRY: number;
  }[];
  subtotalTRY: number;
  vatRatePercent: number;
  vatAmountTRY: number;
  grandTotalTRY: number;
  assumptions: string[];
  costBreakdown?: {
    vehicleFinancingDepreciation?: number;
    insuranceAndCasko?: number;
    maintenanceAndWear?: number;
    tyreManagement?: number;
    motorVehicleTaxMTV?: number;
  };
}

export interface Quotation {
  id: string;
  customerRef: string;
  customerCode: string;
  quotationType: QuotationType;
  vehicleCount: number;
  vehicleModel: string;
  termMonths: number;
  annualKm: number;
  monthlyRentPerVehicle: number;
  totalMonthlyAmount: number;
  grossMarginPercent: number;
  customerCreditScore: 'Düşük Risk / A+' | 'Orta Risk / B' | 'Yüksek Risk / C';
  owner: string;
  status: QuotationStatus;
  lossReason?: QuotationLossReason;
  createdAt: string;
  lastUpdatedAt: string;
  validityDate: string;
  notes: string;
  versions: QuotationVersion[];
  isFastTrackEligible?: boolean;
  relatedContractId?: string;
  calculationDetails?: QuotationCalculationDetails;
  excessMileageKm?: number;
  earlyReturnMonthsRemaining?: number;
  renewalAdjustmentPercent?: number;
}

export type RenewalStatus =
  | 'Yenileme Bekliyor'
  | 'Görüşülüyor'
  | 'Teklif İletildi'
  | 'Yenilendi'
  | 'İade Edilecek'
  | 'Riskli Portföy';

export interface Contract {
  id: string;
  customerRef: string;
  customerCode: string;
  vehicleModel: string;
  plate: string;
  vehicleCount: number;
  startDate: string;
  endDate: string;
  renewalStatus: RenewalStatus;
  assignedOwner: string;
  nextAction: string;
  daysUntilRenewal: number;
  contractLimitKm: number;
  currentOdometerKm: number;
  projectedOverKmPercent: number;
  churnRisk: 'Düşük' | 'Orta' | 'Yüksek' | 'Kara Liste';
  hasRenewalTask: boolean;
  renewalTaskId?: string;
  monthlyRentAmount: number;
  segment?: 'B2B' | 'B2C';
  tckn?: string;
  paymentMethod?: 'Kredi Kartı Otomatik Çekim' | 'DBS' | 'Banka Havalesi / Cari Hesap';
  depositBlockedAmountTRY?: number;
  rightOfWithdrawalDaysRemaining?: number;
  clmStage?: CLMStage;
  clmStageUpdatedAt?: string;
  terminationNoticeDays?: number;
  terminationConditions?: string;
  renewalConditions?: string;
  earlyTerminationPenaltyRate?: number;
  soficoContractId?: string;
  soficoSyncStatus?: 'synced' | 'pending' | 'out_of_sync';
  lastSoficoSync?: string;
  paperworkFolderId?: string;
  paperworkDocCount?: number;
  responsibleDepartment?: string;
  internalNotes?: string[];
  linkedAmendments?: Array<{
    id: string;
    title: string;
    date: string;
    type: string;
    status: string;
  }>;
  missingDocuments?: string[];
}

export type SupplierCategory =
  | 'authorized_service'
  | 'tire_supply'
  | 'road_assistance'
  | 'spare_parts'
  | 'vehicle_procurement'
  | 'inspection'
  | 'insurance';

export interface SupplierContract {
  id: string;
  supplierName: string;
  taxNumber: string;
  category: SupplierCategory;
  categoryLabel: string;
  startDate: string;
  endDate: string;
  status: 'Aktif' | 'İncelemede' | 'Süresi Dolmak Üzere' | 'Feshedildi' | 'Yenilendi';
  daysUntilExpiry: number;
  responsiblePerson: string;
  responsibleDepartment: string;
  contactEmail: string;
  contactPhone: string;
  slaCommitment: string;
  discountRatePercent?: number;
  paymentTermDays: number;
  annualVolumeTRY: number;
  terminationNoticeDays: number;
  terminationConditions: string;
  renewalConditions: string;
  riskScore: 'A+' | 'A' | 'B' | 'C' | 'Kritik';
  soficoSupplierId: string;
  soficoSyncStatus: 'synced' | 'pending' | 'out_of_sync';
  lastSoficoSync?: string;
  paperworkFolderId: string;
  paperworkDocCount: number;
  missingDocuments: string[];
  documents: Array<{
    id: string;
    title: string;
    type: string;
    uploadedAt: string;
    expiryDate?: string;
    fileName: string;
    status: 'valid' | 'expiring_soon' | 'expired';
  }>;
  internalNotes: string[];
  amendments: Array<{
    id: string;
    title: string;
    date: string;
    type: string;
    status: string;
  }>;
}

export type CLMStage =
  | 'draft'
  | 'internal_review'
  | 'negotiation'
  | 'signature_pending'
  | 'active_in_force'
  | 'addendum_in_review'
  | 'renewal_pending'
  | 'closed_archived';

export interface ContractClauseTemplate {
  id: string;
  category: 'mileage' | 'insurance' | 'termination' | 'indexation' | 'maintenance' | 'general';
  title: string;
  code: string;
  standardText: string;
  riskLevel: 'standard' | 'moderate' | 'high_risk';
  legalApprovedDate: string;
  approvedBy: string;
  applicableQuotationTypes?: Array<'excess_mileage' | 'early_return' | 'contract_renewal'>;
}

export interface ContractVaultDocument {
  id: string;
  contractId: string;
  customerRef: string;
  docType: 'master_contract' | 'delivery_protocol' | 'guarantee_letter' | 'signature_circular' | 'addendum' | 'insurance_policy';
  title: string;
  fileName: string;
  uploadedAt: string;
  fileSize: string;
  status: 'valid' | 'expiring_soon' | 'expired' | 'missing';
  expiryDate?: string;
  signedDate?: string;
  downloadUrl?: string;
  notes?: string;
}

export interface ContractComplianceAlert {
  id: string;
  contractId: string;
  customerTitle: string;
  alertType: 'guarantee_expiry' | 'interim_km_audit' | 'option_deadline' | 'contract_expiry' | 'maintenance_sla' | 'indexation_notice';
  partyType?: 'customer' | 'supplier' | 'internal';
  dueDate: string;
  daysRemaining: number;
  severity: 'low' | 'warning' | 'critical';
  title: string;
  description: string;
  actionRequired: string;
  penaltyOrRisk?: string;
  resolved: boolean;
}

export type DocumentCategory =
  | 'Teklif'
  | 'Sözleşme'
  | 'Zeyilname'
  | 'Erken İade'
  | 'Fatura İtirazı';

export type DocumentStatus =
  | 'Gerekli'
  | 'Bekleniyor'
  | 'Alındı'
  | 'Kontrol Ediliyor'
  | 'Eksik'
  | 'Onaylandı'
  | 'Reddedildi';

export interface DocumentItem {
  id: string;
  title: string;
  category: DocumentCategory;
  relatedEntityId: string;
  customerRef: string;
  status: DocumentStatus;
  requiredByDate: string;
  uploadedAt?: string;
  fileName?: string;
  fileSize?: string;
  notes: string;
  isMandatory: boolean;
  riskScoreImpact: number;
}

export type DisputeCategory =
  | 'Hatalı Tutar'
  | 'Çift Fatura'
  | 'Sözleşme Uyuşmazlığı'
  | 'Eksik Destekleyici Belge'
  | 'Hizmet İtirazı'
  | 'Diğer';

export type DisputeStatus =
  | 'İncelemede'
  | 'Müşteri Görüşmesi'
  | 'Onay Bekliyor'
  | 'Çözümlendi (İptal/Düzeltme)'
  | 'Reddedildi (Geçerli Fatura)';

export interface DisputeNote {
  id: string;
  author: string;
  date: string;
  text: string;
}

export interface InvoiceDispute {
  id: string;
  customerRef: string;
  customerCode: string;
  invoiceRef: string;
  category: DisputeCategory;
  amountUnderReview: number;
  dateOpened: string;
  assignedTeamOrOwner: string;
  status: DisputeStatus;
  nextAction: string;
  dueDate: string;
  notes: DisputeNote[];
  resolutionDetails?: string;
  relatedTaskId?: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  conditions: string;
  suggestedAction: string;
  enabled: boolean;
  lastEvaluated: string;
  matchedCount: number;
  category: 'Yenileme' | 'KM Aşımı' | 'Evrak' | 'Teklif' | 'SLA' | 'Fatura';
  parameters: { [key: string]: number | string };
  description: string;
  estimatedHoursSavedPerMonth: number;
}

export interface DataSourceItem {
  id: string;
  name: string;
  status: 'Bağlı' | 'Bağlı değil' | 'Aktif' | 'Aktif (Yerel Depolama)';
  lastSync: string;
  dataFreshness: string;
  plannedMethod: string;
  notes: string;
  recordCount: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  activeTasks: number;
  avatarColor: string;
}

export interface SystemSettings {
  renewalWarningDays: number;
  slaExternalResponseDays: number;
  slaApprovalHours: number;
  fastTrackMaxVehicles: number;
  fastTrackMinMarginPercent: number;
  mileageOverageThresholdPercent: number;
  // Configurable Demo Pricing Engine (Section 16.I)
  excessMileageRatePerKm: number;
  earlyReturnCompensationRatePercent: number;
  earlyReturnFixedProcessingFee: number;
  earlyReturnRefurbishmentProvision: number;
  defaultRenewalDurationMonths: number;
  defaultRenewalAdjustmentPercent: number;
  quotationValidityDays: number;
  vatTaxRatePercent: number;
}

// 1. Delivery & Preparation Tracking
export type DeliveryStepStatus = 'Tamamlandı' | 'İşlemde' | 'Bekliyor' | 'Gecikmiş';

export interface DeliveryChecklistStep {
  id: string;
  name: string;
  status: DeliveryStepStatus;
  completedDate?: string;
  responsible: string;
}

export interface DeliveryTrackerItem {
  id: string;
  orderRef: string;
  customerRef: string;
  customerCode: string;
  vehicleModel: string;
  quantity: number;
  assignedPlates: string[];
  estimatedDeliveryDate: string;
  actualDeliveryDate?: string;
  overallStatus: 'Sipariş Alındı' | 'Hazırlıkta (PDI/Ruhsat)' | 'Sevkiyatta' | 'Teslim Edildi';
  steps: DeliveryChecklistStep[];
  trackingToken: string;
}

// 2. KKB & Credit Intelligence
export interface CreditCheckRecord {
  id: string;
  vkn: string;
  companyName: string;
  inquiryDate: string;
  kkbScore: number; // 0 - 1900
  riskTier: 'Düşük Risk / A+' | 'Orta Risk / B' | 'Yüksek Risk / C' | 'Kritik Risk / D';
  recommendedLimitTRY: number;
  existingExposureTRY: number;
  availableLimitTRY: number;
  requiredCollateralType: 'Teminatsız / Açık Limit' | 'Banka Teminat Mektubu' | 'Doğrudan Borçlandırma (DBS)' | 'Müşterek Senet / Gayrimenkul İpoteği';
  requiredCollateralAmountTRY: number;
  financialSummary?: {
    turnoverTRY: number;
    equityTRY: number;
    netProfitTRY: number;
    year: number;
  };
  evaluationOutcome: 'Fast-Track Onaylandı' | 'Komite Onayı Bekliyor' | 'Ek Teminat Şartlı' | 'Reddedildi';
  // B2C Filomingo extension
  segment?: 'B2B' | 'B2C';
  tckn?: string;
  findeksScore?: number;
  drivingLicenseYears?: number;
  creditCardLimitTRY?: number;
  creditCardProvisionAmountTRY?: number;
  eDevletVerificationStatus?: 'Doğrulandı' | 'Bekliyor' | 'Reddedildi';
}

// 3. Pre-billing Expense Matching (HGS & Traffic Fines)
export interface ExpenseDiscrepancyItem {
  id: string;
  batchId: string;
  plate: string;
  expenseType: 'HGS Otoyol Geçişi' | 'Trafik İdari Para Cezası' | 'İkame Araç Segment Farkı' | 'Hasar / Ekspertiz Yansıtması';
  eventDateTime: string;
  amountTRY: number;
  contractRef: string;
  customerRef: string;
  isVehicleInCustomerCustody: boolean;
  reconciliationStatus: 'Müşteriye Faturalanacak' | 'Şirket İçi İptal (İkame/Parkur)' | 'İnceleme Gerektiriyor' | 'Faturalandı';
  notes: string;
}

// 4. Customer B2B Self-Service Request
export interface CustomerPortalRequest {
  id: string;
  customerRef: string;
  requestType: 'Ek Araç Talebi' | 'Erken İade Başvurusu' | 'Bakım / İkame Talebi' | 'KM Limiti Yükseltme' | 'Fatura İtirazı';
  plate?: string;
  dateSubmitted: string;
  status: 'Yeni' | 'Değerlendiriliyor' | 'Teklif Hazırlandı' | 'Onaylandı' | 'Kapatıldı';
  details: string;
  contactPerson: string;
}
