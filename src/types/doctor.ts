export interface Doctor {
  _id: string;
  name: string;
  gender?: 'male' | 'female' | 'other';
  cnic: string;
  cnicIV: string;
  specialization?: string;
  experience?: string;
  education?: string;
  lisenceNumber: string;
  appointment?: {
    appointerName?: number;
    contactNumber?: string;
  };
  hospitalIds?: string;
  availability?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DoctorListResponse {
  doctors: Doctor[];
  total: number;
  page: number;
  limit: number;
}
