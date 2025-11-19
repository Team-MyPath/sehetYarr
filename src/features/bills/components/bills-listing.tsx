'use client';

import { columns } from './bills-tables/columns';
import { BillTable } from './bills-tables';
import { Bill } from '@/types/bill';
import { useEffect, useState } from 'react';
import { useQueryState, parseAsInteger, parseAsArrayOf, parseAsStringEnum } from 'nuqs';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';

const statusEnum = ['Pending', 'Paid', 'Partial', 'Cancelled'];

export default function BillsListingPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [search] = useQueryState('search');
  const [status] = useQueryState('status', parseAsArrayOf(parseAsStringEnum(statusEnum)).withDefault([]));

  const statusStr = status.join(',');

  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: perPage.toString(),
          ...(search && { search }),
          ...(statusStr && { status: statusStr })
        });

        const response = await fetch(`/api/bills?${params}`);
        const data = await response.json();

        if (data.success) {
          setBills(data.data || []);
          setTotalItems(data.pagination?.total || 0);
        }
      } catch (error) {
        console.error('Failed to fetch bills:', error);
        setBills([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [page, perPage, search, statusStr]);

  if (loading) {
    return <DataTableSkeleton columnCount={8} rowCount={10} filterCount={1} />;
  }

  return (
    <BillTable
      data={bills}
      totalItems={totalItems}
      columns={columns}
    />
  );
}
