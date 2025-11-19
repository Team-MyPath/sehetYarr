export interface Facility {
  _id: string;
  hospitalId: {
    _id: string;
    name: string;
  };
  category: 'Equipment' | 'Medication' | 'Facility';
  name: string;
  quantity: number;
  inUse?: number;
  status: 'Operational' | 'Out of Service' | 'Under Maintenance';
  createdAt: string;
  updatedAt: string;
}

export interface FacilityListResponse {
  facilities: Facility[];
  total: number;
  page: number;
  limit: number;
}
