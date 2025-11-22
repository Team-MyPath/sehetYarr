import type { RxJsonSchema } from 'rxdb';

export type PharmacyDocType = {
  _id: string;
  name: string;
  contact: string;
  location: {
    address: string;
    city: string;
    state: string;
  };
  inventory: Array<{
    name: string;
    supplier: string;
    quantity: number;
    dosage: string;
  }>;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'failed';
};

export const pharmacySchema: RxJsonSchema<PharmacyDocType> = {
  version: 0,
  primaryKey: '_id',
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      maxLength: 100
    },
    name: {
      type: 'string',
      maxLength: 200
    },
    contact: {
      type: 'string'
    },
    location: {
      type: 'object',
      properties: {
        address: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' }
      },
      required: ['address', 'city', 'state']
    },
    inventory: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          supplier: { type: 'string' },
          quantity: { type: 'number' },
          dosage: { type: 'string' }
        }
      }
    },
    createdAt: {
      type: 'string',
      format: 'date-time'
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      maxLength: 50
    },
    syncStatus: {
      type: 'string',
      enum: ['synced', 'pending', 'failed']
    }
  },
  required: ['_id', 'name', 'contact', 'location', 'createdAt', 'updatedAt', 'syncStatus'],
  indexes: ['name', 'updatedAt']
};

