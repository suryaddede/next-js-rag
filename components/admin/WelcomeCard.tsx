import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LayoutDashboard, FileText } from 'lucide-react';

export function WelcomeCard() {
  return (
    <Card className="border-primary/20 border-2">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome to Admin Portal</CardTitle>
        <CardDescription>
          Manage your application content, users, and settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          This admin portal provides tools for managing documents, monitoring
          system performance, and configuring application settings. Use the
          sidebar navigation to access different sections.
        </p>

        <div className="grid gap-4 pt-4 md:grid-cols-2">
          <Link href="/admin/dashboard">
            <Button variant="outline" className="h-24 w-full justify-start p-4">
              <div className="flex h-full w-full flex-col items-start justify-between">
                <LayoutDashboard className="text-primary h-6 w-6" />
                <div className="space-y-1">
                  <h3 className="font-medium">Dashboard</h3>
                  <p className="text-muted-foreground text-sm">
                    View system statistics and activity
                  </p>
                </div>
              </div>
            </Button>
          </Link>

          <Link href="/admin/document">
            <Button variant="outline" className="h-24 w-full justify-start p-4">
              <div className="flex h-full w-full flex-col items-start justify-between">
                <FileText className="text-primary h-6 w-6" />
                <div className="space-y-1">
                  <h3 className="font-medium">Documents</h3>
                  <p className="text-muted-foreground text-sm">
                    Manage document library and uploads
                  </p>
                </div>
              </div>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
