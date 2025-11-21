'use client';

import { columns } from './medical-records-tables/columns';
import { MedicalRecordTable } from './medical-records-tables';
import { MedicalRecord } from '@/types/medical-record';
import { useMemo } from 'react';
import { useQueryState, parseAsInteger } from 'nuqs';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useOfflineData } from '@/hooks/use-offline-data';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff } from 'lucide-react';

export default function MedicalRecordsListingPage() {
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [search] = useQueryState('search');

  const apiEndpoint = useMemo(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: perPage.toString(),
      ...(search && { search })
    });
    return `/api/medical-records?${params}`;
  }, [page, perPage, search]);

  const { data: medicalRecords, totalItems, loading, isFromCache } = useOfflineData<MedicalRecord>({
    collection: 'medical_records',
    apiEndpoint,
  });

  if (loading) {
    return <DataTableSkeleton columnCount={7} rowCount={10} filterCount={1} />;
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
      <MedicalRecordTable
        data={medicalRecords}
        totalItems={totalItems}
        columns={columns}
      />
    </>
  );
}
