'use client';

import { columns } from './hospitals-tables/columns';
import { HospitalTable } from './hospitals-tables';
import { Hospital } from '@/types/hospital';
import { useMemo } from 'react';
import { useQueryState, parseAsInteger } from 'nuqs';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useOfflineData } from '@/hooks/use-offline-data';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff } from 'lucide-react';

export default function HospitalsListingPage() {
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [search] = useQueryState('name');
  const [type] = useQueryState('type');
  const [ownershipType] = useQueryState('ownershipType');

  const apiEndpoint = useMemo(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: perPage.toString(),
      ...(search && { search }),
      ...(type && { type }),
      ...(ownershipType && { ownershipType })
    });
    return `/api/hospitals?${params}`;
  }, [page, perPage, search, type, ownershipType]);

  const { data: hospitals, totalItems, loading, isFromCache } = useOfflineData<Hospital>({
    collection: 'hospitals',
    apiEndpoint,
  });

  if (loading) {
    return <DataTableSkeleton columnCount={7} rowCount={10} filterCount={2} />;
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
      <HospitalTable
        data={hospitals}
        totalItems={totalItems}
        columns={columns}
      />
    </>
  );
}
