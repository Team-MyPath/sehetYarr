import { Capacity } from '@/types/capacity';
import { notFound } from 'next/navigation';
import CapacityForm from './capacity-form';

type TCapacityViewPageProps = {
  capacityId: string;
};

export default async function CapacityViewPage({
  capacityId
}: TCapacityViewPageProps) {
  let capacity = null;
  let pageTitle = 'Create New Capacity Record';

  if (capacityId !== 'new') {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/capacity/${capacityId}`,
        { cache: 'no-store' }
      );
      const result = await response.json();

      if (result.success) {
        capacity = result.data as Capacity;
        pageTitle = `Edit Capacity Record`;
      } else {
        notFound();
      }
    } catch (error) {
      notFound();
    }
  }

  return <CapacityForm initialData={capacity} pageTitle={pageTitle} />;
}
