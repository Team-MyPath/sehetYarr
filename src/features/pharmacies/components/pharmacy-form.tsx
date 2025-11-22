'use client';

import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { FormTextarea } from '@/components/forms/form-textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Pharmacy } from '@/types/pharmacy';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { submitWithOfflineSupport } from '@/lib/offline/form-submission';
import { useI18n } from '@/providers/i18n-provider';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  contact: z.string().min(1, { message: 'Contact number is required.' }),
  'location.address': z.string().min(1, { message: 'Address is required.' }),
  'location.city': z.string().min(1, { message: 'City is required.' }),
  'location.state': z.string().min(1, { message: 'State is required.' }),
  'inventory.name': z.string().optional(),
  'inventory.supplier': z.string().optional(),
  'inventory.quantity': z.string().optional()
});

export default function PharmacyForm({
  initialData,
  pageTitle
}: {
  initialData: Pharmacy | null;
  pageTitle: string;
}) {
  const { t } = useI18n();
  const defaultValues = {
    name: initialData?.name || '',
    contact: initialData?.contact || '',
    'location.address': initialData?.location?.address || '',
    'location.city': initialData?.location?.city || '',
    'location.state': initialData?.location?.state || '',
    'inventory.name': initialData?.inventory?.[0]?.name || '',
    'inventory.supplier': initialData?.inventory?.[0]?.supplier || '',
    'inventory.quantity': initialData?.inventory?.[0]?.quantity || ''
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues
  });

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const payload = {
        name: values.name,
        contact: values.contact,
        location: {
          address: values['location.address'],
          city: values['location.city'],
          state: values['location.state']
        },
        inventory: [{
          name: values['inventory.name'] || '',
          supplier: values['inventory.supplier'] || '',
          quantity: values['inventory.quantity'] || ''
        }]
      };

      const url = initialData
        ? `/api/pharmacies/${initialData._id}`
        : '/api/pharmacies';
      const method = initialData ? 'PUT' : 'POST';

      await submitWithOfflineSupport(
        'pharmacies',
        payload,
        {
          apiEndpoint: url,
          method,
          id: initialData?._id,
          onSuccess: (result) => {
            router.push('/dashboard/pharmacies');
            router.refresh();
          },
          onError: (error) => {
            console.error(error);
          }
        }
      );
    } catch (error) {
      toast.error('Failed to save pharmacy');
    }
  }

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {initialData ? t('common.edit') : t('common.create_new')} {t('common.pharmacies')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          {/* Basic Information */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>{t('common.basic_info')}</h3>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormInput 
                control={form.control} 
                name='name' 
                label={t('common.pharmacy_name')} 
                placeholder={t('common.enter_pharmacy_name')} 
                required 
              />
              <FormInput 
                control={form.control} 
                name='contact' 
                label={t('common.contact')} 
                placeholder={t('common.phone')} 
                required 
              />
            </div>
          </div>

          {/* Location */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>{t('common.location')}</h3>
            <div className='grid grid-cols-1 gap-6'>
              <FormInput 
                control={form.control} 
                name='location.address' 
                label={t('common.address')} 
                placeholder={t('common.complete_address')}
                required
              />
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <FormInput control={form.control} name='location.city' label={t('common.city')} placeholder={t('common.city')} required />
                <FormInput control={form.control} name='location.state' label={t('common.state')} placeholder={t('common.state')} required />
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>{t('common.sample_inventory')}</h3>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              <FormInput 
                control={form.control} 
                name='inventory.name' 
                label={t('common.medicine_name')} 
                placeholder='e.g., Paracetamol'
              />
              <FormInput 
                control={form.control} 
                name='inventory.supplier' 
                label={t('common.supplier')} 
                placeholder='e.g., ABC Pharma'
              />
              <FormInput 
                control={form.control} 
                name='inventory.quantity' 
                label={t('common.quantity')} 
                placeholder='e.g., 100 tablets'
              />
            </div>
          </div>

          <Button type='submit' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting 
              ? t('common.saving') 
              : initialData 
                ? t('common.update') 
                : t('common.create')}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}
