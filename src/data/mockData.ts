import { 
  Project, 
  MaterialPurchase, 
  CustomerBill, 
  CustomerPayment,
  Contractor,
  ContractorWork,
  ContractorPayment,
  Employee,
  SalaryPayment,
  BankTransaction,
  MaterialItem,
  Supplier,
  SupplierPayment 
} from '@/types';

export const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'Green Valley Apartments',
    customer: 'Sharma Builders',
    startDate: '2024-01-15',
    status: 'active',
    totalBilled: 2500000,
    totalReceived: 1800000,
    totalMaterialCost: 850000,
    totalLabourCost: 420000,
    totalOtherCost: 65000,
  },
  {
    id: 'p2',
    name: 'Sunrise Commercial Complex',
    customer: 'Patel Enterprises',
    startDate: '2024-02-01',
    status: 'active',
    totalBilled: 4200000,
    totalReceived: 3100000,
    totalMaterialCost: 1450000,
    totalLabourCost: 780000,
    totalOtherCost: 120000,
  },
  {
    id: 'p3',
    name: 'Lake View Bungalow',
    customer: 'Mr. Rajesh Kumar',
    startDate: '2023-11-01',
    status: 'completed',
    totalBilled: 1800000,
    totalReceived: 1800000,
    totalMaterialCost: 620000,
    totalLabourCost: 340000,
    totalOtherCost: 45000,
  },
];

export const mockMaterialItems: MaterialItem[] = [
  { id: 'mat1', name: 'Cement (OPC 53)', unit: 'bags', description: 'Ordinary Portland Cement 53 grade' },
  { id: 'mat2', name: 'TMT Steel 12mm', unit: 'tonnes', description: 'Thermo Mechanically Treated steel bars' },
  { id: 'mat3', name: 'River Sand', unit: 'brass', description: 'Fine aggregate for construction' },
  { id: 'mat4', name: 'Crushed Stone', unit: 'brass', description: 'Coarse aggregate' },
];

export const mockSuppliers: Supplier[] = [
  { id: 'sup1', name: 'Ambuja Cement Dealer', phone: '9876543210', address: 'Industrial Area', totalPurchased: 133000, totalPaid: 100000 },
  { id: 'sup2', name: 'Steel World', phone: '9876543211', address: 'Steel Market', totalPurchased: 290000, totalPaid: 290000 },
  { id: 'sup3', name: 'Sand & Aggregates Co.', phone: '9876543212', address: 'Quarry Road', totalPurchased: 135000, totalPaid: 100000 },
];

export const mockMaterials: MaterialPurchase[] = [
  {
    id: 'm1',
    date: '2024-12-01',
    supplierId: 'sup1',
    supplierName: 'Ambuja Cement Dealer',
    materialId: 'mat1',
    materialName: 'Cement (OPC 53)',
    quantity: 200,
    unit: 'bags',
    unitPrice: 380,
    totalAmount: 76000,
    amountPaid: 50000,
    projectId: 'p1',
    projectName: 'Green Valley Apartments',
  },
  {
    id: 'm2',
    date: '2024-12-02',
    supplierId: 'sup1',
    supplierName: 'Ambuja Cement Dealer',
    materialId: 'mat1',
    materialName: 'Cement (OPC 53)',
    quantity: 150,
    unit: 'bags',
    unitPrice: 380,
    totalAmount: 57000,
    amountPaid: 50000,
    projectId: 'p2',
    projectName: 'Sunrise Commercial Complex',
  },
  {
    id: 'm3',
    date: '2024-12-03',
    supplierId: 'sup2',
    supplierName: 'Steel World',
    materialId: 'mat2',
    materialName: 'TMT Steel 12mm',
    quantity: 5,
    unit: 'tonnes',
    unitPrice: 58000,
    totalAmount: 290000,
    amountPaid: 290000,
    projectId: 'p1',
    projectName: 'Green Valley Apartments',
  },
  {
    id: 'm4',
    date: '2024-12-05',
    supplierId: 'sup3',
    supplierName: 'Sand & Aggregates Co.',
    materialId: 'mat3',
    materialName: 'River Sand',
    quantity: 30,
    unit: 'brass',
    unitPrice: 4500,
    totalAmount: 135000,
    amountPaid: 100000,
    projectId: 'p2',
    projectName: 'Sunrise Commercial Complex',
  },
];

export const mockSupplierPayments: SupplierPayment[] = [];

