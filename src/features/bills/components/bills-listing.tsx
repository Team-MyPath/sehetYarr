'use client';

import { columns } from './bills-tables/columns';
import { BillTable } from './bills-tables';
import { Bill } from '@/types/bill';
import { useMemo } from 'react';
import { useQueryState, parseAsInteger, parseAsArrayOf, parseAsStringEnum } from 'nuqs';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useOfflineData } from '@/hooks/use-offline-data';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff } from 'lucide-react';

const statusEnum = ['Pending', 'Paid', 'Partial', 'Cancelled'];

export default function BillsListingPage() {
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [search] = useQueryState('search');
  const [status] = useQueryState('status', parseAsArrayOf(parseAsStringEnum(statusEnum)).withDefault([]));

  const statusStr = status.join(',');

  const apiEndpoint = useMemo(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: perPage.toString(),
      ...(search && { search }),
      ...(statusStr && { status: statusStr })
    });
    return `/api/bills?${params}`;
  }, [page, perPage, search, statusStr]);

  const { data: bills, totalItems, loading, isFromCache } = useOfflineData<Bill>({
    collection: 'bills',
    apiEndpoint,
  });

  if (loading) {
    return <DataTableSkeleton columnCount={8} rowCount={10} filterCount={1} />;
  }

  return (
    <>
      {isFromCache && (
        <Alert className="mb-4 border-amber-500 bg-amber-50 dark:bg-amber-950">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You're offline. Showing cached data. Changes will sync when you're back online.
          </AlertDescription>
        </Alert>
      )}
      <BillTable
        data={bills}
        totalItems={totalItems}
        columns={columns}
      />
    </>
  );
}
