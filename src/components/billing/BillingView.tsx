import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { useData } from '@/contexts/DataContext';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerBill, CustomerPayment } from '@/types';
import { cn } from '@/lib/utils';
import { Receipt, Wallet } from 'lucide-react';

export function BillingView() {
  const [showAddBillDialog, setShowAddBillDialog] = useState(false);
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
  const { data, addBill, addPayment } = useData();
  const bills = data.bills;
  const payments = data.payments;
  const projects = data.projects;

  const billColumns = [
    {
      key: 'billNumber',
      header: 'Bill No.',
      render: (b: CustomerBill) => (
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-primary" />
          <span className="font-mono text-sm font-medium">{b.billNumber}</span>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (b: CustomerBill) => <span className="text-sm">{formatDate(b.date)}</span>,
    },
    {
      key: 'projectName',
      header: 'Project',
      render: (b: CustomerBill) => (
        <div>
          <p className="text-sm font-medium">{b.projectName}</p>
          <p className="text-xs text-muted-foreground">{b.customer}</p>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (b: CustomerBill) => <span className="text-sm text-muted-foreground">{b.description}</span>,
    },
    {
      key: 'amount',
      header: 'Bill Amount',
      render: (b: CustomerBill) => <span className="font-mono text-sm">{formatCurrency(b.amount)}</span>,
      className: 'text-right',
    },
    {
      key: 'amountReceived',
      header: 'Received',
      render: (b: CustomerBill) => (
        <span className="font-mono text-sm text-success">{formatCurrency(b.amountReceived)}</span>
      ),
      className: 'text-right',
    },
    {
      key: 'pending',
      header: 'Pending',
      render: (b: CustomerBill) => {
        const pending = b.amount - b.amountReceived;
        return (
          <span className={cn(
            "font-mono text-sm font-semibold",
            pending > 0 ? "text-warning" : "text-muted-foreground"
          )}>
            {formatCurrency(pending)}
          </span>
        );
      },
      className: 'text-right',
    },
    {
      key: 'status',
      header: 'Status',
      render: (b: CustomerBill) => <StatusBadge status={b.status} />,
    },
  ];

  const paymentColumns = [
    {
      key: 'date',
      header: 'Date',
      render: (p: CustomerPayment) => <span className="text-sm">{formatDate(p.date)}</span>,
    },
    {
      key: 'billNumber',
      header: 'Bill No.',
      render: (p: CustomerPayment) => <span className="font-mono text-sm">{p.billNumber}</span>,
    },
    {
      key: 'projectName',
      header: 'Project',
      render: (p: CustomerPayment) => <span className="text-sm">{p.projectName}</span>,
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (p: CustomerPayment) => <span className="text-sm">{p.customer}</span>,
    },
    {
      key: 'paymentMode',
      header: 'Mode',
      render: (p: CustomerPayment) => (
        <span className="text-xs uppercase px-2 py-1 rounded bg-secondary">{p.paymentMode}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (p: CustomerPayment) => (
        <span className="font-mono text-sm font-semibold text-success">{formatCurrency(p.amount)}</span>
      ),
      className: 'text-right',
    },
  ];

  const handleAddBill = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const projectId = formData.get('projectId') as string;
    const project = projects.find(p => p.id === projectId);
    
    const newBill: CustomerBill = {
      id: `b${Date.now()}`,
      billNumber: `INV-${new Date().getFullYear()}-${String(bills.length + 1).padStart(3, '0')}`,
      date: formData.get('date') as string,
      projectId,
      projectName: project?.name || '',
      customer: project?.customer || '',
      description: formData.get('description') as string,
      amount: Number(formData.get('amount')),
      amountReceived: 0,
      status: 'pending',
    };
    await addBill(newBill);
    setShowAddBillDialog(false);
  };

  const handleAddPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const billId = formData.get('billId') as string;
    const bill = bills.find(b => b.id === billId);
    
    if (!bill) return;

    const amount = Number(formData.get('amount'));
    const newPayment: CustomerPayment = {
      id: `cp${Date.now()}`,
      date: formData.get('date') as string,
      billId,
      billNumber: bill.billNumber,
      projectId: bill.projectId,
      projectName: bill.projectName,
      customer: bill.customer,
      amount,
      paymentMode: formData.get('paymentMode') as 'cash' | 'bank' | 'upi',
    };
    
    const newReceived = bill.amountReceived + amount;
    const updatedBill: CustomerBill = {
      ...bill,
      amountReceived: newReceived,
      status: newReceived >= bill.amount ? 'paid' : 'partial',
    };
    
    await addPayment(newPayment, updatedBill);
    setShowAddPaymentDialog(false);
  };

  const pendingBills = bills.filter(b => b.status !== 'paid');

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Customer Billing" 
        onAddNew={() => setShowAddBillDialog(true)}
        addLabel="New Bill"
      />
      
      <div className="flex-1 p-6 overflow-auto">
        <Tabs defaultValue="bills" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="bills" className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Bills
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Payments
              </TabsTrigger>
            </TabsList>
            <Button variant="outline" onClick={() => setShowAddPaymentDialog(true)}>
              Record Payment
            </Button>
          </div>

          <TabsContent value="bills" className="space-y-4">
            <DataTable columns={billColumns} data={bills} />
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <DataTable columns={paymentColumns} data={payments} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Bill Dialog */}
      <Dialog open={showAddBillDialog} onOpenChange={setShowAddBillDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Bill</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddBill} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectId">Project</Label>
                <Select name="projectId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.filter(p => p.status === 'active').map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Work Description</Label>
              <Textarea id="description" name="description" placeholder="e.g., Foundation work - Stage 1" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Bill Amount (₹)</Label>
              <Input id="amount" name="amount" type="number" step="0.01" placeholder="0" required />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddBillDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-accent">
                Create Bill
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog open={showAddPaymentDialog} onOpenChange={setShowAddPaymentDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Customer Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPayment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="billId">Against Bill</Label>
              <Select name="billId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select bill" />
                </SelectTrigger>
                <SelectContent>
                  {pendingBills.map(b => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.billNumber} - {b.projectName} ({formatCurrency(b.amount - b.amountReceived)} pending)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
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
            <div className="space-y-2">
              <Label htmlFor="amount">Amount Received (₹)</Label>
              <Input id="amount" name="amount" type="number" step="0.01" placeholder="0" required />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddPaymentDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-accent">
                Record Payment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
