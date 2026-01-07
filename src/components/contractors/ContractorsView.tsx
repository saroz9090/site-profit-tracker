import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { mockContractors, mockContractorWorks, mockContractorPayments, mockProjects } from '@/data/mockData';
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
import { ContractorWork, ContractorPayment } from '@/types';
import { cn } from '@/lib/utils';
import { HardHat, Wallet, Wrench } from 'lucide-react';

export function ContractorsView() {
  const [showAddWorkDialog, setShowAddWorkDialog] = useState(false);
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
  const [works, setWorks] = useState(mockContractorWorks);
  const [payments, setPayments] = useState(mockContractorPayments);

  const workColumns = [
    {
      key: 'date',
      header: 'Date',
      render: (w: ContractorWork) => <span className="text-sm">{formatDate(w.date)}</span>,
    },
    {
      key: 'contractorName',
      header: 'Contractor',
      render: (w: ContractorWork) => (
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            w.contractorType === 'labour' ? "bg-primary/10" : "bg-accent/10"
          )}>
            {w.contractorType === 'labour' ? 
              <HardHat className="w-4 h-4 text-primary" /> : 
              <Wrench className="w-4 h-4 text-accent" />
            }
          </div>
          <div>
            <p className="text-sm font-medium">{w.contractorName}</p>
            <StatusBadge status={w.contractorType} />
          </div>
        </div>
      ),
    },
    {
      key: 'projectName',
      header: 'Project',
      render: (w: ContractorWork) => <span className="text-sm">{w.projectName}</span>,
    },
    {
      key: 'description',
      header: 'Work Description',
      render: (w: ContractorWork) => <span className="text-sm text-muted-foreground">{w.description}</span>,
    },
    {
      key: 'workValue',
      header: 'Work Value',
      render: (w: ContractorWork) => <span className="font-mono text-sm">{formatCurrency(w.workValue)}</span>,
      className: 'text-right',
    },
    {
      key: 'amountPaid',
      header: 'Paid',
      render: (w: ContractorWork) => (
        <span className="font-mono text-sm text-success">{formatCurrency(w.amountPaid)}</span>
      ),
      className: 'text-right',
    },
    {
      key: 'pending',
      header: 'Payable',
      render: (w: ContractorWork) => {
        const pending = w.workValue - w.amountPaid;
        return (
          <span className={cn(
            "font-mono text-sm font-semibold",
            pending > 0 ? "text-destructive" : "text-muted-foreground"
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
      render: (w: ContractorWork) => <StatusBadge status={w.status} />,
    },
  ];

  const paymentColumns = [
    {
      key: 'date',
      header: 'Date',
      render: (p: ContractorPayment) => <span className="text-sm">{formatDate(p.date)}</span>,
    },
    {
      key: 'contractorName',
      header: 'Contractor',
      render: (p: ContractorPayment) => <span className="text-sm font-medium">{p.contractorName}</span>,
    },
    {
      key: 'projectName',
      header: 'Project',
      render: (p: ContractorPayment) => <span className="text-sm">{p.projectName}</span>,
    },
    {
      key: 'paymentMode',
      header: 'Mode',
      render: (p: ContractorPayment) => (
        <span className="text-xs uppercase px-2 py-1 rounded bg-secondary">{p.paymentMode}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (p: ContractorPayment) => (
        <span className="font-mono text-sm font-semibold text-destructive">{formatCurrency(p.amount)}</span>
      ),
      className: 'text-right',
    },
  ];

  const handleAddWork = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const contractorId = formData.get('contractorId') as string;
    const contractor = mockContractors.find(c => c.id === contractorId);
    const projectId = formData.get('projectId') as string;
    const project = mockProjects.find(p => p.id === projectId);
    
    const newWork: ContractorWork = {
      id: `cw${Date.now()}`,
      date: formData.get('date') as string,
      contractorId,
      contractorName: contractor?.name || '',
      contractorType: contractor?.type || 'labour',
      projectId,
      projectName: project?.name || '',
      description: formData.get('description') as string,
      workValue: Number(formData.get('workValue')),
      amountPaid: 0,
      status: 'pending',
    };
    setWorks([newWork, ...works]);
    setShowAddWorkDialog(false);
  };

  const handleAddPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const workId = formData.get('workId') as string;
    const work = works.find(w => w.id === workId);
    
    const amount = Number(formData.get('amount'));
    const newPayment: ContractorPayment = {
      id: `cpp${Date.now()}`,
      date: formData.get('date') as string,
      workId,
      contractorId: work?.contractorId || '',
      contractorName: work?.contractorName || '',
      projectId: work?.projectId || '',
      projectName: work?.projectName || '',
      amount,
      paymentMode: formData.get('paymentMode') as 'cash' | 'bank' | 'upi',
    };
    
    // Update work
    setWorks(works.map(w => {
      if (w.id === workId) {
        const newPaid = w.amountPaid + amount;
        return {
          ...w,
          amountPaid: newPaid,
          status: newPaid >= w.workValue ? 'paid' : 'partial',
        };
      }
      return w;
    }));
    
    setPayments([newPayment, ...payments]);
    setShowAddPaymentDialog(false);
  };

  const pendingWorks = works.filter(w => w.status !== 'paid');
  const totalPayable = works.reduce((sum, w) => sum + (w.workValue - w.amountPaid), 0);

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Contractors" 
        onAddNew={() => setShowAddWorkDialog(true)}
        addLabel="Add Work"
      />
      
      <div className="flex-1 p-6 overflow-auto">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Work Value</p>
            <p className="text-xl font-bold">{formatCurrency(works.reduce((s, w) => s + w.workValue, 0))}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Paid</p>
            <p className="text-xl font-bold text-success">{formatCurrency(works.reduce((s, w) => s + w.amountPaid, 0))}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Pending Payment</p>
            <p className="text-xl font-bold text-destructive">{formatCurrency(totalPayable)}</p>
          </div>
        </div>

        <Tabs defaultValue="works" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="works" className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Work Records
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Payments
              </TabsTrigger>
            </TabsList>
            <Button variant="outline" onClick={() => setShowAddPaymentDialog(true)}>
              Make Payment
            </Button>
          </div>

          <TabsContent value="works" className="space-y-4">
            <DataTable columns={workColumns} data={works} />
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <DataTable columns={paymentColumns} data={payments} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Work Dialog */}
      <Dialog open={showAddWorkDialog} onOpenChange={setShowAddWorkDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Contractor Work</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddWork} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractorId">Contractor</Label>
                <Select name="contractorId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contractor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockContractors.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectId">Project</Label>
              <Select name="projectId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {mockProjects.filter(p => p.status === 'active').map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Work Description</Label>
              <Textarea id="description" name="description" placeholder="e.g., Foundation excavation labour" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workValue">Work Value (₹)</Label>
              <Input id="workValue" name="workValue" type="number" step="0.01" placeholder="0" required />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddWorkDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-accent">
                Add Work
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog open={showAddPaymentDialog} onOpenChange={setShowAddPaymentDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Make Contractor Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPayment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workId">Against Work</Label>
              <Select name="workId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select work record" />
                </SelectTrigger>
                <SelectContent>
                  {pendingWorks.map(w => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.contractorName} - {w.description} ({formatCurrency(w.workValue - w.amountPaid)} pending)
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
                <Select name="paymentMode" defaultValue="cash">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input id="amount" name="amount" type="number" step="0.01" placeholder="0" required />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddPaymentDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-accent">
                Make Payment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
