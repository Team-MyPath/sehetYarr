'use client';

import { columns } from './workers-tables/columns';
import { WorkerTable } from './workers-tables';
import { Worker } from '@/types/worker';
import { useMemo } from 'react';
import { useQueryState, parseAsInteger, parseAsArrayOf, parseAsStringEnum } from 'nuqs';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useOfflineData } from '@/hooks/use-offline-data';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff } from 'lucide-react';

const designationEnum = ['Nurse', 'Paramedic', 'Technician', 'Other'];

export default function WorkersListingPage() {
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [search] = useQueryState('search');
  const [designation] = useQueryState('designation', parseAsArrayOf(parseAsStringEnum(designationEnum)).withDefault([]));

  const designationStr = designation.join(',');

  const apiEndpoint = useMemo(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: perPage.toString(),
      ...(search && { search }),
      ...(designationStr && { designation: designationStr })
    });
    return `/api/workers?${params}`;
  }, [page, perPage, search, designationStr]);

  const { data: workers, totalItems, loading, isFromCache } = useOfflineData<Worker>({
    collection: 'workers',
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
      <WorkerTable
        data={workers}
        totalItems={totalItems}
        columns={columns}
      />
    </>
  );
}
