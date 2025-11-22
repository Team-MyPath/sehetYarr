'use client';

import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Bill } from '@/types/bill';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

function getStatusColor(status: Bill['status']) {
  switch (status) {
    case 'Paid':
      return 'bg-green-500/10 text-green-700 border-green-500/20';
    case 'Pending':
      return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
    case 'Partial':
      return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
    case 'Cancelled':
      return 'bg-red-500/10 text-red-700 border-red-500/20';
    default:
      return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
  }
}

export const getColumns = (t: any): ColumnDef<Bill>[] => [
  {
    accessorKey: 'patientId',
    header: t('common.patient_name'),
    cell: ({ row }) => {
      const patient = row.getValue('patientId') as Bill['patientId'];
      return (
        <div className='font-medium'>
          {patient?.name || '-'}
        </div>
      );
    }
  },
  {
    accessorKey: 'hospitalId',
    header: t('common.hospital_name'),
    cell: ({ row }) => {
      const hospital = row.getValue('hospitalId') as Bill['hospitalId'];
      return (
        <div className='max-w-[200px] truncate'>
          {hospital?.name || '-'}
        </div>
      );
    }
  },
  {
    accessorKey: 'doctorId',
    header: t('common.doctor_name'),
    cell: ({ row }) => {
      const doctor = row.getValue('doctorId') as Bill['doctorId'];
      return (
        <div className='font-medium'>
          {doctor?.name || '-'}
        </div>
      );
    }
  },
  {
    accessorKey: 'billDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('common.bill_date')} />
    ),
    cell: ({ row }) => {
      const date = row.getValue('billDate') as string;
      return date ? (
        <div className='whitespace-nowrap'>
          {format(new Date(date), 'PP')}
        </div>
      ) : (
        <span className='text-muted-foreground'>-</span>
      );
    }
  },
  {
    accessorKey: 'totalAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('common.total')} />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('totalAmount') as number;
      return (
        <div className='font-medium'>
          Rs. {amount?.toLocaleString() || 0}
        </div>
      );
    }
  },
  {
    accessorKey: 'paidAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('common.paid_amount')} />
    ),
    cell: ({ row }) => {
      const paid = row.getValue('paidAmount') as number;
      return (
        <div className='font-medium'>
          Rs. {paid?.toLocaleString() || 0}
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
      const status = row.getValue('status') as Bill['status'];
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
    accessorKey: 'paymentMethod',
    header: t('common.payment_method'),
    cell: ({ row }) => {
      const method = row.getValue('paymentMethod') as Bill['paymentMethod'];
      return (
        <div className='whitespace-nowrap'>
          {method || '-'}
        </div>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
