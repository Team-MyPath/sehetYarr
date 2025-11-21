'use client';

import { columns } from './facilities-tables/columns';
import { FacilityTable } from './facilities-tables';
import { Facility } from '@/types/facility';
import { useMemo } from 'react';
import { useQueryState, parseAsInteger, parseAsArrayOf, parseAsStringEnum } from 'nuqs';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useOfflineData } from '@/hooks/use-offline-data';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff } from 'lucide-react';

const categoryEnum = ['Equipment', 'Medication', 'Facility'];
const statusEnum = ['Operational', 'Out of Service', 'Under Maintenance'];

export default function FacilitiesListingPage() {
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [search] = useQueryState('search');
  const [category] = useQueryState('category', parseAsArrayOf(parseAsStringEnum(categoryEnum)).withDefault([]));
  const [status] = useQueryState('status', parseAsArrayOf(parseAsStringEnum(statusEnum)).withDefault([]));

  const categoryStr = category.join(',');
  const statusStr = status.join(',');

  const apiEndpoint = useMemo(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: perPage.toString(),
      ...(search && { search }),
      ...(categoryStr && { category: categoryStr }),
      ...(statusStr && { status: statusStr })
    });
    return `/api/facilities?${params}`;
  }, [page, perPage, search, categoryStr, statusStr]);

  const { data: facilities, totalItems, loading, isFromCache } = useOfflineData<Facility>({
    collection: 'facilities',
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
      <FacilityTable
        data={facilities}
        totalItems={totalItems}
        columns={columns}
      />
    </>
  );
}
