export interface Project {
  id: string;
  name: string;
  customer: string;
  startDate: string;
  status: 'active' | 'completed' | 'on-hold';
  totalBilled: number;
  totalReceived: number;
  totalMaterialCost: number;
  totalLabourCost: number;
  totalOtherCost: number;
}

export interface MaterialPurchase {
  id: string;
  date: string;
  supplierId: string;
  supplierName: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  amountPaid: number;
  projectId: string;
  projectName: string;
}

export interface CustomerBill {
  id: string;
  billNumber: string;
  date: string;
  projectId: string;
  projectName: string;
  customer: string;
  description: string;
  amount: number;
  amountReceived: number;
  status: 'pending' | 'partial' | 'paid';
}

export interface CustomerPayment {
  id: string;
  date: string;
  billId: string;
  billNumber: string;
  projectId: string;
  projectName: string;
  customer: string;
  amount: number;
  paymentMode: 'cash' | 'bank' | 'upi';
}

export interface Contractor {
  id: string;
  name: string;
  type: 'labour' | 'machine';
  phone?: string;
}

export interface ContractorWork {
  id: string;
  date: string;
  contractorId: string;
  contractorName: string;
  contractorType: 'labour' | 'machine';
  projectId: string;
  projectName: string;
  description: string;
  workValue: number;
  amountPaid: number;
  status: 'pending' | 'partial' | 'paid';
}

export interface ContractorPayment {
  id: string;
  date: string;
  workId: string;
  contractorId: string;
  contractorName: string;
  projectId: string;
  projectName: string;
  amount: number;
  paymentMode: 'cash' | 'bank' | 'upi';
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  salary: number;
  assignedTo: 'project' | 'office';
  projectId?: string;
  projectName?: string;
}

export interface SalaryPayment {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  month: string;
  amount: number;
  projectId?: string;
  projectName?: string;
  costType: 'project' | 'office';
  paymentMode: 'cash' | 'bank' | 'upi';
}

export interface BankTransaction {
  id: string;
  date: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  description: string;
  mode: 'cash' | 'bank' | 'upi';
}

// Material catalog (master list of materials)
export interface MaterialItem {
  id: string;
  name: string;
  unit: string;
  description?: string;
}

// Supplier with payment tracking
export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  totalPurchased: number;
  totalPaid: number;
}

// Supplier payment
export interface SupplierPayment {
  id: string;
  date: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  paymentMode: 'cash' | 'bank' | 'upi';
  description?: string;
}

export type TabType = 'dashboard' | 'projects' | 'materials' | 'billing' | 'contractors' | 'employees' | 'bank' | 'reports' | 'suppliers';
