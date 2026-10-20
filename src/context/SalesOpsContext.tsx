import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  TaskStatus,
  QuotationStatus,
  DocumentStatus,
  DisputeStatus,
  QuotationLossReason,
  DeliveryTrackerItem,
  DeliveryStepStatus,
  CreditCheckRecord,
  ExpenseDiscrepancyItem,
  CustomerPortalRequest,
  PortfolioMode,
  CLMStage,
  ContractClauseTemplate,
  ContractVaultDocument,
  ContractComplianceAlert,
  SupplierContract
} from '../types';
import {
  initialTasks,
  initialQuotations,
  initialContracts,
  initialDocuments,
  initialDisputes,
  initialAutomationRules,
  initialDataSources,
  initialTeamMembers,
  initialSettings,
  initialDeliveryItems,
  initialCreditRecords,
  initialExpenseDiscrepancies,
  initialCustomerPortalRequests,
  initialClauseTemplates,
  initialVaultDocuments,
  initialComplianceAlerts,
  initialSupplierContracts
} from '../data/initialData';

interface NotificationMessage {
  id: string;
  text: string;
  time: string;
  type: 'info' | 'success' | 'warning';
}

interface SalesOpsContextType {
  // Portfolio Mode (B2B Hedef Filo vs. B2C Filomingo)
  portfolioMode: PortfolioMode;
  setPortfolioMode: (mode: PortfolioMode) => void;

  // Navigation & UI State
  activePage: string;
  setActivePage: (page: string) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  notifications: NotificationMessage[];
  addNotification: (text: string, type?: 'info' | 'success' | 'warning') => void;
  dismissNotification: (id: string) => void;

  // Data collections (Scoped to portfolioMode)
  tasks: Task[];
  allTasks: Task[];
  quotations: Quotation[];
  contracts: Contract[];
  allContracts: Contract[];
  documents: DocumentItem[];
  disputes: InvoiceDispute[];
  automationRules: AutomationRule[];
  dataSources: DataSourceItem[];
  teamMembers: TeamMember[];
  settings: SystemSettings;
  deliveryItems: DeliveryTrackerItem[];
  creditRecords: CreditCheckRecord[];
  allCreditRecords: CreditCheckRecord[];
  expenseDiscrepancies: ExpenseDiscrepancyItem[];
  customerPortalRequests: CustomerPortalRequest[];

  // Delivery methods
  updateDeliveryStep: (itemId: string, stepId: string, status: DeliveryStepStatus) => void;

  // Credit methods
  addCreditCheck: (record: Partial<CreditCheckRecord>) => CreditCheckRecord;

  // Expense methods
  updateExpenseStatus: (id: string, status: ExpenseDiscrepancyItem['reconciliationStatus']) => void;

  // Customer Portal methods
  addCustomerPortalRequest: (req: Partial<CustomerPortalRequest>) => CustomerPortalRequest;
  updateCustomerPortalRequestStatus: (id: string, status: CustomerPortalRequest['status']) => void;

  // Task methods
  createTask: (data: Partial<Task>) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  addTaskNote: (taskId: string, noteText: string, author?: string) => void;
  toggleChecklistItem: (taskId: string, checkId: string) => void;
  addChecklistItem: (taskId: string, text: string) => void;
  reassignTask: (taskId: string, newOwner: string) => void;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;

  // Quotation methods
  createQuotation: (data: Partial<Quotation>) => Quotation;
  updateQuotation: (quoteId: string, updates: Partial<Quotation>) => void;
  addQuotationVersion: (quoteId: string, versionData: { monthlyRent: number; margin: number; notes: string }) => void;
  updateQuotationStatus: (quoteId: string, newStatus: QuotationStatus, lossReason?: QuotationLossReason) => void;

  // Contract & Renewal methods
  createRenewalTaskForContract: (contractId: string) => { success: boolean; message: string; taskId?: string };
  updateContract: (contractId: string, updates: Partial<Contract>) => void;
  syncContractWithSofico: (id: string, isSupplier?: boolean) => Promise<boolean>;
  addContractInternalNote: (id: string, note: string, isSupplier?: boolean) => void;

  // Supplier Contracts & Management (Tedarikçi Yönetimi)
  supplierContracts: SupplierContract[];
  updateSupplierContract: (contractId: string, updates: Partial<SupplierContract>) => void;

  // CLM and Contract Library
  clauseTemplates: ContractClauseTemplate[];
  vaultDocuments: ContractVaultDocument[];
  complianceAlerts: ContractComplianceAlert[];
  updateContractCLMStage: (contractId: string, newStage: CLMStage, note?: string) => void;
  addVaultDocument: (doc: Omit<ContractVaultDocument, 'id' | 'uploadedAt'>) => ContractVaultDocument;
  resolveComplianceAlert: (alertId: string) => void;
  addClauseTemplate: (clause: Omit<ContractClauseTemplate, 'id' | 'legalApprovedDate'>) => ContractClauseTemplate;

  // Document methods
  updateDocumentStatus: (docId: string, newStatus: DocumentStatus, notes?: string) => void;
  uploadDocumentPlaceholder: (docId: string, fileName: string) => void;
  createMissingDocFollowUpTask: (docId: string) => Task;

  // Dispute methods
  createDispute: (data: Partial<InvoiceDispute>) => InvoiceDispute;
  updateDispute: (disputeId: string, updates: Partial<InvoiceDispute>) => void;
  addDisputeNote: (disputeId: string, text: string) => void;
  createDisputeFollowUpTask: (disputeId: string) => Task;

  // Automation methods
  toggleRule: (ruleId: string) => void;
  updateRuleParameter: (ruleId: string, key: string, value: any) => void;
  runRuleSimulation: (ruleId: string) => { matchedCount: number; matchedRecords: any[]; simulatedActionSummary: string };
  runAllRulesEvaluation: () => { rulesRun: number; totalMatches: number };

  // System & Settings
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetToDemoData: () => void;

  // Computed KPIs
  totalOpenTasks: number;
  overdueTasksCount: number;
  waitingApprovalCount: number;
  waitingExternalResponseCount: number;
  monthlyQuotesCount: number;
  quoteConversionRate: number;
  upcomingRenewalsCount: number;
  openDisputesCount: number;
  avgCompletionDays: number;
  missingDocRiskScore: number;
  estimatedHoursSavedWeekly: number;
}

const STORAGE_KEY = 'salesops_intelligence_store_v1';

const SalesOpsContext = createContext<SalesOpsContextType | undefined>(undefined);

