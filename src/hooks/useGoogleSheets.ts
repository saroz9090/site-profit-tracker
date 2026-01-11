import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
  getSpreadsheetId,
  setSpreadsheetId,
  createSpreadsheet,
  initializeSpreadsheet,
  readAllData,
  appendData,
  updateRow,
  deleteRow,
  projectToRow,
  materialToRow,
  billToRow,
  paymentToRow,
  contractorWorkToRow,
  contractorPaymentToRow,
  employeeToRow,
  salaryPaymentToRow,
  transactionToRow,
  materialItemToRow,
  supplierToRow,
  supplierPaymentToRow,
} from '@/lib/googleSheets';
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

export interface SheetsData {
  projects: Project[];
  materials: MaterialPurchase[];
  bills: CustomerBill[];
  payments: CustomerPayment[];
  contractors: ContractorWork[];
  contractorPayments: ContractorPayment[];
  employees: Employee[];
  salaryPayments: SalaryPayment[];
  transactions: BankTransaction[];
  materialItems: MaterialItem[];
  suppliers: Supplier[];
  supplierPayments: SupplierPayment[];
}

const EMPTY_DATA: SheetsData = {
  projects: [],
  materials: [],
  bills: [],
  payments: [],
  contractors: [],
  contractorPayments: [],
  employees: [],
  salaryPayments: [],
  transactions: [],
  materialItems: [],
  suppliers: [],
  supplierPayments: [],
};

