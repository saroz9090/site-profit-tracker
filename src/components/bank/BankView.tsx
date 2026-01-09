import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { DataTable } from '@/components/ui/data-table';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BankTransaction } from '@/types';
import { cn } from '@/lib/utils';
import { ArrowDownLeft, ArrowUpRight, Building2, Wallet } from 'lucide-react';

export function BankView() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { data, addTransaction } = useData();
  const transactions = data.transactions;

  // Calculate balances
  const bankBalance = transactions.reduce((sum, t) => {
    if (t.mode === 'bank' || t.mode === 'upi') {
      return t.type === 'deposit' ? sum + t.amount : sum - t.amount;
    }
    return sum;
  }, 0);

  const cashBalance = transactions.reduce((sum, t) => {
    if (t.mode === 'cash') {
      return t.type === 'deposit' ? sum + t.amount : sum - t.amount;
    }
    return sum;
  }, 0);

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (t: BankTransaction) => <span className="text-sm">{formatDate(t.date)}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      render: (t: BankTransaction) => (
        <div className={cn(
          "flex items-center gap-2 text-sm font-medium",
          t.type === 'deposit' ? "text-success" : "text-destructive"
        )}>
          {t.type === 'deposit' ? 
            <ArrowDownLeft className="w-4 h-4" /> : 
            <ArrowUpRight className="w-4 h-4" />
          }
          <span className="capitalize">{t.type}</span>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (t: BankTransaction) => <span className="text-sm">{t.description}</span>,
    },
    {
      key: 'mode',
      header: 'Mode',
      render: (t: BankTransaction) => (
        <span className="text-xs uppercase px-2 py-1 rounded bg-secondary">{t.mode}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (t: BankTransaction) => (
        <span className={cn(
          "font-mono text-sm font-semibold",
          t.type === 'deposit' ? "text-success" : "text-destructive"
        )}>
          {t.type === 'deposit' ? '+' : '-'}{formatCurrency(t.amount)}
        </span>
      ),
      className: 'text-right',
    },
  ];

  const handleAddTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newTransaction: BankTransaction = {
      id: `bt${Date.now()}`,
      date: formData.get('date') as string,
      type: formData.get('type') as 'deposit' | 'withdrawal',
      amount: Number(formData.get('amount')),
      description: formData.get('description') as string,
      mode: formData.get('mode') as 'cash' | 'bank' | 'upi',
    };
    await addTransaction(newTransaction);
    setShowAddDialog(false);
  };

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Bank & Cash" 
        onAddNew={() => setShowAddDialog(true)}
        addLabel="Add Transaction"
      />
      
      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Building2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Bank Balance</span>
                </div>
                <p className={cn(
                  "text-3xl font-bold",
                  bankBalance >= 0 ? "text-foreground" : "text-destructive"
                )}>
                  {formatCurrency(bankBalance)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Including UPI transactions</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-info/10 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-info" />
              </div>
            </div>
          </div>

          <div className="card-elevated p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Wallet className="w-5 h-5" />
                  <span className="text-sm font-medium">Cash in Hand</span>
                </div>
                <p className={cn(
                  "text-3xl font-bold",
                  cashBalance >= 0 ? "text-foreground" : "text-destructive"
                )}>
                  {formatCurrency(cashBalance)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Physical cash balance</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                <Wallet className="w-8 h-8 text-success" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="card-elevated p-4 bg-muted/30">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Note:</strong> This section is for general deposits and withdrawals. 
            Customer payments and contractor payments are automatically reflected in project costs—no need to enter them here.
          </p>
        </div>

        {/* Transactions Table */}
        <DataTable columns={columns} data={transactions} />
      </div>

      {/* Add Transaction Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTransaction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select name="type" defaultValue="deposit">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="e.g., Cash deposit from office" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input id="amount" name="amount" type="number" placeholder="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mode">Mode</Label>
                <Select name="mode" defaultValue="bank">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-accent">
                Add Transaction
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
