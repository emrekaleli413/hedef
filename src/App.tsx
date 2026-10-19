import React, { useState } from 'react';
import { SalesOpsProvider, useSalesOps } from './context/SalesOpsContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { OverviewPage } from './components/pages/OverviewPage';
import { TaskQueuePage } from './components/pages/TaskQueuePage';
import { QuotationPage } from './components/pages/QuotationPage';
import { ContractsPage } from './components/pages/ContractsPage';
import { DocumentsPage } from './components/pages/DocumentsPage';
import { DisputesPage } from './components/pages/DisputesPage';
import { AutomationPage } from './components/pages/AutomationPage';
import { AnalyticsPage } from './components/pages/AnalyticsPage';
import { DataSourcesPage } from './components/pages/DataSourcesPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { DeliveryTrackerPage } from './components/pages/DeliveryTrackerPage';
import { CreditIntelligencePage } from './components/pages/CreditIntelligencePage';
import { PreBillingReconciliationPage } from './components/pages/PreBillingReconciliationPage';
import { CustomerPortalPage } from './components/pages/CustomerPortalPage';
import { CreateTaskModal } from './components/modals/CreateTaskModal';
import { AutomatedQuotationGeneratorModal } from './components/modals/AutomatedQuotationGeneratorModal';

const AppContent: React.FC = () => {
  const { activePage } = useSalesOps();
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isNewQuoteOpen, setIsNewQuoteOpen] = useState(false);

  const renderActivePage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <OverviewPage
            onOpenNewTask={() => setIsNewTaskOpen(true)}
            onOpenNewQuote={() => setIsNewQuoteOpen(true)}
          />
        );
      case 'tasks':
        return (
          <TaskQueuePage onOpenCreateTaskModal={() => setIsNewTaskOpen(true)} />
        );
      case 'quotations':
        return (
          <QuotationPage onOpenCreateQuoteModal={() => setIsNewQuoteOpen(true)} />
        );
      case 'contracts':
        return <ContractsPage />;
      case 'documents':
        return <DocumentsPage />;
      case 'disputes':
        return <DisputesPage />;
      case 'delivery':
        return <DeliveryTrackerPage />;
      case 'credit':
        return <CreditIntelligencePage />;
      case 'prebilling':
        return <PreBillingReconciliationPage />;
      case 'customerportal':
        return <CustomerPortalPage />;
      case 'automation':
        return <AutomationPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'datasources':
        return <DataSourcesPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <OverviewPage
            onOpenNewTask={() => setIsNewTaskOpen(true)}
            onOpenNewQuote={() => setIsNewQuoteOpen(true)}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden text-slate-900 font-sans">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Compact Top Bar */}
        <TopBar
          onOpenNewTaskModal={() => setIsNewTaskOpen(true)}
          onOpenNewQuoteModal={() => setIsNewQuoteOpen(true)}
        />

        {/* Scrollable Page Viewport */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1560px] mx-auto">
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <CreateTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
      />

      {/* Section 16 Priority Feature: Automated Quotation Generator Modal */}
      <AutomatedQuotationGeneratorModal
        isOpen={isNewQuoteOpen}
        onClose={() => setIsNewQuoteOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <SalesOpsProvider>
      <AppContent />
    </SalesOpsProvider>
  );
}
