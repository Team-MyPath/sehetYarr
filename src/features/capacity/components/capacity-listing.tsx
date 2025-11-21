'use client';

import { columns } from './capacity-tables/columns';
import { CapacityTable } from './capacity-tables';
import { Capacity } from '@/types/capacity';
import { useMemo } from 'react';
import { useQueryState, parseAsInteger, parseAsArrayOf, parseAsStringEnum } from 'nuqs';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useOfflineData } from '@/hooks/use-offline-data';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff } from 'lucide-react';

const wardTypeEnum = ['VIP', 'Normal', 'Emergency', 'ICU', 'Maternity', 'Pediatrics', 'Other'];

export default function CapacityListingPage() {
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [search] = useQueryState('search');
  const [wardType] = useQueryState('wardType', parseAsArrayOf(parseAsStringEnum(wardTypeEnum)).withDefault([]));

  const wardTypeStr = wardType.join(',');

  const apiEndpoint = useMemo(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: perPage.toString(),
      ...(search && { search }),
      ...(wardTypeStr && { wardType: wardTypeStr })
    });
    return `/api/capacity?${params}`;
  }, [page, perPage, search, wardTypeStr]);

  const { data: capacities, totalItems, loading, isFromCache } = useOfflineData<Capacity>({
    collection: 'capacity',
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
      <CapacityTable
        data={capacities}
        totalItems={totalItems}
        columns={columns}
      />
    </>
  );
}
