'use client';

import { columns } from './patients-tables/columns';
import { PatientTable } from './patients-tables';
import { Patient } from '@/types/patient';
import { useMemo } from 'react';
import { useQueryState, parseAsInteger } from 'nuqs';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useOfflineData } from '@/hooks/use-offline-data';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff } from 'lucide-react';

export default function PatientsListingPage() {
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [search] = useQueryState('name');
  const [gender] = useQueryState('gender');
  const [bloodGroup] = useQueryState('bloodGroup');

  const apiEndpoint = useMemo(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: perPage.toString(),
      ...(search && { search }),
      ...(gender && { gender }),
      ...(bloodGroup && { bloodGroup })
    });
    return `/api/patients?${params}`;
  }, [page, perPage, search, gender, bloodGroup]);

  const { data: patients, totalItems, loading, isFromCache } = useOfflineData<Patient>({
    collection: 'patients',
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
      <PatientTable
        data={patients}
        totalItems={totalItems}
        columns={columns}
      />
    </>
  );
}
