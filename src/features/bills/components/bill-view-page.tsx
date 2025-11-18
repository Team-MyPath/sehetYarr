import { Bill } from '@/types/bill';
import { notFound } from 'next/navigation';
import BillForm from './bill-form';

type TBillViewPageProps = {
  billId: string;
};

export default async function BillViewPage({
  billId
}: TBillViewPageProps) {
  let bill = null;
  let pageTitle = 'Create New Bill';

  if (billId !== 'new') {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/bills/${billId}`,
        { cache: 'no-store' }
      );
      const result = await response.json();

      if (result.success) {
        bill = result.data as Bill;
        pageTitle = `Edit Bill`;
      } else {
        notFound();
      }
    } catch (error) {
      notFound();
    }
  }

  return <BillForm initialData={bill} pageTitle={pageTitle} />;
}
