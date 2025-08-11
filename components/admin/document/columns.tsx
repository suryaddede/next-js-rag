'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, MoreHorizontal, Trash2, Edit, Loader2, ExternalLink } from 'lucide-react';
import { getCurrentTimestamp } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown } from 'lucide-react';

export type DocumentType = {
  id: string;
  title: string;
  type: string;
  updated: string;
  url?: string; // Added for document source URL
};

export const columns: ColumnDef<DocumentType>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <FileText className="mr-2 h-5 w-5 text-blue-500" />
          <span>{row.getValue('title')}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => <div>{row.getValue('type')}</div>,
  },
  {
    accessorKey: 'updated',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Updated
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const updated = row.getValue('updated') as string;
      const formattedDate = getCurrentTimestamp(new Date(updated));
      return <div>{formattedDate}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const document = row.original;
      const onEdit = (table.options.meta as Record<string, unknown>)?.onEdit as
        | ((doc: DocumentType) => void)
        | undefined;
      const onDelete = (table.options.meta as Record<string, unknown>)
        ?.onDelete as ((id: string) => void) | undefined;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {document.url && (
              <DropdownMenuItem 
                onClick={() => window.open(document.url, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit URL
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit?.(document)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                if (confirm('Are you sure you want to delete this document?')) {
                  onDelete?.(document.id);
                }
              }}
              disabled={
                (table.options.meta as Record<string, unknown>)
                  ?.deletingIds instanceof Array &&
                (
                  (table.options.meta as Record<string, unknown>)
                    ?.deletingIds as string[]
                )?.includes(document.id)
              }
            >
              {(table.options.meta as Record<string, unknown>)
                ?.deletingIds instanceof Array &&
              (
                (table.options.meta as Record<string, unknown>)
                  ?.deletingIds as string[]
              )?.includes(document.id) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
