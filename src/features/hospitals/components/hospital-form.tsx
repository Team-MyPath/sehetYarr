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

const formSchema = z.object({
  hospitalName: z.string().min(2, {
    message: 'Hospital name must be at least 2 characters.'
  }),
  ntnNumber: z.string().min(1, {
    message: 'NTN number is required.'
  }),
  type: z.enum(['public', 'private', 'semi-government', 'ngo']),
  hospitalAddress: z.string().optional(),
  'hospitalLocation.address': z.string().optional(),
  'hospitalLocation.city': z.string().optional(),
  'hospitalLocation.state': z.string().optional(),
  doctorId: z.string().optional(),
  hospitalServices: z.string().optional(),
  numberOfBeds: z.string().optional(),
  'departments.medicineApplied.generalOPD': z.string().optional(),
  'departments.medicineApplied.immunization': z.string().optional(),
  'departments.medicineApplied.TBControl': z.string().optional(),
  'departments.surgryApplied.minorProcedures': z.string().optional(),
  'departments.accidentEmergency.basicEmergency': z.string().optional(),
  'departments.accidentEmergency.LHV_Services': z.string().optional(),
  'departments.accidentEmergency.deliveryRoom': z.string().optional(),
  'departments.pathologyLaboratory.basicLabTests': z.string().optional(),
  'departments.pathologyLaboratory.malariaSmear': z.string().optional()
});

