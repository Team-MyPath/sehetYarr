'use client';

import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { FormDatePicker } from '@/components/forms/form-date-picker';
import { FormTextarea } from '@/components/forms/form-textarea';
import { FormSearchableSelect, SearchableSelectOption } from '@/components/forms/form-searchable-select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Bill } from '@/types/bill';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

const statusOptions = [
  { label: 'Pending', value: 'Pending' },
  { label: 'Paid', value: 'Paid' },
  { label: 'Partial', value: 'Partial' },
  { label: 'Cancelled', value: 'Cancelled' }
];

const paymentMethodOptions = [
  { label: 'Cash', value: 'Cash' },
  { label: 'Card', value: 'Card' },
  { label: 'Bank Transfer', value: 'Bank Transfer' },
  { label: 'Insurance', value: 'Insurance' }
];

const formSchema = z.object({
  patientId: z.string().min(1, { message: 'Patient is required.' }),
  hospitalId: z.string().min(1, { message: 'Hospital is required.' }),
  doctorId: z.string().optional(),
  billDate: z.date(),
  totalAmount: z.string().min(1, { message: 'Total amount is required.' }),
  paidAmount: z.string().min(1, { message: 'Paid amount is required.' }),
  status: z.enum(['Pending', 'Paid', 'Partial', 'Cancelled']),
  paymentMethod: z.enum(['Cash', 'Card', 'Bank Transfer', 'Insurance']),
  discount: z.string().optional(),
  items: z.string().optional()
});

