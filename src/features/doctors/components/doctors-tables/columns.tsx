'use client';

import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Doctor } from '@/types/doctor';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';

export const columns: ColumnDef<Doctor>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Doctor Name' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] truncate font-medium'>
            {row.getValue('name')}
          </span>
        </div>
      );
    },
    meta: {
      label: 'Search by name',
      placeholder: 'Doctor name...',
      variant: 'text'
    }
  },
  {
    accessorKey: 'specialization',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Specialization' />
    ),
    cell: ({ row }) => {
      const specialization = row.getValue('specialization') as string;
      return (
        <div className='capitalize'>
          {specialization || '-'}
        </div>
      );
    },
    meta: {
      label: 'Specialization',
      placeholder: 'Filter by specialization',
      variant: 'text'
    }
  },
  {
    accessorKey: 'lisenceNumber',
    header: 'License Number',
    cell: ({ row }) => {
      const licenseNumber = row.getValue('lisenceNumber');
      return (
        <div className='font-mono text-sm'>
          {licenseNumber || '-'}
        </div>
      );
    }
  },
  {
    accessorKey: 'experience',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Experience' />
    ),
    cell: ({ row }) => {
      const experience = row.getValue('experience') as string;
      return (
        <div>
          {experience || '-'}
        </div>
      );
    }
  },
  {
    accessorKey: 'hospitalIds',
    header: 'Hospitals',
    cell: ({ row }) => {
      const hospitalId = row.getValue('hospitalIds') as string;
      return (
        <div className='max-w-[300px] truncate'>
          {hospitalId || <span className='text-muted-foreground'>-</span>}
        </div>
      );
    }
  },
  {
    accessorKey: 'appointment',
    header: 'Contact',
    cell: ({ row }) => {
      const appointment = row.getValue('appointment') as Doctor['appointment'];
      return (
        <div>
          {appointment?.contactNumber || <span className='text-muted-foreground'>-</span>}
        </div>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
