import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import BillViewPage from '@/features/bills/components/bill-view-page';

export const metadata = {
  title: 'Dashboard : Bill'
};

type PageProps = { params: Promise<{ billId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <BillViewPage billId={params.billId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
