'use client';

import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { FormTextarea } from '@/components/forms/form-textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Capacity } from '@/types/capacity';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { submitWithOfflineSupport } from '@/lib/offline/form-submission';

const wardTypeOptions = [
  { label: 'VIP', value: 'VIP' },
  { label: 'Normal', value: 'Normal' },
  { label: 'Emergency', value: 'Emergency' },
  { label: 'ICU', value: 'ICU' },
  { label: 'Maternity', value: 'Maternity' },
  { label: 'Pediatrics', value: 'Pediatrics' },
  { label: 'Other', value: 'Other' }
];

const formSchema = z.object({
  hospitalId: z.string().min(1, { message: 'Hospital is required.' }),
  wardType: z.enum(['VIP', 'Normal', 'Emergency', 'ICU', 'Maternity', 'Pediatrics', 'Other']),
  totalBeds: z.string().min(1, { message: 'Total beds is required.' }),
  occupiedBeds: z.string().min(1, { message: 'Occupied beds is required.' }),
  equipmentIds: z.string().optional(),
  notes: z.string().optional()
});

export default function CapacityForm({
  initialData,
  pageTitle
}: {
  initialData: Capacity | null;
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
    wardType: (initialData?.wardType || 'Normal') as 'VIP' | 'Normal' | 'Emergency' | 'ICU' | 'Maternity' | 'Pediatrics' | 'Other',
    totalBeds: initialData?.totalBeds?.toString() || '',
    occupiedBeds: initialData?.occupiedBeds?.toString() || '',
    equipmentIds: initialData?.equipmentIds?.map(e => typeof e === 'object' ? e._id : e).join(', ') || '',
    notes: initialData?.notes || ''
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues
  });

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const totalBeds = parseInt(values.totalBeds);
      const occupiedBeds = parseInt(values.occupiedBeds);
      
      if (occupiedBeds > totalBeds) {
        toast.error('Occupied beds cannot be greater than total beds');
        return;
      }

      const payload = {
        hospitalId: values.hospitalId,
        wardType: values.wardType,
        totalBeds: totalBeds,
        occupiedBeds: occupiedBeds,
        availableBeds: totalBeds - occupiedBeds,
        equipmentIds: values.equipmentIds ? values.equipmentIds.split(',').map(id => id.trim()).filter(Boolean) : [],
        notes: values.notes
      };

      const url = initialData
        ? `/api/capacity/${initialData._id}`
        : '/api/capacity';
      const method = initialData ? 'PUT' : 'POST';

      await submitWithOfflineSupport(
        'capacity',
        payload,
        {
          apiEndpoint: url,
          method,
          id: initialData?._id,
          onSuccess: (result) => {
            router.push('/dashboard/capacity');
            router.refresh();
          },
          onError: (error) => {
            console.error(error);
          }
        }
      );
    } catch (error) {
      toast.error('Failed to save capacity');
    }
  }

  const watchTotalBeds = form.watch('totalBeds');
  const watchOccupiedBeds = form.watch('occupiedBeds');
  const availableBeds = watchTotalBeds && watchOccupiedBeds 
    ? Math.max(0, parseInt(watchTotalBeds) - parseInt(watchOccupiedBeds))
    : 0;
  const occupancyRate = watchTotalBeds && watchOccupiedBeds && parseInt(watchTotalBeds) > 0
    ? ((parseInt(watchOccupiedBeds) / parseInt(watchTotalBeds)) * 100).toFixed(1)
    : '0.0';

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>{pageTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <FormSelect control={form.control} name='hospitalId' label='Hospital' placeholder='Select hospital' required options={hospitals} />
            <FormSelect control={form.control} name='wardType' label='Ward Type' placeholder='Select ward type' required options={wardTypeOptions} />
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <FormInput control={form.control} name='totalBeds' label='Total Beds' placeholder='0' required type='number' />
            <FormInput control={form.control} name='occupiedBeds' label='Occupied Beds' placeholder='0' required type='number' />
          </div>

          {watchTotalBeds && watchOccupiedBeds && (
            <div className='rounded-lg border bg-muted/50 p-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>Available Beds</p>
                  <p className='text-2xl font-bold'>{availableBeds}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Occupancy Rate</p>
                  <p className='text-2xl font-bold'>{occupancyRate}%</p>
                </div>
              </div>
            </div>
          )}

          <FormInput control={form.control} name='equipmentIds' label='Equipment IDs' placeholder='Comma separated facility/equipment IDs' />

          <FormTextarea
            control={form.control}
            name='notes'
            label='Notes'
            placeholder='Additional notes about this ward capacity'
            config={{ rows: 4, maxLength: 500, showCharCount: true }}
          />

          <Button type='submit' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : initialData ? 'Update Capacity' : 'Create Capacity'}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}
