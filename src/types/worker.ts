export interface Worker {
  _id: string;
  name: string;
  gender?: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  cnic: string;
  cnicIV: string;
  designation: 'Nurse' | 'Paramedic' | 'Technician' | 'Other';
  department?: 'ICU' | 'Emergency' | 'Radiology' | 'General Ward' | 'Laboratory' | 'Other';
  experienceYears?: number;
  qualifications?: string[];
  shift?: {
    type?: 'Morning' | 'Evening' | 'Night' | 'Rotational';
    startTime?: string;
    endTime?: string;
  };
  contact?: {
    primaryNumber?: string;
    secondaryNumber?: string;
    area?: string;
    city?: string;
    state?: string;
  };
  hospitalIds?: Array<{
    _id: string;
    name: string;
  }>;
  licenseNumber?: string;
  schemes?: Array<{
    name?: string;
    organization?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    remarks?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface WorkerListResponse {
  workers: Worker[];
  total: number;
  page: number;
  limit: number;
}
