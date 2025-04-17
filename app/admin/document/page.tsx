import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { DocumentTable } from '@/components/admin/document/DocumentTable';
import { columns } from '@/components/admin/document/columns';
import { documents } from '@/components/admin/document/data';

export default function DocumentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Document
        </Button>
      </div>

      <Card>
        <div className="p-4">
          <DocumentTable columns={columns} data={documents} />
        </div>
      </Card>
    </div>
  );
}
