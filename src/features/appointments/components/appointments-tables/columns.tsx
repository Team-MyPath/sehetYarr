'use client';

import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Appointment } from '@/types/appointment';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Scheduled':
      return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
    case 'Completed':
      return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
    case 'Cancelled':
      return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
    case 'No Show':
      return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
    default:
      return '';
  }
};

const getPriorityColor = (priority: string) => {
  return priority === 'Urgent'
    ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
    : 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
};

export const getColumns = (t: any): ColumnDef<Appointment>[] => {
  const STATUS_OPTIONS = [
    { label: t('common.scheduled'), value: 'Scheduled' },
    { label: t('common.completed'), value: 'Completed' },
    { label: t('common.cancelled'), value: 'Cancelled' },
    { label: 'No Show', value: 'No Show' }
  ];

  const PRIORITY_OPTIONS = [
    { label: 'Normal', value: 'Normal' }, // Need key
    { label: 'Urgent', value: 'Urgent' }  // Need key
  ];

  return [
    {
      accessorKey: 'patientId',
      header: t('common.patient_name'),
      cell: ({ row }) => {
        const patient = row.getValue('patientId') as Appointment['patientId'];
        return (
          <div className='font-medium'>
            {patient?.name || '-'}
          </div>
        );
      }
    },
    {
      accessorKey: 'doctorId',
      header: t('common.doctor_name'),
      cell: ({ row }) => {
        const doctor = row.getValue('doctorId') as Appointment['doctorId'];
        return (
          <div className='font-medium'>
            {doctor?.name || '-'}
          </div>
        );
      }
    },
    {
      accessorKey: 'hospitalId',
      header: t('common.hospital_name'),
      cell: ({ row }) => {
        const hospital = row.getValue('hospitalId') as Appointment['hospitalId'];
        return (
          <div className='max-w-[200px] truncate'>
            {hospital?.name || '-'}
          </div>
        );
      }
    },
    {
      accessorKey: 'appointmentDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.appointment_date')} />
      ),
      cell: ({ row }) => {
        const date = row.getValue('appointmentDate') as string;
        return (
          <div className='whitespace-nowrap'>
            {format(new Date(date), 'PPp')}
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
        const status = row.getValue('status') as string;
        // Map status value to localized label if possible for display?
        // Usually we display the status string directly but localized status would be better.
        // For now keeping it simple.
        return (
          <Badge className={getStatusColor(status)}>
            {status}
          </Badge>
        );
      },
      meta: {
        label: t('common.status'),
        placeholder: t('common.status'),
        variant: 'multiSelect',
        options: STATUS_OPTIONS
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      }
    },
    {
      accessorKey: 'priority',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Priority' /> // Need key
      ),
      cell: ({ row }) => {
        const priority = row.getValue('priority') as string;
        return priority ? (
          <Badge className={getPriorityColor(priority)}>
            {priority}
          </Badge>
        ) : (
          <span className='text-muted-foreground'>-</span>
        );
      },
      meta: {
        label: 'Priority',
        placeholder: 'Filter by priority',
        variant: 'multiSelect',
        options: PRIORITY_OPTIONS
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      }
    },
    {
      accessorKey: 'reason',
      header: t('common.reason'),
      cell: ({ row }) => {
        const reason = row.getValue('reason') as string;
        return (
          <div className='max-w-[300px] truncate'>
            {reason || '-'}
          </div>
        );
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => <CellAction data={row.original} />
    }
  ];
};
