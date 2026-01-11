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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaterialPurchase, MaterialItem } from '@/types';
import { Package, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function MaterialsView() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAddMaterialDialog, setShowAddMaterialDialog] = useState(false);
  const [filterProject, setFilterProject] = useState<string>('all');
  const { data, addMaterial, addMaterialItem, updateMaterialItem, deleteMaterialItem } = useData();
  const materials = data.materials;
  const projects = data.projects;
  const materialItems = data.materialItems;
  const suppliers = data.suppliers;

  const filteredMaterials = filterProject === 'all' 
    ? materials 
    : materials.filter(m => m.projectId === filterProject);

  // Calculate totals by material type
  const materialSummary = materials.reduce((acc, m) => {
    if (!acc[m.materialName]) {
      acc[m.materialName] = { quantity: 0, total: 0, unit: m.unit };
    }
    acc[m.materialName].quantity += m.quantity;
    acc[m.materialName].total += m.totalAmount;
    return acc;
  }, {} as Record<string, { quantity: number; total: number; unit: string }>);

  const purchaseColumns = [
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
            <p className="font-medium text-sm">{m.materialName}</p>
            <p className="text-xs text-muted-foreground">{m.supplierName}</p>
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

  const materialItemColumns = [
    {
      key: 'name',
      header: 'Material Name',
      render: (m: MaterialItem) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          <span className="font-medium">{m.name}</span>
        </div>
      ),
    },
    {
      key: 'unit',
      header: 'Unit',
      render: (m: MaterialItem) => (
        <span className="text-sm px-2 py-1 rounded-md bg-secondary">{m.unit}</span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (m: MaterialItem) => (
        <span className="text-sm text-muted-foreground">{m.description || '-'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (m: MaterialItem) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleDeleteMaterialItem(m.id)}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
      className: 'text-right',
    },
  ];

  const handleAddPurchase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const projectId = formData.get('projectId') as string;
    const project = projects.find(p => p.id === projectId);
    const supplierId = formData.get('supplierId') as string;
    const supplier = suppliers.find(s => s.id === supplierId);
    const materialId = formData.get('materialId') as string;
    const materialItem = materialItems.find(m => m.id === materialId);
    const quantity = Number(formData.get('quantity'));
    const unitPrice = Number(formData.get('unitPrice'));
    
    if (!project || !supplier || !materialItem) {
      toast.error('Please select valid project, supplier, and material');
      return;
    }
    
    const newMaterial: MaterialPurchase = {
      id: `m${Date.now()}`,
      date: formData.get('date') as string,
      supplierId,
      supplierName: supplier.name,
      materialId,
      materialName: materialItem.name,
      quantity,
      unit: materialItem.unit,
      unitPrice,
      totalAmount: quantity * unitPrice,
      amountPaid: 0,
      projectId,
      projectName: project.name,
    };
    await addMaterial(newMaterial);
    setShowAddDialog(false);
  };

  const handleAddMaterialItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem: MaterialItem = {
      id: `mat${Date.now()}`,
      name: formData.get('name') as string,
      unit: formData.get('unit') as string,
      description: formData.get('description') as string || undefined,
    };
    await addMaterialItem(newItem);
    setShowAddMaterialDialog(false);
    toast.success('Material added to catalog');
  };

  const handleDeleteMaterialItem = async (id: string) => {
    // Check if material is used in any purchase
    const isUsed = materials.some(m => m.materialId === id);
    if (isUsed) {
      toast.error('Cannot delete material that has purchases');
      return;
    }
    await deleteMaterialItem(id);
    toast.success('Material deleted');
  };

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Materials" 
        onAddNew={() => setShowAddDialog(true)}
        addLabel="Add Purchase"
      />
      
      <div className="flex-1 p-6 overflow-auto space-y-6">
        <Tabs defaultValue="purchases" className="space-y-4">
          <TabsList>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="catalog">Material Catalog</TabsTrigger>
          </TabsList>

          <TabsContent value="purchases" className="space-y-6">
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

            {suppliers.length === 0 || materialItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">Add materials and suppliers first</p>
                <p className="text-sm">Go to the Catalog tab to add materials, and Suppliers tab to add suppliers</p>
              </div>
            ) : (
              <DataTable columns={purchaseColumns} data={filteredMaterials} />
            )}
          </TabsContent>

          <TabsContent value="catalog" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowAddMaterialDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Material
              </Button>
            </div>
            
            {materialItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No materials in catalog. Add your first material.</p>
              </div>
            ) : (
              <DataTable columns={materialItemColumns} data={materialItems} />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Purchase Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Material Purchase</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPurchase} className="space-y-4">
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
              <Label htmlFor="supplierId">Supplier</Label>
              <Select name="supplierId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="materialId">Material</Label>
              <Select name="materialId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {materialItems.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name} ({m.unit})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* Add Material Item Dialog */}
      <Dialog open={showAddMaterialDialog} onOpenChange={setShowAddMaterialDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Material to Catalog</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMaterialItem} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Material Name</Label>
              <Input id="name" name="name" placeholder="e.g., Cement (OPC 53)" required />
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
                  <SelectItem value="kg">KG</SelectItem>
                  <SelectItem value="liters">Liters</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input id="description" name="description" placeholder="e.g., Ordinary Portland Cement 53 grade" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddMaterialDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-accent">
                Add Material
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
