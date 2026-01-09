import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { DataTable } from '@/components/ui/data-table';
import { useData } from '@/contexts/DataContext';
import { formatCurrency, formatDate, formatNumber } from '@/lib/format';
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
import { MaterialPurchase } from '@/types';
import { Package } from 'lucide-react';

export function MaterialsView() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filterProject, setFilterProject] = useState<string>('all');
  const { data, addMaterial } = useData();
  const materials = data.materials;
  const projects = data.projects;

  const filteredMaterials = filterProject === 'all' 
    ? materials 
    : materials.filter(m => m.projectId === filterProject);

  // Calculate totals by material type
  const materialSummary = materials.reduce((acc, m) => {
    if (!acc[m.material]) {
      acc[m.material] = { quantity: 0, total: 0, unit: m.unit };
    }
    acc[m.material].quantity += m.quantity;
    acc[m.material].total += m.totalAmount;
    return acc;
  }, {} as Record<string, { quantity: number; total: number; unit: string }>);

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (m: MaterialPurchase) => (
        <span className="text-sm">{formatDate(m.date)}</span>
      ),
    },
    {
      key: 'material',
      header: 'Material',
      render: (m: MaterialPurchase) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">{m.material}</p>
            <p className="text-xs text-muted-foreground">{m.supplier}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (m: MaterialPurchase) => (
        <span className="font-mono text-sm">{formatNumber(m.quantity)} {m.unit}</span>
      ),
    },
    {
      key: 'unitPrice',
      header: 'Rate',
      render: (m: MaterialPurchase) => (
        <span className="font-mono text-sm text-muted-foreground">{formatCurrency(m.unitPrice)}/{m.unit}</span>
      ),
    },
    {
      key: 'projectName',
      header: 'Project',
      render: (m: MaterialPurchase) => (
        <span className="text-sm px-2 py-1 rounded-md bg-secondary">{m.projectName}</span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Amount',
      render: (m: MaterialPurchase) => (
        <span className="font-mono text-sm font-semibold">{formatCurrency(m.totalAmount)}</span>
      ),
      className: 'text-right',
    },
  ];

  const handleAddMaterial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const projectId = formData.get('projectId') as string;
    const project = projects.find(p => p.id === projectId);
    const quantity = Number(formData.get('quantity'));
    const unitPrice = Number(formData.get('unitPrice'));
    
    const newMaterial: MaterialPurchase = {
      id: `m${Date.now()}`,
      date: formData.get('date') as string,
      supplier: formData.get('supplier') as string,
      material: formData.get('material') as string,
      quantity,
      unit: formData.get('unit') as string,
      unitPrice,
      totalAmount: quantity * unitPrice,
      projectId,
      projectName: project?.name || '',
    };
    await addMaterial(newMaterial);
    setShowAddDialog(false);
  };

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Materials" 
        onAddNew={() => setShowAddDialog(true)}
        addLabel="Add Purchase"
      />
      
      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* Material Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(materialSummary).map(([material, data]) => (
            <div key={material} className="stat-card">
              <p className="text-xs font-medium text-muted-foreground truncate">{material}</p>
              <p className="text-lg font-bold text-foreground">{formatNumber(data.quantity)} {data.unit}</p>
              <p className="text-xs text-muted-foreground">{formatCurrency(data.total)}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4">
          <Label className="text-sm text-muted-foreground">Filter by Project:</Label>
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DataTable columns={columns} data={filteredMaterials} />
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Material Purchase</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMaterial} className="space-y-4">
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
              <Label htmlFor="supplier">Supplier Name</Label>
              <Input id="supplier" name="supplier" placeholder="e.g., Ambuja Cement Dealer" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input id="material" name="material" placeholder="e.g., Cement (OPC 53)" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select name="unit" defaultValue="bags">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bags">Bags</SelectItem>
                    <SelectItem value="tonnes">Tonnes</SelectItem>
                    <SelectItem value="brass">Brass</SelectItem>
                    <SelectItem value="cft">CFT</SelectItem>
                    <SelectItem value="sqft">Sq.Ft</SelectItem>
                    <SelectItem value="nos">Nos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" name="quantity" type="number" step="0.01" placeholder="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Rate per Unit (₹)</Label>
                <Input id="unitPrice" name="unitPrice" type="number" step="0.01" placeholder="0" required />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-accent">
                Add Purchase
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
