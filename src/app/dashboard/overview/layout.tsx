import React from 'react';
import { auth } from '@clerk/nextjs/server';
import OverviewContent from '@/features/overview/components/overview-content';

// Fetch healthcare statistics (role-based)
async function getHealthcareStats() {
  try {
    const { userId } = await auth();
    
    const [patientsRes, doctorsRes, hospitalsRes, userRes, appointmentsRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/patients`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/doctors`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/hospitals`, { cache: 'no-store' }),
      userId ? fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/user/me`, { cache: 'no-store' }) : Promise.resolve(null),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/appointments`, { cache: 'no-store' })
    ]);

    const [patientsData, doctorsData, hospitalsData, userData, appointmentsData] = await Promise.all([
      patientsRes.json(),
      doctorsRes.json(),
      hospitalsRes.json(),
      userRes ? userRes.json() : Promise.resolve(null),
      appointmentsRes.json()
    ]);

    const role = userData?.data?.role || 'guest';

    return {
      role,
      totalPatients: patientsData.pagination?.total || patientsData.data?.length || 0,
      totalDoctors: doctorsData.pagination?.total || doctorsData.data?.length || 0,
      totalHospitals: hospitalsData.pagination?.total || hospitalsData.data?.length || 0,
      totalAppointments: appointmentsData.pagination?.total || appointmentsData.data?.length || 0,
      activePatients: Math.floor((patientsData.pagination?.total || 0) * 0.85), // Assuming 85% are active
    };
  } catch (error) {
    console.error('Error fetching healthcare stats:', error);
    return {
      role: 'guest',
      totalPatients: 0,
      totalDoctors: 0,
      totalHospitals: 0,
      totalAppointments: 0,
      activePatients: 0
    };
  }
}

export default async function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  const stats = await getHealthcareStats();
  
  return (
    <OverviewContent 
      stats={stats}
      sales={sales}
      pie_stats={pie_stats}
      bar_stats={bar_stats}
      area_stats={area_stats}
    />
  );
}
