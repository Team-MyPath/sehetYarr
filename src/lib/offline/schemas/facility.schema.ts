import type { RxJsonSchema } from 'rxdb';

export type FacilityDocType = {
  _id: string;
  hospitalId: string | { _id: string; name: string };
  category: string;
  name: string;
  quantity: number;
  inUse?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'failed';
};

export const facilitySchema: RxJsonSchema<FacilityDocType> = {
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
    category: {
      type: 'string',
      maxLength: 50
    },
    name: {
      type: 'string',
      maxLength: 200
    },
    quantity: {
      type: 'number'
    },
    inUse: {
      type: 'number'
    },
    status: {
      type: 'string',
      maxLength: 50
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
  required: ['_id', 'hospitalId', 'category', 'name', 'quantity', 'status', 'createdAt', 'updatedAt', 'syncStatus'],
  indexes: ['name', 'category', 'status', 'updatedAt']
};

