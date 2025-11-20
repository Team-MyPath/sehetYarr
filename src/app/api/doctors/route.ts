import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { DoctorModel } from '@/lib/models/doctor.model';
import { Gender } from '@/lib/enums';
import { logger } from '@/lib/utils/logger';
import { auth } from '@clerk/nextjs/server';
import { UserModel, UserRole } from '@/lib/models/user.model';
import { HospitalModel } from '@/lib/models/hospital.model';
import { isValidObjectId } from 'mongoose';

// GET - Get all doctors or search
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { userId } = await auth();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const specialization = searchParams.get('specialization');
    const hospitalId = searchParams.get('hospitalId');
    const lookup = searchParams.get('lookup'); // For CNIC lookup without role filtering
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const query: any = {};

    // Role-based access control (skip if lookup mode for forms)
    if (userId && !lookup) {
      const user = await UserModel.findOne({ clerkId: userId });
      
      if (user) {
        if (user.role === UserRole.HOSPITAL) {
          const hospital = await HospitalModel.findOne({ userId: user._id });
          if (hospital) {
            // Filter doctors linked to this hospital
            query.hospitalIds = hospital._id;
          } else {
            // If hospital profile is missing, show no doctors
            query._id = { $in: [] };
          }
        } else if (user.role === UserRole.DOCTOR) {
          // Doctors can only see their own profile
          const doctor = await DoctorModel.findOne({ userId: user._id });
          if (doctor) {
            query._id = doctor._id;
          } else {
            // If doctor profile is missing, show no doctors
            query._id = { $in: [] };
          }
        }
        // Admin role sees all doctors, patient role sees all doctors (for selection)
      }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { cnic: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    if (hospitalId && isValidObjectId(hospitalId)) {
      query.hospitalIds = hospitalId;
    }

    const doctors = await DoctorModel.find(query)
      .populate('hospitalIds', 'name type location')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await DoctorModel.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: doctors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching doctors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}

// POST - Create a new doctor or link existing
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { userId } = await auth();

    const body = await req.json();

    // Validate required fields
    const { name, cnic, cnicIV, licenseNumber } = body;

    if (!name || !cnic || !cnicIV || !licenseNumber) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, cnic, cnicIV, licenseNumber'
        },
        { status: 400 }
      );
    }

    // Validate gender if provided
    if (body.gender && !Object.values(Gender).includes(body.gender)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid gender. Must be one of: ${Object.values(Gender).join(', ')}`
        },
        { status: 400 }
      );
    }

    // Check for existing doctor with same CNIC
    const existingDoctor = await DoctorModel.findOne({ cnic: cnic });

    // Determine if the creator is a hospital
    let hospitalId = null;
    let userRole = null;

    if (userId) {
      const user = await UserModel.findOne({ clerkId: userId });
      if (user) {
        userRole = user.role;
        logger.info(`User role: ${user.role}, User ID: ${user._id}`);
        
        if (user.role === UserRole.HOSPITAL) {
          const hospital = await HospitalModel.findOne({ userId: user._id });
          logger.info(`Hospital lookup result:`, hospital ? `Found ID: ${hospital._id}` : 'Not found');
          
          if (hospital) {
            hospitalId = hospital._id;
          } else {
            logger.error(`Hospital profile not found for user ${user._id}`);
          }
        }
      }
    }

    if (existingDoctor) {
      // If hospital, link the doctor and update empty fields
      if (hospitalId) {
        // Check if already linked
        const isLinked = existingDoctor.hospitalIds.some(
          (id: any) => id.toString() === hospitalId.toString()
        );

        // Update empty/missing fields only
        const updates: any = {};
        if (body.specialization && !existingDoctor.specialization) updates.specialization = body.specialization;
        if (body.experienceYears && !existingDoctor.experienceYears) updates.experienceYears = body.experienceYears;
        if (body.qualifications?.length && !existingDoctor.qualifications?.length) updates.qualifications = body.qualifications;
        if (body.subSpecialization?.length && !existingDoctor.subSpecialization?.length) updates.subSpecialization = body.subSpecialization;
        if (body.gender && !existingDoctor.gender) updates.gender = body.gender;
        if (body.dateOfBirth && !existingDoctor.dateOfBirth) updates.dateOfBirth = body.dateOfBirth;
        
        // Update contact fields if they're empty
        if (body.contact) {
          const contactUpdates: any = {};
          if (body.contact.primaryNumber && !existingDoctor.contact?.primaryNumber) contactUpdates.primaryNumber = body.contact.primaryNumber;
          if (body.contact.secondaryNumber && !existingDoctor.contact?.secondaryNumber) contactUpdates.secondaryNumber = body.contact.secondaryNumber;
          if (body.contact.area && !existingDoctor.contact?.area) contactUpdates.area = body.contact.area;
          if (body.contact.city && !existingDoctor.contact?.city) contactUpdates.city = body.contact.city;
          if (body.contact.state && !existingDoctor.contact?.state) contactUpdates.state = body.contact.state;
          
          if (Object.keys(contactUpdates).length > 0) {
            updates.contact = { ...existingDoctor.contact?.toObject(), ...contactUpdates };
          }
        }

        // Link hospital if not already linked
        if (!isLinked) {
          updates.$addToSet = { hospitalIds: hospitalId };
        }

        // Apply updates if any
        if (Object.keys(updates).length > 0) {
          await DoctorModel.findByIdAndUpdate(existingDoctor._id, updates);
        }

        // Fetch updated doctor
        const updatedDoctor = await DoctorModel.findById(existingDoctor._id).populate('hospitalIds', 'name type location');

        return NextResponse.json(
          { 
            success: true, 
            message: isLinked 
              ? 'Doctor is already linked to your hospital. Empty fields have been updated.' 
              : 'Doctor already exists and has been linked to your hospital. Empty fields have been updated.',
            data: updatedDoctor 
          },
          { status: 200 }
        );
      }

      // If not a hospital or hospital profile missing
      const errorDetails = userRole === UserRole.HOSPITAL 
        ? 'Hospital profile not found. Please complete your hospital registration.'
        : 'Doctor already exists in the system.';
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorDetails,
          userRole: userRole,
          data: existingDoctor 
        },
        { status: 409 }
      );
    }

    // Create new doctor and link to hospital if applicable
    const doctorData = {
      ...body,
      hospitalIds: hospitalId ? [hospitalId] : body.hospitalIds || []
    };

    const doctor = await DoctorModel.create(doctorData);

    logger.info('Doctor created:', doctor._id);

    return NextResponse.json(
      { success: true, data: doctor },
      { status: 201 }
    );
  } catch (error: any) {
    logger.error('Error creating doctor:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create doctor' },
      { status: 500 }
    );
  }
}
