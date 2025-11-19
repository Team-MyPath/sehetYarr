import { Worker } from '@/types/worker';
import { notFound } from 'next/navigation';
import WorkerForm from './worker-form';

type TWorkerViewPageProps = {
  workerId: string;
};

export default async function WorkerViewPage({
  workerId
}: TWorkerViewPageProps) {
  let worker = null;
  let pageTitle = 'Create New Worker';

  if (workerId !== 'new') {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/workers/${workerId}`,
        { cache: 'no-store' }
      );
      const result = await response.json();

      if (result.success) {
        worker = result.data as Worker;
        pageTitle = `Edit Worker`;
      } else {
        notFound();
      }
    } catch (error) {
      notFound();
    }
  }

  return <WorkerForm initialData={worker} pageTitle={pageTitle} />;
}
