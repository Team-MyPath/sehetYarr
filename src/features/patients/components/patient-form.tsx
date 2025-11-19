'use client';

import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { FormDatePicker } from '@/components/forms/form-date-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Patient } from '@/types/patient';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
  patientName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  patientCnic: z.string().min(13, { message: 'CNIC must be 13 characters.' }),
  patientGender: z.enum(['male', 'female', 'other']),
  'patientDob.day': z.string().min(1, { message: 'Day is required.' }),
  'patientDob.month': z.string().min(1, { message: 'Month is required.' }),
  'patientDob.year': z.string().min(4, { message: 'Year is required.' }),
  patientBloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']).optional(),
  patientMobile: z.string().optional(),
  'patientAddress.address': z.string().optional(),
  'patientAddress.city': z.string().optional(),
  'patientAddress.state': z.string().optional(),
  patientDisability: z.string().optional(),
  'emergencyContact.primaryContact.name': z.string().optional(),
  'emergencyContact.primaryContact.relation': z.string().optional(),
  'emergencyContact.primaryContact.cnic': z.string().optional(),
  'emergencyContact.primaryContact.contactNumber': z.string().optional(),
  'emergencyContact.secondaryContact.name': z.string().optional(),
  'emergencyContact.secondaryContact.relation': z.string().optional(),
  'emergencyContact.secondaryContact.cnic': z.string().optional(),
  'emergencyContact.secondaryContact.contactNumber': z.string().optional()
});

