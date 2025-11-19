'use client';

import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { FormDatePicker } from '@/components/forms/form-date-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Doctor } from '@/types/doctor';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useEffect, useState } from 'react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  cnic: z.string().min(13, { message: 'CNIC must be 13 characters.' }),
  cnicIV: z.string().min(1, { message: 'CNIC IV is required.' }),
  lisenceNumber: z.string().min(1, { message: 'License number is required.' }),
  gender: z.enum(['male', 'female', 'other']).optional(),
  specialization: z.string().optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  hospitalIds: z.string().optional(),
  'appointment.appointerName': z.number().optional(),
  'appointment.contactNumber': z.string().optional()
});

export default function DoctorForm({
  initialData,
  pageTitle
}: {
  initialData: Doctor | null;
  pageTitle: string;
}) {
  const [hospitals, setHospitals] = useState<Array<{ label: string; value: string }>>([]);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch('/api/hospitals?limit=1000');
        const data = await response.json();
        if (data.success) {
          setHospitals(
            data.data.map((h: any) => ({
              label: h.name,
              value: h._id
            }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch hospitals:', error);
      }
    };
    fetchHospitals();
  }, []);

  const defaultValues = {
    name: initialData?.name || '',
    cnic: initialData?.cnic || '',
    cnicIV: initialData?.cnicIV || '',
    lisenceNumber: initialData?.lisenceNumber || '',
    gender: initialData?.gender,
    specialization: initialData?.specialization || '',
    experience: initialData?.experience || '',
    education: initialData?.education || '',
    hospitalIds: initialData?.hospitalIds || '',
    'appointment.appointerName': initialData?.appointment?.appointerName,
    'appointment.contactNumber': initialData?.appointment?.contactNumber || ''
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
        cnic: values.cnic,
        cnicIV: values.cnicIV,
        lisenceNumber: values.lisenceNumber,
        gender: values.gender,
        specialization: values.specialization,
        experience: values.experience,
        education: values.education,
        hospitalIds: values.hospitalIds,
        appointment: {
          appointerName: values['appointment.appointerName'],
          contactNumber: values['appointment.contactNumber']
        }
      };

      const url = initialData
        ? `/api/doctors/${initialData._id}`
        : '/api/doctors';
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        toast.success(initialData ? 'Doctor updated successfully' : 'Doctor created successfully');
        router.push('/dashboard/doctors');
        router.refresh();
      } else {
        toast.error(result.message || 'Something went wrong');
      }
    } catch (error) {
      toast.error('Failed to save doctor');
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
            <FormInput control={form.control} name='name' label='Doctor Name' placeholder='Enter name' required />
            <FormInput control={form.control} name='cnic' label='CNIC' placeholder='13-digit CNIC' required />
            <FormInput control={form.control} name='cnicIV' label='CNIC IV' placeholder='Enter CNIC IV' required />
            <FormInput control={form.control} name='lisenceNumber' label='License Number' placeholder='Medical license number' required />
            
            <FormSelect control={form.control} name='gender' label='Gender' options={[
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
              { label: 'Other', value: 'other' }
            ]} />
            
            <FormInput control={form.control} name='specialization' label='Specialization' placeholder='e.g., Cardiology' />
            
            <FormInput 
              control={form.control} 
              name='experience' 
              label='Experience' 
              placeholder='Years of experience'
            />
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <FormInput 
              control={form.control} 
              name='education' 
              label='Education' 
              placeholder='MBBS, MD, etc.' 
            />
            
            <FormSelect 
              control={form.control} 
              name='hospitalIds' 
              label='Primary Hospital' 
              placeholder='Select hospital'
              options={hospitals}
            />
          </div>

          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Appointment Information</h3>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormInput 
                control={form.control} 
                name='appointment.appointerName' 
                label='Appointer Name' 
                placeholder='Enter appointer name'
                type='number'
              />
              <FormInput 
                control={form.control} 
                name='appointment.contactNumber' 
                label='Contact Number' 
                placeholder='Contact number for appointments'
              />
            </div>
          </div>

          <Button type='submit' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : initialData ? 'Update Doctor' : 'Create Doctor'}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}
