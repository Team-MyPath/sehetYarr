'use client';

import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Facility } from '@/types/facility';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useEffect, useState } from 'react';

const categoryOptions = [
  { label: 'Equipment', value: 'Equipment' },
  { label: 'Medication', value: 'Medication' },
  { label: 'Facility', value: 'Facility' }
];

const statusOptions = [
  { label: 'Operational', value: 'Operational' },
  { label: 'Out of Service', value: 'Out of Service' },
  { label: 'Under Maintenance', value: 'Under Maintenance' }
];

const formSchema = z.object({
  hospitalId: z.string().min(1, { message: 'Hospital is required.' }),
  category: z.enum(['Equipment', 'Medication', 'Facility']),
  name: z.string().min(1, { message: 'Name is required.' }),
  quantity: z.string().min(1, { message: 'Quantity is required.' }),
  inUse: z.string().optional(),
  status: z.enum(['Operational', 'Out of Service', 'Under Maintenance'])
});

export default function FacilityForm({
  initialData,
  pageTitle
}: {
  initialData: Facility | null;
  pageTitle: string;
}) {
  const [hospitals, setHospitals] = useState<Array<{ label: string; value: string }>>([]);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch('/api/hospitals?limit=1000');
        const data = await response.json();

        if (data.success) {
          setHospitals(data.data.map((h: any) => ({ label: h.name, value: h._id })));
        }
      } catch (error) {
        console.error('Failed to fetch hospitals:', error);
      }
    };
    fetchHospitals();
  }, []);

  const defaultValues = {
    hospitalId: typeof initialData?.hospitalId === 'object' ? initialData.hospitalId._id : initialData?.hospitalId || '',
    category: (initialData?.category || 'Equipment') as 'Equipment' | 'Medication' | 'Facility',
    name: initialData?.name || '',
    quantity: initialData?.quantity?.toString() || '',
    inUse: initialData?.inUse?.toString() || '',
    status: (initialData?.status || 'Operational') as 'Operational' | 'Out of Service' | 'Under Maintenance'
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues
  });

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const payload = {
        hospitalId: values.hospitalId,
        category: values.category,
        name: values.name,
        quantity: parseInt(values.quantity),
        inUse: values.inUse ? parseInt(values.inUse) : undefined,
        status: values.status
      };

      const url = initialData
        ? `/api/facilities/${initialData._id}`
        : '/api/facilities';
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        toast.success(initialData ? 'Facility updated successfully' : 'Facility created successfully');
        router.push('/dashboard/facilities');
        router.refresh();
      } else {
        toast.error(result.message || 'Something went wrong');
      }
    } catch (error) {
      toast.error('Failed to save facility');
    }
  }

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>{pageTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <FormSelect control={form.control} name='hospitalId' label='Hospital' placeholder='Select hospital' required options={hospitals} />
            <FormSelect control={form.control} name='category' label='Category' placeholder='Select category' required options={categoryOptions} />
          </div>

          <FormInput control={form.control} name='name' label='Name' placeholder='Enter facility name' required />

          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            <FormInput control={form.control} name='quantity' label='Quantity' placeholder='0' required type='number' />
            <FormInput control={form.control} name='inUse' label='In Use' placeholder='0' type='number' />
            <FormSelect control={form.control} name='status' label='Status' placeholder='Select status' required options={statusOptions} />
          </div>

          <Button type='submit' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : initialData ? 'Update Facility' : 'Create Facility'}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}
