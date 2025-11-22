'use client';

import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Facility } from '@/types/facility';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';

function getStatusColor(status: Facility['status']) {
  switch (status) {
    case 'Operational':
      return 'bg-green-500/10 text-green-700 border-green-500/20';
    case 'Out of Service':
      return 'bg-red-500/10 text-red-700 border-red-500/20';
    case 'Under Maintenance':
      return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
    default:
      return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
  }
}

function getCategoryColor(category: Facility['category']) {
  switch (category) {
    case 'Equipment':
      return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
    case 'Medication':
      return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
    case 'Facility':
      return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
    default:
      return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
  }
}

export const getColumns = (t: any): ColumnDef<Facility>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('common.name')} />
    ),
    cell: ({ row }) => {
      return (
        <div className='font-medium'>
          {row.getValue('name')}
        </div>
      );
    }
  },
  {
    accessorKey: 'hospitalId',
    header: t('common.hospital'),
    cell: ({ row }) => {
      const hospital = row.getValue('hospitalId') as Facility['hospitalId'];
      return (
        <div className='max-w-[200px] truncate'>
          {hospital?.name || '-'}
        </div>
      );
    }
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('common.category')} />
    ),
    cell: ({ row }) => {
      const category = row.getValue('category') as Facility['category'];
      return (
        <Badge variant='outline' className={getCategoryColor(category)}>
          {category}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.length === 0 || value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: 'quantity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('common.quantity')} />
    ),
    cell: ({ row }) => {
      const quantity = row.getValue('quantity') as number;
      return <div className='font-medium'>{quantity}</div>;
    }
  },
  {
    accessorKey: 'inUse',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('common.in_use')} />
    ),
    cell: ({ row }) => {
      const inUse = row.getValue('inUse') as number;
      return <div className='font-medium'>{inUse || 0}</div>;
    }
  },
  {
    id: 'available',
    header: t('common.available'),
    cell: ({ row }) => {
      const quantity = row.getValue('quantity') as number;
      const inUse = (row.getValue('inUse') as number) || 0;
      const available = quantity - inUse;
      return (
        <div className='font-medium'>
          {available >= 0 ? available : 0}
        </div>
      );
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('common.status')} />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as Facility['status'];
      return (
        <Badge variant='outline' className={getStatusColor(status)}>
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.length === 0 || value.includes(row.getValue(id));
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
