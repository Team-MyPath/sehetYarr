import { auth } from '@clerk/nextjs/server';
import { RecentSalesContent } from './recent-sales-content';

// Fetch recent patient registrations (role-based)
async function getRecentPatients() {
  try {
    const { userId } = await auth();
    
    const [patientsResponse, userResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/patients?limit=5`, {
        cache: 'no-store'
      }),
      userId ? fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/user/me`, {
        cache: 'no-store'
      }) : Promise.resolve(null)
    ]);
    
    const [patientsData, userData] = await Promise.all([
      patientsResponse.json(),
      userResponse ? userResponse.json() : Promise.resolve(null)
    ]);
    
    const role = userData?.data?.role || 'guest';
    
    return {
      patients: patientsData.success ? patientsData.data : [],
      role
    };
  } catch (error) {
    console.error('Error fetching recent patients:', error);
    return { patients: [], role: 'guest' };
  }
}

export async function RecentSales() {
  const { patients, role } = await getRecentPatients();

  return (
    <RecentSalesContent patients={patients} role={role} />
  );
}
