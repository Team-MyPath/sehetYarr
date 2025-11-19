import { Schema, model, models } from 'mongoose';
import { DayOfWeek, Gender } from '../enums';

const AppointmentSchema = new Schema(
  {
    appointerName: String,
    contactNumber: String
  },
  { _id: false }
);

const AvailabilitySchema = new Schema(
  {
    monday: String,
    tuesday: String,
    wednesday: String,
    thursday: String,
    friday: String,
    saturday: String,
    sunday: String
  },
  { _id: false }
);

const DoctorSchema = new Schema(
  {
    name: { type: String, required: true },
    gender: { type: String, enum: Object.values(Gender) },
    specialization: String,
    appointment: AppointmentSchema,
    availability: AvailabilitySchema,
    experience: String,
    education: String,
    cnic: { type: String, required: true },
    cnicIV: { type: String, required: true },
    lisenceNumber: { type: String, required: true },
    hospitalIds: { type: String }
  },
  { timestamps: true }
);

export const DoctorModel = models.Doctor || model('Doctor', DoctorSchema);
