'use client';

import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { FormDatePicker } from '@/components/forms/form-date-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Doctor } from '@/types/doctor';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useI18n } from '@/providers/i18n-provider';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  cnic: z.string().min(13, { message: 'CNIC must be 13 characters.' }),
  cnicIV: z.string().min(1, { message: 'CNIC IV is required.' }),
  licenseNumber: z.string().min(1, { message: 'License number is required.' }),
  gender: z.enum(['male', 'female', 'other']).optional(),
  dateOfBirth: z.date().optional(),
  specialization: z.string().optional(),
  experienceYears: z.number().min(0).optional(),
  qualifications: z.string().optional(),
  subSpecialization: z.string().optional(),
  hospitalIds: z.string().optional(),
  'contact.area': z.string().optional(),
  'contact.city': z.string().optional(),
  'contact.state': z.string().optional(),
  'contact.primaryNumber': z.string().optional(),
  'contact.secondaryNumber': z.string().optional()
});

export default function DoctorForm({
  initialData,
  pageTitle
}: {
  initialData: Doctor | null;
  pageTitle: string;
}) {
  const { t } = useI18n();
  const [hospitals, setHospitals] = useState<Array<{ label: string; value: string }>>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [existingDoctor, setExistingDoctor] = useState<Doctor | null>(null);

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
    licenseNumber: initialData?.licenseNumber || '',
    gender: initialData?.gender,
    dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth) : undefined,
    specialization: initialData?.specialization || '',
    experienceYears: initialData?.experienceYears,
    qualifications: initialData?.qualifications?.join(', ') || '',
    subSpecialization: initialData?.subSpecialization?.join(', ') || '',
    hospitalIds: initialData?.hospitalIds?.[0]?._id || '',
    'contact.area': initialData?.contact?.area || '',
    'contact.city': initialData?.contact?.city || '',
    'contact.state': initialData?.contact?.state || '',
    'contact.primaryNumber': initialData?.contact?.primaryNumber || '',
    'contact.secondaryNumber': initialData?.contact?.secondaryNumber || ''
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues
  });

  const router = useRouter();
  const cnicValue = form.watch('cnic');

  // CNIC lookup logic - check for existing doctor
  useEffect(() => {
    const checkDoctor = async () => {
      if (cnicValue?.length >= 13 && !initialData) {
        setIsChecking(true);
        try {
          const response = await fetch(`/api/doctors?search=${cnicValue}&lookup=true`);
          const result = await response.json();
          
          if (result.success && result.data && result.data.length > 0) {
            // Find exact CNIC match
            const match = result.data.find((d: Doctor) => d.cnic === cnicValue);
            if (match) {
              setExistingDoctor(match);
              toast.info('Doctor found in the system!');
              
              // Auto-fill fields
              form.setValue('name', match.name);
              form.setValue('cnicIV', match.cnicIV);
              form.setValue('licenseNumber', match.licenseNumber);
              if (match.gender) form.setValue('gender', match.gender);
              if (match.dateOfBirth) form.setValue('dateOfBirth', new Date(match.dateOfBirth));
              if (match.specialization) form.setValue('specialization', match.specialization);
              if (match.experienceYears) form.setValue('experienceYears', match.experienceYears);
              if (match.qualifications?.length) form.setValue('qualifications', match.qualifications.join(', '));
              if (match.subSpecialization?.length) form.setValue('subSpecialization', match.subSpecialization.join(', '));
              if (match.contact?.primaryNumber) form.setValue('contact.primaryNumber' as any, match.contact.primaryNumber);
              if (match.contact?.secondaryNumber) form.setValue('contact.secondaryNumber' as any, match.contact.secondaryNumber);
              if (match.contact?.area) form.setValue('contact.area' as any, match.contact.area);
              if (match.contact?.city) form.setValue('contact.city' as any, match.contact.city);
              if (match.contact?.state) form.setValue('contact.state' as any, match.contact.state);
            } else {
              setExistingDoctor(null);
            }
          } else {
            setExistingDoctor(null);
          }
        } catch (error) {
          console.error('Error checking doctor:', error);
        } finally {
          setIsChecking(false);
        }
      } else if (cnicValue?.length < 13) {
        setExistingDoctor(null);
      }
    };

    const timer = setTimeout(checkDoctor, 500);
    return () => clearTimeout(timer);
  }, [cnicValue, form, initialData]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const payload = {
        name: values.name,
        cnic: values.cnic,
        cnicIV: values.cnicIV,
        licenseNumber: values.licenseNumber,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth?.toISOString(),
        specialization: values.specialization,
        experienceYears: values.experienceYears,
        qualifications: values.qualifications
          ? values.qualifications.split(',').map(q => q.trim()).filter(Boolean)
          : [],
        subSpecialization: values.subSpecialization
          ? values.subSpecialization.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        hospitalIds: values.hospitalIds ? [values.hospitalIds] : [],
        contact: {
          area: values['contact.area'],
          city: values['contact.city'],
          state: values['contact.state'],
          primaryNumber: values['contact.primaryNumber'],
          secondaryNumber: values['contact.secondaryNumber']
        }
      };

      const url = initialData
        ? `/api/doctors/${initialData._id}`
        : '/api/doctors';
      const method = initialData ? 'PUT' : 'POST';

      // Import offline submission utility
      const { submitWithOfflineSupport } = await import('@/lib/offline/form-submission');

      const result = await submitWithOfflineSupport(
        'doctors',
        payload,
        {
          apiEndpoint: url,
          method,
          id: initialData?._id,
          onSuccess: () => {
            router.push('/dashboard/doctors');
            router.refresh();
          },
        }
      );

      if (!result.success) {
        console.error('Doctor submission failed:', result.error);
      }
    } catch (error) {
      toast.error('Failed to save doctor');
      console.error('Doctor form error:', error);
    }
  }

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {initialData ? t('common.edit') : t('common.create_new')} {t('common.doctors')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {existingDoctor && (
          <Alert className="mb-6 border-primary/50 bg-primary/10 text-primary">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>{t('common.doctor_found') || 'Doctor Found!'}</AlertTitle>
            <AlertDescription>
              {t('common.doctor_found_desc') || "This doctor already exists in the system. We've auto-filled their information."}
            </AlertDescription>
          </Alert>
        )}

        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div className="relative">
              <FormInput 
                control={form.control} 
                name='cnic' 
                label={t('common.cnic')} 
                placeholder={t('common.enter_cnic')} 
                required 
                disabled={!!initialData}
              />
              <div className="absolute right-3 top-[34px]">
                {isChecking ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : existingDoctor ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : null}
              </div>
            </div>

            <FormInput 
              control={form.control} 
              name='name' 
              label={t('common.doctor_name')} 
              placeholder={t('common.enter_name')} 
              required 
              disabled={!!existingDoctor?.name}
            />
            
            <FormInput 
              control={form.control} 
              name='cnicIV' 
              label='CNIC IV' 
              placeholder={t('common.enter_cnic_iv')} 
              required 
              disabled={!!existingDoctor?.cnicIV}
            />
            
            <FormInput 
              control={form.control} 
              name='licenseNumber' 
              label={t('common.license_number')} 
              placeholder={t('common.enter_license')} 
              required 
              disabled={!!existingDoctor?.licenseNumber}
            />
            
            <FormSelect 
              control={form.control} 
              name='gender' 
              label={t('common.gender')} 
              options={[
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
                { label: 'Other', value: 'other' }
              ]} 
              disabled={!!existingDoctor?.gender}
            />
            
            <FormDatePicker 
              control={form.control} 
              name='dateOfBirth' 
              label={t('common.dob')} 
              disabled={!!existingDoctor?.dateOfBirth}
            />
            
            <FormInput 
              control={form.control} 
              name='specialization' 
              label={t('common.specialization')} 
              placeholder='e.g., Cardiology' 
              disabled={!!existingDoctor?.specialization}
            />
            
            <FormInput 
              control={form.control} 
              name='experienceYears' 
              label={t('common.experience_years')} 
              placeholder='Years of experience' 
              type='number' 
              min={0}
              disabled={!!existingDoctor?.experienceYears}
            />
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <FormInput 
              control={form.control} 
              name='qualifications' 
              label={t('common.qualification')} 
              placeholder='MBBS, MD (comma separated)' 
              disabled={!!existingDoctor?.qualifications?.length}
            />
            
            <FormInput 
              control={form.control} 
              name='subSpecialization' 
              label='Sub-Specializations' // Need key
              placeholder='Interventional Cardiology (comma separated)' 
              disabled={!!existingDoctor?.subSpecialization?.length}
            />
            
            <FormSelect 
              control={form.control} 
              name='hospitalIds' 
              label={t('common.hospital_name')} // Primary Hospital?
              placeholder={t('common.select_type')} // Select hospital
              options={hospitals}
            />
          </div>

          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>{t('common.contact_info')}</h3>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormInput 
                control={form.control} 
                name='contact.primaryNumber' 
                label={t('common.primary_number')} 
                placeholder={t('common.phone')} 
                disabled={!!existingDoctor?.contact?.primaryNumber}
              />
              <FormInput 
                control={form.control} 
                name='contact.secondaryNumber' 
                label={t('common.secondary_number')} 
                placeholder={t('common.phone')} 
                disabled={!!existingDoctor?.contact?.secondaryNumber}
              />
              <FormInput 
                control={form.control} 
                name='contact.area' 
                label='Area' // Need key
                placeholder='Area' 
                disabled={!!existingDoctor?.contact?.area}
              />
              <FormInput 
                control={form.control} 
                name='contact.city' 
                label={t('common.city')} 
                placeholder={t('common.city')} 
                disabled={!!existingDoctor?.contact?.city}
              />
              <FormInput 
                control={form.control} 
                name='contact.state' 
                label={t('common.state')} 
                placeholder={t('common.state')} 
                disabled={!!existingDoctor?.contact?.state}
              />
            </div>
          </div>

          <Button type='submit' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting 
              ? t('common.saving') 
              : existingDoctor 
                ? 'Link Doctor' // Need key
                : initialData 
                  ? t('common.update') 
                  : t('common.create')}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}
