'use client';

import { columns } from './doctors-tables/columns';
import { DoctorTable } from './doctors-tables';
import { Doctor } from '@/types/doctor';
import { useMemo } from 'react';
import { useQueryState, parseAsInteger } from 'nuqs';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useOfflineData } from '@/hooks/use-offline-data';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff } from 'lucide-react';

export default function DoctorsListingPage() {
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [search] = useQueryState('name');
  const [specialization] = useQueryState('specialization');

  const apiEndpoint = useMemo(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: perPage.toString(),
      ...(search && { search }),
      ...(specialization && { specialization })
    });
    return `/api/doctors?${params}`;
  }, [page, perPage, search, specialization]);

  const { data: doctors, totalItems, loading, isFromCache } = useOfflineData<Doctor>({
    collection: 'doctors',
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
      <DoctorTable
        data={doctors}
        totalItems={totalItems}
        columns={columns}
      />
    </>
  );
}
