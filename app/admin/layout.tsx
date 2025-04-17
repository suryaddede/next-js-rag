'use client';

import { ThemeToggle } from '@/components/ThemeToggle';
import { MobileSidebar } from '@/components/admin/MobileSidebar';
import { DesktopSidebar } from '@/components/admin/DesktopSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen">
      {/* Mobile sidebar */}
      <MobileSidebar />

      {/* Desktop sidebar */}
      <DesktopSidebar />

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="bg-background sticky top-0 z-10 flex h-16 items-center gap-x-4 border-b px-4 sm:px-6 lg:px-8">
          <MobileSidebar />
          <div className="flex flex-1 items-center justify-end">
            <ThemeToggle />
          </div>
        </div>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
