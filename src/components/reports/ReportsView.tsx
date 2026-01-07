import { Header } from '@/components/layout/Header';
import { mockProjects, mockMaterials, mockBills, mockContractorWorks } from '@/data/mockData';
import { formatCurrency, formatNumber, calculateProfit, calculateProfitPercentage } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Users, 
  HardHat,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export function ReportsView() {
  // Project Profit/Loss Report
  const projectReport = mockProjects.map(p => ({
    ...p,
    profit: calculateProfit(p),
    profitPercent: calculateProfitPercentage(p),
    customerPending: p.totalBilled - p.totalReceived,
  }));

  // Material Usage Report
  const materialByProject = mockProjects.map(project => {
    const projectMaterials = mockMaterials.filter(m => m.projectId === project.id);
    const materialSummary = projectMaterials.reduce((acc, m) => {
      if (!acc[m.material]) {
        acc[m.material] = { quantity: 0, total: 0, unit: m.unit };
      }
      acc[m.material].quantity += m.quantity;
      acc[m.material].total += m.totalAmount;
      return acc;
    }, {} as Record<string, { quantity: number; total: number; unit: string }>);
    
    return {
      project,
      materials: Object.entries(materialSummary).map(([name, data]) => ({
        name,
        ...data,
      })),
      totalCost: projectMaterials.reduce((sum, m) => sum + m.totalAmount, 0),
    };
  });

  // Customer Pending Report
  const customerPendingReport = mockBills
    .filter(b => b.status !== 'paid')
    .map(b => ({
      ...b,
      pending: b.amount - b.amountReceived,
    }))
    .sort((a, b) => b.pending - a.pending);

  // Contractor Pending Report
  const contractorPendingReport = mockContractorWorks
    .filter(w => w.status !== 'paid')
    .map(w => ({
      ...w,
      pending: w.workValue - w.amountPaid,
    }))
    .sort((a, b) => b.pending - a.pending);

  const totalCustomerPending = customerPendingReport.reduce((s, b) => s + b.pending, 0);
  const totalContractorPending = contractorPendingReport.reduce((s, w) => s + w.pending, 0);

  return (
    <div className="flex flex-col h-full">
      <Header title="Reports" />
      
      <div className="flex-1 p-6 overflow-auto">
        <Tabs defaultValue="profit" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="profit">Project P&L</TabsTrigger>
            <TabsTrigger value="materials">Material Usage</TabsTrigger>
            <TabsTrigger value="customer">Customer Pending</TabsTrigger>
            <TabsTrigger value="contractor">Contractor Pending</TabsTrigger>
          </TabsList>

          {/* Project Profit/Loss Report */}
          <TabsContent value="profit" className="space-y-4">
            <div className="card-elevated overflow-hidden">
              <div className="p-4 bg-muted/30 border-b">
                <h3 className="font-semibold">Project-wise Profit & Loss</h3>
              </div>
              <div className="divide-y">
                {projectReport.map(p => (
                  <div key={p.id} className="p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{p.name}</h4>
                        <p className="text-sm text-muted-foreground">{p.customer}</p>
                      </div>
                      <div className="text-right">
                        <div className={cn(
                          "flex items-center gap-1 font-bold text-lg",
                          p.profit >= 0 ? "text-success" : "text-destructive"
                        )}>
                          {p.profit >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                          {formatCurrency(p.profit)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {p.profitPercent.toFixed(1)}% margin
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Billed</p>
                        <p className="font-mono font-medium">{formatCurrency(p.totalBilled)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Materials</p>
                        <p className="font-mono font-medium">{formatCurrency(p.totalMaterialCost)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Labour</p>
                        <p className="font-mono font-medium">{formatCurrency(p.totalLabourCost)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Other</p>
                        <p className="font-mono font-medium">{formatCurrency(p.totalOtherCost)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pending</p>
                        <p className={cn(
                          "font-mono font-medium",
                          p.customerPending > 0 ? "text-warning" : "text-success"
                        )}>
                          {formatCurrency(p.customerPending)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Material Usage Report */}
          <TabsContent value="materials" className="space-y-4">
            {materialByProject.map(({ project, materials, totalCost }) => (
              <div key={project.id} className="card-elevated overflow-hidden">
                <div className="p-4 bg-muted/30 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-primary" />
                    <div>
                      <h4 className="font-medium">{project.name}</h4>
                      <p className="text-xs text-muted-foreground">{project.customer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold">{formatCurrency(totalCost)}</p>
                    <p className="text-xs text-muted-foreground">Total Material Cost</p>
                  </div>
                </div>
                {materials.length > 0 ? (
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {materials.map((m, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-muted/30">
                          <p className="font-medium text-sm">{m.name}</p>
                          <div className="flex justify-between items-end mt-1">
                            <span className="text-sm text-muted-foreground">
                              {formatNumber(m.quantity)} {m.unit}
                            </span>
                            <span className="font-mono text-sm font-medium">
                              {formatCurrency(m.total)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No materials purchased yet
                  </div>
                )}
              </div>
            ))}
          </TabsContent>

          {/* Customer Pending Report */}
          <TabsContent value="customer" className="space-y-4">
            <div className="stat-card bg-warning/5 border-warning/20">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-warning" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Pending from Customers</p>
                  <p className="text-2xl font-bold text-warning">{formatCurrency(totalCustomerPending)}</p>
                </div>
              </div>
            </div>

            <div className="card-elevated overflow-hidden">
              <div className="divide-y">
                {customerPendingReport.length === 0 ? (
                  <div className="p-8 text-center">
                    <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                    <p className="text-success font-medium">All bills are fully paid!</p>
                  </div>
                ) : (
                  customerPendingReport.map(b => (
                    <div key={b.id} className="p-4 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono text-sm font-medium">{b.billNumber}</p>
                          <p className="text-sm">{b.projectName}</p>
                          <p className="text-xs text-muted-foreground">{b.customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-warning">{formatCurrency(b.pending)}</p>
                          <p className="text-xs text-muted-foreground">
                            of {formatCurrency(b.amount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Contractor Pending Report */}
          <TabsContent value="contractor" className="space-y-4">
            <div className="stat-card bg-destructive/5 border-destructive/20">
              <div className="flex items-center gap-3">
                <HardHat className="w-6 h-6 text-destructive" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Payable to Contractors</p>
                  <p className="text-2xl font-bold text-destructive">{formatCurrency(totalContractorPending)}</p>
                </div>
              </div>
            </div>

            <div className="card-elevated overflow-hidden">
              <div className="divide-y">
                {contractorPendingReport.length === 0 ? (
                  <div className="p-8 text-center">
                    <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                    <p className="text-success font-medium">All contractors are fully paid!</p>
                  </div>
                ) : (
                  contractorPendingReport.map(w => (
                    <div key={w.id} className="p-4 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{w.contractorName}</p>
                          <p className="text-sm text-muted-foreground">{w.description}</p>
                          <p className="text-xs text-muted-foreground">{w.projectName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-destructive">{formatCurrency(w.pending)}</p>
                          <p className="text-xs text-muted-foreground">
                            of {formatCurrency(w.workValue)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
