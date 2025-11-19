export interface Bill {
  _id: string;
  patientId: {
    _id: string;
    name: string;
  };
  hospitalId: {
    _id: string;
    name: string;
  };
  doctorId?: {
    _id: string;
    name: string;
  };
  medicalRecordId?: {
    _id: string;
  };
  billDate: string;
  totalAmount: number;
  paidAmount: number;
  status: 'Pending' | 'Paid' | 'Partial' | 'Cancelled';
  paymentMethod: 'Cash' | 'Card' | 'Bank Transfer' | 'Insurance';
  items?: Array<{
    description?: string;
    quantity?: number;
    unitPrice?: number;
    amount?: number;
  }>;
  discount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BillListResponse {
  bills: Bill[];
  total: number;
  page: number;
  limit: number;
}
