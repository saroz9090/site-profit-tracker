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
import { Supplier, SupplierPayment } from '@/types';
import { Truck, Plus, Pencil, Trash2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function SuppliersView() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const { data, addSupplier, updateSupplier, deleteSupplier, addSupplierPayment } = useData();
  const { suppliers, supplierPayments, materials } = data;

  // Calculate pending amounts from materials
  const suppliersWithPending = suppliers.map(s => {
    const supplierMaterials = materials.filter(m => m.supplierId === s.id);
    const totalPurchased = supplierMaterials.reduce((sum, m) => sum + m.totalAmount, 0);
    const totalPaid = supplierPayments
      .filter(p => p.supplierId === s.id)
      .reduce((sum, p) => sum + p.amount, 0);
    return {
      ...s,
      totalPurchased,
      totalPaid,
      pending: totalPurchased - totalPaid,
    };
  });

  const totalPending = suppliersWithPending.reduce((sum, s) => sum + s.pending, 0);

  const columns = [
    {
      key: 'name',
      header: 'Supplier Name',
      render: (s: Supplier & { pending: number }) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Truck className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{s.name}</p>
            {s.phone && <p className="text-xs text-muted-foreground">{s.phone}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Address',
      render: (s: Supplier) => (
        <span className="text-sm text-muted-foreground">{s.address || '-'}</span>
      ),
    },
    {
      key: 'totalPurchased',
      header: 'Total Purchased',
      render: (s: Supplier & { totalPurchased: number }) => (
        <span className="font-mono text-sm">{formatCurrency(s.totalPurchased)}</span>
      ),
      className: 'text-right',
    },
    {
      key: 'totalPaid',
      header: 'Total Paid',
      render: (s: Supplier & { totalPaid: number }) => (
        <span className="font-mono text-sm text-success">{formatCurrency(s.totalPaid)}</span>
      ),
      className: 'text-right',
    },
    {
      key: 'pending',
      header: 'Pending',
      render: (s: Supplier & { pending: number }) => (
        <span className={cn(
          "font-mono text-sm font-semibold",
          s.pending > 0 ? "text-destructive" : "text-success"
        )}>
          {formatCurrency(s.pending)}
        </span>
      ),
      className: 'text-right',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (s: Supplier & { pending: number }) => (
        <div className="flex items-center gap-1 justify-end">
          {s.pending > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSelectedSupplier(s);
                setShowPaymentDialog(true);
              }}
            >
              <CreditCard className="w-4 h-4 text-primary" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setSelectedSupplier(s);
              setShowEditDialog(true);
            }}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleDelete(s.id)}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
      className: 'text-right',
    },
  ];

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newSupplier: Supplier = {
      id: `sup${Date.now()}`,
      name: formData.get('name') as string,
      phone: formData.get('phone') as string || undefined,
      address: formData.get('address') as string || undefined,
      totalPurchased: 0,
      totalPaid: 0,
    };
    await addSupplier(newSupplier);
    setShowAddDialog(false);
    toast.success('Supplier added');
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    
    const formData = new FormData(e.currentTarget);
    const updated: Supplier = {
      ...selectedSupplier,
      name: formData.get('name') as string,
      phone: formData.get('phone') as string || undefined,
      address: formData.get('address') as string || undefined,
    };
    await updateSupplier(updated);
    setShowEditDialog(false);
    setSelectedSupplier(null);
    toast.success('Supplier updated');
  };

  const handleDelete = async (id: string) => {
    // Check if supplier has purchases
    const hasPurchases = materials.some(m => m.supplierId === id);
    if (hasPurchases) {
      toast.error('Cannot delete supplier with purchases');
      return;
    }
    await deleteSupplier(id);
    toast.success('Supplier deleted');
  };

  const handlePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    
    const formData = new FormData(e.currentTarget);
    const payment: SupplierPayment = {
      id: `spp${Date.now()}`,
      date: formData.get('date') as string,
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      amount: Number(formData.get('amount')),
      paymentMode: formData.get('paymentMode') as 'cash' | 'bank' | 'upi',
      description: formData.get('description') as string || undefined,
    };
    await addSupplierPayment(payment);
    setShowPaymentDialog(false);
    setSelectedSupplier(null);
    toast.success('Payment recorded');
  };

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Suppliers" 
        onAddNew={() => setShowAddDialog(true)}
        addLabel="Add Supplier"
      />
      
      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* Summary Card */}
        <div className="stat-card bg-destructive/5 border-destructive/20">
          <div className="flex items-center gap-3">
            <Truck className="w-6 h-6 text-destructive" />
            <div>
              <p className="text-sm text-muted-foreground">Total Payable to Suppliers</p>
              <p className="text-2xl font-bold text-destructive">{formatCurrency(totalPending)}</p>
            </div>
          </div>
        </div>

        {suppliers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No suppliers yet. Add your first supplier.</p>
          </div>
        ) : (
          <DataTable columns={columns} data={suppliersWithPending} />
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Supplier Name</Label>
              <Input id="name" name="name" placeholder="e.g., Ambuja Cement Dealer" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input id="phone" name="phone" placeholder="e.g., 9876543210" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address (Optional)</Label>
              <Input id="address" name="address" placeholder="e.g., Industrial Area" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-accent">
                Add Supplier
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Supplier Name</Label>
              <Input id="editName" name="name" defaultValue={selectedSupplier?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPhone">Phone (Optional)</Label>
              <Input id="editPhone" name="phone" defaultValue={selectedSupplier?.phone || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editAddress">Address (Optional)</Label>
              <Input id="editAddress" name="address" defaultValue={selectedSupplier?.address || ''} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-accent">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment to {selectedSupplier?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePayment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Date</Label>
              <Input id="paymentDate" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Amount (₹)</Label>
              <Input id="paymentAmount" name="amount" type="number" step="0.01" placeholder="0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMode">Payment Mode</Label>
              <Select name="paymentMode" defaultValue="bank">
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
            <div className="space-y-2">
              <Label htmlFor="paymentDescription">Description (Optional)</Label>
              <Input id="paymentDescription" name="description" placeholder="e.g., Partial payment for cement" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowPaymentDialog(false)}>
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
