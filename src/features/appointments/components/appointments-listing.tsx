'use client';

import { getColumns } from './appointments-tables/columns';
import { AppointmentTable } from './appointments-tables';
import { Appointment } from '@/types/appointment';
import { useMemo, createContext, useContext } from 'react';
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

// Create a context for the refresh function
interface AppointmentsContextType {
  refresh: () => void;
}

const AppointmentsContext = createContext<AppointmentsContextType | null>(null);

export const useAppointmentsRefresh = () => {
  const context = useContext(AppointmentsContext);
  if (!context) {
    throw new Error('useAppointmentsRefresh must be used within AppointmentsListingPage');
  }
  return context;
};

export default function AppointmentsListingPage() {
  const { t } = useI18n();
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [search] = useQueryState('search');
  const [status] = useQueryState('status');
  const [priority] = useQueryState('priority');

  const apiEndpoint = useMemo(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: perPage.toString(),
      ...(search && { search }),
      ...(status && { status }),
      ...(priority && { priority })
    });
    return `/api/appointments?${params}`;
  }, [page, perPage, search, status, priority]);

  const { data: appointments, totalItems, loading, isFromCache, refresh } = useOfflineData<Appointment>({
    collection: 'appointments',
    apiEndpoint,
  });

  const columns = useMemo(() => getColumns(t), [t]);

  if (loading) {
    return <DataTableSkeleton columnCount={8} rowCount={10} filterCount={2} />;
  }

  return (
    <AppointmentsContext.Provider value={{ refresh }}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title={t('common.appointments')}
            description={t('common.manage_appointments')}
          />
          <Link
            href='/dashboard/appointments/new'
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
        <AppointmentTable
          data={appointments}
          totalItems={totalItems}
          columns={columns}
        />
      </div>
    </AppointmentsContext.Provider>
  );
}
