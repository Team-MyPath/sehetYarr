'use client';

import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Patient } from '@/types/patient';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { format } from 'date-fns';

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' }
];

const BLOOD_GROUP_OPTIONS = [
  { label: 'A+', value: 'A+' },
  { label: 'A-', value: 'A-' },
  { label: 'B+', value: 'B+' },
  { label: 'B-', value: 'B-' },
  { label: 'O+', value: 'O+' },
  { label: 'O-', value: 'O-' },
  { label: 'AB+', value: 'AB+' },
  { label: 'AB-', value: 'AB-' }
];

export const getColumns = (t: any): ColumnDef<Patient>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('common.patient_name')} />
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
      placeholder: t('common.patient_name'),
      variant: 'text'
    }
  },
  {
    accessorKey: 'cnic',
    header: t('common.cnic'),
    cell: ({ row }) => {
      return (
        <div className='font-mono text-sm'>
          {row.getValue('cnic')}
        </div>
      );
    }
  },
  {
    accessorKey: 'gender',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('common.gender')} />
    ),
    cell: ({ row }) => {
      const gender = row.getValue('gender') as string;
      return (
        <div className='capitalize'>
          {gender}
        </div>
      );
    },
    meta: {
      label: t('common.gender'),
      placeholder: t('common.filter_by_gender') || 'Filter by gender',
      variant: 'multiSelect',
      options: GENDER_OPTIONS
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: 'bloodGroup',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('common.blood_group')} />
    ),
    cell: ({ row }) => {
      const bloodGroup = row.getValue('bloodGroup') as string;
      return (
        <div className='font-semibold'>
          {bloodGroup || '-'}
        </div>
      );
    },
    meta: {
      label: t('common.blood_group'),
      placeholder: t('common.filter_by_blood_group') || 'Filter by blood group',
      variant: 'multiSelect',
      options: BLOOD_GROUP_OPTIONS
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: 'dateOfBirth',
    header: t('common.dob'),
    cell: ({ row }) => {
      const dob = row.getValue('dateOfBirth') as string;
      return (
        <div>
          {format(new Date(dob), 'PP')}
        </div>
      );
    }
  },
  {
    accessorKey: 'contact',
    header: t('common.contact'),
    cell: ({ row }) => {
      const contact = row.getValue('contact') as Patient['contact'];
      return (
        <div>
          {contact?.primaryNumber || <span className='text-muted-foreground'>-</span>}
        </div>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
