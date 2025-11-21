import type { RxJsonSchema } from 'rxdb';

export type WorkerDocType = {
  _id: string;
  name: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  cnic: string;
  cnicIV: string;
  designation: string;
  department?: string;
  experienceYears?: number;
  qualifications?: string[];
  shift?: {
    type?: string;
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
  hospitalIds?: Array<string | { _id: string; name: string }>;
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
  syncStatus: 'synced' | 'pending' | 'failed';
};

export const workerSchema: RxJsonSchema<WorkerDocType> = {
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
    gender: {
      type: 'string',
      enum: ['male', 'female', 'other']
    },
    dateOfBirth: {
      type: 'string',
      format: 'date-time'
    },
    cnic: {
      type: 'string',
      maxLength: 15
    },
    cnicIV: {
      type: 'string',
      maxLength: 100
    },
    designation: {
      type: 'string',
      maxLength: 50
    },
    department: {
      type: 'string'
    },
    experienceYears: {
      type: 'number'
    },
    qualifications: {
      type: 'array',
      items: { type: 'string' }
    },
    shift: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        startTime: { type: 'string' },
        endTime: { type: 'string' }
      }
    },
    contact: {
      type: 'object',
      properties: {
        primaryNumber: { type: 'string' },
        secondaryNumber: { type: 'string' },
        area: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' }
      }
    },
    hospitalIds: {
      type: 'array',
      items: {
        oneOf: [
          { type: 'string' },
          { type: 'object' }
        ]
      }
    },
    licenseNumber: {
      type: 'string'
    },
    schemes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          organization: { type: 'string' },
          role: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          remarks: { type: 'string' }
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
  required: ['_id', 'name', 'cnic', 'cnicIV', 'designation', 'createdAt', 'updatedAt', 'syncStatus'],
  indexes: ['name', 'cnic', 'designation', 'updatedAt']
};

