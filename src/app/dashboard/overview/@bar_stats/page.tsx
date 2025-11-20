import { BarGraph } from '@/features/overview/components/bar-graph';
import { auth } from '@clerk/nextjs/server';

async function getBarChartData() {
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
      data: analyticsData.success ? analyticsData.data.barChart : [],
      role: userData?.data?.role || 'guest'
    };
  } catch (error) {
    console.error('Error fetching bar chart data:', error);
    return { data: [], role: 'guest' };
  }
}

export default async function BarStats() {
  const { data, role } = await getBarChartData();
  return <BarGraph data={data} role={role} />;
}
