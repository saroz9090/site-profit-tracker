import { 
  FolderKanban, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Receipt,
  Package,
  HardHat,
  AlertCircle,
  Loader2,
  CloudOff,
  Link
} from 'lucide-react';
import { useState } from 'react';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { useData } from '@/contexts/DataContext';
import { formatCurrency, calculateProfit, calculateProfitPercentage } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function extractSpreadsheetId(value: string): string | null {
  const trimmed = value.trim();
  const matchUrl = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (matchUrl?.[1]) return matchUrl[1];
  const matchId = trimmed.match(/^([a-zA-Z0-9-_]{20,})$/);
  return matchId?.[1] ?? null;
}

export function Dashboard() {
  const { data, isConnected, isSyncing, hasInitialized, connect, connectExisting, isLoading } = useData();
  const [existingInput, setExistingInput] = useState('');
  const { projects, bills, contractors } = data;

  // Show loading state during initial sync
  if (!hasInitialized && isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading data from Google Sheets...</p>
      </div>
    );
  }

  // Show connect prompt if not connected
  if (!isConnected) {
    const id = extractSpreadsheetId(existingInput);

    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 px-6">
        <CloudOff className="w-12 h-12 text-muted-foreground" />
        <div className="text-center w-full max-w-lg">
          <h3 className="font-semibold text-lg text-foreground mb-2">Connect your Google Sheet</h3>
          <p className="text-muted-foreground mb-4">
            Paste your Sheet link/ID and we’ll create the required tabs + headers automatically.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <Input
              placeholder="Paste Sheet link or Spreadsheet ID"
              value={existingInput}
              onChange={(e) => setExistingInput(e.target.value)}
            />
            <Button onClick={() => id && connectExisting(id)} disabled={!id || isSyncing}>
              {isSyncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Link className="w-4 h-4 mr-2" />}
              Connect Existing
            </Button>
          </div>

          <div className="flex justify-center">
            <Button onClick={() => connect()} disabled={isLoading} variant="outline">
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Create New Spreadsheet
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
      {isSyncing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin" />
          Syncing with Google Sheets...
        </div>
      )}
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
