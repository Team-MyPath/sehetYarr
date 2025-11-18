'use client';

import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Worker } from '@/types/worker';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';

export const columns: ColumnDef<Worker>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
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
    accessorKey: 'cnic',
    header: 'CNIC',
    cell: ({ row }) => {
      return <div className='whitespace-nowrap'>{row.getValue('cnic')}</div>;
    }
  },
  {
    accessorKey: 'designation',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Designation' />
    ),
    cell: ({ row }) => {
      const designation = row.getValue('designation') as Worker['designation'];
      return (
        <Badge variant='outline'>
          {designation}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.length === 0 || value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: 'department',
    header: 'Department',
    cell: ({ row }) => {
      const department = row.getValue('department') as Worker['department'];
      return <div>{department || '-'}</div>;
    }
  },
  {
    accessorKey: 'experienceYears',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Experience' />
    ),
    cell: ({ row }) => {
      const exp = row.getValue('experienceYears') as number;
      return <div>{exp ? `${exp} years` : '-'}</div>;
    }
  },
  {
    accessorKey: 'shift',
    header: 'Shift',
    cell: ({ row }) => {
      const shift = row.getValue('shift') as Worker['shift'];
      return (
        <div className='whitespace-nowrap'>
          {shift?.type || '-'}
        </div>
      );
    }
  },
  {
    accessorKey: 'hospitalIds',
    header: 'Hospitals',
    cell: ({ row }) => {
      const hospitals = row.getValue('hospitalIds') as Worker['hospitalIds'];
      const count = hospitals?.length || 0;
      return count > 0 ? (
        <Badge variant='outline'>{count} hospital{count !== 1 ? 's' : ''}</Badge>
      ) : (
        <span className='text-muted-foreground'>-</span>
      );
    }
  },
  {
    accessorKey: 'contact',
    header: 'Contact',
    cell: ({ row }) => {
      const contact = row.getValue('contact') as Worker['contact'];
      return (
        <div className='whitespace-nowrap'>
          {contact?.primaryNumber || '-'}
        </div>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
