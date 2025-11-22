'use client';

import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Capacity } from '@/types/capacity';
import { Edit, MoreVertical, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { useI18n } from '@/providers/i18n-provider';

interface CellActionProps {
  data: Capacity;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const onConfirm = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/capacity/${data._id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast.success(t('common.capacity_deleted'));
        router.refresh();
      } else {
        toast.error(result.message || t('common.error'));
      }
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
        title={t('common.delete_confirmation_title')}
        description={t('common.delete_confirmation_desc')}
        confirmText={t('common.continue')}
        cancelText={t('common.cancel')}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>{t('common.open_menu')}</span>
            <MoreVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/capacity/${data._id}`)}
          >
            <Edit className='mr-2 h-4 w-4' /> {t('common.update')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className='mr-2 h-4 w-4' /> {t('common.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
