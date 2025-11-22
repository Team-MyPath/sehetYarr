'use client';

import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Pharmacy } from '@/types/pharmacy';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';

export const getColumns = (t: any): ColumnDef<Pharmacy>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('common.pharmacy_name')} />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[300px] truncate font-medium'>
            {row.getValue('name')}
          </span>
        </div>
      );
    },
    meta: {
      label: t('common.search'),
      placeholder: t('common.enter_pharmacy_name'),
      variant: 'text'
    }
  },
  {
    accessorKey: 'contact',
    header: t('common.contact'),
    cell: ({ row }) => {
      const contact = row.getValue('contact') as string;
      return (
        <div className='font-mono text-sm'>
          {contact || '-'}
        </div>
      );
    }
  },
  {
    accessorKey: 'location',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('common.location')} />
    ),
    cell: ({ row }) => {
      const location = row.getValue('location') as Pharmacy['location'];
      return (
        <div className='max-w-[250px]'>
          <div className='font-medium'>{location.city}</div>
          <div className='text-sm text-muted-foreground truncate'>
            {location.address}
          </div>
        </div>
      );
    },
    meta: {
      label: t('common.filter_by_city'),
      placeholder: t('common.select_city'),
      variant: 'text'
    }
  },
  {
    accessorKey: 'location.state',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('common.state')} />
    ),
    cell: ({ row }) => {
      const location = row.getValue('location') as Pharmacy['location'];
      return (
        <div className='capitalize'>
          {location.state || '-'}
        </div>
      );
    },
    meta: {
      label: t('common.filter_by_state'),
      placeholder: t('common.select_state'),
      variant: 'text'
    }
  },
  {
    accessorKey: 'inventory',
    header: t('common.inventory_count'),
    cell: ({ row }) => {
      const inventory = row.getValue('inventory') as Pharmacy['inventory'];
      const count = inventory?.length || 0;
      return (
        <div className='text-center'>
          <span className='inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10'>
            {count} {t('common.items')}
          </span>
        </div>
      );
    }
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('common.date_added')} />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string;
      return (
        <div className='text-sm'>
          {date ? new Date(date).toLocaleDateString() : '-'}
        </div>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
