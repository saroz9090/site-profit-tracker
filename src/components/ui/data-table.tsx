import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({ 
  columns, 
  data, 
  onRowClick,
  emptyMessage = "No data available" 
}: DataTableProps<T>) {
  return (
    <div className="card-elevated overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead>
            <tr className="table-header border-b border-border">
              {columns.map((col) => (
                <th 
                  key={String(col.key)} 
                  className={cn("px-4 py-3 text-left", col.className)}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr 
                  key={item.id}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "border-b border-border/50 transition-colors",
                    onRowClick && "cursor-pointer hover:bg-muted/50",
                    idx % 2 === 0 ? "bg-card" : "bg-muted/20"
                  )}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {columns.map((col) => (
                    <td 
                      key={String(col.key)} 
                      className={cn("px-4 py-3 text-sm", col.className)}
                    >
                      {col.render 
                        ? col.render(item) 
                        : String((item as Record<string, unknown>)[col.key as string] ?? '')
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
