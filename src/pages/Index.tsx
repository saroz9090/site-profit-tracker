import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { ProjectsView } from '@/components/projects/ProjectsView';
import { MaterialsView } from '@/components/materials/MaterialsView';
import { BillingView } from '@/components/billing/BillingView';
import { ContractorsView } from '@/components/contractors/ContractorsView';
import { EmployeesView } from '@/components/employees/EmployeesView';
import { BankView } from '@/components/bank/BankView';
import { ReportsView } from '@/components/reports/ReportsView';
import { TabType } from '@/types';
import { Header } from '@/components/layout/Header';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <Header title="Dashboard" />
            <Dashboard />
          </>
        );
      case 'projects':
        return <ProjectsView />;
      case 'materials':
        return <MaterialsView />;
      case 'billing':
        return <BillingView />;
      case 'contractors':
        return <ContractorsView />;
      case 'employees':
        return <EmployeesView />;
      case 'bank':
        return <BankView />;
      case 'reports':
        return <ReportsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