export function useGoogleSheets() {
  const [spreadsheetId, setSpreadsheetIdState] = useState<string | null>(getSpreadsheetId());
  const [isConnected, setIsConnected] = useState(!!getSpreadsheetId());
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [data, setData] = useState<SheetsData>(EMPTY_DATA);
  const syncRef = useRef(false);

  const connect = useCallback(async () => {
    setIsLoading(true);
    try {
      const newId = await createSpreadsheet();
      setSpreadsheetIdState(newId);
      setIsConnected(true);
      toast.success('Google Sheets connected!');
      return newId;
    } catch (error: any) {
      console.error('Failed to connect:', error);
      toast.error(`Failed to connect: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connectExisting = useCallback(async (id: string) => {
    setIsSyncing(true);
    try {
      setSpreadsheetId(id);
      setSpreadsheetIdState(id);
      setIsConnected(true);
      await initializeSpreadsheet(id);
      const sheetsData = await readAllData(id);
      setData(sheetsData);
      setHasInitialized(true);
      toast.success('Connected to existing spreadsheet');
    } catch (error: any) {
      console.error('Failed to connect:', error);
      toast.error(`Failed to connect: ${error.message}`);
      setIsConnected(false);
      setSpreadsheetIdState(null);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem('buildtrack_spreadsheet_id');
    setSpreadsheetIdState(null);
    setIsConnected(false);
    toast.info('Disconnected from Google Sheets');
  }, []);

  const syncFromSheets = useCallback(async () => {
    if (!spreadsheetId) return;
    setIsSyncing(true);
    try {
      const sheetsData = await readAllData(spreadsheetId);
      setData(sheetsData);
      toast.success('Data synced');
    } catch (error: any) {
      console.error('Sync failed:', error);
      toast.error(`Sync failed: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  }, [spreadsheetId]);

  // Project CRUD
  const addProject = useCallback(async (project: Project) => {
    setData(prev => ({ ...prev, projects: [...prev.projects, project] }));
    if (spreadsheetId) {
      try { await appendData(spreadsheetId, 'projects', [projectToRow(project)]); }
      catch (error: any) { toast.error('Failed to sync'); }
    }
  }, [spreadsheetId]);

  const updateProject = useCallback(async (project: Project) => {
    setData(prev => ({ ...prev, projects: prev.projects.map(p => p.id === project.id ? project : p) }));
    if (spreadsheetId) {
      const idx = data.projects.findIndex(p => p.id === project.id);
      if (idx >= 0) await updateRow(spreadsheetId, 'projects', idx, projectToRow(project));
    }
  }, [spreadsheetId, data.projects]);

  const deleteProject = useCallback(async (id: string) => {
    setData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
    if (spreadsheetId) {
      const idx = data.projects.findIndex(p => p.id === id);
      if (idx >= 0) await deleteRow(spreadsheetId, 'projects', idx);
    }
  }, [spreadsheetId, data.projects]);

  // Material CRUD
  const addMaterial = useCallback(async (material: MaterialPurchase) => {
    setData(prev => ({ ...prev, materials: [...prev.materials, material] }));
    if (spreadsheetId) {
      try { await appendData(spreadsheetId, 'materials', [materialToRow(material)]); }
      catch (error: any) { toast.error('Failed to sync'); }
    }
  }, [spreadsheetId]);

  // MaterialItem CRUD
  const addMaterialItem = useCallback(async (item: MaterialItem) => {
    setData(prev => ({ ...prev, materialItems: [...prev.materialItems, item] }));
    if (spreadsheetId) {
      try { await appendData(spreadsheetId, 'materialItems', [materialItemToRow(item)]); }
      catch (error: any) { toast.error('Failed to sync'); }
    }
  }, [spreadsheetId]);

  const updateMaterialItem = useCallback(async (item: MaterialItem) => {
    setData(prev => ({ ...prev, materialItems: prev.materialItems.map(m => m.id === item.id ? item : m) }));
    if (spreadsheetId) {
      const idx = data.materialItems.findIndex(m => m.id === item.id);
      if (idx >= 0) await updateRow(spreadsheetId, 'materialItems', idx, materialItemToRow(item));
    }
  }, [spreadsheetId, data.materialItems]);

  const deleteMaterialItem = useCallback(async (id: string) => {
    setData(prev => ({ ...prev, materialItems: prev.materialItems.filter(m => m.id !== id) }));
    if (spreadsheetId) {
      const idx = data.materialItems.findIndex(m => m.id === id);
      if (idx >= 0) await deleteRow(spreadsheetId, 'materialItems', idx);
    }
  }, [spreadsheetId, data.materialItems]);

  // Supplier CRUD
  const addSupplier = useCallback(async (supplier: Supplier) => {
    setData(prev => ({ ...prev, suppliers: [...prev.suppliers, supplier] }));
    if (spreadsheetId) {
      try { await appendData(spreadsheetId, 'suppliers', [supplierToRow(supplier)]); }
      catch (error: any) { toast.error('Failed to sync'); }
    }
  }, [spreadsheetId]);

  const updateSupplier = useCallback(async (supplier: Supplier) => {
    setData(prev => ({ ...prev, suppliers: prev.suppliers.map(s => s.id === supplier.id ? supplier : s) }));
    if (spreadsheetId) {
      const idx = data.suppliers.findIndex(s => s.id === supplier.id);
      if (idx >= 0) await updateRow(spreadsheetId, 'suppliers', idx, supplierToRow(supplier));
    }
  }, [spreadsheetId, data.suppliers]);

  const deleteSupplier = useCallback(async (id: string) => {
    setData(prev => ({ ...prev, suppliers: prev.suppliers.filter(s => s.id !== id) }));
    if (spreadsheetId) {
      const idx = data.suppliers.findIndex(s => s.id === id);
      if (idx >= 0) await deleteRow(spreadsheetId, 'suppliers', idx);
    }
  }, [spreadsheetId, data.suppliers]);

  const addSupplierPayment = useCallback(async (payment: SupplierPayment) => {
    setData(prev => ({ ...prev, supplierPayments: [...prev.supplierPayments, payment] }));
    if (spreadsheetId) {
      try { await appendData(spreadsheetId, 'supplierPayments', [supplierPaymentToRow(payment)]); }
      catch (error: any) { toast.error('Failed to sync'); }
    }
  }, [spreadsheetId]);

  // Bill CRUD
  const addBill = useCallback(async (bill: CustomerBill) => {
    setData(prev => ({ ...prev, bills: [...prev.bills, bill] }));
    if (spreadsheetId) {
      try { await appendData(spreadsheetId, 'bills', [billToRow(bill)]); }
      catch (error: any) { toast.error('Failed to sync'); }
    }
  }, [spreadsheetId]);

  const addPayment = useCallback(async (payment: CustomerPayment, updatedBill: CustomerBill) => {
    setData(prev => ({
      ...prev,
      payments: [...prev.payments, payment],
      bills: prev.bills.map(b => b.id === updatedBill.id ? updatedBill : b),
    }));
    if (spreadsheetId) {
      try {
        await appendData(spreadsheetId, 'payments', [paymentToRow(payment)]);
        const billIndex = data.bills.findIndex(b => b.id === updatedBill.id);
        if (billIndex >= 0) await updateRow(spreadsheetId, 'bills', billIndex, billToRow(updatedBill));
      } catch (error: any) { toast.error('Failed to sync'); }
    }
  }, [spreadsheetId, data.bills]);

  const addContractorWork = useCallback(async (work: ContractorWork) => {
    setData(prev => ({ ...prev, contractors: [...prev.contractors, work] }));
    if (spreadsheetId) {
      try { await appendData(spreadsheetId, 'contractors', [contractorWorkToRow(work)]); }
      catch (error: any) { toast.error('Failed to sync'); }
    }
  }, [spreadsheetId]);

  const addContractorPayment = useCallback(async (payment: ContractorPayment, updatedWork: ContractorWork) => {
    setData(prev => ({
      ...prev,
      contractorPayments: [...prev.contractorPayments, payment],
      contractors: prev.contractors.map(w => w.id === updatedWork.id ? updatedWork : w),
    }));
    if (spreadsheetId) {
      try {
        await appendData(spreadsheetId, 'contractorPayments', [contractorPaymentToRow(payment)]);
        const workIndex = data.contractors.findIndex(w => w.id === updatedWork.id);
        if (workIndex >= 0) await updateRow(spreadsheetId, 'contractors', workIndex, contractorWorkToRow(updatedWork));
      } catch (error: any) { toast.error('Failed to sync'); }
    }
  }, [spreadsheetId, data.contractors]);

  const addEmployee = useCallback(async (employee: Employee) => {
    setData(prev => ({ ...prev, employees: [...prev.employees, employee] }));
    if (spreadsheetId) {
      try { await appendData(spreadsheetId, 'employees', [employeeToRow(employee)]); }
      catch (error: any) { toast.error('Failed to sync'); }
    }
  }, [spreadsheetId]);

  const addSalaryPayment = useCallback(async (payment: SalaryPayment) => {
    setData(prev => ({ ...prev, salaryPayments: [...prev.salaryPayments, payment] }));
    if (spreadsheetId) {
      try { await appendData(spreadsheetId, 'salaryPayments', [salaryPaymentToRow(payment)]); }
      catch (error: any) { toast.error('Failed to sync'); }
    }
  }, [spreadsheetId]);

  const addTransaction = useCallback(async (transaction: BankTransaction) => {
    setData(prev => ({ ...prev, transactions: [...prev.transactions, transaction] }));
    if (spreadsheetId) {
      try { await appendData(spreadsheetId, 'transactions', [transactionToRow(transaction)]); }
      catch (error: any) { toast.error('Failed to sync'); }
    }
  }, [spreadsheetId]);

  useEffect(() => {
    const doSync = async () => {
      if (isConnected && spreadsheetId && !syncRef.current) {
        syncRef.current = true;
        setIsSyncing(true);
        try {
          const sheetsData = await readAllData(spreadsheetId);
          setData(sheetsData);
          setHasInitialized(true);
        } catch (error: any) {
          console.error('Initial sync failed:', error);
          toast.error(`Failed to load data: ${error.message}`);
        } finally {
          setIsSyncing(false);
          syncRef.current = false;
        }
      } else if (!isConnected) {
        setData(EMPTY_DATA);
        setHasInitialized(true);
      }
    };
    doSync();
  }, [isConnected, spreadsheetId]);

  return {
    isConnected, isLoading, isSyncing, hasInitialized, spreadsheetId, data,
    connect, connectExisting, disconnect, syncFromSheets,
    addProject, updateProject, deleteProject,
    addMaterial, addMaterialItem, updateMaterialItem, deleteMaterialItem,
    addSupplier, updateSupplier, deleteSupplier, addSupplierPayment,
    addBill, addPayment, addContractorWork, addContractorPayment,
    addEmployee, addSalaryPayment, addTransaction,
  };
}
