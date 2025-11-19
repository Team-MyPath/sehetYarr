import path from "path";

export interface Hospital {
  _id: string;
  hospitalName: string;
  hospitalAddress?: string;
  hospitalLocation?: {
    address?: string;
    city?: string;
    state?: string;
  };
  doctorId?: string;
  type: 'public' | 'private' | 'semi-government' | 'ngo';
  hospitalServices?: Array<string>;
  numberOfBeds?: string;
  departments?: {
    'medicine&applied'?: {
      generalOPD?: string;
      immunization?: string;
      TBControl?: string;
    };
    'surgery&allied'?: {
      minorProcedures?: string;
    };
    'accident&emergency'?: {
      basicEmergency?: string;
      LHV_Services?: string;
      deliveryRoom?: string;
    };
    'pathalogy&laboratory'?: {
      basicLabTests?: string;
      malariaSmear?: string;
    };
  };
  ntnNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface HospitalListResponse {
  hospitals: Hospital[];
  total: number;
  page: number;
  limit: number;
}
