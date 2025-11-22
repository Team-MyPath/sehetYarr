'use client';

import { getColumns } from './facilities-tables/columns';
import { FacilityTable } from './facilities-tables';
import { Facility } from '@/types/facility';
import { useMemo } from 'react';
import { useQueryState, parseAsInteger, parseAsArrayOf, parseAsStringEnum } from 'nuqs';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useOfflineData } from '@/hooks/use-offline-data';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Plus } from 'lucide-react';
import { useI18n } from '@/providers/i18n-provider';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';

const categoryEnum = ['Equipment', 'Medication', 'Facility'];
const statusEnum = ['Operational', 'Out of Service', 'Under Maintenance'];

export default function FacilitiesListingPage() {
  const { t } = useI18n();
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

  const columns = useMemo(() => getColumns(t), [t]);

  if (loading) {
    return <DataTableSkeleton columnCount={7} rowCount={10} filterCount={2} />;
  }

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <div className='flex items-start justify-between'>
        <Heading
          title={t('common.facilities')}
          description={t('common.manage_facilities')}
        />
        <Link
          href='/dashboard/facilities/new'
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
            {t('common.offline_cached_data')}
          </AlertDescription>
        </Alert>
      )}
      <FacilityTable
        data={facilities}
        totalItems={totalItems}
        columns={columns}
      />
    </div>
  );
}