export default function PatientForm({
  initialData,
  pageTitle
}: {
  initialData: Patient | null;
  pageTitle: string;
}) {
  const defaultValues = {
    patientName: initialData?.patientName || '',
    patientCnic: initialData?.patientCnic || '',
    patientGender: initialData?.patientGender || ('male' as const),
    'patientDob.day': initialData?.patientDob?.day?.toString() || '',
    'patientDob.month': initialData?.patientDob?.month?.toString() || '',
    'patientDob.year': initialData?.patientDob?.year?.toString() || '',
    patientBloodGroup: initialData?.patientBloodGroup,
    patientMobile: initialData?.patientMobile || '',
    'patientAddress.address': initialData?.patientAddress?.address || '',
    'patientAddress.city': initialData?.patientAddress?.city || '',
    'patientAddress.state': initialData?.patientAddress?.state || '',
    patientDisability: initialData?.patientDisability || '',
    'emergencyContact.primaryContact.name': initialData?.emergencyContact?.primaryContact?.name || '',
    'emergencyContact.primaryContact.relation': initialData?.emergencyContact?.primaryContact?.relation || '',
    'emergencyContact.primaryContact.cnic': initialData?.emergencyContact?.primaryContact?.cnic || '',
    'emergencyContact.primaryContact.contactNumber': initialData?.emergencyContact?.primaryContact?.contactNumber || '',
    'emergencyContact.secondaryContact.name': initialData?.emergencyContact?.secondaryContact?.name || '',
    'emergencyContact.secondaryContact.relation': initialData?.emergencyContact?.secondaryContact?.relation || '',
    'emergencyContact.secondaryContact.cnic': initialData?.emergencyContact?.secondaryContact?.cnic || '',
    'emergencyContact.secondaryContact.contactNumber': initialData?.emergencyContact?.secondaryContact?.contactNumber || ''
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues
  });

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const payload = {
        patientName: values.patientName,
        patientCnic: values.patientCnic,
        patientGender: values.patientGender,
        patientDob: {
          day: parseInt(values['patientDob.day']),
          month: parseInt(values['patientDob.month']),
          year: parseInt(values['patientDob.year'])
        },
        patientBloodGroup: values.patientBloodGroup,
        patientMobile: values.patientMobile,
        patientAddress: {
          address: values['patientAddress.address'],
          city: values['patientAddress.city'],
          state: values['patientAddress.state']
        },
        patientDisability: values.patientDisability,
        emergencyContact: {
          primaryContact: {
            name: values['emergencyContact.primaryContact.name'],
            relation: values['emergencyContact.primaryContact.relation'],
            cnic: values['emergencyContact.primaryContact.cnic'],
            contactNumber: values['emergencyContact.primaryContact.contactNumber']
          },
          secondaryContact: {
            name: values['emergencyContact.secondaryContact.name'],
            relation: values['emergencyContact.secondaryContact.relation'],
            cnic: values['emergencyContact.secondaryContact.cnic'],
            contactNumber: values['emergencyContact.secondaryContact.contactNumber']
          }
        }
      };

      const url = initialData
        ? `/api/patients/${initialData._id}`
        : '/api/patients';
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        toast.success(initialData ? 'Patient updated successfully' : 'Patient created successfully');
        router.push('/dashboard/patients');
        router.refresh();
      } else {
        toast.error(result.message || 'Something went wrong');
      }
    } catch (error) {
      toast.error('Failed to save patient');
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
            <FormInput control={form.control} name='patientName' label='Patient Name' placeholder='Enter name' required />
            <FormInput control={form.control} name='patientCnic' label='CNIC' placeholder='13-digit CNIC' required />
            
            <FormSelect control={form.control} name='patientGender' label='Gender' required options={[
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
              { label: 'Other', value: 'other' }
            ]} />
            
            <div className='grid grid-cols-3 gap-2'>
              <FormInput control={form.control} name='patientDob.day' label='Day' placeholder='DD' required />
              <FormInput control={form.control} name='patientDob.month' label='Month' placeholder='MM' required />
              <FormInput control={form.control} name='patientDob.year' label='Year' placeholder='YYYY' required />
            </div>
            
            <FormSelect control={form.control} name='patientBloodGroup' label='Blood Group' options={[
              { label: 'A+', value: 'A+' }, { label: 'A-', value: 'A-' },
              { label: 'B+', value: 'B+' }, { label: 'B-', value: 'B-' },
              { label: 'O+', value: 'O+' }, { label: 'O-', value: 'O-' },
              { label: 'AB+', value: 'AB+' }, { label: 'AB-', value: 'AB-' }
            ]} />

            <FormInput control={form.control} name='patientMobile' label='Mobile Number' placeholder='Phone number' />

            <FormInput control={form.control} name='patientDisability' label='Disability (if any)' placeholder='Enter disability details' />
          </div>

          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Address Information</h3>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormInput control={form.control} name='patientAddress.address' label='Address' placeholder='Street address' />
              <FormInput control={form.control} name='patientAddress.city' label='City' placeholder='City' />
              <FormInput control={form.control} name='patientAddress.state' label='State' placeholder='State' />
            </div>
          </div>

          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Emergency Contacts</h3>
            
            <div className='space-y-6'>
              <div>
                <h4 className='text-md font-medium mb-3'>Primary Emergency Contact</h4>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <FormInput control={form.control} name='emergencyContact.primaryContact.name' label='Name' placeholder='Contact name' />
                  <FormInput control={form.control} name='emergencyContact.primaryContact.relation' label='Relation' placeholder='Relationship' />
                  <FormInput control={form.control} name='emergencyContact.primaryContact.cnic' label='CNIC' placeholder='13-digit CNIC' />
                  <FormInput control={form.control} name='emergencyContact.primaryContact.contactNumber' label='Contact Number' placeholder='Phone number' />
                </div>
              </div>
              
              <div>
                <h4 className='text-md font-medium mb-3'>Secondary Emergency Contact</h4>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <FormInput control={form.control} name='emergencyContact.secondaryContact.name' label='Name' placeholder='Contact name' />
                  <FormInput control={form.control} name='emergencyContact.secondaryContact.relation' label='Relation' placeholder='Relationship' />
                  <FormInput control={form.control} name='emergencyContact.secondaryContact.cnic' label='CNIC' placeholder='13-digit CNIC' />
                  <FormInput control={form.control} name='emergencyContact.secondaryContact.contactNumber' label='Contact Number' placeholder='Phone number' />
                </div>
              </div>
            </div>
          </div>

          <Button type='submit' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : initialData ? 'Update Patient' : 'Create Patient'}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}
