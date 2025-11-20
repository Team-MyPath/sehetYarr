import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db/connect';
import { UserModel, UserRole } from '@/lib/models/user.model';
import { HospitalModel } from '@/lib/models/hospital.model';
import { DoctorModel } from '@/lib/models/doctor.model';
import { PatientModel } from '@/lib/models/patient.model';
import { logger } from '@/lib/utils/logger';

// GET - Get current user info with related records
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

    const response: any = {
      _id: user._id,
      clerkId: user.clerkId,
      email: user.email,
      role: user.role,
      name: user.name
    };

    // Fetch related records based on role
    if (user.role === UserRole.HOSPITAL) {
      const hospital = await HospitalModel.findOne({ userId: user._id });
      if (hospital) {
        response.hospital = {
          _id: hospital._id,
          name: hospital.name,
          type: hospital.type
        };
      }
    } else if (user.role === UserRole.DOCTOR) {
      const doctor = await DoctorModel.findOne({ userId: user._id });
      if (doctor) {
        response.doctor = {
          _id: doctor._id,
          name: doctor.name,
          specialization: doctor.specialization
        };
      }
    } else if (user.role === UserRole.PATIENT) {
      const patient = await PatientModel.findOne({ userId: user._id });
      if (patient) {
        response.patient = {
          _id: patient._id,
          name: patient.name
        };
      }
    }

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    logger.error('Error fetching user info:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user info' },
      { status: 500 }
    );
  }
}
