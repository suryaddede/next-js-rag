'use client';

import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NavigationItems } from '@/components/admin/NavigationItems';

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex min-h-0 flex-1 flex-col border-r">
        <div className="flex h-16 items-center justify-between border-b px-4">
          <h2 className="text-lg font-semibold">Admin Panel</h2>
          <ThemeToggle />
        </div>
        <nav className="flex-1 space-y-1 p-2">
          <NavigationItems pathname={pathname} />
        </nav>
      </div>
    </div>
  );
}
