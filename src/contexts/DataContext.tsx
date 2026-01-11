import React, { createContext, useContext, ReactNode } from 'react';
import { useGoogleSheets, SheetsData } from '@/hooks/useGoogleSheets';
import type {
  Project,
  MaterialPurchase,
  CustomerBill,
  CustomerPayment,
  ContractorWork,
  ContractorPayment,
  Employee,
  SalaryPayment,
  BankTransaction,
  MaterialItem,
  Supplier,
  SupplierPayment,
} from '@/types';

interface DataContextType {
  isConnected: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  hasInitialized: boolean;
  spreadsheetId: string | null;
  data: SheetsData;
  connect: () => Promise<string>;
  connectExisting: (id: string) => Promise<void>;
  disconnect: () => void;
  syncFromSheets: () => Promise<void>;
  addProject: (project: Project) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addMaterial: (material: MaterialPurchase) => Promise<void>;
  addMaterialItem: (item: MaterialItem) => Promise<void>;
  updateMaterialItem: (item: MaterialItem) => Promise<void>;
  deleteMaterialItem: (id: string) => Promise<void>;
  addSupplier: (supplier: Supplier) => Promise<void>;
  updateSupplier: (supplier: Supplier) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  addSupplierPayment: (payment: SupplierPayment) => Promise<void>;
  addBill: (bill: CustomerBill) => Promise<void>;
  addPayment: (payment: CustomerPayment, updatedBill: CustomerBill) => Promise<void>;
  addContractorWork: (work: ContractorWork) => Promise<void>;
  addContractorPayment: (payment: ContractorPayment, updatedWork: ContractorWork) => Promise<void>;
  addEmployee: (employee: Employee) => Promise<void>;
  addSalaryPayment: (payment: SalaryPayment) => Promise<void>;
  addTransaction: (transaction: BankTransaction) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const sheetsHook = useGoogleSheets();
  return (
    <DataContext.Provider value={sheetsHook}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
