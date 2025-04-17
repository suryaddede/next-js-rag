'use client';

import Link from 'next/link';
import { LayoutDashboard, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavigationItemsProps {
  pathname: string;
  onClick?: () => void;
}

export function NavigationItems({ pathname, onClick }: NavigationItemsProps) {
  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Documents', href: '/admin/document', icon: FileText },
  ];

  return (
    <>
      {navigation.map((item) => (
        <Link key={item.name} href={item.href} onClick={onClick}>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start',
              pathname === item.href ? 'bg-muted' : 'hover:bg-muted/50'
            )}
          >
            <item.icon className="mr-2 h-5 w-5" />
            {item.name}
          </Button>
        </Link>
      ))}
    </>
  );
}
