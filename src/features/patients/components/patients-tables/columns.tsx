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

export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: 'patientName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Patient Name' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] truncate font-medium'>
            {row.getValue('patientName')}
          </span>
        </div>
      );
    },
    meta: {
      label: 'Search by name',
      placeholder: 'Patient name...',
      variant: 'text'
    }
  },
  {
    accessorKey: 'patientCnic',
    header: 'CNIC',
    cell: ({ row }) => {
      return (
        <div className='font-mono text-sm'>
          {row.getValue('patientCnic')}
        </div>
      );
    }
  },
  {
    accessorKey: 'patientGender',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Gender' />
    ),
    cell: ({ row }) => {
      const gender = row.getValue('patientGender') as string;
      return (
        <div className='capitalize'>
          {gender}
        </div>
      );
    },
    meta: {
      label: 'Gender',
      placeholder: 'Filter by gender',
      variant: 'multiSelect',
      options: GENDER_OPTIONS
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: 'patientBloodGroup',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Blood Group' />
    ),
    cell: ({ row }) => {
      const bloodGroup = row.getValue('patientBloodGroup') as string;
      return (
        <div className='font-semibold'>
          {bloodGroup || '-'}
        </div>
      );
    },
    meta: {
      label: 'Blood Group',
      placeholder: 'Filter by blood group',
      variant: 'multiSelect',
      options: BLOOD_GROUP_OPTIONS
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: 'patientDob',
    header: 'Date of Birth',
    cell: ({ row }) => {
      const dob = row.getValue('patientDob') as any;
      
      if (!dob) {
        return <span className='text-muted-foreground'>-</span>;
      }
      
      try {
        // Handle the new structure with day, month, year
        if (typeof dob === 'object' && dob.day && dob.month && dob.year) {
          const dateStr = `${dob.year}-${dob.month.padStart(2, '0')}-${dob.day.padStart(2, '0')}`;
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            return <span className='text-muted-foreground'>Invalid date</span>;
          }
          return (
            <div>
              {format(date, 'PP')}
            </div>
          );
        }
        
        // Handle old structure (ISO string)
        if (typeof dob === 'string') {
          const date = new Date(dob);
          if (isNaN(date.getTime())) {
            return <span className='text-muted-foreground'>Invalid date</span>;
          }
          return (
            <div>
              {format(date, 'PP')}
            </div>
          );
        }
        
        return <span className='text-muted-foreground'>Invalid format</span>;
      } catch (error) {
        console.error('Date formatting error:', error);
        return <span className='text-muted-foreground'>Error</span>;
      }
    }
  },
  {
    accessorKey: 'patientMobile',
    header: 'Contact',
    cell: ({ row }) => {
      const mobile = row.getValue('patientMobile') as string;
      return (
        <div>
          {mobile || <span className='text-muted-foreground'>-</span>}
        </div>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
