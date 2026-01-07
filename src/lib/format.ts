export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
}

export function calculateProfit(project: {
  totalBilled: number;
  totalMaterialCost: number;
  totalLabourCost: number;
  totalOtherCost: number;
}): number {
  return project.totalBilled - project.totalMaterialCost - project.totalLabourCost - project.totalOtherCost;
}

export function calculateProfitPercentage(project: {
  totalBilled: number;
  totalMaterialCost: number;
  totalLabourCost: number;
  totalOtherCost: number;
}): number {
  const profit = calculateProfit(project);
  if (project.totalBilled === 0) return 0;
  return (profit / project.totalBilled) * 100;
}
