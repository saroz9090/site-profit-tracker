import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { useData } from '@/contexts/DataContext';
import { formatCurrency, formatDate, calculateProfit } from '@/lib/format';
import { cn } from '@/lib/utils';
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
import { Project } from '@/types';

export function ProjectsView() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { data, addProject } = useData();
  const projects = data.projects;

  const columns = [
    {
      key: 'name',
      header: 'Project Name',
      render: (project: Project) => (
        <div>
          <p className="font-medium text-foreground">{project.name}</p>
          <p className="text-xs text-muted-foreground">{project.customer}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (project: Project) => <StatusBadge status={project.status} />,
    },
    {
      key: 'startDate',
      header: 'Start Date',
      render: (project: Project) => (
        <span className="text-sm">{formatDate(project.startDate)}</span>
      ),
    },
    {
      key: 'totalBilled',
      header: 'Billed',
      render: (project: Project) => (
        <span className="font-mono text-sm">{formatCurrency(project.totalBilled)}</span>
      ),
      className: 'text-right',
    },
    {
      key: 'totalReceived',
      header: 'Received',
      render: (project: Project) => (
        <span className="font-mono text-sm text-success">{formatCurrency(project.totalReceived)}</span>
      ),
      className: 'text-right',
    },
    {
      key: 'pending',
      header: 'Pending',
      render: (project: Project) => {
        const pending = project.totalBilled - project.totalReceived;
        return (
          <span className={cn(
            "font-mono text-sm",
            pending > 0 ? "text-warning" : "text-muted-foreground"
          )}>
            {formatCurrency(pending)}
          </span>
        );
      },
      className: 'text-right',
    },
    {
      key: 'profit',
      header: 'Profit/Loss',
      render: (project: Project) => {
        const profit = calculateProfit(project);
        return (
          <span className={cn(
            "font-mono text-sm font-semibold",
            profit >= 0 ? "text-success" : "text-destructive"
          )}>
            {formatCurrency(profit)}
          </span>
        );
      },
      className: 'text-right',
    },
  ];

  const handleAddProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newProject: Project = {
      id: `p${Date.now()}`,
      name: formData.get('name') as string,
      customer: formData.get('customer') as string,
      startDate: formData.get('startDate') as string,
      status: formData.get('status') as 'active' | 'completed' | 'on-hold',
      totalBilled: 0,
      totalReceived: 0,
      totalMaterialCost: 0,
      totalLabourCost: 0,
      totalOtherCost: 0,
    };
    await addProject(newProject);
    setShowAddDialog(false);
  };

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Projects" 
        onAddNew={() => setShowAddDialog(true)}
        addLabel="New Project"
      />
      
      <div className="flex-1 p-6 overflow-auto">
        <DataTable columns={columns} data={projects} />
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddProject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input id="name" name="name" placeholder="e.g., Green Valley Apartments" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer">Customer Name</Label>
              <Input id="customer" name="customer" placeholder="e.g., Sharma Builders" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" name="startDate" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue="active">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-accent">
                Add Project
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
