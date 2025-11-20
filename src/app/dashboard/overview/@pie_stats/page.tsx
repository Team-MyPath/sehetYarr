import { PieGraph } from '@/features/overview/components/pie-graph';
import { auth } from '@clerk/nextjs/server';

async function getPieChartData() {
  try {
    const { userId } = await auth();
    
    const [analyticsResponse, userResponse] = await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/analytics`,
        { cache: 'no-store' }
      ),
      userId ? fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/user/me`,
        { cache: 'no-store' }
      ) : Promise.resolve(null)
    ]);
    
    const [analyticsData, userData] = await Promise.all([
      analyticsResponse.json(),
      userResponse ? userResponse.json() : Promise.resolve(null)
    ]);
    
    return {
      data: analyticsData.success ? analyticsData.data.pieChart : [],
      role: userData?.data?.role || 'guest'
    };
  } catch (error) {
    console.error('Error fetching pie chart data:', error);
    return { data: [], role: 'guest' };
  }
}

export default async function Stats() {
  const { data, role } = await getPieChartData();
  return <PieGraph data={data} role={role} />;
}
