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
  projectToRow,
  materialToRow,
  billToRow,
  paymentToRow,
  contractorWorkToRow,
  contractorPaymentToRow,
  employeeToRow,
  salaryPaymentToRow,
  transactionToRow,
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
};

export function useGoogleSheets() {
  const [spreadsheetId, setSpreadsheetIdState] = useState<string | null>(getSpreadsheetId());
  const [isConnected, setIsConnected] = useState(!!getSpreadsheetId());
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [data, setData] = useState<SheetsData>(EMPTY_DATA);
  const syncRef = useRef(false);

  // Connect and create new spreadsheet
  const connect = useCallback(async () => {
    setIsLoading(true);
    try {
      const newId = await createSpreadsheet();
      setSpreadsheetIdState(newId);
      setIsConnected(true);
      toast.success('Google Sheets connected! Spreadsheet created.');
      return newId;
    } catch (error: any) {
      console.error('Failed to connect:', error);
      toast.error(`Failed to connect: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Connect to existing spreadsheet
  const connectExisting = useCallback(async (id: string) => {
    setIsSyncing(true);
    try {
      setSpreadsheetId(id);
      setSpreadsheetIdState(id);
      setIsConnected(true);

      // Ensure sheets + headers exist so writes persist
      await initializeSpreadsheet(id);

      const sheetsData = await readAllData(id);
      setData(sheetsData);
      setHasInitialized(true);

      toast.success('Connected to existing spreadsheet');
    } catch (error: any) {
      console.error('Failed to connect to existing sheet:', error);
      toast.error(`Failed to connect: ${error.message}`);
      setIsConnected(false);
      setSpreadsheetIdState(null);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    localStorage.removeItem('buildtrack_spreadsheet_id');
    setSpreadsheetIdState(null);
    setIsConnected(false);
    toast.info('Disconnected from Google Sheets');
  }, []);

  // Sync data from sheets
  const syncFromSheets = useCallback(async () => {
    if (!spreadsheetId) return;
    
    setIsSyncing(true);
    try {
      const sheetsData = await readAllData(spreadsheetId);
      setData(sheetsData);
      toast.success('Data synced from Google Sheets');
    } catch (error: any) {
      console.error('Sync failed:', error);
      toast.error(`Sync failed: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  }, [spreadsheetId]);

  // Add project
  const addProject = useCallback(async (project: Project) => {
    setData(prev => ({ ...prev, projects: [...prev.projects, project] }));
    
    if (spreadsheetId) {
      try {
        await appendData(spreadsheetId, 'projects', [projectToRow(project)]);
      } catch (error: any) {
        console.error('Failed to sync project:', error);
        toast.error('Failed to sync to Google Sheets');
      }
    }
  }, [spreadsheetId]);

  // Add material
  const addMaterial = useCallback(async (material: MaterialPurchase) => {
    setData(prev => ({ ...prev, materials: [...prev.materials, material] }));
    
    if (spreadsheetId) {
      try {
        await appendData(spreadsheetId, 'materials', [materialToRow(material)]);
      } catch (error: any) {
        console.error('Failed to sync material:', error);
        toast.error('Failed to sync to Google Sheets');
      }
    }
  }, [spreadsheetId]);

  // Add bill
  const addBill = useCallback(async (bill: CustomerBill) => {
    setData(prev => ({ ...prev, bills: [...prev.bills, bill] }));
    
    if (spreadsheetId) {
      try {
        await appendData(spreadsheetId, 'bills', [billToRow(bill)]);
      } catch (error: any) {
        console.error('Failed to sync bill:', error);
        toast.error('Failed to sync to Google Sheets');
      }
    }
  }, [spreadsheetId]);

  // Add payment and update bill
  const addPayment = useCallback(async (payment: CustomerPayment, updatedBill: CustomerBill) => {
    setData(prev => ({
      ...prev,
      payments: [...prev.payments, payment],
      bills: prev.bills.map(b => b.id === updatedBill.id ? updatedBill : b),
    }));
    
    if (spreadsheetId) {
      try {
        await appendData(spreadsheetId, 'payments', [paymentToRow(payment)]);
        // Find bill index and update
        const billIndex = data.bills.findIndex(b => b.id === updatedBill.id);
        if (billIndex >= 0) {
          await updateRow(spreadsheetId, 'bills', billIndex, billToRow(updatedBill));
        }
      } catch (error: any) {
        console.error('Failed to sync payment:', error);
        toast.error('Failed to sync to Google Sheets');
      }
    }
  }, [spreadsheetId, data.bills]);

  // Add contractor work
  const addContractorWork = useCallback(async (work: ContractorWork) => {
    setData(prev => ({ ...prev, contractors: [...prev.contractors, work] }));
    
    if (spreadsheetId) {
      try {
        await appendData(spreadsheetId, 'contractors', [contractorWorkToRow(work)]);
      } catch (error: any) {
        console.error('Failed to sync contractor work:', error);
        toast.error('Failed to sync to Google Sheets');
      }
    }
  }, [spreadsheetId]);

  // Add contractor payment and update work
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
        if (workIndex >= 0) {
          await updateRow(spreadsheetId, 'contractors', workIndex, contractorWorkToRow(updatedWork));
        }
      } catch (error: any) {
        console.error('Failed to sync contractor payment:', error);
        toast.error('Failed to sync to Google Sheets');
      }
    }
  }, [spreadsheetId, data.contractors]);

  // Add employee
  const addEmployee = useCallback(async (employee: Employee) => {
    setData(prev => ({ ...prev, employees: [...prev.employees, employee] }));
    
    if (spreadsheetId) {
      try {
        await appendData(spreadsheetId, 'employees', [employeeToRow(employee)]);
      } catch (error: any) {
        console.error('Failed to sync employee:', error);
        toast.error('Failed to sync to Google Sheets');
      }
    }
  }, [spreadsheetId]);

  // Add salary payment
  const addSalaryPayment = useCallback(async (payment: SalaryPayment) => {
    setData(prev => ({ ...prev, salaryPayments: [...prev.salaryPayments, payment] }));
    
    if (spreadsheetId) {
      try {
        await appendData(spreadsheetId, 'salaryPayments', [salaryPaymentToRow(payment)]);
      } catch (error: any) {
        console.error('Failed to sync salary payment:', error);
        toast.error('Failed to sync to Google Sheets');
      }
    }
  }, [spreadsheetId]);

  // Add transaction
  const addTransaction = useCallback(async (transaction: BankTransaction) => {
    setData(prev => ({ ...prev, transactions: [...prev.transactions, transaction] }));
    
    if (spreadsheetId) {
      try {
        await appendData(spreadsheetId, 'transactions', [transactionToRow(transaction)]);
      } catch (error: any) {
        console.error('Failed to sync transaction:', error);
        toast.error('Failed to sync to Google Sheets');
      }
    }
  }, [spreadsheetId]);

  // Auto-sync on mount and when connection changes
  useEffect(() => {
    const doSync = async () => {
      if (isConnected && spreadsheetId && !syncRef.current) {
        syncRef.current = true;
        setIsSyncing(true);
        try {
          const sheetsData = await readAllData(spreadsheetId);
          setData(sheetsData);
          setHasInitialized(true);
          console.log('Data synced from Google Sheets:', sheetsData);
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
    isConnected,
    isLoading,
    isSyncing,
    hasInitialized,
    spreadsheetId,
    data,
    connect,
    connectExisting,
    disconnect,
    syncFromSheets,
    addProject,
    addMaterial,
    addBill,
    addPayment,
    addContractorWork,
    addContractorPayment,
    addEmployee,
    addSalaryPayment,
    addTransaction,
  };
}
