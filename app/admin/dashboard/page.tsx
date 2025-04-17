import { StatCards } from '@/components/admin/dashboard/StatCards';
import { ActivityCard } from '@/components/admin/dashboard/ActivityCard';
import { QuickActions } from '@/components/admin/dashboard/QuickActions';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <StatCards />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-1 md:col-span-2">
          <ActivityCard />
        </div>

        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
