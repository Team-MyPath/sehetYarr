export interface Capacity {
  _id: string;
  hospitalId: {
    _id: string;
    name: string;
  };
  wardType: 'VIP' | 'Normal' | 'Emergency' | 'ICU' | 'Maternity' | 'Pediatrics' | 'Other';
  totalBeds: number;
  occupiedBeds: number;
  availableBeds?: number;
  equipmentIds?: Array<{
    _id: string;
    name: string;
  }>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CapacityListResponse {
  capacities: Capacity[];
  total: number;
  page: number;
  limit: number;
}
