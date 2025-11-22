import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import PharmacyDetailView from '@/features/pharmacies/components/pharmacy-detail-view';

export const metadata = {
  title: 'Dashboard : Pharmacy Details'
};

type PageProps = { params: Promise<{ pharmacyId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <PharmacyDetailView pharmacyId={params.pharmacyId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}

