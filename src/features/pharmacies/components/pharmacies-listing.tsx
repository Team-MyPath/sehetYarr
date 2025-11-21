'use client';

import { columns } from './pharmacies-tables/columns';
import { PharmacyTable } from './pharmacies-tables';
import { Pharmacy } from '@/types/pharmacy';
import { useMemo } from 'react';
import { useQueryState, parseAsInteger } from 'nuqs';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useOfflineData } from '@/hooks/use-offline-data';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff } from 'lucide-react';

export default function PharmaciesListingPage() {
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [search] = useQueryState('name');

  const apiEndpoint = useMemo(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: perPage.toString(),
      ...(search && { search })
    });
    return `/api/pharmacies?${params}`;
  }, [page, perPage, search]);

  const { data: pharmacies, totalItems, loading, isFromCache } = useOfflineData<Pharmacy>({
    collection: 'pharmacies',
    apiEndpoint,
  });

  if (loading) {
    return <DataTableSkeleton columnCount={6} rowCount={10} filterCount={1} />;
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
      <PharmacyTable
        data={pharmacies}
        totalItems={totalItems}
        columns={columns}
      />
    </>
  );
}