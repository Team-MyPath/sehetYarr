'use client';

import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Hospital } from '@/types/hospital';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useI18n } from '@/providers/i18n-provider';
import { submitWithOfflineSupport } from '@/lib/offline/form-submission';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Hospital name must be at least 2 characters.'
  }),
  registrationNumber: z.string().min(1, {
    message: 'Registration number is required.'
  }),
  type: z.enum(['hospital', 'clinic', 'dispensary', 'ngo', 'other']),
  ownershipType: z.enum(['public', 'private', 'semi-government', 'ngo']),
  'location.area': z.string().optional(),
  'location.city': z.string().optional(),
  'location.country': z.string().optional(),
  'location.latitude': z.number().optional(),
  'location.longitude': z.number().optional(),
  'contact.primaryNumber': z.string().optional(),
  'contact.secondaryNumber': z.string().optional()
});

export default function HospitalForm({
  initialData,
  pageTitle
}: {
  initialData: Hospital | null;
  pageTitle: string;
}) {
  const { t } = useI18n();
  const defaultValues = {
    name: initialData?.name || '',
    registrationNumber: initialData?.registrationNumber || '',
    type: initialData?.type || ('hospital' as const),
    ownershipType: initialData?.ownershipType || ('public' as const),
    'location.area': initialData?.location?.area || '',
    'location.city': initialData?.location?.city || '',
    'location.country': initialData?.location?.country || '',
    'location.latitude': initialData?.location?.latitude,
    'location.longitude': initialData?.location?.longitude,
    'contact.primaryNumber': initialData?.contact?.primaryNumber || '',
    'contact.secondaryNumber': initialData?.contact?.secondaryNumber || ''
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues
  });

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Transform flat form values to nested structure
      const payload = {
        name: values.name,
        registrationNumber: values.registrationNumber,
        type: values.type,
        ownershipType: values.ownershipType,
        location: {
          area: values['location.area'],
          city: values['location.city'],
          country: values['location.country'],
          latitude: values['location.latitude'],
          longitude: values['location.longitude']
        },
        contact: {
          primaryNumber: values['contact.primaryNumber'],
          secondaryNumber: values['contact.secondaryNumber']
        }
      };

      const url = initialData
        ? `/api/hospitals/${initialData._id}`
        : '/api/hospitals';
      const method = initialData ? 'PUT' : 'POST';

      const result = await submitWithOfflineSupport(
        'hospitals',
        payload,
        {
          apiEndpoint: url,
          method,
          id: initialData?._id,
          onSuccess: () => {
            router.push('/dashboard/hospitals');
            router.refresh();
          },
        }
      );

      if (!result.success) {
        console.error('Hospital submission failed:', result.error);
      }
    } catch (error) {
      toast.error('Failed to save hospital');
      console.error('Hospital form error:', error);
    }
  }

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {initialData ? t('common.edit') : t('common.create_new')} {t('common.hospitals')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form
          form={form}
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-8'
        >
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <FormInput
              control={form.control}
              name='name'
              label={t('common.hospital_name')}
              placeholder={t('common.hospital_name')}
              required
            />

            <FormInput
              control={form.control}
              name='registrationNumber'
              label='Registration Number' // Need key
              placeholder='Enter registration number'
              required
            />

            <FormSelect
              control={form.control}
              name='type'
              label={t('common.hospital_type')}
              placeholder={t('common.select_type')}
              required
              options={[
                { label: 'Hospital', value: 'hospital' },
                { label: 'Clinic', value: 'clinic' },
                { label: 'Dispensary', value: 'dispensary' },
                { label: 'NGO', value: 'ngo' },
                { label: 'Other', value: 'other' }
              ]}
            />

            <FormSelect
              control={form.control}
              name='ownershipType'
              label='Ownership Type' // Need key
              placeholder='Select ownership type'
              required
              options={[
                { label: 'Public', value: 'public' },
                { label: 'Private', value: 'private' },
                { label: 'Semi-Government', value: 'semi-government' },
                { label: 'NGO', value: 'ngo' }
              ]}
            />
          </div>

          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>{t('common.location')}</h3>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormInput
                control={form.control}
                name='location.area'
                label='Area' // Need key
                placeholder='Enter area'
              />

              <FormInput
                control={form.control}
                name='location.city'
                label={t('common.city')}
                placeholder={t('common.city')}
              />

              <FormInput
                control={form.control}
                name='location.country'
                label={t('common.country')}
                placeholder={t('common.country')}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormInput
                  control={form.control}
                  name='location.latitude'
                  label='Latitude' // Need key
                  placeholder='Latitude'
                  type='number'
                  step='any'
                />

                <FormInput
                  control={form.control}
                  name='location.longitude'
                  label='Longitude' // Need key
                  placeholder='Longitude'
                  type='number'
                  step='any'
                />
              </div>
            </div>
          </div>

          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>{t('common.contact_info')}</h3>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormInput
                control={form.control}
                name='contact.primaryNumber'
                label={t('common.primary_number')}
                placeholder={t('common.phone')}
              />

              <FormInput
                control={form.control}
                name='contact.secondaryNumber'
                label={t('common.secondary_number')}
                placeholder={t('common.phone')}
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
