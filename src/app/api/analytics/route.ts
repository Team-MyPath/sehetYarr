import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { PatientModel } from '@/lib/models/patient.model';
import { DoctorModel } from '@/lib/models/doctor.model';
import { AppointmentModel } from '@/lib/models/appointment.model';
import { HospitalModel } from '@/lib/models/hospital.model';
import { PatientHospitalModel } from '@/lib/models/patient-hospital.model';
import { UserModel, UserRole } from '@/lib/models/user.model';
import { logger } from '@/lib/utils/logger';
import { auth } from '@clerk/nextjs/server';

// GET - Analytics data for dashboard (role-based)
export async function GET() {
  try {
    await connectDB();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await UserModel.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Build role-based filters
    let patientFilter: any = {};
    let doctorFilter: any = {};
    let appointmentFilter: any = {};

    if (user.role === UserRole.HOSPITAL) {
      const hospital = await HospitalModel.findOne({ userId: user._id });
      if (hospital) {
        // Hospital sees only their linked patients
        const linkedPatientIds = await PatientHospitalModel.find({ 
          hospitalId: hospital._id 
        }).distinct('patientId');
        patientFilter._id = { $in: linkedPatientIds };

        // Hospital sees only their linked doctors
        doctorFilter.hospitalIds = hospital._id;

        // Hospital sees only appointments at their facility
        appointmentFilter.hospitalId = hospital._id;
      } else {
        // No hospital profile, return empty data
        patientFilter._id = { $in: [] };
        doctorFilter._id = { $in: [] };
        appointmentFilter._id = { $in: [] };
      }
    } else if (user.role === UserRole.DOCTOR) {
      const doctor = await DoctorModel.findOne({ userId: user._id });
      if (doctor) {
        // Doctor sees only their own appointments
        appointmentFilter.doctorId = doctor._id;

        // Doctor sees only patients they've had appointments with
        const patientIds = await AppointmentModel.find({ 
          doctorId: doctor._id 
        }).distinct('patientId');
        patientFilter._id = { $in: patientIds };

        // Doctors don't see other doctors' data
        doctorFilter._id = doctor._id;
      } else {
        patientFilter._id = { $in: [] };
        doctorFilter._id = { $in: [] };
        appointmentFilter._id = { $in: [] };
      }
    }
    // ADMIN and other roles see all data (no filters)

    // Get registration data for the last 90 days (bar chart)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const [patientsByDay, doctorsByDay] = await Promise.all([
      PatientModel.aggregate([
        {
          $match: {
            ...patientFilter,
            createdAt: { $gte: ninetyDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      DoctorModel.aggregate([
        {
          $match: {
            ...doctorFilter,
            createdAt: { $gte: ninetyDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    // Get appointment data for the last 6 months (area chart)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const appointmentsByMonth = await AppointmentModel.aggregate([
      {
        $match: {
          ...appointmentFilter,
          appointmentDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$appointmentDate' },
            year: { $year: '$appointmentDate' },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get patient demographics data (pie chart)
    const patientDemographics = await PatientModel.aggregate([
      {
        $match: patientFilter
      },
      {
        $facet: {
          byGender: [
            {
              $group: {
                _id: '$gender',
                count: { $sum: 1 }
              }
            }
          ],
          byAge: [
            {
              $addFields: {
                age: {
                  $divide: [
                    { $subtract: [new Date(), '$dateOfBirth'] },
                    31536000000 // milliseconds in a year
                  ]
                }
              }
            },
            {
              $group: {
                _id: {
                  $switch: {
                    branches: [
                      { case: { $lt: ['$age', 18] }, then: 'pediatric' },
                      { case: { $gte: ['$age', 65] }, then: 'elderly' },
                      { case: { $and: [{ $gte: ['$age', 18] }, { $lt: ['$age', 65] }] }, then: 'adult' }
                    ],
                    default: 'unknown'
                  }
                },
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    // Format bar chart data
    const barChartData = [];
    const patientMap = new Map(patientsByDay.map(item => [item._id, item.count]));
    const doctorMap = new Map(doctorsByDay.map(item => [item._id, item.count]));
    
    for (let i = 0; i < 90; i++) {
      const date = new Date(ninetyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      barChartData.push({
        date: dateStr,
        patients: patientMap.get(dateStr) || 0,
        doctors: doctorMap.get(dateStr) || 0
      });
    }

    // Format area chart data
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const areaChartData = [];
    const appointmentMap = new Map();
    
    appointmentsByMonth.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      if (!appointmentMap.has(key)) {
        appointmentMap.set(key, { scheduled: 0, completed: 0 });
      }
      const data = appointmentMap.get(key);
      if (item._id.status === 'Completed') {
        data.completed += item.count;
      }
      data.scheduled += item.count;
    });
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(sixMonthsAgo);
      date.setMonth(date.getMonth() + i);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const data = appointmentMap.get(key) || { scheduled: 0, completed: 0 };
      
      areaChartData.push({
        month: monthNames[date.getMonth()],
        scheduled: data.scheduled,
        completed: data.completed
      });
    }

    // Format pie chart data
    const pieChartData: Array<{ demographic: string; patients: number }> = [];
    const demographics = patientDemographics[0];
    
    // Add gender data
    if (demographics.byGender) {
      demographics.byGender.forEach((item: any) => {
        if (item._id === 'Male' || item._id === 'male') {
          pieChartData.push({ demographic: 'male', patients: item.count });
        } else if (item._id === 'Female' || item._id === 'female') {
          pieChartData.push({ demographic: 'female', patients: item.count });
        }
      });
    }
    
    // Add age group data
    if (demographics.byAge) {
      demographics.byAge.forEach((item: any) => {
        pieChartData.push({ demographic: item._id, patients: item.count });
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        barChart: barChartData,
        areaChart: areaChartData,
        pieChart: pieChartData
      }
    });
  } catch (error) {
    logger.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
