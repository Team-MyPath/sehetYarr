import type { RxJsonSchema } from 'rxdb';

export type CapacityDocType = {
  _id: string;
  hospitalId: string | { _id: string; name: string };
  wardType: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds?: number;
  equipmentIds?: Array<string | { _id: string; name: string }>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'failed';
};

export const capacitySchema: RxJsonSchema<CapacityDocType> = {
  version: 0,
  primaryKey: '_id',
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      maxLength: 100
    },
    hospitalId: {
      oneOf: [
        { type: 'string', maxLength: 100 },
        { type: 'object' }
      ]
    },
    wardType: {
      type: 'string',
      maxLength: 50
    },
    totalBeds: {
      type: 'number'
    },
    occupiedBeds: {
      type: 'number'
    },
    availableBeds: {
      type: 'number'
    },
    equipmentIds: {
      type: 'array',
      items: {
        oneOf: [
          { type: 'string' },
          { type: 'object' }
        ]
      }
    },
    notes: {
      type: 'string'
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
  required: ['_id', 'hospitalId', 'wardType', 'totalBeds', 'occupiedBeds', 'createdAt', 'updatedAt', 'syncStatus'],
  indexes: ['wardType', 'updatedAt']
};