export default function HospitalForm({
  initialData,
  pageTitle
}: {
  initialData: Hospital | null;
  pageTitle: string;
}) {
  const defaultValues = {
    hospitalName: initialData?.hospitalName || '',
    ntnNumber: initialData?.ntnNumber || '',
    type: initialData?.type || ('public' as const),
    hospitalAddress: initialData?.hospitalAddress || '',
    'hospitalLocation.address': initialData?.hospitalLocation?.address || '',
    'hospitalLocation.city': initialData?.hospitalLocation?.city || '',
    'hospitalLocation.state': initialData?.hospitalLocation?.state || '',
    doctorId: initialData?.doctorId || '',
    hospitalServices: initialData?.hospitalServices?.join(', ') || '',
    numberOfBeds: initialData?.numberOfBeds || '',
    'departments.medicineApplied.generalOPD': initialData?.departments?.['medicine&applied']?.generalOPD || '',
    'departments.medicineApplied.immunization': initialData?.departments?.['medicine&applied']?.immunization || '',
    'departments.medicineApplied.TBControl': initialData?.departments?.['medicine&applied']?.TBControl || '',
    'departments.surgryApplied.minorProcedures': initialData?.departments?.['surgery&allied']?.minorProcedures || '',
    'departments.accidentEmergency.basicEmergency': initialData?.departments?.['accident&emergency']?.basicEmergency || '',
    'departments.accidentEmergency.LHV_Services': initialData?.departments?.['accident&emergency']?.LHV_Services || '',
    'departments.accidentEmergency.deliveryRoom': initialData?.departments?.['accident&emergency']?.deliveryRoom || '',
    'departments.pathologyLaboratory.basicLabTests': initialData?.departments?.['pathalogy&laboratory']?.basicLabTests || '',
    'departments.pathologyLaboratory.malariaSmear': initialData?.departments?.['pathalogy&laboratory']?.malariaSmear || ''
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
        hospitalName: values.hospitalName,
        ntnNumber: values.ntnNumber,
        type: values.type,
        hospitalAddress: values.hospitalAddress,
        hospitalLocation: {
          address: values['hospitalLocation.address'],
          city: values['hospitalLocation.city'],
          state: values['hospitalLocation.state']
        },
        doctorId: values.doctorId,
        hospitalServices: values.hospitalServices 
          ? values.hospitalServices.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        numberOfBeds: values.numberOfBeds,
        departments: {
          'medicine&applied': {
            generalOPD: values['departments.medicineApplied.generalOPD'],
            immunization: values['departments.medicineApplied.immunization'],
            TBControl: values['departments.medicineApplied.TBControl']
          },
          'surgery&allied': {
            minorProcedures: values['departments.surgryApplied.minorProcedures']
          },
          'accident&emergency': {
            basicEmergency: values['departments.accidentEmergency.basicEmergency'],
            LHV_Services: values['departments.accidentEmergency.LHV_Services'],
            deliveryRoom: values['departments.accidentEmergency.deliveryRoom']
          },
          'pathalogy&laboratory': {
            basicLabTests: values['departments.pathologyLaboratory.basicLabTests'],
            malariaSmear: values['departments.pathologyLaboratory.malariaSmear']
          }
        }
      };

      const url = initialData
        ? `/api/hospitals/${initialData._id}`
        : '/api/hospitals';
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          initialData
            ? 'Hospital updated successfully'
            : 'Hospital created successfully'
        );
        router.push('/dashboard/hospitals');
        router.refresh();
      } else {
        toast.error(result.message || 'Something went wrong');
      }
    } catch (error) {
      toast.error('Failed to save hospital');
    }
  }

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {pageTitle}
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
              name='hospitalName'
              label='Hospital Name'
              placeholder='Enter hospital name'
              required
            />

            <FormInput
              control={form.control}
              name='ntnNumber'
              label='NTN Number'
              placeholder='Enter NTN number'
              required
            />

            <FormSelect
              control={form.control}
              name='type'
              label='Hospital Type'
              placeholder='Select type'
              required
              options={[
                { label: 'Public', value: 'public' },
                { label: 'Private', value: 'private' },
                { label: 'Semi-Government', value: 'semi-government' },
                { label: 'NGO', value: 'ngo' }
              ]}
            />

            <FormInput
              control={form.control}
              name='hospitalAddress'
              label='Hospital Address'
              placeholder='Enter hospital address'
            />
          </div>

          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Location Details</h3>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormInput
                control={form.control}
                name='hospitalLocation.address'
                label='Address'
                placeholder='Enter address'
              />

              <FormInput
                control={form.control}
                name='hospitalLocation.city'
                label='City'
                placeholder='Enter city'
              />

              <FormInput
                control={form.control}
                name='hospitalLocation.state'
                label='State'
                placeholder='Enter state'
              />

              <FormInput
                control={form.control}
                name='doctorId'
                label='Doctor ID'
                placeholder='Enter doctor ID'
              />
            </div>
          </div>

          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Hospital Details</h3>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormInput
                control={form.control}
                name='hospitalServices'
                label='Hospital Services'
                placeholder='Enter services (comma separated)'
              />

              <FormInput
                control={form.control}
                name='numberOfBeds'
                label='Number of Beds'
                placeholder='Enter number of beds'
              />
            </div>
          </div>

          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Departments</h3>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormInput
                control={form.control}
                name='departments.medicineApplied.generalOPD'
                label='General OPD'
                placeholder='General OPD status'
              />

              <FormInput
                control={form.control}
                name='departments.medicineApplied.immunization'
                label='Immunization'
                placeholder='Immunization status'
              />

              <FormInput
                control={form.control}
                name='departments.medicineApplied.TBControl'
                label='TB Control'
                placeholder='TB Control status'
              />

              <FormInput
                control={form.control}
                name='departments.surgryApplied.minorProcedures'
                label='Minor Procedures'
                placeholder='Minor procedures status'
              />

              <FormInput
                control={form.control}
                name='departments.accidentEmergency.basicEmergency'
                label='Basic Emergency'
                placeholder='Basic emergency status'
              />

              <FormInput
                control={form.control}
                name='departments.accidentEmergency.LHV_Services'
                label='LHV Services'
                placeholder='LHV services status'
              />

              <FormInput
                control={form.control}
                name='departments.accidentEmergency.deliveryRoom'
                label='Delivery Room'
                placeholder='Delivery room status'
              />

              <FormInput
                control={form.control}
                name='departments.pathologyLaboratory.basicLabTests'
                label='Basic Lab Tests'
                placeholder='Basic lab tests status'
              />

              <FormInput
                control={form.control}
                name='departments.pathologyLaboratory.malariaSmear'
                label='Malaria Smear'
                placeholder='Malaria smear status'
              />
            </div>
          </div>

          <Button type='submit' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? 'Saving...'
              : initialData
                ? 'Update Hospital'
                : 'Create Hospital'}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}
