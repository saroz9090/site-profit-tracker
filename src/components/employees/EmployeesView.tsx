import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { mockEmployees, mockSalaryPayments, mockProjects } from '@/data/mockData';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Employee, SalaryPayment } from '@/types';
import { Users, Wallet, Briefcase, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EmployeesView() {
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false);
  const [showPaySalaryDialog, setShowPaySalaryDialog] = useState(false);
  const [employees, setEmployees] = useState(mockEmployees);
  const [salaryPayments, setSalaryPayments] = useState(mockSalaryPayments);

  const employeeColumns = [
    {
      key: 'name',
      header: 'Employee',
      render: (e: Employee) => (
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold",
            e.assignedTo === 'project' ? "bg-info/10 text-info" : "bg-secondary text-secondary-foreground"
          )}>
            {e.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-medium text-sm">{e.name}</p>
            <p className="text-xs text-muted-foreground">{e.role}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'assignedTo',
      header: 'Assigned To',
      render: (e: Employee) => (
        <div className="flex items-center gap-2">
          {e.assignedTo === 'project' ? (
            <>
              <Briefcase className="w-4 h-4 text-info" />
              <span className="text-sm">{e.projectName}</span>
            </>
          ) : (
            <>
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Office</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'costType',
      header: 'Cost Type',
      render: (e: Employee) => <StatusBadge status={e.assignedTo} />,
    },
    {
      key: 'salary',
      header: 'Monthly Salary',
      render: (e: Employee) => (
        <span className="font-mono text-sm font-semibold">{formatCurrency(e.salary)}</span>
      ),
      className: 'text-right',
    },
  ];

  const salaryColumns = [
    {
      key: 'date',
      header: 'Date',
      render: (s: SalaryPayment) => <span className="text-sm">{formatDate(s.date)}</span>,
    },
    {
      key: 'employeeName',
      header: 'Employee',
      render: (s: SalaryPayment) => <span className="text-sm font-medium">{s.employeeName}</span>,
    },
    {
      key: 'month',
      header: 'For Month',
      render: (s: SalaryPayment) => <span className="text-sm">{s.month}</span>,
    },
    {
      key: 'costType',
      header: 'Cost Type',
      render: (s: SalaryPayment) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={s.costType} />
          {s.projectName && <span className="text-xs text-muted-foreground">({s.projectName})</span>}
        </div>
      ),
    },
    {
      key: 'paymentMode',
      header: 'Mode',
      render: (s: SalaryPayment) => (
        <span className="text-xs uppercase px-2 py-1 rounded bg-secondary">{s.paymentMode}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (s: SalaryPayment) => (
        <span className="font-mono text-sm font-semibold">{formatCurrency(s.amount)}</span>
      ),
      className: 'text-right',
    },
  ];

  const handleAddEmployee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const assignedTo = formData.get('assignedTo') as 'project' | 'office';
    const projectId = formData.get('projectId') as string;
    const project = mockProjects.find(p => p.id === projectId);
    
    const newEmployee: Employee = {
      id: `e${Date.now()}`,
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      salary: Number(formData.get('salary')),
      assignedTo,
      projectId: assignedTo === 'project' ? projectId : undefined,
      projectName: assignedTo === 'project' ? project?.name : undefined,
    };
    setEmployees([...employees, newEmployee]);
    setShowAddEmployeeDialog(false);
  };

  const handlePaySalary = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const employeeId = formData.get('employeeId') as string;
    const employee = employees.find(emp => emp.id === employeeId);
    
    const newPayment: SalaryPayment = {
      id: `sp${Date.now()}`,
      date: formData.get('date') as string,
      employeeId,
      employeeName: employee?.name || '',
      month: formData.get('month') as string,
      amount: Number(formData.get('amount')),
      projectId: employee?.projectId,
      projectName: employee?.projectName,
      costType: employee?.assignedTo || 'office',
      paymentMode: formData.get('paymentMode') as 'cash' | 'bank' | 'upi',
    };
    setSalaryPayments([newPayment, ...salaryPayments]);
    setShowPaySalaryDialog(false);
  };

  const totalProjectSalary = employees.filter(e => e.assignedTo === 'project').reduce((s, e) => s + e.salary, 0);
  const totalOfficeSalary = employees.filter(e => e.assignedTo === 'office').reduce((s, e) => s + e.salary, 0);

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Employees" 
        onAddNew={() => setShowAddEmployeeDialog(true)}
        addLabel="Add Employee"
      />
      
      <div className="flex-1 p-6 overflow-auto">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="stat-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium">Total Employees</span>
            </div>
            <p className="text-2xl font-bold">{employees.length}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 text-info mb-1">
              <Briefcase className="w-4 h-4" />
              <span className="text-xs font-medium">Project Cost</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(totalProjectSalary)}/mo</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Building2 className="w-4 h-4" />
              <span className="text-xs font-medium">Office Cost</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(totalOfficeSalary)}/mo</p>
          </div>
        </div>

        <Tabs defaultValue="employees" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="employees" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Employees
              </TabsTrigger>
              <TabsTrigger value="salaries" className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Salary Payments
              </TabsTrigger>
            </TabsList>
            <Button variant="outline" onClick={() => setShowPaySalaryDialog(true)}>
              Pay Salary
            </Button>
          </div>

          <TabsContent value="employees" className="space-y-4">
            <DataTable columns={employeeColumns} data={employees} />
          </TabsContent>

          <TabsContent value="salaries" className="space-y-4">
            <DataTable columns={salaryColumns} data={salaryPayments} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Employee Dialog */}
      <Dialog open={showAddEmployeeDialog} onOpenChange={setShowAddEmployeeDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Employee</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="e.g., Sunil Kumar" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" name="role" placeholder="e.g., Site Engineer" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary">Monthly Salary (₹)</Label>
                <Input id="salary" name="salary" type="number" placeholder="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Select name="assignedTo" defaultValue="project">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectId">Project (if assigned to project)</Label>
              <Select name="projectId">
                <SelectTrigger>
                  <SelectValue placeholder="Select project (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {mockProjects.filter(p => p.status === 'active').map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddEmployeeDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-accent">
                Add Employee
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Pay Salary Dialog */}
      <Dialog open={showPaySalaryDialog} onOpenChange={setShowPaySalaryDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pay Salary</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePaySalary} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee</Label>
              <Select name="employeeId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(e => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name} - {e.role} ({formatCurrency(e.salary)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Payment Date</Label>
                <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="month">For Month</Label>
                <Input id="month" name="month" placeholder="e.g., December 2024" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input id="amount" name="amount" type="number" placeholder="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMode">Payment Mode</Label>
                <Select name="paymentMode" defaultValue="bank">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowPaySalaryDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-accent">
                Pay Salary
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
