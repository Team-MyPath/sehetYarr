import { Schema, model, models } from 'mongoose';
import { BloodGroup, Gender, MedicalConditionStatus } from '../enums';

const PatientAddressSchema = new Schema(
  {
    address: String,
    city: String,
    state: String
  },
  { _id: false }
);

const PatientDobSchema = new Schema(
  {
    day: String,
    month: String,
    year: String
  },
  { _id: false }
);

const EmergencyContactPersonSchema = new Schema(
  {
    name: String,
    contactNumber: String,
    cnic: String,
    relation: String
  },
  { _id: false }
);

const EmergencyContactSchema = new Schema(
  {
    primaryContact: EmergencyContactPersonSchema,
    secondaryContact: EmergencyContactPersonSchema
  },
  { _id: false }
);

const PatientSchema = new Schema(
  {
    patientName: { type: String, required: true },
    patientGender: { type: String, required: true, enum: Object.values(Gender) },
    patientDob: { type: PatientDobSchema, required: true },
    patientCnic: { type: String, required: true },
    patientMobile: String,
    patientBloodGroup: { type: String, enum: Object.values(BloodGroup) },
    patientAddress: PatientAddressSchema,
    patientDisability: String,
    emergencyContact: EmergencyContactSchema,
    patientHistory: [String]
  },
  { timestamps: true }
);

export const PatientModel = models.Patient || model('Patient', PatientSchema);
