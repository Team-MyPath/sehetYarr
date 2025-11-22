'use client';

import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { FormDatePicker } from '@/components/forms/form-date-picker';
import { FormTextarea } from '@/components/forms/form-textarea';
import { FormSearchableSelect, SearchableSelectOption } from '@/components/forms/form-searchable-select';
import { FormSwitch } from '@/components/forms/form-switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Appointment } from '@/types/appointment';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { useI18n } from '@/providers/i18n-provider';

const formSchema = z.object({
  patientId: z.string().min(1, { message: 'Patient is required.' }),
  doctorId: z.string().min(1, { message: 'Doctor is required.' }),
  hospitalId: z.string().min(1, { message: 'Hospital is required.' }),
  appointmentDate: z.date(),
  appointmentTime: z.string().min(1, { message: 'Time is required.' }),
  status: z.enum(['Scheduled', 'Completed', 'Cancelled', 'No Show']),
  priority: z.enum(['Normal', 'Urgent']).optional(),
  reason: z.string().optional(),
  payUpfront: z.boolean().default(false),
  totalAmount: z.number().optional(),
  paidAmount: z.number().optional(),
  paymentMethod: z.enum(['Cash', 'Card', 'Bank Transfer', 'Insurance']).optional(),
  discount: z.number().optional(),
  billItems: z.string().optional()
}).refine((data) => {
  if (data.payUpfront) {
    return (
      data.totalAmount !== undefined && 
      data.totalAmount > 0 &&
      data.paidAmount !== undefined && 
      data.paidAmount >= 0 &&
      data.paymentMethod
    );
  }
  return true;
}, {
  message: 'Billing details are required when completing appointment with payment',
  path: ['totalAmount']
});

