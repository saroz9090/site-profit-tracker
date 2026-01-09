import { 
  FolderKanban, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Receipt,
  Package,
  HardHat,
  AlertCircle
} from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { useData } from '@/contexts/DataContext';
import { formatCurrency, calculateProfit, calculateProfitPercentage } from '@/lib/format';
import { cn } from '@/lib/utils';

export function Dashboard() {
  const { data } = useData();
  const { projects, bills, contractors } = data;

  // Calculate totals
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalBilled = projects.reduce((sum, p) => sum + p.totalBilled, 0);
  const totalReceived = projects.reduce((sum, p) => sum + p.totalReceived, 0);
  const totalProfit = projects.reduce((sum, p) => sum + calculateProfit(p), 0);
  const pendingFromCustomers = bills.reduce((sum, b) => sum + (b.amount - b.amountReceived), 0);
  const pendingToContractors = contractors.reduce((sum, w) => sum + (w.workValue - w.amountPaid), 0);

  // Project overview data
  const projectOverview = projects.map(p => ({
    ...p,
    profit: calculateProfit(p),
    profitPercent: calculateProfitPercentage(p),
    pending: p.totalBilled - p.totalReceived,
  }));

  // Recent pending bills
  const pendingBills = bills.filter(b => b.status !== 'paid').slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Projects"
          value={activeProjects}
          subtitle={`${projects.length} total projects`}
          icon={FolderKanban}
          variant="info"
        />
        <StatCard
          title="Total Billed"
          value={formatCurrency(totalBilled)}
          subtitle={`${formatCurrency(totalReceived)} received`}
          icon={Receipt}
          variant="default"
        />
        <StatCard
          title="Total Profit"
          value={formatCurrency(totalProfit)}
          icon={totalProfit >= 0 ? TrendingUp : TrendingDown}
          variant={totalProfit >= 0 ? 'success' : 'destructive'}
        />
        <StatCard
          title="Customer Pending"
          value={formatCurrency(pendingFromCustomers)}
          subtitle={`${formatCurrency(pendingToContractors)} to contractors`}
          icon={Clock}
          variant="warning"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Profit Overview */}
        <div className="card-elevated p-5">
          <h3 className="font-semibold text-foreground mb-4">Project Profit Overview</h3>
          <div className="space-y-3">
            {projectOverview.map((project) => (
              <div 
                key={project.id} 
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-2 h-10 rounded-full",
                    project.profit >= 0 ? "bg-success" : "bg-destructive"
                  )} />
                  <div>
                    <p className="font-medium text-sm text-foreground">{project.name}</p>
                    <p className="text-xs text-muted-foreground">{project.customer}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "font-semibold text-sm",
                    project.profit >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {formatCurrency(project.profit)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {project.profitPercent.toFixed(1)}% margin
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Bills */}
        <div className="card-elevated p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-warning" />
            Pending Customer Bills
          </h3>
          <div className="space-y-3">
            {pendingBills.map((bill) => (
              <div 
                key={bill.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div>
                  <p className="font-medium text-sm text-foreground">{bill.billNumber}</p>
                  <p className="text-xs text-muted-foreground">{bill.projectName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-warning">
                    {formatCurrency(bill.amount - bill.amountReceived)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    of {formatCurrency(bill.amount)}
                  </p>
                </div>
              </div>
            ))}
            {pendingBills.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                All bills are paid! 🎉
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Package className="w-4 h-4" />
            <span className="text-xs font-medium">Materials</span>
          </div>
          <p className="text-lg font-bold text-foreground">
            {formatCurrency(projects.reduce((sum, p) => sum + p.totalMaterialCost, 0))}
          </p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <HardHat className="w-4 h-4" />
            <span className="text-xs font-medium">Labour Cost</span>
          </div>
          <p className="text-lg font-bold text-foreground">
            {formatCurrency(projects.reduce((sum, p) => sum + p.totalLabourCost, 0))}
          </p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Received</span>
          </div>
          <p className="text-lg font-bold text-success">
            {formatCurrency(totalReceived)}
          </p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">To Contractors</span>
          </div>
          <p className="text-lg font-bold text-warning">
            {formatCurrency(pendingToContractors)}
          </p>
        </div>
      </div>
    </div>
  );
}
