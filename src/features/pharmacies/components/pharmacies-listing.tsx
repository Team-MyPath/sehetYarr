'use client';

import { getColumns } from './pharmacies-tables/columns';
import { PharmacyTable } from './pharmacies-tables';
import { Pharmacy } from '@/types/pharmacy';
import { useMemo } from 'react';
import { useQueryState, parseAsInteger } from 'nuqs';
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

export default function PharmaciesListingPage() {
  const { t } = useI18n();
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

  const columns = useMemo(() => getColumns(t), [t]);

  if (loading) {
    return <DataTableSkeleton columnCount={6} rowCount={10} filterCount={1} />;
  }

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <div className='flex items-start justify-between'>
        <Heading
          title={t('common.pharmacies')}
          description={t('common.manage_pharmacy_records')}
        />
        <Link
          href='/dashboard/pharmacies/new'
          className={cn(buttonVariants(), 'text-xs md:text-sm')}
        >
          <Plus className='mr-2 h-4 w-4' /> {t('common.create_new')}
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
      <PharmacyTable
        data={pharmacies}
        totalItems={totalItems}
        columns={columns}
      />
    </div>
  );
}
