import { 
  LayoutDashboard, 
  FolderKanban, 
  Package, 
  Receipt, 
  HardHat, 
  Users, 
  Building2, 
  FileBarChart,
  ChevronLeft,
  ChevronRight,
  Truck
} from 'lucide-react';
import { TabType } from '@/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const navItems: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'materials', label: 'Materials', icon: Package },
  { id: 'suppliers', label: 'Suppliers', icon: Truck },
  { id: 'billing', label: 'Billing', icon: Receipt },
  { id: 'contractors', label: 'Contractors', icon: HardHat },
  { id: 'employees', label: 'Employees', icon: Users },
  { id: 'bank', label: 'Bank & Cash', icon: Building2 },
  { id: 'reports', label: 'Reports', icon: FileBarChart },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "bg-sidebar h-screen flex flex-col border-r border-sidebar-border transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <HardHat className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground">BuildTrack</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn("nav-item w-full", activeTab === item.id && "active")}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/50">Google Sheets Backend</p>
        </div>
      )}
    </aside>
  );
}