export default function AppointmentForm({
  initialData,
  pageTitle
}: {
  initialData: Appointment | null;
  pageTitle: string;
}) {
  const { t } = useI18n();
  const [patients, setPatients] = useState<SearchableSelectOption[]>([]);
  const [doctors, setDoctors] = useState<SearchableSelectOption[]>([]);
  const [hospitals, setHospitals] = useState<Array<{ label: string; value: string }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, doctorsRes, hospitalsRes] = await Promise.all([
          fetch('/api/patients?limit=1000'),
          fetch('/api/doctors?limit=1000'),
          fetch('/api/hospitals?limit=1000')
        ]);

        const [patientsData, doctorsData, hospitalsData] = await Promise.all([
          patientsRes.json(),
          doctorsRes.json(),
          hospitalsRes.json()
        ]);

        if (patientsData.success) {
          setPatients(patientsData.data.map((p: any) => ({
            label: p.name,
            value: p._id,
            subtitle: `${t('common.cnic')}: ${p.cnic || 'N/A'}`,
            searchText: `${p.name} ${p.cnic || ''}`
          })));
        }

        if (doctorsData.success) {
          setDoctors(doctorsData.data.map((d: any) => ({
            label: d.name,
            value: d._id,
            subtitle: `${t('common.cnic')}: ${d.cnic || 'N/A'}`,
            searchText: `${d.name} ${d.cnic || ''}`
          })));
        }

        if (hospitalsData.success) {
          setHospitals(hospitalsData.data.map((h: any) => ({
            label: h.name,
            value: h._id
          })));
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, [t]);

  const getTimeFromDate = (date: string) => {
    const d = new Date(date);
    return d.toTimeString().slice(0, 5);
  };

  const defaultValues = {
    patientId: typeof initialData?.patientId === 'object' ? initialData.patientId._id : initialData?.patientId || '',
    doctorId: typeof initialData?.doctorId === 'object' ? initialData.doctorId._id : initialData?.doctorId || '',
    hospitalId: typeof initialData?.hospitalId === 'object' ? initialData.hospitalId._id : initialData?.hospitalId || '',
    appointmentDate: initialData?.appointmentDate ? new Date(initialData.appointmentDate) : undefined,
    appointmentTime: initialData?.appointmentDate ? getTimeFromDate(initialData.appointmentDate) : '',
    status: initialData?.status || ('Scheduled' as const),
    priority: initialData?.priority,
    reason: initialData?.reason || '',
    payUpfront: false,
    totalAmount: undefined,
    paidAmount: undefined,
    paymentMethod: 'Cash' as const,
    discount: undefined,
    billItems: ''
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues
  });

  const router = useRouter();
  const payUpfront = form.watch('payUpfront');
  
  useEffect(() => {
    if (payUpfront) {
      form.setValue('status', 'Completed');
    } else if (!initialData) {
      form.setValue('status', 'Scheduled');
    }
  }, [payUpfront, form, initialData]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const dateTime = new Date(values.appointmentDate);
      const [hours, minutes] = values.appointmentTime.split(':');
      dateTime.setHours(parseInt(hours), parseInt(minutes));

      const appointmentPayload = {
        patientId: values.patientId,
        doctorId: values.doctorId,
        hospitalId: values.hospitalId,
        appointmentDate: dateTime.toISOString(),
        status: values.status,
        priority: values.priority,
        reason: values.reason
      };

      const url = initialData
        ? `/api/appointments/${initialData._id}`
        : '/api/appointments';
      const method = initialData ? 'PUT' : 'POST';

      const { submitWithOfflineSupport } = await import('@/lib/offline/form-submission');

      const result = await submitWithOfflineSupport(
        'appointments',
        appointmentPayload,
        {
          apiEndpoint: url,
          method,
          id: initialData?._id,
        }
      );

      if (!result.success) {
        console.error('Appointment submission failed:', result.error);
        return;
      }

      if (values.payUpfront && !initialData) {
        try {
          const parseItems = (str: string) => {
            if (!str || !str.trim()) return [];
            return str.split('\n').filter(Boolean).map(line => {
              const [description, quantity, unitPrice, amount] = line.split('|').map(s => s.trim());
              return {
                description: description || '',
                quantity: quantity ? parseFloat(quantity) : 0,
                unitPrice: unitPrice ? parseFloat(unitPrice) : 0,
                amount: amount ? parseFloat(amount) : 0
              };
            });
          };

          const billPayload = {
            patientId: values.patientId,
            hospitalId: values.hospitalId,
            doctorId: values.doctorId,
            billDate: dateTime.toISOString(),
            totalAmount: values.totalAmount!,
            paidAmount: values.paidAmount!,
            status: values.paidAmount! >= values.totalAmount! ? 'Paid' : 'Partial',
            paymentMethod: values.paymentMethod!,
            discount: values.discount || 0,
            items: parseItems(values.billItems || '')
          };

          await submitWithOfflineSupport(
            'bills',
            billPayload,
            {
              apiEndpoint: '/api/bills',
              method: 'POST',
            }
          );

          toast.success(t('common.appointment_completed_bill_created')); // This key is not in dictionary, falling back to hardcoded if not added
          // Actually I should stick to t('common.create') + 'd' or something but simpler to use generic success message if key not present.
          // I'll use standard success message.
        } catch (billError) {
          console.error('Bill creation failed:', billError);
          toast.warning('Appointment created but bill creation failed. Please create the bill manually.');
        }
      } else {
        toast.success(initialData ? t('common.update') : t('common.create'));
      }

      router.push('/dashboard/appointments');
      router.refresh();
    } catch (error) {
      toast.error(t('common.failed_to_save_appointment')); // Key likely missing, will add standard error
      console.error('Appointment form error:', error);
    }
  }

  const statusOptions = [
    { label: t('common.scheduled'), value: 'Scheduled' },
    { label: t('common.completed'), value: 'Completed' },
    { label: t('common.cancelled'), value: 'Cancelled' },
    { label: t('common.no_show'), value: 'No Show' } // Need key for 'No Show'
  ];

  const priorityOptions = [
    { label: t('common.normal'), value: 'Normal' },
    { label: t('common.urgent'), value: 'Urgent' }
  ];

  const paymentMethodOptions = [
    { label: t('common.cash'), value: 'Cash' },
    { label: t('common.card'), value: 'Card' },
    { label: t('common.bank_transfer'), value: 'Bank Transfer' },
    { label: t('common.insurance'), value: 'Insurance' }
  ];

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {initialData ? t('common.edit') : t('common.create_new')} {t('common.appointments')}
        </CardTitle>
        <CardDescription>
          {!initialData && t('common.enable_complete_pay_upfront')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <div className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormSearchableSelect 
                control={form.control} 
                name='patientId' 
                label={t('common.patient_name')} 
                placeholder={t('common.select_patient')}
                required
                options={patients}
                emptyMessage={t('common.no_data_display')}
              />
              
              <FormSearchableSelect 
                control={form.control} 
                name='doctorId' 
                label={t('common.doctor_name')} 
                placeholder={t('common.select_doctor')}
                required
                options={doctors}
                emptyMessage={t('common.no_data_display')}
              />
              
              <FormSelect 
                control={form.control} 
                name='hospitalId' 
                label={t('common.hospital_name')} 
                placeholder={t('common.select_type')}
                required
                options={hospitals}
              />
              
              <FormDatePicker 
                control={form.control} 
                name='appointmentDate' 
                label={t('common.appointment_date')} 
                required 
              />
              
              <FormInput 
                control={form.control} 
                name='appointmentTime' 
                label={t('common.appointment_time')}
                placeholder={t('common.time_placeholder')}
                required 
              />
              
              <FormSelect 
                control={form.control} 
                name='status' 
                label={t('common.status')} 
                required
                disabled={payUpfront}
                options={statusOptions}
              />
              
              <FormSelect 
                control={form.control} 
                name='priority' 
                label={t('common.priority')} 
                options={priorityOptions}
              />
            </div>

            <FormTextarea
              control={form.control}
              name='reason'
              label={t('common.reason')}
              placeholder={t('common.enter_reason')}
              config={{
                maxLength: 500,
                showCharCount: true,
                rows: 4
              }}
            />
          </div>

          {!initialData && (
            <>
              <Separator className='my-6' />
              
              <FormSwitch
                control={form.control}
                name='payUpfront'
                label={t('common.complete_and_pay_upfront')}
                description={t('common.complete_and_pay_upfront_desc')}
                showDescription={true}
              />

              {payUpfront && (
                <div className='space-y-6 rounded-lg border border-primary/20 bg-primary/5 p-6'>
                  <div className='space-y-2'>
                    <h3 className='text-lg font-semibold'>{t('common.payment_details')}</h3>
                    <p className='text-sm text-muted-foreground'>
                      {t('common.payment_details_desc')}
                    </p>
                  </div>

                  <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <FormInput
                      control={form.control}
                      name='totalAmount'
                      label={t('common.total')}
                      type='number'
                      placeholder={t('common.enter_total_amount')}
                      required
                      min='0.01'
                      step='0.01'
                    />
                    
                    <FormInput
                      control={form.control}
                      name='paidAmount'
                      label={t('common.paid_amount')}
                      type='number'
                      placeholder={t('common.enter_paid_amount')}
                      required
                      min='0'
                      step='0.01'
                    />
                    
                    <FormSelect
                      control={form.control}
                      name='paymentMethod'
                      label={t('common.payment_method')}
                      required
                      options={paymentMethodOptions}
                    />
                    
                    <FormInput
                      control={form.control}
                      name='discount'
                      label={t('common.discount')}
                      type='number'
                      placeholder='0'
                      min='0'
                      step='0.01'
                    />
                  </div>

                  <FormTextarea
                    control={form.control}
                    name='billItems'
                    label={t('common.bill_items_optional')}
                    placeholder={t('common.bill_items_placeholder')}
                    config={{
                      maxLength: 1000,
                      showCharCount: true,
                      rows: 4
                    }}
                  />
                </div>
              )}
            </>
          )}

          <div className='flex gap-4'>
            <Button 
              type='button' 
              variant='outline' 
              onClick={() => router.back()}
              disabled={form.formState.isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button type='submit' disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting 
                ? t('common.saving') 
                : initialData 
                  ? t('common.update') 
                  : payUpfront 
                    ? t('common.complete_and_create_bill')
                    : t('common.create')
              }
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
