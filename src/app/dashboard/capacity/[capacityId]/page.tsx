import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import CapacityViewPage from '@/features/capacity/components/capacity-view-page';

export const metadata = {
  title: 'Dashboard : Capacity'
};

type PageProps = { params: Promise<{ capacityId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <CapacityViewPage capacityId={params.capacityId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
