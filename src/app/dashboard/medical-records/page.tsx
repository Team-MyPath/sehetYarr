import PageContainer from '@/components/layout/page-container';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import MedicalRecordsListingPage from '@/features/medical-records/components/medical-records-listing';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard: Medical Records'
};

type pageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: pageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer scrollable={false}>
      <Suspense
        fallback={
          <DataTableSkeleton columnCount={7} rowCount={8} filterCount={1} />
        }
      >
        <MedicalRecordsListingPage />
      </Suspense>
    </PageContainer>
  );
}
