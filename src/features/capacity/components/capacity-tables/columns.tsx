'use client';

import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Capacity } from '@/types/capacity';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';

function getWardTypeColor(wardType: Capacity['wardType']) {
  switch (wardType) {
    case 'VIP':
      return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
    case 'ICU':
      return 'bg-red-500/10 text-red-700 border-red-500/20';
    case 'Emergency':
      return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
    case 'Maternity':
      return 'bg-pink-500/10 text-pink-700 border-pink-500/20';
    case 'Pediatrics':
      return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
    case 'Normal':
      return 'bg-green-500/10 text-green-700 border-green-500/20';
    default:
      return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
  }
}

function getOccupancyColor(percentage: number) {
  if (percentage >= 90) return 'text-red-600 font-semibold';
  if (percentage >= 70) return 'text-orange-600 font-semibold';
  if (percentage >= 50) return 'text-yellow-600 font-medium';
  return 'text-green-600 font-medium';
}

export const getColumns = (t: any): ColumnDef<Capacity>[] => [
  {
    accessorKey: 'hospitalId',
    header: t('common.hospital'),
    cell: ({ row }) => {
      const hospital = row.getValue('hospitalId') as Capacity['hospitalId'];
      return (
        <div className='max-w-[200px] truncate font-medium'>
          {hospital?.name || '-'}
        </div>
      );
    }
  },
  {
    accessorKey: 'wardType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('common.ward_type')} />
    ),
    cell: ({ row }) => {
      const wardType = row.getValue('wardType') as Capacity['wardType'];
      return (
        <Badge variant='outline' className={getWardTypeColor(wardType)}>
          {t(`common.${wardType.toLowerCase()}`)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.length === 0 || value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: 'totalBeds',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('common.total_beds')} />
    ),
    cell: ({ row }) => {
      const total = row.getValue('totalBeds') as number;
      return <div className='font-medium'>{total}</div>;
    }
  },
  {
    accessorKey: 'occupiedBeds',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('common.occupied')} />
    ),
    cell: ({ row }) => {
      const occupied = row.getValue('occupiedBeds') as number;
      return <div className='font-medium'>{occupied}</div>;
    }
  },
  {
    id: 'availableBeds',
    header: t('common.available'),
    cell: ({ row }) => {
      const total = row.getValue('totalBeds') as number;
      const occupied = row.getValue('occupiedBeds') as number;
      const available = total - occupied;
      return (
        <div className='font-medium'>
          {available >= 0 ? available : 0}
        </div>
      );
    }
  },
  {
    id: 'occupancyRate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('common.occupancy_percentage')} />
    ),
    cell: ({ row }) => {
      const total = row.getValue('totalBeds') as number;
      const occupied = row.getValue('occupiedBeds') as number;
      const percentage = total > 0 ? ((occupied / total) * 100).toFixed(1) : '0.0';
      return (
        <div className={getOccupancyColor(parseFloat(percentage))}>
          {percentage}%
        </div>
      );
    }
  },
  {
    accessorKey: 'equipmentIds',
    header: t('common.equipment'),
    cell: ({ row }) => {
      const equipment = row.getValue('equipmentIds') as Capacity['equipmentIds'];
      const count = equipment?.length || 0;
      return count > 0 ? (
        <Badge variant='outline'>{count} {count !== 1 ? t('common.items') : t('common.item')}</Badge>
      ) : (
        <span className='text-muted-foreground'>-</span>
      );
    }
  },
  {
    accessorKey: 'notes',
    header: t('common.notes'),
    cell: ({ row }) => {
      const notes = row.getValue('notes') as string;
      return (
        <div className='max-w-[200px] truncate'>
          {notes || '-'}
        </div>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
