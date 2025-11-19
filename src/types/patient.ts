export interface Patient {
  _id: string;
  patientName: string;
  patientGender: 'male' | 'female' | 'other';
  patientDob: {
    day: number;
    month: number;
    year: number;
  };
  patientCnic: string;
  patientBloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
  patientMobile?: string;
  patientAddress?: {
    address?: string;
    city?: string;
    state?: string;
  };
  patientDisability?: string;
  emergencyContact?: {
    primaryContact?:{
      name?: string;
      relation?: string;
      cnic?: string;
      contactNumber?: string;
    };
    secondaryContact?:{
      name?: string;
      relation?: string;
      cnic?: string;
      contactNumber?: string;
    }
  };
  medicalHistory?: Array<{
    condition?: string;
    diagnosedAt?: string;
    status?: 'active' | 'recovered' | 'chronic';
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface PatientListResponse {
  patients: Patient[];
  total: number;
  page: number;
  limit: number;
}
