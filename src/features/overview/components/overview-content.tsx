'use client';

import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import { IconTrendingUp, IconUsers, IconBuilding, IconStethoscope, IconHeartbeat, IconCalendar } from '@tabler/icons-react';
import React from 'react';
import { useI18n } from '@/providers/i18n-provider';

interface OverviewContentProps {
  stats: {
    role: string;
    totalPatients: number;
    totalDoctors: number;
    totalHospitals: number;
    totalAppointments: number;
    activePatients: number;
  };
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}

export default function OverviewContent({
  stats,
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: OverviewContentProps) {
  const { t } = useI18n();

  const getCardLabels = (role: string) => {
    switch (role) {
      case 'hospital':
        return {
          patients: { title: 'My Patients', description: 'Patients at your facility' },
          doctors: { title: 'My Doctors', description: 'Doctors at your hospital' },
          facilities: { title: 'My Facility', description: 'Your healthcare facility' },
          cases: { title: 'Active Cases', description: 'Ongoing treatments at facility' }
        };
      case 'doctor':
        return {
          patients: { title: 'My Patients', description: 'Patients under your care' },
          doctors: { title: 'Your Profile', description: 'Your doctor profile' },
          facilities: { title: 'Hospitals', description: 'Hospitals you work with' },
          cases: { title: 'Your Appointments', description: 'Your scheduled appointments' }
        };
      case 'admin':
        return {
          patients: { title: 'Total Patients', description: 'All registered patients' },
          doctors: { title: 'Active Doctors', description: 'All medical professionals' },
          facilities: { title: 'Healthcare Facilities', description: 'All partner hospitals' },
          cases: { title: 'Active Cases', description: 'All ongoing treatments' }
        };
      default:
        return {
          patients: { title: t('common.patients'), description: t('common.patient_records') },
          doctors: { title: t('common.doctors'), description: t('common.medical_professionals') },
          facilities: { title: t('common.facilities'), description: t('common.healthcare_facilities') },
          cases: { title: t('common.cases'), description: t('common.active_treatments') }
        };
    }
  };

  const labels = getCardLabels(stats.role);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            {t('common.welcome_back')} 👋
          </h2>
        </div>

        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription className='flex items-center gap-2'>
                <IconUsers className='size-4' />
                {labels.patients.title}
              </CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {stats.totalPatients.toLocaleString()}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp />
                  +8.2%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                {stats.role === 'hospital' ? 'Patient registrations' : stats.role === 'doctor' ? 'Patients under care' : t('common.growing_patient_base')} <IconTrendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                {labels.patients.description}
              </div>
            </CardFooter>
          </Card>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription className='flex items-center gap-2'>
                {stats.role === 'doctor' ? <IconCalendar className='size-4' /> : <IconStethoscope className='size-4' />}
                {labels.doctors.title}
              </CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {stats.role === 'doctor' ? stats.totalAppointments.toLocaleString() : stats.totalDoctors.toLocaleString()}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp />
                  +5.4%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                {stats.role === 'doctor' ? 'Your appointments' : t('common.medical_staff')} <IconTrendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                {labels.doctors.description}
              </div>
            </CardFooter>
          </Card>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription className='flex items-center gap-2'>
                <IconBuilding className='size-4' />
                {labels.facilities.title}
              </CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {stats.totalHospitals.toLocaleString()}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp />
                  +2.1%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                {stats.role === 'hospital' ? 'Your facility' : t('common.network')} <IconTrendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                {labels.facilities.description}
              </div>
            </CardFooter>
          </Card>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription className='flex items-center gap-2'>
                <IconHeartbeat className='size-4' />
                {labels.cases.title}
              </CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {stats.activePatients.toLocaleString()}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp />
                  +12.3%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                {stats.role === 'doctor' ? 'Patients under care' : t('common.ongoing_treatments')} <IconTrendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                {labels.cases.description}
              </div>
            </CardFooter>
          </Card>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4'>{bar_stats}</div>
          <div className='col-span-4 md:col-span-3'>
            {/* sales arallel routes */}
            {sales}
          </div>
          <div className='col-span-4'>{area_stats}</div>
          <div className='col-span-4 md:col-span-3'>{pie_stats}</div>
        </div>
      </div>
    </PageContainer>
  );
}

