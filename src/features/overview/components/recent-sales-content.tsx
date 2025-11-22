'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { useI18n } from '@/providers/i18n-provider';

interface RecentSalesContentProps {
  patients: any[];
  role: string;
}

// Function to get initials from name
function getInitials(name: string) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Generate avatar URL based on name
function generateAvatarUrl(name: string) {
  const seed = name.toLowerCase().replace(/\s+/g, '');
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
}

export function RecentSalesContent({ patients, role }: RecentSalesContentProps) {
  const { t } = useI18n();

  const getTitle = () => {
    switch (role) {
      case 'hospital':
        return 'Recent Patient Registrations';
      case 'doctor':
        return 'Your Recent Patients';
      case 'admin':
        return 'Recent Patient Registrations';
      default:
        return t('common.recent_activity');
    }
  };

  const getDescription = () => {
    if (patients.length > 0) {
      switch (role) {
        case 'hospital':
          return `${patients.length} new patients at your facility.`;
        case 'doctor':
          return `${patients.length} patients you've seen recently.`;
        default:
          return `${patients.length} ${t('common.new_patients_registered')}.`;
      }
    }
    return role === 'doctor' 
      ? 'No recent patient visits.'
      : t('common.no_registration_data');
  };

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>
          {getDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          {patients.length > 0 ? (
            patients.map((patient: any, index: number) => {
              const patientName = patient.patientName || patient.name || 'Unknown Patient';
              const patientCnic = patient.patientCnic || patient.cnic || 'N/A';
              const registrationDate = patient.createdAt 
                ? formatDistanceToNow(new Date(patient.createdAt), { addSuffix: true })
                : 'Recently';
              
              return (
                <div key={patient._id || index} className='flex items-center'>
                  <Avatar className='h-9 w-9'>
                    <AvatarImage src={generateAvatarUrl(patientName)} alt='Patient Avatar' />
                    <AvatarFallback>{getInitials(patientName)}</AvatarFallback>
                  </Avatar>
                  <div className='ml-4 space-y-1'>
                    <p className='text-sm leading-none font-medium'>{patientName}</p>
                    <p className='text-muted-foreground text-sm'>CNIC: {patientCnic}</p>
                  </div>
                  <div className='ml-auto text-sm text-muted-foreground'>
                    {registrationDate}
                  </div>
                </div>
              );
            })
          ) : (
            <div className='flex items-center justify-center py-8'>
              <p className='text-muted-foreground text-sm'>{t('common.no_data_display')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

