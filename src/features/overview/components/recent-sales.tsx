import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { auth } from '@clerk/nextjs/server';

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

export async function RecentSales() {
  const { patients, role } = await getRecentPatients();

  const getTitle = () => {
    switch (role) {
      case 'hospital':
        return 'Recent Patient Registrations';
      case 'doctor':
        return 'Your Recent Patients';
      case 'admin':
        return 'Recent Patient Registrations';
      default:
        return 'Recent Activity';
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
          return `${patients.length} new patients registered recently.`;
      }
    }
    return role === 'doctor' 
      ? 'No recent patient visits.'
      : 'No recent patient registrations.';
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
              <p className='text-muted-foreground text-sm'>No patient registrations to display</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