export default function BillForm({
  initialData,
  pageTitle
}: {
  initialData: Bill | null;
  pageTitle: string;
}) {
  const [patients, setPatients] = useState<SearchableSelectOption[]>([]);
  const [doctors, setDoctors] = useState<SearchableSelectOption[]>([]);
  const [hospitals, setHospitals] = useState<Array<{ label: string; value: string }>>([]);
  const { user } = useUser();
  const isHospitalUser = user?.publicMetadata?.role === 'hospital';
  const [userHospitalId, setUserHospitalId] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, doctorsRes, hospitalsRes, userRes] = await Promise.all([
          fetch('/api/patients?limit=1000'),
          fetch('/api/doctors?limit=1000'),
          fetch('/api/hospitals?limit=1000'),
          isHospitalUser ? fetch('/api/user/me') : Promise.resolve(null)
        ]);

        const [patientsData, doctorsData, hospitalsData, userData] = await Promise.all([
          patientsRes.json(),
          doctorsRes.json(),
          hospitalsRes.json(),
          userRes ? userRes.json() : Promise.resolve(null)
        ]);

        if (patientsData.success) {
          setPatients(patientsData.data.map((p: any) => ({
            label: p.name,
            value: p._id,
            subtitle: `CNIC: ${p.cnic || 'N/A'}`,
            searchText: `${p.name} ${p.cnic || ''}`
          })));
        }

        if (doctorsData.success) {
          setDoctors(doctorsData.data.map((d: any) => ({
            label: d.name,
            value: d._id,
            subtitle: `CNIC: ${d.cnic || 'N/A'}`,
            searchText: `${d.name} ${d.cnic || ''}`
          })));
        }

        if (hospitalsData.success) {
          const hospitalsList = hospitalsData.data.map((h: any) => ({ label: h.name, value: h._id }));
          setHospitals(hospitalsList);

          // If user is hospital role, auto-fill with their hospital
          if (isHospitalUser && userData?.success && userData.data.hospital) {
            const hospitalId = userData.data.hospital._id;
            setUserHospitalId(hospitalId);
            if (!initialData) {
              form.setValue('hospitalId', hospitalId);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, [isHospitalUser, initialData]);

  const formatItems = (items?: Bill['items']) => {
    if (!items || items.length === 0) return '';
    return items.map(item => 
      `${item.description || ''} | ${item.quantity || ''} | ${item.unitPrice || ''} | ${item.amount || ''}`
    ).join('\n');
  };

  const defaultValues = {
    patientId: typeof initialData?.patientId === 'object' ? initialData.patientId._id : initialData?.patientId || '',
    hospitalId: typeof initialData?.hospitalId === 'object' ? initialData.hospitalId._id : initialData?.hospitalId || '',
    doctorId: typeof initialData?.doctorId === 'object' ? initialData.doctorId?._id : initialData?.doctorId || '',
    billDate: initialData?.billDate ? new Date(initialData.billDate) : new Date(),
    totalAmount: initialData?.totalAmount?.toString() || '',
    paidAmount: initialData?.paidAmount?.toString() || '',
    status: (initialData?.status || 'Pending') as 'Pending' | 'Paid' | 'Partial' | 'Cancelled',
    paymentMethod: (initialData?.paymentMethod || 'Cash') as 'Cash' | 'Card' | 'Bank Transfer' | 'Insurance',
    discount: initialData?.discount?.toString() || '',
    items: formatItems(initialData?.items)
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues
  });

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const parseItems = (str: string) => {
        if (!str.trim()) return [];
        return str.split('\n').filter(Boolean).map(line => {
          const [description, quantity, unitPrice, amount] = line.split('|').map(s => s.trim());
          return {
            description,
            quantity: quantity ? parseFloat(quantity) : 0,
            unitPrice: unitPrice ? parseFloat(unitPrice) : 0,
            amount: amount ? parseFloat(amount) : 0
          };
        });
      };

      const payload = {
        patientId: values.patientId,
        hospitalId: values.hospitalId,
        doctorId: values.doctorId || undefined,
        billDate: values.billDate.toISOString(),
        totalAmount: parseFloat(values.totalAmount),
        paidAmount: parseFloat(values.paidAmount),
        status: values.status,
        paymentMethod: values.paymentMethod,
        discount: values.discount ? parseFloat(values.discount) : undefined,
        items: parseItems(values.items || '')
      };

      const url = initialData
        ? `/api/bills/${initialData._id}`
        : '/api/bills';
      const method = initialData ? 'PUT' : 'POST';

      // Import offline submission utility
      const { submitWithOfflineSupport } = await import('@/lib/offline/form-submission');

      const result = await submitWithOfflineSupport(
        'bills',
        payload,
        {
          apiEndpoint: url,
          method,
          id: initialData?._id,
          onSuccess: () => {
            router.push('/dashboard/bills');
            router.refresh();
          },
        }
      );

      if (!result.success) {
        console.error('Bill submission failed:', result.error);
      }
    } catch (error) {
      toast.error('Failed to save bill');
      console.error('Bill form error:', error);
    }
  }

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>{pageTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            <FormSearchableSelect 
              control={form.control} 
              name='patientId' 
              label='Patient' 
              placeholder='Search patient...' 
              required 
              options={patients} 
            />
            <FormSelect 
              control={form.control} 
              name='hospitalId' 
              label='Hospital' 
              placeholder='Select hospital' 
              required 
              options={hospitals}
              disabled={isHospitalUser}
            />
            <FormSearchableSelect 
              control={form.control} 
              name='doctorId' 
              label='Doctor (Optional)' 
              placeholder='Search doctor...' 
              options={doctors} 
            />
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <FormDatePicker control={form.control} name='billDate' label='Bill Date' required />
            <FormSelect control={form.control} name='status' label='Status' placeholder='Select status' required options={statusOptions} />
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            <FormInput control={form.control} name='totalAmount' label='Total Amount (Rs.)' placeholder='0.00' required type='number' />
            <FormInput control={form.control} name='paidAmount' label='Paid Amount (Rs.)' placeholder='0.00' required type='number' />
            <FormInput control={form.control} name='discount' label='Discount (Rs.)' placeholder='0.00' type='number' />
          </div>

          <FormSelect control={form.control} name='paymentMethod' label='Payment Method' placeholder='Select payment method' required options={paymentMethodOptions} />

          <FormTextarea
            control={form.control}
            name='items'
            label='Bill Items'
            placeholder='One per line: Description | Quantity | Unit Price | Amount&#10;Example: Consultation | 1 | 2000 | 2000&#10;Lab Test | 1 | 1500 | 1500'
            config={{ rows: 6, maxLength: 2000, showCharCount: true }}
          />

          <Button type='submit' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : initialData ? 'Update Bill' : 'Create Bill'}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}
