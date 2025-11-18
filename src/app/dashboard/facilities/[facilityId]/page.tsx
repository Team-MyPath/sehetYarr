import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import FacilityViewPage from '@/features/facilities/components/facility-view-page';

export const metadata = {
  title: 'Dashboard : Facility'
};

type PageProps = { params: Promise<{ facilityId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <FacilityViewPage facilityId={params.facilityId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
