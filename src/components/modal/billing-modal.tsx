'use client';

import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { FormTextarea } from '@/components/forms/form-textarea';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { IconReceipt } from '@tabler/icons-react';
import { useI18n } from '@/providers/i18n-provider';

const billingSchema = z.object({
  totalAmount: z.number().min(0.01, { message: 'Total amount must be greater than 0' }),
  paidAmount: z.number().min(0, { message: 'Paid amount cannot be negative' }),
  paymentMethod: z.enum(['Cash', 'Card', 'Bank Transfer', 'Insurance']),
  discount: z.number().min(0).optional(),
  billItems: z.string().optional()
});

export type BillingFormData = z.infer<typeof billingSchema>;

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: BillingFormData) => Promise<void>;
  loading: boolean;
  patientName?: string;
  doctorName?: string;
  appointmentDate?: string;
}

export function BillingModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  patientName,
  doctorName,
  appointmentDate
}: BillingModalProps) {
  const { t } = useI18n();
  const form = useForm<BillingFormData>({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      totalAmount: undefined,
      paidAmount: undefined,
      paymentMethod: 'Cash',
      discount: undefined,
      billItems: ''
    }
  });

  const handleSubmit = async (values: BillingFormData) => {
    try {
      await onConfirm(values);
      form.reset();
    } catch (error) {
      // Error handling is done in parent component
      console.error('Billing submission error:', error);
    }
  };

  const handleClose = () => {
    if (!loading) {
      form.reset();
      onClose();
    }
  };

  const paymentMethodOptions = [
    { label: t('common.cash'), value: 'Cash' },
    { label: t('common.card'), value: 'Card' },
    { label: t('common.bank_transfer'), value: 'Bank Transfer' },
    { label: t('common.insurance'), value: 'Insurance' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <div className='flex items-center gap-2'>
            <IconReceipt className='h-5 w-5 text-primary' />
            <DialogTitle>{t('common.complete_and_create_bill')}</DialogTitle>
          </div>
          <DialogDescription>
            {t('common.billing_modal_desc')}
          </DialogDescription>
        </DialogHeader>

        {(patientName || doctorName || appointmentDate) && (
          <div className='rounded-lg border bg-muted/50 p-4 space-y-2'>
            <h4 className='text-sm font-semibold'>{t('common.appointment_details')}</h4>
            {patientName && (
              <p className='text-sm'>
                <span className='text-muted-foreground'>{t('common.patient_name')}:</span>{' '}
                <span className='font-medium'>{patientName}</span>
              </p>
            )}
            {doctorName && (
              <p className='text-sm'>
                <span className='text-muted-foreground'>{t('common.doctor_name')}:</span>{' '}
                <span className='font-medium'>{doctorName}</span>
              </p>
            )}
            {appointmentDate && (
              <p className='text-sm'>
                <span className='text-muted-foreground'>{t('common.date')}:</span>{' '}
                <span className='font-medium'>{appointmentDate}</span>
              </p>
            )}
          </div>
        )}

        <Separator />

        <Form form={form} onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
          <div className='space-y-4'>
            <h4 className='text-sm font-semibold'>{t('common.payment_info')}</h4>
            
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
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

          <DialogFooter className='gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={loading}
            >
              {t('common.cancel')}
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? t('common.processing') : t('common.complete_and_create_bill')}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
