import { Bell, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title: string;
  onAddNew?: () => void;
  addLabel?: string;
}

export function Header({ title, onAddNew, addLabel }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="input-field pl-9 w-64"
          />
        </div>

        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-secondary transition-colors relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full"></span>
        </button>

        {/* Add New Button */}
        {onAddNew && (
          <Button onClick={onAddNew} className="btn-accent flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{addLabel || 'Add New'}</span>
          </Button>
        )}
      </div>
    </header>
  );
}