export const mockBills: CustomerBill[] = [
  {
    id: 'b1',
    billNumber: 'INV-2024-001',
    date: '2024-11-15',
    projectId: 'p1',
    projectName: 'Green Valley Apartments',
    customer: 'Sharma Builders',
    description: 'Foundation work - Stage 1',
    amount: 800000,
    amountReceived: 800000,
    status: 'paid',
  },
  {
    id: 'b2',
    billNumber: 'INV-2024-002',
    date: '2024-12-01',
    projectId: 'p1',
    projectName: 'Green Valley Apartments',
    customer: 'Sharma Builders',
    description: 'RCC Work - Ground Floor',
    amount: 1200000,
    amountReceived: 700000,
    status: 'partial',
  },
  {
    id: 'b3',
    billNumber: 'INV-2024-003',
    date: '2024-12-10',
    projectId: 'p2',
    projectName: 'Sunrise Commercial Complex',
    customer: 'Patel Enterprises',
    description: 'Structural Work - Phase 1',
    amount: 2000000,
    amountReceived: 1500000,
    status: 'partial',
  },
];

export const mockCustomerPayments: CustomerPayment[] = [
  {
    id: 'cp1',
    date: '2024-11-20',
    billId: 'b1',
    billNumber: 'INV-2024-001',
    projectId: 'p1',
    projectName: 'Green Valley Apartments',
    customer: 'Sharma Builders',
    amount: 500000,
    paymentMode: 'bank',
  },
  {
    id: 'cp2',
    date: '2024-11-28',
    billId: 'b1',
    billNumber: 'INV-2024-001',
    projectId: 'p1',
    projectName: 'Green Valley Apartments',
    customer: 'Sharma Builders',
    amount: 300000,
    paymentMode: 'bank',
  },
];

export const mockContractors: Contractor[] = [
  { id: 'c1', name: 'Ramesh Labour Contractor', type: 'labour', phone: '9876543210' },
  { id: 'c2', name: 'JCB Services - Suresh', type: 'machine', phone: '9876543211' },
  { id: 'c3', name: 'Manoj Mason Team', type: 'labour', phone: '9876543212' },
];

export const mockContractorWorks: ContractorWork[] = [
  {
    id: 'cw1',
    date: '2024-11-15',
    contractorId: 'c1',
    contractorName: 'Ramesh Labour Contractor',
    contractorType: 'labour',
    projectId: 'p1',
    projectName: 'Green Valley Apartments',
    description: 'Foundation excavation labour',
    workValue: 150000,
    amountPaid: 100000,
    status: 'partial',
  },
  {
    id: 'cw2',
    date: '2024-11-20',
    contractorId: 'c2',
    contractorName: 'JCB Services - Suresh',
    contractorType: 'machine',
    projectId: 'p1',
    projectName: 'Green Valley Apartments',
    description: 'Excavation work - 3 days',
    workValue: 45000,
    amountPaid: 45000,
    status: 'paid',
  },
];

export const mockContractorPayments: ContractorPayment[] = [
  {
    id: 'cpp1',
    date: '2024-11-20',
    workId: 'cw1',
    contractorId: 'c1',
    contractorName: 'Ramesh Labour Contractor',
    projectId: 'p1',
    projectName: 'Green Valley Apartments',
    amount: 50000,
    paymentMode: 'cash',
  },
  {
    id: 'cpp2',
    date: '2024-11-28',
    workId: 'cw1',
    contractorId: 'c1',
    contractorName: 'Ramesh Labour Contractor',
    projectId: 'p1',
    projectName: 'Green Valley Apartments',
    amount: 50000,
    paymentMode: 'bank',
  },
];

export const mockEmployees: Employee[] = [
  { id: 'e1', name: 'Sunil Kumar', role: 'Site Engineer', salary: 45000, assignedTo: 'project', projectId: 'p1', projectName: 'Green Valley Apartments' },
  { id: 'e2', name: 'Priya Sharma', role: 'Accountant', salary: 35000, assignedTo: 'office' },
  { id: 'e3', name: 'Amit Patel', role: 'Supervisor', salary: 30000, assignedTo: 'project', projectId: 'p2', projectName: 'Sunrise Commercial Complex' },
];

export const mockSalaryPayments: SalaryPayment[] = [
  {
    id: 'sp1',
    date: '2024-12-01',
    employeeId: 'e1',
    employeeName: 'Sunil Kumar',
    month: 'November 2024',
    amount: 45000,
    projectId: 'p1',
    projectName: 'Green Valley Apartments',
    costType: 'project',
    paymentMode: 'bank',
  },
  {
    id: 'sp2',
    date: '2024-12-01',
    employeeId: 'e2',
    employeeName: 'Priya Sharma',
    month: 'November 2024',
    amount: 35000,
    costType: 'office',
    paymentMode: 'bank',
  },
];

export const mockBankTransactions: BankTransaction[] = [
  { id: 'bt1', date: '2024-12-01', type: 'deposit', amount: 500000, description: 'Customer payment received', mode: 'bank' },
  { id: 'bt2', date: '2024-12-03', type: 'withdrawal', amount: 150000, description: 'Material payment', mode: 'bank' },
  { id: 'bt3', date: '2024-12-05', type: 'withdrawal', amount: 80000, description: 'Salary payments', mode: 'bank' },
];
