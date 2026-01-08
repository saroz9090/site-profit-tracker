import { supabase } from "@/integrations/supabase/client";
import type { 
  Project, 
  MaterialPurchase, 
  CustomerBill, 
  CustomerPayment, 
  ContractorWork, 
  ContractorPayment, 
  Employee, 
  SalaryPayment, 
  BankTransaction 
} from "@/types";

const STORAGE_KEY = 'buildtrack_spreadsheet_id';

export function getSpreadsheetId(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function setSpreadsheetId(id: string): void {
  localStorage.setItem(STORAGE_KEY, id);
}

async function callSheetsApi(payload: Record<string, any>) {
  const { data, error } = await supabase.functions.invoke('google-sheets', {
    body: payload,
  });
  
  if (error) {
    console.error('Sheets API error:', error);
    throw new Error(error.message || 'Failed to call Google Sheets API');
  }
  
  if (!data.success) {
    throw new Error(data.error || 'Unknown error');
  }
  
  return data;
}

// Create a new spreadsheet with all required sheets
export async function createSpreadsheet(): Promise<string> {
  const result = await callSheetsApi({ action: 'create' });
  const spreadsheetId = result.spreadsheetId;
  setSpreadsheetId(spreadsheetId);
  return spreadsheetId;
}

// Read all data from the spreadsheet
export async function readAllData(spreadsheetId: string): Promise<{
  projects: Project[];
  materials: MaterialPurchase[];
  bills: CustomerBill[];
  payments: CustomerPayment[];
  contractors: ContractorWork[];
  contractorPayments: ContractorPayment[];
  employees: Employee[];
  salaryPayments: SalaryPayment[];
  transactions: BankTransaction[];
}> {
  const result = await callSheetsApi({ action: 'readAll', spreadsheetId });
  const raw = result.data;
  
  return {
    projects: (raw.projects || []).map(parseProject),
    materials: (raw.materials || []).map(parseMaterial),
    bills: (raw.bills || []).map(parseBill),
    payments: (raw.payments || []).map(parsePayment),
    contractors: (raw.contractors || []).map(parseContractorWork),
    contractorPayments: (raw.contractorPayments || []).map(parseContractorPayment),
    employees: (raw.employees || []).map(parseEmployee),
    salaryPayments: (raw.salaryPayments || []).map(parseSalaryPayment),
    transactions: (raw.transactions || []).map(parseTransaction),
  };
}

// Append data to a specific sheet
export async function appendData(
  spreadsheetId: string,
  sheetType: string,
  rows: any[][]
): Promise<void> {
  await callSheetsApi({
    action: 'append',
    spreadsheetId,
    sheetType,
    data: rows,
  });
}

// Update a specific row
export async function updateRow(
  spreadsheetId: string,
  sheetType: string,
  rowIndex: number,
  values: any[]
): Promise<void> {
  await callSheetsApi({
    action: 'update',
    spreadsheetId,
    sheetType,
    rowIndex,
    data: values,
  });
}

// Helper functions to serialize data for sheets
export function projectToRow(p: Project): any[] {
  return [
    p.id,
    p.name,
    p.customer,
    p.startDate,
    p.status,
    p.totalBilled,
    p.totalReceived,
    p.totalMaterialCost,
    p.totalLabourCost,
    p.totalOtherCost,
  ];
}

export function materialToRow(m: MaterialPurchase): any[] {
  return [
    m.id,
    m.date,
    m.projectId,
    m.projectName,
    m.supplier,
    m.material,
    m.unit,
    m.quantity,
    m.unitPrice,
    m.totalAmount,
  ];
}

export function billToRow(b: CustomerBill): any[] {
  return [
    b.id,
    b.billNumber,
    b.date,
    b.projectId,
    b.projectName,
    b.customer,
    b.description,
    b.amount,
    b.amountReceived,
    b.status,
  ];
}

export function paymentToRow(p: CustomerPayment): any[] {
  return [
    p.id,
    p.date,
    p.billId,
    p.billNumber,
    p.projectId,
    p.projectName,
    p.customer,
    p.paymentMode,
    p.amount,
  ];
}

export function contractorWorkToRow(c: ContractorWork): any[] {
  return [
    c.id,
    c.date,
    c.contractorId,
    c.contractorName,
    c.contractorType,
    c.projectId,
    c.projectName,
    c.description,
    c.workValue,
    c.amountPaid,
    c.status,
  ];
}

export function contractorPaymentToRow(p: ContractorPayment): any[] {
  return [
    p.id,
    p.date,
    p.workId,
    p.contractorId,
    p.contractorName,
    p.projectId,
    p.projectName,
    p.paymentMode,
    p.amount,
  ];
}

export function employeeToRow(e: Employee): any[] {
  return [
    e.id,
    e.name,
    e.role,
    e.salary,
    e.assignedTo,
    e.projectId || '',
    e.projectName || '',
  ];
}

export function salaryPaymentToRow(s: SalaryPayment): any[] {
  return [
    s.id,
    s.date,
    s.employeeId,
    s.employeeName,
    s.month,
    s.costType,
    s.paymentMode,
    s.amount,
  ];
}

export function transactionToRow(t: BankTransaction): any[] {
  return [
    t.id,
    t.date,
    t.type,
    t.description,
    t.amount,
    t.mode,
  ];
}

// Helper functions to parse data from sheets
function parseProject(row: Record<string, string>): Project {
  return {
    id: row.id,
    name: row.name,
    customer: row.customer,
    startDate: row.startDate,
    status: (row.status as Project['status']) || 'active',
    totalBilled: parseFloat(row.totalBilled) || 0,
    totalReceived: parseFloat(row.totalReceived) || 0,
    totalMaterialCost: parseFloat(row.totalMaterialCost) || 0,
    totalLabourCost: parseFloat(row.totalLabourCost) || 0,
    totalOtherCost: parseFloat(row.totalOtherCost) || 0,
  };
}

function parseMaterial(row: Record<string, string>): MaterialPurchase {
  return {
    id: row.id,
    date: row.date,
    projectId: row.projectId,
    projectName: row.projectName,
    supplier: row.supplier,
    material: row.material,
    unit: row.unit,
    quantity: parseFloat(row.quantity) || 0,
    unitPrice: parseFloat(row.unitPrice) || 0,
    totalAmount: parseFloat(row.totalAmount) || 0,
  };
}

function parseBill(row: Record<string, string>): CustomerBill {
  return {
    id: row.id,
    billNumber: row.billNumber,
    date: row.date,
    projectId: row.projectId,
    projectName: row.projectName,
    customer: row.customer,
    description: row.description,
    amount: parseFloat(row.amount) || 0,
    amountReceived: parseFloat(row.amountReceived) || 0,
    status: (row.status as CustomerBill['status']) || 'pending',
  };
}

function parsePayment(row: Record<string, string>): CustomerPayment {
  return {
    id: row.id,
    date: row.date,
    billId: row.billId,
    billNumber: row.billNumber,
    projectId: row.projectId,
    projectName: row.projectName,
    customer: row.customer,
    paymentMode: (row.paymentMode as CustomerPayment['paymentMode']) || 'bank',
    amount: parseFloat(row.amount) || 0,
  };
}

function parseContractorWork(row: Record<string, string>): ContractorWork {
  return {
    id: row.id,
    date: row.date,
    contractorId: row.contractorId,
    contractorName: row.contractorName,
    contractorType: (row.contractorType as ContractorWork['contractorType']) || 'labour',
    projectId: row.projectId,
    projectName: row.projectName,
    description: row.description,
    workValue: parseFloat(row.workValue) || 0,
    amountPaid: parseFloat(row.amountPaid) || 0,
    status: (row.status as ContractorWork['status']) || 'pending',
  };
}

function parseContractorPayment(row: Record<string, string>): ContractorPayment {
  return {
    id: row.id,
    date: row.date,
    workId: row.workId,
    contractorId: row.contractorId,
    contractorName: row.contractorName,
    projectId: row.projectId,
    projectName: row.projectName,
    paymentMode: (row.paymentMode as ContractorPayment['paymentMode']) || 'cash',
    amount: parseFloat(row.amount) || 0,
  };
}

function parseEmployee(row: Record<string, string>): Employee {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    salary: parseFloat(row.salary) || 0,
    assignedTo: (row.assignedTo as Employee['assignedTo']) || 'office',
    projectId: row.projectId || undefined,
    projectName: row.projectName || undefined,
  };
}

function parseSalaryPayment(row: Record<string, string>): SalaryPayment {
  return {
    id: row.id,
    date: row.date,
    employeeId: row.employeeId,
    employeeName: row.employeeName,
    month: row.month,
    costType: (row.costType as SalaryPayment['costType']) || 'office',
    paymentMode: (row.paymentMode as SalaryPayment['paymentMode']) || 'bank',
    amount: parseFloat(row.amount) || 0,
    projectId: row.projectId || undefined,
    projectName: row.projectName || undefined,
  };
}

function parseTransaction(row: Record<string, string>): BankTransaction {
  return {
    id: row.id,
    date: row.date,
    type: (row.type as BankTransaction['type']) || 'deposit',
    description: row.description,
    amount: parseFloat(row.amount) || 0,
    mode: (row.mode as BankTransaction['mode']) || 'bank',
  };
}
