'use client';

import { getColumns } from './workers-tables/columns';
import { WorkerTable } from './workers-tables';
import { Worker } from '@/types/worker';
import { useMemo } from 'react';
import { useQueryState, parseAsInteger, parseAsArrayOf, parseAsStringEnum } from 'nuqs';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useOfflineData } from '@/hooks/use-offline-data';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Plus } from 'lucide-react';
import { useI18n } from '@/providers/i18n-provider';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

const designationEnum = ['Nurse', 'Paramedic', 'Technician', 'Other'];

export default function WorkersListingPage() {
  const { t } = useI18n();
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

  const columns = useMemo(() => getColumns(t), [t]);

  if (loading) {
    return <DataTableSkeleton columnCount={8} rowCount={10} filterCount={1} />;
  }

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <div className='flex items-start justify-between'>
        <Heading
          title={t('common.workers')}
          description={t('common.manage_workers')}
        />
        <Link
          href='/dashboard/workers/new'
          className={cn(buttonVariants(), 'text-xs md:text-sm')}
        >
          <Plus className='mr-2 h-4 w-4' /> {t('common.create_new') + ' +'}
        </Link>
      </div>
      <Separator />
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
    </div>
  );
}
