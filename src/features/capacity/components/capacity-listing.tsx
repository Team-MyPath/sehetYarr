'use client';

import { getColumns } from './capacity-tables/columns';
import { CapacityTable } from './capacity-tables';
import { Capacity } from '@/types/capacity';
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

const wardTypeEnum = ['VIP', 'Normal', 'Emergency', 'ICU', 'Maternity', 'Pediatrics', 'Other'];

export default function CapacityListingPage() {
  const { t } = useI18n();
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

  const columns = useMemo(() => getColumns(t), [t]);

  if (loading) {
    return <DataTableSkeleton columnCount={8} rowCount={10} filterCount={1} />;
  }

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <div className='flex items-start justify-between'>
        <Heading
          title={t('common.capacities')}
          description={t('common.manage_capacities')}
        />
        <Link
          href='/dashboard/capacity/new'
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
      <CapacityTable
        data={capacities}
        totalItems={totalItems}
        columns={columns}
      />
    </div>
  );
}
