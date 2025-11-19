import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { PatientModel } from '@/lib/models/patient.model';
import { Gender, BloodGroup } from '@/lib/enums';
import { logger } from '@/lib/utils/logger';

// GET - Get all patients or search
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const gender = searchParams.get('gender');
    const bloodGroup = searchParams.get('bloodGroup');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const query: any = {};

    if (search) {
      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { patientCnic: { $regex: search, $options: 'i' } }
      ];
    }

    if (gender && Object.values(Gender).includes(gender as Gender)) {
      query.patientGender = gender;
    }

    if (bloodGroup && Object.values(BloodGroup).includes(bloodGroup as BloodGroup)) {
      query.patientBloodGroup = bloodGroup;
    }

    const patients = await PatientModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await PatientModel.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: patients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching patients:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

// POST - Create a new patient
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    // Validate required fields
    const { patientName, patientGender, patientDob, patientCnic } = body;

    if (!patientName || !patientGender || !patientDob || !patientCnic) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: patientName, patientGender, patientDob, patientCnic'
        },
        { status: 400 }
      );
    }

    // Validate gender enum
    if (!Object.values(Gender).includes(patientGender)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid gender. Must be one of: ${Object.values(Gender).join(', ')}`
        },
        { status: 400 }
      );
    }

    // Validate blood group if provided
    if (body.patientBloodGroup && !Object.values(BloodGroup).includes(body.patientBloodGroup)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid blood group. Must be one of: ${Object.values(BloodGroup).join(', ')}`
        },
        { status: 400 }
      );
    }

    // Validate date of birth object
    if (!patientDob.day || !patientDob.month || !patientDob.year) {
      return NextResponse.json(
        { success: false, error: 'Invalid date of birth format. Must include day, month, and year.' },
        { status: 400 }
      );
    }

    const patient = await PatientModel.create(body);

    logger.info('Patient created:', patient._id);

    return NextResponse.json(
      { success: true, data: patient },
      { status: 201 }
    );
  } catch (error: any) {
    logger.error('Error creating patient:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create patient' },
      { status: 500 }
    );
  }
}
