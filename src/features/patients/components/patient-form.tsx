'use client';

import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { FormDatePicker } from '@/components/forms/form-date-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Patient } from '@/types/patient';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useI18n } from '@/providers/i18n-provider';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  cnic: z.string().min(13, { message: 'CNIC must be 13 characters.' }),
  gender: z.enum(['male', 'female', 'other']),
  dateOfBirth: z.date(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']).optional(),
  contact: z.object({
    primaryNumber: z.string().optional(),
    secondaryNumber: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional()
  }).optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    relation: z.string().optional(),
    phoneNo: z.string().optional()
  }).optional()
});

export default function PatientForm({
  initialData,
  pageTitle
}: {
  initialData: Patient | null;
  pageTitle: string;
}) {
  const { t } = useI18n();
  const defaultValues = {
    name: initialData?.name || '',
    cnic: initialData?.cnic || '',
    gender: initialData?.gender || ('male' as const),
    dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth) : undefined,
    bloodGroup: initialData?.bloodGroup,
    contact: {
      primaryNumber: initialData?.contact?.primaryNumber || '',
      secondaryNumber: initialData?.contact?.secondaryNumber || '',
      address: initialData?.contact?.address || '',
      city: initialData?.contact?.city || '',
      state: initialData?.contact?.state || ''
    },
    emergencyContact: {
      name: initialData?.emergencyContact?.name || '',
      relation: initialData?.emergencyContact?.relation || '',
      phoneNo: initialData?.emergencyContact?.phoneNo || ''
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues
  });

  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const [existingPatient, setExistingPatient] = useState<Patient | null>(null);
  const cnicValue = form.watch('cnic');

  useEffect(() => {
    const checkPatient = async () => {
      if (cnicValue?.length >= 13 && !initialData) {
        setIsChecking(true);
        try {
          const response = await fetch(`/api/patients?search=${cnicValue}&lookup=true`);
          const result = await response.json();
          
          if (result.success && result.data && result.data.length > 0) {
            // Find exact match
            const match = result.data.find((p: Patient) => p.cnic === cnicValue);
            if (match) {
              setExistingPatient(match);
              toast.info('Patient found in the system!');
              
              // Auto-fill fields
              form.setValue('name', match.name);
              form.setValue('gender', match.gender);
              if (match.dateOfBirth) form.setValue('dateOfBirth', new Date(match.dateOfBirth));
              if (match.bloodGroup) form.setValue('bloodGroup', match.bloodGroup);
              if (match.contact) {
                form.setValue('contact', {
                  primaryNumber: match.contact.primaryNumber || '',
                  secondaryNumber: match.contact.secondaryNumber || '',
                  address: match.contact.address || '',
                  city: match.contact.city || '',
                  state: match.contact.state || ''
                });
              }
              if (match.emergencyContact) {
                form.setValue('emergencyContact', {
                  name: match.emergencyContact.name || '',
                  relation: match.emergencyContact.relation || '',
                  phoneNo: match.emergencyContact.phoneNo || ''
                });
              }
            } else {
              setExistingPatient(null);
            }
          } else {
            setExistingPatient(null);
          }
        } catch (error) {
          console.error('Error checking patient:', error);
        } finally {
          setIsChecking(false);
        }
      } else if (cnicValue?.length < 13) {
        setExistingPatient(null);
      }
    };

    const timer = setTimeout(checkPatient, 500);
    return () => clearTimeout(timer);
  }, [cnicValue, form, initialData]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log('Form values received:', values);
      console.log('Contact object:', values.contact);
      console.log('EmergencyContact object:', values.emergencyContact);

      // Build contact object - clean and trim values
      const contact: any = {};
      if (values.contact) {
        contact.primaryNumber = values.contact.primaryNumber?.trim() || '';
        contact.secondaryNumber = values.contact.secondaryNumber?.trim() || '';
        contact.address = values.contact.address?.trim() || '';
        contact.city = values.contact.city?.trim() || '';
        contact.state = values.contact.state?.trim() || '';
      }

      console.log('Built contact object:', contact);

      // Build emergency contact object - clean and trim values
      const emergencyContact: any = {};
      if (values.emergencyContact) {
        emergencyContact.name = values.emergencyContact.name?.trim() || '';
        emergencyContact.relation = values.emergencyContact.relation?.trim() || '';
        emergencyContact.phoneNo = values.emergencyContact.phoneNo?.trim() || '';
      }

      console.log('Built emergencyContact object:', emergencyContact);

      // Validate dateOfBirth
      if (!values.dateOfBirth || !(values.dateOfBirth instanceof Date) || isNaN(values.dateOfBirth.getTime())) {
        toast.error('Please select a valid date of birth');
        return;
      }

      const payload: any = {
        name: values.name.trim(),
        cnic: values.cnic.trim(),
        gender: values.gender,
        dateOfBirth: values.dateOfBirth.toISOString(),
      };

      // Only include bloodGroup if it's provided
      if (values.bloodGroup) {
        payload.bloodGroup = values.bloodGroup;
      }

      // Always include contact object (even if empty)
      payload.contact = contact;

      // Always include emergencyContact object (even if empty)
      payload.emergencyContact = emergencyContact;

      console.log('Final payload being sent:', JSON.stringify(payload, null, 2));

      const url = initialData
        ? `/api/patients/${initialData._id}`
        : '/api/patients';
      const method = initialData ? 'PUT' : 'POST';

      // Import offline submission utility
      const { submitWithOfflineSupport } = await import('@/lib/offline/form-submission');

      const result = await submitWithOfflineSupport(
        'patients',
        payload,
        {
          apiEndpoint: url,
          method,
          id: initialData?._id,
          onSuccess: (responseData?: any) => {
            // Navigate to patients list
            router.push('/dashboard/patients');
            router.refresh();
          },
        }
      );

      if (!result.success) {
        console.error('Patient submission failed:', result.error);
        toast.error(result.error || 'Failed to save patient');
      }
      // Note: Success messages (including "already linked") are handled by submitWithOfflineSupport
    } catch (error) {
      toast.error('Failed to save patient');
      console.error('Patient form error:', error);
    }
  }

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {initialData ? t('common.edit') : t('common.create_new')} {t('common.patients')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {existingPatient && (
          <Alert className="mb-6 border-primary/50 bg-primary/10 text-primary">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>{t('common.patient_found')}</AlertTitle>
            <AlertDescription>
              {t('common.patient_found_desc')}
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
                ) : existingPatient ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : null}
              </div>
            </div>

            <FormInput 
              control={form.control} 
              name='name' 
              label={t('common.patient_name')} 
              placeholder={t('common.enter_name')} 
              required 
              disabled={!!existingPatient?.name}
            />
            
            <FormSelect 
              control={form.control} 
              name='gender' 
              label={t('common.gender')} 
              required 
              options={[
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
                { label: 'Other', value: 'other' }
              ]} 
              disabled={!!existingPatient?.gender}
            />
            
            <FormDatePicker 
              control={form.control} 
              name='dateOfBirth' 
              label={t('common.dob')} 
              required 
              disabled={!!existingPatient?.dateOfBirth}
            />
            
            <FormSelect 
              control={form.control} 
              name='bloodGroup' 
              label={t('common.blood_group')} 
              options={[
                { label: 'A+', value: 'A+' }, { label: 'A-', value: 'A-' },
                { label: 'B+', value: 'B+' }, { label: 'B-', value: 'B-' },
                { label: 'O+', value: 'O+' }, { label: 'O-', value: 'O-' },
                { label: 'AB+', value: 'AB+' }, { label: 'AB-', value: 'AB-' }
              ]} 
              disabled={!!existingPatient?.bloodGroup}
            />
          </div>

          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>{t('common.contact_info')}</h3>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormInput control={form.control} name='contact.primaryNumber' label={t('common.primary_number')} placeholder={t('common.phone')} disabled={!!existingPatient?.contact?.primaryNumber} />
              <FormInput control={form.control} name='contact.secondaryNumber' label={t('common.secondary_number')} placeholder={t('common.phone')} disabled={!!existingPatient?.contact?.secondaryNumber} />
              <FormInput control={form.control} name='contact.address' label={t('common.address')} placeholder={t('common.address')} disabled={!!existingPatient?.contact?.address} />
              <FormInput control={form.control} name='contact.city' label={t('common.city')} placeholder={t('common.city')} disabled={!!existingPatient?.contact?.city} />
              <FormInput control={form.control} name='contact.state' label={t('common.state')} placeholder={t('common.state')} disabled={!!existingPatient?.contact?.state} />
            </div>
          </div>

          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>{t('common.emergency_contact')}</h3>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              <FormInput control={form.control} name='emergencyContact.name' label={t('common.name')} placeholder={t('common.name')} disabled={!!existingPatient?.emergencyContact?.name} />
              <FormInput control={form.control} name='emergencyContact.relation' label={t('common.relation')} placeholder={t('common.relation')} disabled={!!existingPatient?.emergencyContact?.relation} />
              <FormInput control={form.control} name='emergencyContact.phoneNo' label={t('common.phone')} placeholder={t('common.phone')} disabled={!!existingPatient?.emergencyContact?.phoneNo} />
            </div>
          </div>

          <Button type='submit' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting 
              ? t('common.saving') 
              : existingPatient 
                ? t('common.link_patient') 
                : initialData 
                  ? t('common.update') 
                  : t('common.create')}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}
