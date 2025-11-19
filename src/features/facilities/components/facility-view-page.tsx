import { Facility } from '@/types/facility';
import { notFound } from 'next/navigation';
import FacilityForm from './facility-form';

type TFacilityViewPageProps = {
  facilityId: string;
};

export default async function FacilityViewPage({
  facilityId
}: TFacilityViewPageProps) {
  let facility = null;
  let pageTitle = 'Create New Facility';

  if (facilityId !== 'new') {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/facilities/${facilityId}`,
        { cache: 'no-store' }
      );
      const result = await response.json();

      if (result.success) {
        facility = result.data as Facility;
        pageTitle = `Edit Facility`;
      } else {
        notFound();
      }
    } catch (error) {
      notFound();
    }
  }

  return <FacilityForm initialData={facility} pageTitle={pageTitle} />;
}