export const SalesOpsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<string>('overview');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([
    {
      id: 'notif-1',
      text: 'Otomasyon Motoru: 2 sözleşme T-90 yenileme penceresine girdi.',
      time: '10 dk önce',
      type: 'info'
    },
    {
      id: 'notif-2',
      text: 'SLA Uyarısı: TSK-1042 görevi 5 gündür dış yanıt bekliyor.',
      time: '1 saat önce',
      type: 'warning'
    }
  ]);

  const [portfolioMode, setPortfolioModeState] = useState<PortfolioMode>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_portfolio_mode`);
    return (saved === 'B2C' || saved === 'B2B') ? saved : 'B2B';
  });

  const setPortfolioMode = (mode: PortfolioMode) => {
    setPortfolioModeState(mode);
    localStorage.setItem(`${STORAGE_KEY}_portfolio_mode`, mode);
    addNotification(
      mode === 'B2C'
        ? 'Filomingo B2C Bireysel Kiralama Moduna geçildi (TCKN, Findeks, Kredi Kartı).'
        : 'Hedef Filo B2B Kurumsal Filo Moduna geçildi (VKN, Bilanço, DBS).',
      'info'
    );
  };

  // Load state or default
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tasks`);
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_quotations`);
    return saved ? JSON.parse(saved) : initialQuotations;
  });

  const [contracts, setContracts] = useState<Contract[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_contracts`);
    return saved ? JSON.parse(saved) : initialContracts;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_documents`);
    return saved ? JSON.parse(saved) : initialDocuments;
  });

  const [disputes, setDisputes] = useState<InvoiceDispute[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_disputes`);
    return saved ? JSON.parse(saved) : initialDisputes;
  });

  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_rules`);
    return saved ? JSON.parse(saved) : initialAutomationRules;
  });

  const [dataSources] = useState<DataSourceItem[]>(initialDataSources);
  const [teamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    return saved ? { ...initialSettings, ...JSON.parse(saved) } : initialSettings;
  });

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_tasks`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_quotations`, JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_contracts`, JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_documents`, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_disputes`, JSON.stringify(disputes));
  }, [disputes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_rules`, JSON.stringify(automationRules));
  }, [automationRules]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
  }, [settings]);

  const [deliveryItems, setDeliveryItems] = useState<DeliveryTrackerItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_delivery`);
    return saved ? JSON.parse(saved) : initialDeliveryItems;
  });

  const [creditRecords, setCreditRecords] = useState<CreditCheckRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_credit`);
    return saved ? JSON.parse(saved) : initialCreditRecords;
  });

  const [expenseDiscrepancies, setExpenseDiscrepancies] = useState<ExpenseDiscrepancyItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_expenses`);
    return saved ? JSON.parse(saved) : initialExpenseDiscrepancies;
  });

  const [customerPortalRequests, setCustomerPortalRequests] = useState<CustomerPortalRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_portal_reqs`);
    return saved ? JSON.parse(saved) : initialCustomerPortalRequests;
  });

  const [clauseTemplates, setClauseTemplates] = useState<ContractClauseTemplate[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_clause_templates`);
    return saved ? JSON.parse(saved) : initialClauseTemplates;
  });

  const [vaultDocuments, setVaultDocuments] = useState<ContractVaultDocument[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_vault_docs`);
    return saved ? JSON.parse(saved) : initialVaultDocuments;
  });

  const [complianceAlerts, setComplianceAlerts] = useState<ContractComplianceAlert[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_compliance_alerts`);
    return saved ? JSON.parse(saved) : initialComplianceAlerts;
  });

  const [supplierContracts, setSupplierContracts] = useState<SupplierContract[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_supplier_contracts`);
    return saved ? JSON.parse(saved) : initialSupplierContracts;
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_supplier_contracts`, JSON.stringify(supplierContracts));
  }, [supplierContracts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_delivery`, JSON.stringify(deliveryItems));
  }, [deliveryItems]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_credit`, JSON.stringify(creditRecords));
  }, [creditRecords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(expenseDiscrepancies));
  }, [expenseDiscrepancies]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_portal_reqs`, JSON.stringify(customerPortalRequests));
  }, [customerPortalRequests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_clause_templates`, JSON.stringify(clauseTemplates));
  }, [clauseTemplates]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_vault_docs`, JSON.stringify(vaultDocuments));
  }, [vaultDocuments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_compliance_alerts`, JSON.stringify(complianceAlerts));
  }, [complianceAlerts]);

  // Scoped views based on active portfolio mode (B2B Hedef Filo vs. B2C Filomingo)
  const scopedTasks = useMemo(() => {
    return tasks.filter(t => !t.segment || t.segment === portfolioMode);
  }, [tasks, portfolioMode]);

  const scopedContracts = useMemo(() => {
    return contracts.filter(c => !c.segment || c.segment === portfolioMode);
  }, [contracts, portfolioMode]);

  const scopedCreditRecords = useMemo(() => {
    return creditRecords.filter(r => !r.segment || r.segment === portfolioMode);
  }, [creditRecords, portfolioMode]);

  // Delivery methods
  const updateDeliveryStep = (itemId: string, stepId: string, status: DeliveryStepStatus) => {
    const nowStr = new Date().toISOString().split('T')[0];
    setDeliveryItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const updatedSteps = item.steps.map(s =>
            s.id === stepId ? { ...s, status, completedDate: status === 'Tamamlandı' ? nowStr : undefined } : s
          );
          const allCompleted = updatedSteps.every(s => s.status === 'Tamamlandı');
          const isShipping = updatedSteps.slice(0, 4).every(s => s.status === 'Tamamlandı');
          return {
            ...item,
            steps: updatedSteps,
            overallStatus: allCompleted
              ? 'Teslim Edildi'
              : isShipping
              ? 'Sevkiyatta'
              : 'Hazırlıkta (PDI/Ruhsat)'
          };
        }
        return item;
      })
    );
    addNotification('Teslimat hazırlık adımı güncellendi.', 'success');
  };

  // Credit methods
  const addCreditCheck = (record: Partial<CreditCheckRecord>): CreditCheckRecord => {
    const newId = `KKB-${Math.floor(400 + Math.random() * 500)}`;
    const nowStr = new Date().toISOString().split('T')[0];
    const newRecord: CreditCheckRecord = {
      id: newId,
      vkn: record.vkn || '1000000000',
      companyName: record.companyName || 'Sorgulanan Firma',
      inquiryDate: nowStr,
      kkbScore: record.kkbScore || 1550,
      riskTier: record.riskTier || 'Düşük Risk / A+',
      recommendedLimitTRY: record.recommendedLimitTRY || 8000000,
      existingExposureTRY: record.existingExposureTRY || 2000000,
      availableLimitTRY: (record.recommendedLimitTRY || 8000000) - (record.existingExposureTRY || 2000000),
      requiredCollateralType: record.requiredCollateralType || 'Banka Teminat Mektubu',
      requiredCollateralAmountTRY: record.requiredCollateralAmountTRY || 1000000,
      financialSummary: record.financialSummary || {
        turnoverTRY: 400000000,
        equityTRY: 120000000,
        netProfitTRY: 35000000,
        year: 2025
      },
      evaluationOutcome: record.evaluationOutcome || 'Fast-Track Onaylandı'
    };
    setCreditRecords(prev => [newRecord, ...prev]);
    addNotification(`KKB Kredi istihbaratı kaydedildi: ${newRecord.companyName}`, 'info');
    return newRecord;
  };

  // Expense methods
  const updateExpenseStatus = (id: string, status: ExpenseDiscrepancyItem['reconciliationStatus']) => {
    setExpenseDiscrepancies(prev =>
      prev.map(item => (item.id === id ? { ...item, reconciliationStatus: status } : item))
    );
    addNotification(`Ek gider mutabakat durumu: ${status}`, 'info');
  };

  // Customer Portal methods
  const addCustomerPortalRequest = (req: Partial<CustomerPortalRequest>): CustomerPortalRequest => {
    const newId = `REQ-${Math.floor(900 + Math.random() * 99)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newReq: CustomerPortalRequest = {
      id: newId,
      customerRef: req.customerRef || 'Müşteri',
      requestType: req.requestType || 'Ek Araç Talebi',
      plate: req.plate,
      dateSubmitted: nowStr,
      status: 'Yeni',
      details: req.details || 'Portal üzerinden iletilen talep.',
      contactPerson: req.contactPerson || 'Filo Yöneticisi'
    };
    setCustomerPortalRequests(prev => [newReq, ...prev]);

    // Also automatically create an operational task in Task Queue!
    createTask({
      title: `${newReq.customerRef} - B2B Portal Talebi: ${newReq.requestType}`,
      processType: newReq.requestType === 'Erken İade Başvurusu' ? 'Erken İade' : 'Müşteri Takibi',
      customerRef: newReq.customerRef,
      customerCode: 'CUST-PORTAL',
      sourceSystem: 'Manuel',
      owner: 'Deniz Yılmaz',
      priority: 'Yüksek',
      status: 'Yeni',
      whatNeedsToBeDone: `${newReq.contactPerson} tarafından B2B Müşteri Portalından iletilen ${newReq.requestType} değerlendirilecek: ${newReq.details}`,
      nextAction: 'Müşteri yetkilisi ile irtibata geçilip talep teyit edilecek'
    });

    addNotification(`B2B Portaldan yeni talep alındı (${newReq.id}) ve iş kuyruğuna aktarıldı.`, 'success');
    return newReq;
  };

  const updateCustomerPortalRequestStatus = (id: string, status: CustomerPortalRequest['status']) => {
    setCustomerPortalRequests(prev =>
      prev.map(req => (req.id === id ? { ...req, status } : req))
    );
  };

  const addNotification = (text: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const newNotif: NotificationMessage = {
      id: `notif-${Date.now()}`,
      text,
      time: 'Az önce',
      type
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 9)]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Task Operations
  const createTask = (data: Partial<Task>): Task => {
    const newId = `TSK-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toISOString().split('T')[0];
    const newTask: Task = {
      id: newId,
      title: data.title || 'Yeni Görev',
      processType: data.processType || 'Teklif Hazırlama',
      customerRef: data.customerRef || 'Bilinmeyen Müşteri',
      customerCode: data.customerCode || 'CUST-999',
      sourceSystem: data.sourceSystem || 'Manuel',
      owner: data.owner || 'Burak Kaya',
      priority: data.priority || 'Orta',
      status: data.status || 'Yeni',
      createdAt: nowStr,
      dueDate: data.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      nextAction: data.nextAction || 'İlk inceleme başlatılacak',
      waitingDuration: '0 gün',
      waitingDays: 0,
      blocker: data.blocker || 'Engel bulunmuyor',
      whatNeedsToBeDone: data.whatNeedsToBeDone || 'Görev detayları tanımlandı.',
      checklist: data.checklist || [
        { id: `chk-${Date.now()}-1`, text: 'Ön talep değerlendirmesi yapıldı', completed: true },
        { id: `chk-${Date.now()}-2`, text: 'Müşteri ile iletişim kuruldu', completed: false }
      ],
      notes: [
        { id: `nt-${Date.now()}`, author: data.owner || 'Sistem', timestamp: `${nowStr} 10:00`, text: 'Görev oluşturuldu.' }
      ],
      history: [
        { id: `h-${Date.now()}`, timestamp: `${nowStr} 10:00`, user: data.owner || 'Sistem', action: 'Görev oluşturuldu' }
      ],
      relatedContractId: data.relatedContractId,
      relatedQuoteId: data.relatedQuoteId,
      relatedDisputeId: data.relatedDisputeId,
      isOverdue: false,
      isSlaBreached: false,
      segment: data.segment || portfolioMode,
      tckn: data.tckn,
      creditCardStatus: data.creditCardStatus,
      findeksScore: data.findeksScore,
      drivingLicenseYears: data.drivingLicenseYears,
      rightOfWithdrawalDaysRemaining: data.rightOfWithdrawalDaysRemaining
    };

    setTasks(prev => [newTask, ...prev]);
    addNotification(`"${newTask.title}" görevi oluşturuldu (${newTask.id})`, 'success');
    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
          const historyEntry = {
            id: `h-${Date.now()}`,
            timestamp: now,
            user: 'Kullanıcı',
            action: 'Görev bilgileri güncellendi'
          };
          return {
            ...t,
            ...updates,
            history: [historyEntry, ...t.history]
          };
        }
        return t;
      })
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
    addNotification(`Görev silindi (${taskId})`, 'info');
  };

  const addTaskNote = (taskId: string, noteText: string, author: string = 'Kullanıcı') => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newNote = {
      id: `nt-${Date.now()}`,
      author,
      timestamp: now,
      text: noteText
    };
    const historyItem = {
      id: `h-${Date.now()}`,
      timestamp: now,
      user: author,
      action: 'Yeni dahili not eklendi'
    };

    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, notes: [newNote, ...t.notes], history: [historyItem, ...t.history] }
          : t
      )
    );
  };

  const toggleChecklistItem = (taskId: string, checkId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            checklist: t.checklist.map(c =>
              c.id === checkId ? { ...c, completed: !c.completed } : c
            )
          };
        }
        return t;
      })
    );
  };

  const addChecklistItem = (taskId: string, text: string) => {
    const newItem = { id: `chk-${Date.now()}`, text, completed: false };
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, checklist: [...t.checklist, newItem] } : t))
    );
  };

  const reassignTask = (taskId: string, newOwner: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            owner: newOwner,
            history: [
              {
                id: `h-${Date.now()}`,
                timestamp: now,
                user: 'Kullanıcı',
                action: `Sorumlu "${newOwner}" olarak değiştirildi`
              },
              ...t.history
            ]
          };
        }
        return t;
      })
    );
    addNotification(`Görev sorumlusu ${newOwner} olarak güncellendi`, 'info');
  };

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            status: newStatus,
            history: [
              {
                id: `h-${Date.now()}`,
                timestamp: now,
                user: 'Kullanıcı',
                action: `Durum "${newStatus}" olarak değiştirildi`
              },
              ...t.history
            ]
          };
        }
        return t;
      })
    );
    addNotification(`Görev durumu güncellendi: ${newStatus}`, 'info');
  };

  // Quotation Operations
  const createQuotation = (data: Partial<Quotation>): Quotation => {
    const typePrefix =
      data.quotationType === 'Aşırı KM Zeyilnamesi'
        ? 'KM'
        : data.quotationType === 'Erken Araç İadesi'
        ? 'EI'
        : data.quotationType === 'Sözleşme Yenileme'
        ? 'YN'
        : 'TKF';

    const newId = `TKF-2026-${typePrefix}-${Math.floor(100 + Math.random() * 900)}`;
    const nowStr = new Date().toISOString().split('T')[0];
    const vehicleCount = data.vehicleCount || 1;
    const monthlyRent = data.monthlyRentPerVehicle || 25000;
    const grossMargin = data.grossMarginPercent || 15.0;
    const creditScore = data.customerCreditScore || 'Düşük Risk / A+';

    // Blueprint 4: Fast-track quotation approval check
    const isFastTrack =
      vehicleCount <= settings.fastTrackMaxVehicles &&
      grossMargin >= settings.fastTrackMinMarginPercent &&
      creditScore === 'Düşük Risk / A+';

    // If explicit status provided (e.g. 'Taslak'), respect it unless fast-track
    let finalStatus: QuotationStatus = data.status || (isFastTrack ? 'Onaylandı (Fast-Track)' : 'Onay Bekliyor');
    if (isFastTrack && (!data.status || data.status === 'Onay Bekliyor')) {
      finalStatus = 'Onaylandı (Fast-Track)';
    }

    const validityDays = settings.quotationValidityDays || 15;
    const validityDate = new Date(Date.now() + validityDays * 86400000).toISOString().split('T')[0];

    const newQuotation: Quotation = {
      id: newId,
      customerRef: data.customerRef || 'Yeni Müşteri',
      customerCode: data.customerCode || 'CUST-100',
      quotationType: data.quotationType || 'Yeni Teklif',
      vehicleCount,
      vehicleModel: data.vehicleModel || 'Renault Megane Sedan 1.3 TCe Touch EDC',
      termMonths: data.termMonths || 36,
      annualKm: data.annualKm || 25000,
      monthlyRentPerVehicle: monthlyRent,
      totalMonthlyAmount: data.totalMonthlyAmount || vehicleCount * monthlyRent,
      grossMarginPercent: grossMargin,
      customerCreditScore: creditScore,
      owner: data.owner || 'Burak Kaya',
      status: finalStatus,
      createdAt: nowStr,
      lastUpdatedAt: nowStr,
      validityDate: data.validityDate || validityDate,
      notes: data.notes || 'Yeni teklif taslağı',
      versions: data.versions || [
        {
          version: 1,
          date: nowStr,
          vehicleCount,
          monthlyRentPerVehicle: monthlyRent,
          grossMarginPercent: grossMargin,
          status: finalStatus,
          notes: isFastTrack
            ? 'Fast-Track kuralı uyarınca otomatik onaylandı (Araç <= 5, Marj >= %14, Kredi A+).'
            : (data.status === 'Taslak' ? 'Taslak olarak oluşturuldu.' : 'İlk teklif oluşturuldu, onay sürecinde.'),
          author: isFastTrack ? 'Otomasyon Motoru' : (data.owner || 'Burak Kaya')
        }
      ],
      isFastTrackEligible: isFastTrack,
      relatedContractId: data.relatedContractId,
      calculationDetails: data.calculationDetails,
      excessMileageKm: data.excessMileageKm,
      earlyReturnMonthsRemaining: data.earlyReturnMonthsRemaining,
      renewalAdjustmentPercent: data.renewalAdjustmentPercent
    };

    setQuotations(prev => [newQuotation, ...prev]);

    if (isFastTrack) {
      addNotification(
        `Fast-Track Tetiklendi: ${newQuotation.id} teklifi anında onaylandı!`,
        'success'
      );
    } else {
      addNotification(`Yeni teklif oluşturuldu: ${newQuotation.id} (${newQuotation.status})`, 'info');
    }

    return newQuotation;
  };

  const updateQuotation = (quoteId: string, updates: Partial<Quotation>) => {
    const nowStr = new Date().toISOString().split('T')[0];
    setQuotations(prev =>
      prev.map(q => {
        if (q.id === quoteId) {
          const vCount = updates.vehicleCount !== undefined ? updates.vehicleCount : q.vehicleCount;
          const rent = updates.monthlyRentPerVehicle !== undefined ? updates.monthlyRentPerVehicle : q.monthlyRentPerVehicle;
          return {
            ...q,
            ...updates,
            vehicleCount: vCount,
            monthlyRentPerVehicle: rent,
            totalMonthlyAmount: vCount * rent,
            lastUpdatedAt: nowStr
          };
        }
        return q;
      })
    );
  };

  const addQuotationVersion = (
    quoteId: string,
    versionData: { monthlyRent: number; margin: number; notes: string }
  ) => {
    const nowStr = new Date().toISOString().split('T')[0];
    setQuotations(prev =>
      prev.map(q => {
        if (q.id === quoteId) {
          const nextVersionNumber = q.versions.length + 1;
          const newVersion = {
            version: nextVersionNumber,
            date: nowStr,
            vehicleCount: q.vehicleCount,
            monthlyRentPerVehicle: versionData.monthlyRent,
            grossMarginPercent: versionData.margin,
            status: 'Teklif Revizyonu',
            notes: versionData.notes,
            author: q.owner
          };
          return {
            ...q,
            monthlyRentPerVehicle: versionData.monthlyRent,
            totalMonthlyAmount: q.vehicleCount * versionData.monthlyRent,
            grossMarginPercent: versionData.margin,
            lastUpdatedAt: nowStr,
            status: 'İnceleniyor',
            versions: [newVersion, ...q.versions]
          };
        }
        return q;
      })
    );
    addNotification(`Teklif revizyonu kaydedildi (${quoteId})`, 'info');
  };

  const updateQuotationStatus = (
    quoteId: string,
    newStatus: QuotationStatus,
    lossReason?: QuotationLossReason
  ) => {
    setQuotations(prev =>
      prev.map(q => {
        if (q.id === quoteId) {
          return {
            ...q,
            status: newStatus,
            lossReason: newStatus === 'Reddedildi' ? lossReason : undefined,
            lastUpdatedAt: new Date().toISOString().split('T')[0]
          };
        }
        return q;
      })
    );
    addNotification(`Teklif durumu güncellendi: ${newStatus}`, 'info');
  };

  // Contract & Renewal operations
  const createRenewalTaskForContract = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) {
      return { success: false, message: 'Sözleşme bulunamadı' };
    }

    // Check duplicate rule: prevent duplicate renewal task for the same contract
    if (contract.hasRenewalTask) {
      return {
        success: false,
        message: `Bu sözleşme için zaten aktif bir yenileme görevi (${contract.renewalTaskId}) mevcut. Tekrar oluşturulamaz.`
      };
    }

    // Create the task
    const newTask = createTask({
      title: `${contract.customerRef} - ${contract.vehicleCount} Araç Yenileme Teklifi Hazırlığı`,
      processType: 'Sözleşme Yenileme',
      customerRef: contract.customerRef,
      customerCode: contract.customerCode,
      sourceSystem: 'Otomasyon Motoru',
      owner: contract.assignedOwner || 'Burak Kaya',
      priority: contract.daysUntilRenewal <= 30 ? 'Kritik' : 'Yüksek',
      status: 'Yeni',
      dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      whatNeedsToBeDone: `${contract.plate} plakalı ${contract.vehicleModel} filosunun sözleşmesi ${contract.daysUntilRenewal} gün sonra bitiyor. Müşteriye yeni dönem şartları iletilecek.`,
      nextAction: 'Müşteri filo müdürü aranacak ve ikame araç alternatifleri sunulacak',
      relatedContractId: contract.id
    });

    // Update contract to track the task and mark hasRenewalTask = true
    setContracts(prev =>
      prev.map(c =>
        c.id === contractId
          ? { ...c, hasRenewalTask: true, renewalTaskId: newTask.id, renewalStatus: 'Görüşülüyor' }
          : c
      )
    );

    addNotification(
      `Yenileme görevi oluşturuldu: ${newTask.id} (${contract.customerRef})`,
      'success'
    );

    return {
      success: true,
      message: `Yenileme görevi (${newTask.id}) başarıyla oluşturuldu ve ${newTask.owner} uzmanına atandı.`,
      taskId: newTask.id
    };
  };

  // Dedicated Contract & Supplier Contract Methods (Detay Çekmecesi & Entegrasyonlar)
  const updateContract = (contractId: string, updates: Partial<Contract>) => {
    setContracts(prev =>
      prev.map(c => (c.id === contractId ? { ...c, ...updates } : c))
    );
    addNotification(`Sözleşme güncellendi: ${contractId}`, 'success');
  };

  const updateSupplierContract = (contractId: string, updates: Partial<SupplierContract>) => {
    setSupplierContracts(prev =>
      prev.map(c => (c.id === contractId ? { ...c, ...updates } : c))
    );
    addNotification(`Tedarikçi sözleşmesi güncellendi: ${contractId}`, 'success');
  };

  const syncContractWithSofico = async (id: string, isSupplier?: boolean): Promise<boolean> => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    if (isSupplier) {
      setSupplierContracts(prev =>
        prev.map(s => s.id === id ? { ...s, soficoSyncStatus: 'synced', lastSoficoSync: nowStr } : s)
      );
      addNotification(`Sofico Miles ERP ile anlık mutabakat tamamlandı: ${id}`, 'success');
    } else {
      setContracts(prev =>
        prev.map(c => c.id === id ? { ...c, soficoSyncStatus: 'synced', lastSoficoSync: nowStr } : c)
      );
      addNotification(`Sofico Miles ERP ile anlık telematik ve finans senkronizasyonu sağlandı: ${id}`, 'success');
    }
    return true;
  };

  const addContractInternalNote = (id: string, note: string, isSupplier?: boolean) => {
    const dateStr = new Date().toISOString().split('T')[0];
    const formattedNote = `[${dateStr}] ${note}`;
    if (isSupplier) {
      setSupplierContracts(prev =>
        prev.map(s => s.id === id ? { ...s, internalNotes: [formattedNote, ...(s.internalNotes || [])] } : s)
      );
    } else {
      setContracts(prev =>
        prev.map(c => c.id === id ? { ...c, internalNotes: [formattedNote, ...(c.internalNotes || [])] } : c)
      );
    }
    addNotification(`Dahili operasyonel not eklendi: ${id}`, 'info');
  };

  // CLM Stage and Lifecycle Operations
  const updateContractCLMStage = (contractId: string, newStage: CLMStage, note?: string) => {
    const stageLabels: Record<CLMStage, string> = {
      draft: 'Taslak Hazırlık',
      internal_review: 'Hukuk & Finans İnceleme',
      negotiation: 'Müşteri Müzakeresi',
      signature_pending: 'İmza / KEP Bekliyor',
      active_in_force: 'Yürürlükte (Aktif)',
      addendum_in_review: 'Zeyilname Sürecinde',
      renewal_pending: 'Yenileme Bekliyor',
      closed_archived: 'Arşivlendi / Kapatıldı'
    };

    setContracts(prev =>
      prev.map(c => {
        if (c.id === contractId) {
          const updated: Contract = {
            ...c,
            clmStage: newStage,
            clmStageUpdatedAt: new Date().toISOString().split('T')[0]
          };
          if (note) {
            updated.nextAction = note;
          }
          if (newStage === 'active_in_force') {
            updated.renewalStatus = 'Yenilendi';
          }
          return updated;
        }
        return c;
      })
    );

    addNotification(
      `Sözleşme ${contractId} yaşam döngüsü aşaması güncellendi: ${stageLabels[newStage]}`,
      'success'
    );
  };

  const addVaultDocument = (doc: Omit<ContractVaultDocument, 'id' | 'uploadedAt'>): ContractVaultDocument => {
    const newDoc: ContractVaultDocument = {
      ...doc,
      id: `DOC-VLT-${Date.now().toString().slice(-4)}`,
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    setVaultDocuments(prev => [newDoc, ...prev]);
    addNotification(`Doküman kasasına evrak eklendi: ${newDoc.title}`, 'success');
    return newDoc;
  };

  const resolveComplianceAlert = (alertId: string) => {
    setComplianceAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, resolved: true } : a))
    );
    addNotification(`Hukuki yükümlülük alarmı çözümlendi olarak işaretlendi.`, 'info');
  };

  const addClauseTemplate = (clause: Omit<ContractClauseTemplate, 'id' | 'legalApprovedDate'>): ContractClauseTemplate => {
    const newClause: ContractClauseTemplate = {
      ...clause,
      id: `CLS-${(clauseTemplates.length + 1).toString().padStart(2, '0')}`,
      legalApprovedDate: new Date().toISOString().split('T')[0]
    };
    setClauseTemplates(prev => [...prev, newClause]);
    addNotification(`Madde kütüphanesine yeni madde eklendi: ${newClause.code}`, 'success');
    return newClause;
  };

  // Document Operations
  const updateDocumentStatus = (docId: string, newStatus: DocumentStatus, notes?: string) => {
    setDocuments(prev =>
      prev.map(d => {
        if (d.id === docId) {
          const impact = newStatus === 'Onaylandı' ? 0 : newStatus === 'Eksik' ? 25 : d.riskScoreImpact;
          return {
            ...d,
            status: newStatus,
            riskScoreImpact: impact,
            notes: notes !== undefined ? notes : d.notes
          };
        }
        return d;
      })
    );
    addNotification(`Evrak durumu güncellendi: ${newStatus}`, 'info');
  };

  const uploadDocumentPlaceholder = (docId: string, fileName: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setDocuments(prev =>
      prev.map(d => {
        if (d.id === docId) {
          return {
            ...d,
            status: 'Kontrol Ediliyor',
            fileName,
            fileSize: '1.4 MB',
            uploadedAt: now,
            riskScoreImpact: 5,
            notes: `Müşteri tarafından yüklendi: ${fileName}. Ön inceleme bekleniyor.`
          };
        }
        return d;
      })
    );
    addNotification(`Belge yüklendi (Ön kontrol bekleniyor): ${fileName}`, 'success');
  };

  const createMissingDocFollowUpTask = (docId: string): Task => {
    const doc = documents.find(d => d.id === docId);
    const newTask = createTask({
      title: `${doc?.customerRef || 'Müşteri'} - Eksik Evrak Takibi (${doc?.title || 'Belge'})`,
      processType: 'Evrak Takibi',
      customerRef: doc?.customerRef || 'Bilinmeyen Müşteri',
      customerCode: 'CUST-DOC',
      sourceSystem: 'Otomasyon Motoru',
      owner: 'Selin Arslan',
      priority: 'Yüksek',
      status: 'Dış Yanıt Bekliyor',
      dueDate: doc?.requiredByDate || new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      whatNeedsToBeDone: `Hukuk ve kredi tahsis gereğince ${doc?.title} temin edilmeli. Teslimat için zorunludur.`,
      nextAction: 'Müşteri muhasebesine otomatik hatırlatma ve yükleme linki gönderilecek',
      relatedContractId: doc?.relatedEntityId.startsWith('KNT') ? doc.relatedEntityId : undefined,
      relatedQuoteId: doc?.relatedEntityId.startsWith('TKF') ? doc.relatedEntityId : undefined
    });
    return newTask;
  };

  // Dispute Operations
  const createDispute = (data: Partial<InvoiceDispute>): InvoiceDispute => {
    const newId = `ITR-${Math.floor(500 + Math.random() * 500)}`;
    const nowStr = new Date().toISOString().split('T')[0];
    const newDispute: InvoiceDispute = {
      id: newId,
      customerRef: data.customerRef || 'Yeni Müşteri',
      customerCode: data.customerCode || 'CUST-300',
      invoiceRef: data.invoiceRef || `FAT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      category: data.category || 'Hatalı Tutar',
      amountUnderReview: data.amountUnderReview || 10000,
      dateOpened: nowStr,
      assignedTeamOrOwner: data.assignedTeamOrOwner || 'Can Demir',
      status: 'İncelemede',
      nextAction: data.nextAction || 'Fatura ekleri ve sözleşme şartları karşılaştırılacak',
      dueDate: data.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      notes: [
        { id: `dn-${Date.now()}`, author: 'Sistem', date: nowStr, text: 'Fatura itiraz kaydı oluşturuldu.' }
      ]
    };

    setDisputes(prev => [newDispute, ...prev]);
    addNotification(`Yeni fatura itirazı kaydedildi (${newDispute.id})`, 'info');
    return newDispute;
  };

  const updateDispute = (disputeId: string, updates: Partial<InvoiceDispute>) => {
    setDisputes(prev =>
      prev.map(d => (d.id === disputeId ? { ...d, ...updates } : d))
    );
    addNotification(`Fatura itirazı güncellendi (${disputeId})`, 'info');
  };

  const addDisputeNote = (disputeId: string, text: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newNote = {
      id: `dn-${Date.now()}`,
      author: 'Kullanıcı',
      date: now,
      text
    };
    setDisputes(prev =>
      prev.map(d => (d.id === disputeId ? { ...d, notes: [newNote, ...d.notes] } : d))
    );
  };

  const createDisputeFollowUpTask = (disputeId: string): Task => {
    const dispute = disputes.find(d => d.id === disputeId);
    const newTask = createTask({
      title: `${dispute?.customerRef} - Fatura İtiraz Takibi (${dispute?.invoiceRef})`,
      processType: 'Fatura İtirazı',
      customerRef: dispute?.customerRef || 'Müşteri',
      customerCode: dispute?.customerCode || 'CUST-INV',
      sourceSystem: 'Manuel',
      owner: dispute?.assignedTeamOrOwner || 'Can Demir',
      priority: 'Yüksek',
      status: 'İşlemde',
      dueDate: dispute?.dueDate || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      whatNeedsToBeDone: `${dispute?.invoiceRef} numaralı faturadaki ${dispute?.amountUnderReview.toLocaleString('tr-TR')} TL tutarındaki ${dispute?.category} itirazının çözümlenmesi.`,
      nextAction: dispute?.nextAction || 'Müşteri muhasebe yetkilisiyle mutabakat görüşmesi yapılacak',
      relatedDisputeId: dispute?.id
    });

    setDisputes(prev =>
      prev.map(d => (d.id === disputeId ? { ...d, relatedTaskId: newTask.id } : d))
    );

    return newTask;
  };

  // Automation Operations
  const toggleRule = (ruleId: string) => {
    setAutomationRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const updateRuleParameter = (ruleId: string, key: string, value: any) => {
    setAutomationRules(prev =>
      prev.map(r =>
        r.id === ruleId
          ? { ...r, parameters: { ...r.parameters, [key]: value } }
          : r
      )
    );
  };

  const runRuleSimulation = (ruleId: string) => {
    const rule = automationRules.find(r => r.id === ruleId);
    if (!rule) {
      return { matchedCount: 0, matchedRecords: [], simulatedActionSummary: 'Kural bulunamadı' };
    }

    let matchedRecords: any[] = [];
    let simulatedActionSummary = '';

    if (rule.id === 'RULE-1') {
      // Contracts expiring within threshold with no renewal task
      const threshold = Number(rule.parameters.alertDaysThreshold || 90);
      matchedRecords = contracts.filter(
        c => c.daysUntilRenewal <= threshold && !c.hasRenewalTask && c.churnRisk !== 'Kara Liste'
      );
      simulatedActionSummary = `${matchedRecords.length} adet süresi dolmak üzere olan sözleşme için taslak teklif ve Öncelikli Yenileme görevi önerildi. (Otomatik mükerrer engelleme devrede)`;
    } else if (rule.id === 'RULE-2') {
      // Mileage overage > threshold
      const threshold = Number(rule.parameters.overagePercentageThreshold || 15);
      matchedRecords = contracts.filter(c => c.projectedOverKmPercent >= threshold);
      simulatedActionSummary = `${matchedRecords.length} adet yüksek KM aşımlı filo için ek kira zeyilnamesi taslağı ve risk uyarısı hesaplandı.`;
    } else if (rule.id === 'RULE-3') {
      // Missing mandatory documents
      matchedRecords = documents.filter(d => d.isMandatory && (d.status === 'Eksik' || d.status === 'Bekleniyor'));
      simulatedActionSummary = `${matchedRecords.length} adet eksik zorunlu evrak saptandı. Müşterilere SMS/E-posta evrak yükleme link taslağı hazırlandı.`;
    } else if (rule.id === 'RULE-4') {
      // Fast-track quotes
      const maxVehicles = Number(rule.parameters.maxVehicles || 5);
      const minMargin = Number(rule.parameters.minGrossMarginPercent || 14.0);
      matchedRecords = quotations.filter(
        q => q.vehicleCount <= maxVehicles && q.grossMarginPercent >= minMargin && q.customerCreditScore === 'Düşük Risk / A+'
      );
      simulatedActionSummary = `${matchedRecords.length} adet teklif Fast-Track onay kriterlerini sağladı. Yönetim kurulu onayı gerekmeden müşteri PDF taslağı üretilebilir.`;
    } else if (rule.id === 'RULE-5') {
      // Tasks waiting too long in external response or approval
      const extDays = Number(rule.parameters.externalWaitDaysLimit || 3);
      matchedRecords = tasks.filter(
        t => (t.status === 'Dış Yanıt Bekliyor' && t.waitingDays >= extDays) ||
             (t.status === 'Onay Bekliyor' && t.waitingDays >= 1)
      );
      simulatedActionSummary = `${matchedRecords.length} adet SLA gecikmesi yaşayan görev tespit edildi. Öncelik yükseltme ve operasyon direktörüne eskalasyon bildirimi simüle edildi.`;
    } else if (rule.id === 'RULE-6') {
      // Invoice pre-billing disputes
      matchedRecords = disputes.filter(d => d.status === 'İncelemede' || d.status === 'Onay Bekliyor');
      simulatedActionSummary = `${matchedRecords.length} adet fatura uyuşmazlığı inceleniyor. Ön fatura mutabakatı ile fatura kesilmeden önce düzeltme önerildi.`;
    }

    // Update rule lastEvaluated
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setAutomationRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, lastEvaluated: nowStr, matchedCount: matchedRecords.length } : r))
    );

    return {
      matchedCount: matchedRecords.length,
      matchedRecords,
      simulatedActionSummary
    };
  };

  const runAllRulesEvaluation = () => {
    let totalMatches = 0;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const updated = automationRules.map(r => {
      let count = 0;
      if (r.id === 'RULE-1') {
        const threshold = Number(r.parameters.alertDaysThreshold || 90);
        count = contracts.filter(c => c.daysUntilRenewal <= threshold && !c.hasRenewalTask).length;
      } else if (r.id === 'RULE-2') {
        count = contracts.filter(c => c.projectedOverKmPercent >= 15).length;
      } else if (r.id === 'RULE-3') {
        count = documents.filter(d => d.isMandatory && (d.status === 'Eksik' || d.status === 'Bekleniyor')).length;
      } else if (r.id === 'RULE-4') {
        count = quotations.filter(q => q.vehicleCount <= 5 && q.grossMarginPercent >= 14 && q.customerCreditScore === 'Düşük Risk / A+').length;
      } else if (r.id === 'RULE-5') {
        count = tasks.filter(t => (t.status === 'Dış Yanıt Bekliyor' && t.waitingDays >= 3) || (t.status === 'Onay Bekliyor' && t.waitingDays >= 1)).length;
      } else if (r.id === 'RULE-6') {
        count = disputes.filter(d => d.status !== 'Çözümlendi (İptal/Düzeltme)').length;
      }
      totalMatches += count;
      return {
        ...r,
        lastEvaluated: nowStr,
        matchedCount: count
      };
    });

    setAutomationRules(updated);
    addNotification(`Tüm otomasyon kuralları çalıştırıldı: Toplam ${totalMatches} kayıt etkilendi.`, 'success');
    return { rulesRun: updated.length, totalMatches };
  };

  // Settings
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addNotification('Sistem parametreleri güncellendi.', 'success');
  };

  const resetToDemoData = () => {
    setTasks(initialTasks);
    setQuotations(initialQuotations);
    setContracts(initialContracts);
    setDocuments(initialDocuments);
    setDisputes(initialDisputes);
    setAutomationRules(initialAutomationRules);
    setSettings(initialSettings);
    setClauseTemplates(initialClauseTemplates);
    setVaultDocuments(initialVaultDocuments);
    setComplianceAlerts(initialComplianceAlerts);
    setSupplierContracts(initialSupplierContracts);
    localStorage.removeItem(`${STORAGE_KEY}_tasks`);
    localStorage.removeItem(`${STORAGE_KEY}_quotations`);
    localStorage.removeItem(`${STORAGE_KEY}_contracts`);
    localStorage.removeItem(`${STORAGE_KEY}_documents`);
    localStorage.removeItem(`${STORAGE_KEY}_disputes`);
    localStorage.removeItem(`${STORAGE_KEY}_rules`);
    localStorage.removeItem(`${STORAGE_KEY}_settings`);
    localStorage.removeItem(`${STORAGE_KEY}_clause_templates`);
    localStorage.removeItem(`${STORAGE_KEY}_vault_docs`);
    localStorage.removeItem(`${STORAGE_KEY}_compliance_alerts`);
    localStorage.removeItem(`${STORAGE_KEY}_supplier_contracts`);
    addNotification('Demo veri seti sıfırlandı ve fabrika ayarlarına döndürüldü.', 'info');
  };

  // Computed KPIs based on active portfolio mode
  const totalOpenTasks = useMemo(() => {
    return scopedTasks.filter(t => t.status !== 'Tamamlandı' && t.status !== 'İptal').length;
  }, [scopedTasks]);

  const overdueTasksCount = useMemo(() => {
    return scopedTasks.filter(t => t.isOverdue || (t.status !== 'Tamamlandı' && t.status !== 'İptal' && t.waitingDays >= 4)).length;
  }, [scopedTasks]);

  const waitingApprovalCount = useMemo(() => {
    return scopedTasks.filter(t => t.status === 'Onay Bekliyor').length;
  }, [scopedTasks]);

  const waitingExternalResponseCount = useMemo(() => {
    return scopedTasks.filter(t => t.status === 'Dış Yanıt Bekliyor').length;
  }, [scopedTasks]);

  const monthlyQuotesCount = useMemo(() => {
    return quotations.length;
  }, [quotations]);

  const quoteConversionRate = useMemo(() => {
    if (quotations.length === 0) return 0;
    const acceptedCount = quotations.filter(
      q => q.status === 'Kabul Edildi' || q.status === 'Onaylandı (Fast-Track)' || q.status === 'Onaylandı'
    ).length;
    return Math.round((acceptedCount / quotations.length) * 100);
  }, [quotations]);

  const upcomingRenewalsCount = useMemo(() => {
    return scopedContracts.filter(c => c.daysUntilRenewal <= settings.renewalWarningDays).length;
  }, [scopedContracts, settings.renewalWarningDays]);

  const openDisputesCount = useMemo(() => {
    return disputes.filter(
      d => d.status !== 'Çözümlendi (İptal/Düzeltme)' && d.status !== 'Reddedildi (Geçerli Fatura)'
    ).length;
  }, [disputes]);

  const avgCompletionDays = useMemo(() => {
    return portfolioMode === 'B2C' ? 0.8 : 3.2; // B2C is high volume instant approval
  }, [portfolioMode]);

  const missingDocRiskScore = useMemo(() => {
    const totalImpact = documents.reduce((acc, curr) => acc + (curr.riskScoreImpact || 0), 0);
    return Math.min(100, Math.round(totalImpact * 1.8));
  }, [documents]);

  const estimatedHoursSavedWeekly = useMemo(() => {
    const activeRules = automationRules.filter(r => r.enabled);
    const monthlySum = activeRules.reduce((acc, r) => acc + (r.estimatedHoursSavedPerMonth || 10), 0);
    return Math.round(monthlySum / 4.2);
  }, [automationRules]);

  return (
    <SalesOpsContext.Provider
      value={{
        portfolioMode,
        setPortfolioMode,
        activePage,
        setActivePage,
        selectedTaskId,
        setSelectedTaskId,
        notifications,
        addNotification,
        dismissNotification,
        tasks: scopedTasks,
        allTasks: tasks,
        quotations,
        contracts: scopedContracts,
        allContracts: contracts,
        documents,
        disputes,
        automationRules,
        dataSources,
        teamMembers,
        settings,
        deliveryItems,
        creditRecords: scopedCreditRecords,
        allCreditRecords: creditRecords,
        expenseDiscrepancies,
        customerPortalRequests,
        updateDeliveryStep,
        addCreditCheck,
        updateExpenseStatus,
        addCustomerPortalRequest,
        updateCustomerPortalRequestStatus,
        createTask,
        updateTask,
        deleteTask,
        addTaskNote,
        toggleChecklistItem,
        addChecklistItem,
        reassignTask,
        updateTaskStatus,
        createQuotation,
        updateQuotation,
        addQuotationVersion,
        updateQuotationStatus,
        createRenewalTaskForContract,
        updateContract,
        updateSupplierContract,
        syncContractWithSofico,
        addContractInternalNote,
        supplierContracts,
        clauseTemplates,
        vaultDocuments,
        complianceAlerts,
        updateContractCLMStage,
        addVaultDocument,
        resolveComplianceAlert,
        addClauseTemplate,
        updateDocumentStatus,
        uploadDocumentPlaceholder,
        createMissingDocFollowUpTask,
        createDispute,
        updateDispute,
        addDisputeNote,
        createDisputeFollowUpTask,
        toggleRule,
        updateRuleParameter,
        runRuleSimulation,
        runAllRulesEvaluation,
        updateSettings,
        resetToDemoData,
        totalOpenTasks,
        overdueTasksCount,
        waitingApprovalCount,
        waitingExternalResponseCount,
        monthlyQuotesCount,
        quoteConversionRate,
        upcomingRenewalsCount,
        openDisputesCount,
        avgCompletionDays,
        missingDocRiskScore,
        estimatedHoursSavedWeekly
      }}
    >
      {children}
    </SalesOpsContext.Provider>
  );
};

export const useSalesOps = (): SalesOpsContextType => {
  const context = useContext(SalesOpsContext);
  if (!context) {
    throw new Error('useSalesOps must be used within a SalesOpsProvider');
  }
  return context;
};
