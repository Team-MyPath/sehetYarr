'use client';

import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Hospital } from '@/types/hospital';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';

const HOSPITAL_TYPE_OPTIONS = [
  { label: 'Hospital', value: 'hospital' },
  { label: 'Clinic', value: 'clinic' },
  { label: 'Dispensary', value: 'dispensary' },
  { label: 'NGO', value: 'ngo' },
  { label: 'Other', value: 'other' }
];

const OWNERSHIP_TYPE_OPTIONS = [
  { label: 'Public', value: 'public' },
  { label: 'Private', value: 'private' },
  { label: 'Semi-Government', value: 'semi-government' },
  { label: 'NGO', value: 'ngo' }
];

export const getColumns = (t: any): ColumnDef<Hospital>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('common.hospital_name')} />
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
      label: t('common.search'),
      placeholder: t('common.hospital_name'),
      variant: 'text'
    }
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('common.type')} />
    ),
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      return (
        <div className='capitalize'>
          {type}
        </div>
      );
    },
    meta: {
      label: t('common.type'),
      placeholder: t('common.select_type'),
      variant: 'multiSelect',
      options: HOSPITAL_TYPE_OPTIONS
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: 'ownershipType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ownership' /> // Need key
    ),
    cell: ({ row }) => {
      const ownership = row.getValue('ownershipType') as string;
      return (
        <div className='capitalize'>
          {ownership.replace('-', ' ')}
        </div>
      );
    },
    meta: {
      label: 'Ownership Type', // Need key
      placeholder: 'Filter by ownership',
      variant: 'multiSelect',
      options: OWNERSHIP_TYPE_OPTIONS
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: 'location',
    header: t('common.location'),
    cell: ({ row }) => {
      const location = row.getValue('location') as Hospital['location'];
      if (!location) return <span className='text-muted-foreground'>-</span>;
      
      const parts = [location.area, location.city, location.country].filter(Boolean);
      return (
        <div className='max-w-[300px] truncate'>
          {parts.join(', ') || '-'}
        </div>
      );
    }
  },
  {
    accessorKey: 'contact',
    header: t('common.contact'),
    cell: ({ row }) => {
      const contact = row.getValue('contact') as Hospital['contact'];
      return (
        <div>
          {contact?.primaryNumber || <span className='text-muted-foreground'>-</span>}
        </div>
      );
    }
  },
  {
    accessorKey: 'registrationNumber',
    header: 'Registration No', // Need key
    cell: ({ row }) => {
      return (
        <div className='font-mono text-sm'>
          {row.getValue('registrationNumber')}
        </div>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
