# AI Copilot Instructions for Site Profit Tracker

## Project Overview

**Site Profit Tracker** is a Vite-React-TypeScript web application for construction project management and financial tracking. It monitors projects, materials, labour/contractors, customer billing, and cashflow—all using mock data (no backend).

**Tech Stack**: Vite, React 18, TypeScript, shadcn-ui (Radix UI), Tailwind CSS, TanStack Query, Lucide icons

## Architecture & Data Flow

### Component Structure
- **Pages** (`src/pages/`): Single-page app with `Index.tsx` managing tab-based navigation via `activeTab` state
- **Layouts** (`src/components/layout/`): 
  - `Sidebar.tsx`: Collapsible navigation with 8 main tabs (Dashboard, Projects, Materials, Billing, Contractors, Employees, Bank, Reports)
  - `Header.tsx`: Reusable header with title, search, notifications, and "Add New" button
- **Views** (`src/components/<domain>/`): One component per tab (e.g., `ProjectsView.tsx`, `BillingView.tsx`)
  - Views manage local state for dialogs/forms using `useState`
  - All use mock data from `src/data/mockData.ts` directly (no API calls yet)
- **UI Components** (`src/components/ui/`): shadcn-ui components (button, dialog, data-table, form, etc.)

### Data Model
Central type definitions in `src/types/index.ts` covering:
- **Entities**: Project, MaterialPurchase, CustomerBill, Contractor, ContractorWork, Employee, SalaryPayment, BankTransaction
- **Relationships**: Bills/Payments reference Projects; Contractor Work references Projects; Employees track project assignment
- **Status Enums**: Projects (active|completed|on-hold), Bills (pending|partial|paid), Contractor Work (pending|partial|paid)

### Key Design Patterns
1. **Tab-based UI**: Main navigation routes through `TabType` enum; `Index.tsx` renders appropriate view based on `activeTab`
2. **Mock Data Only**: `mockData.ts` contains hardcoded arrays; changes are in-memory and reset on refresh—no persistence
3. **Responsive Tables**: `DataTable` component displays entities with custom `render` functions for formatted columns
4. **Financial Calculations**: 
   - Profit = totalBilled - (materialCost + labourCost + otherCost)
   - Pending amounts calculated as invoice total minus received amount
   - See `src/lib/format.ts` for `calculateProfit()`, `calculateProfitPercentage()`

## Code Conventions

### Imports & Aliases
- Use `@/` path alias for all imports (configured in `vite.config.ts` and `tsconfig.json`)
- Example: `import { Header } from '@/components/layout/Header'`

### Styling
- **Tailwind CSS** classes via `className` attribute
- **Theme System**: CSS variables (e.g., `--foreground`, `--border`, `--primary`) defined globally; use semantic names like `text-foreground`, `bg-card`, `border-border`
- **Color Utilities**: `status-badge.tsx` shows pattern—use className + `cn()` utility for conditional styling
- **Icons**: Lucide React; import as `import { SettingIcon } from 'lucide-react'`

### Component Patterns
```typescript
// Standard View component structure
export function DomainView() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [data, setData] = useState(mockDomainData);
  
  const columns = [{ key: 'field', header: 'Display Name', render: (item) => ... }];
  
  const handleAdd = (newItem: DomainType) => setData([...data, newItem]);
  
  return (
    <div>
      <Header title="Title" onAddNew={() => setShowAddDialog(true)} addLabel="Add X" />
      <DataTable columns={columns} data={data} />
      {showAddDialog && <Dialog>...</Dialog>}
    </div>
  );
}
```

### Formatting Functions
- `formatCurrency(amount)` - INR format, no decimals
- `formatDate(dateString)` - "DD Mon YYYY" (e.g., "15 Jan 2024")
- `formatNumber(num)` - Localized number formatting
- Use `date-fns` for date manipulations

### TypeScript Conventions
- Strict null checks disabled (`strictNullChecks: false` in tsconfig) for flexibility
- Interfaces in `src/types/index.ts` for domain models; keep views non-generic where possible
- Props interfaces defined inline or as simple types (no complex generics)

## Development Workflow

### Getting Started
```sh
npm install        # Install deps (uses bun.lockb)
npm run dev        # Start Vite dev server (port 8080)
npm run build      # Production build
npm run build:dev  # Development build with component tagger (Lovable integration)
npm run lint       # Run ESLint
```

### Adding New Features
1. **New Tab/Domain**: Add to `TabType` in `types/index.ts`, create `SomethingView.tsx`, add nav item to `Sidebar.tsx`
2. **New View**: Follow the pattern in `ProjectsView.tsx`—use `Header`, `DataTable`, and local `useState` for forms
3. **New Entity Type**: Define interface in `types/index.ts`, add mock data to `mockData.ts`, import and use in views
4. **Styling**: Use existing Tailwind classes; reference `src/index.css` for custom properties and base styles

### Mock Data Strategy
- All data is in `src/data/mockData.ts` as exported constants (`mockProjects`, `mockBills`, etc.)
- Views import and use directly; **changes are not persisted**
- For future backend: Replace imports with API calls keeping type signatures consistent
- Use IDs (strings like 'p1', 'b1') as stable references across entities

## Common Tasks

### Display a New List/Table
```typescript
const columns = [
  { 
    key: 'name', 
    header: 'Name', 
    render: (item) => <span>{item.name}</span> 
  },
  { 
    key: 'amount', 
    header: 'Amount', 
    render: (item) => <span>{formatCurrency(item.amount)}</span>,
    className: 'text-right'
  }
];
return <DataTable columns={columns} data={items} />;
```

### Add a Dialog Form
```typescript
<Dialog open={showDialog} onOpenChange={setShowDialog}>
  <DialogContent>
    <DialogHeader><DialogTitle>Add Item</DialogTitle></DialogHeader>
    <form onSubmit={(e) => { e.preventDefault(); /* handle */ }}>
      <Label>Name</Label>
      <Input />
      <Button type="submit">Save</Button>
    </form>
  </DialogContent>
</Dialog>
```

### Calculate & Display Financial Metrics
Use functions from `lib/format.ts`; example from Dashboard:
```typescript
const totalProfit = mockProjects.reduce((sum, p) => sum + calculateProfit(p), 0);
const pendingAmount = mockBills.reduce((sum, b) => sum + (b.amount - b.amountReceived), 0);
```

## External Dependencies
- **@tanstack/react-query**: Imported but not actively used (no server calls yet); ready for backend integration
- **@hookform/resolvers**, **react-hook-form**: Form validation (referenced in dependencies but minimal use in current views)
- **date-fns**: Date utilities
- **clsx**, **tailwind-merge**: Utility functions for className management (via `cn()`)

## Important Notes
- **No API Layer Yet**: All data flows through local state and mock data; component prop types define the contract for future API integration
- **Lovable Integration**: Project uses `lovable-tagger` plugin in dev mode for component tracking; `vite.config.ts` shows integration
- **Browser Router**: Uses React Router v6 with catch-all `*` route; routes are dynamically rendered, not URL-based
- **Accessibility**: shadcn-ui components handle ARIA; ensure custom interactive elements have `role` and `aria-*` attributes
