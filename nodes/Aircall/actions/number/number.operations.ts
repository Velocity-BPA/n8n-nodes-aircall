/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { aircallApiRequest, aircallApiRequestAllItems } from '../../transport/aircallClient';

export const numberOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['number'],
      },
    },
    options: [
      {
        name: 'Get',
        value: 'get',
        description: 'Get a phone number by ID',
        action: 'Get a number',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many phone numbers',
        action: 'Get many numbers',
      },
      {
        name: 'Get Messages',
        value: 'getMessages',
        description: 'Get SMS messages for a number',
        action: 'Get messages for a number',
      },
      {
        name: 'Get Music',
        value: 'getMusic',
        description: 'Get hold music settings for a number',
        action: 'Get music for a number',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a phone number',
        action: 'Update a number',
      },
    ],
    default: 'get',
  },
];

export const numberFields: INodeProperties[] = [
  // Number ID
  {
    displayName: 'Number ID',
    name: 'numberId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['number'],
        operation: ['get', 'update', 'getMessages', 'getMusic'],
      },
    },
    description: 'The ID of the phone number',
  },

  // GetAll options
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['number'],
        operation: ['getAll', 'getMessages'],
      },
    },
    description: 'Whether to return all results or only up to a given limit',
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    typeOptions: {
      minValue: 1,
      maxValue: 100,
    },
    displayOptions: {
      show: {
        resource: ['number'],
        operation: ['getAll', 'getMessages'],
        returnAll: [false],
      },
    },
    description: 'Max number of results to return',
  },

  // Update fields
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['number'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Display name for the number',
      },
      {
        displayName: 'Open',
        name: 'open',
        type: 'boolean',
        default: true,
        description: 'Whether the number is open for business',
      },
      {
        displayName: 'Live Recording Activated',
        name: 'live_recording_activated',
        type: 'boolean',
        default: false,
        description: 'Whether live recording is enabled',
      },
      {
        displayName: 'Welcome Message',
        name: 'welcome_message',
        type: 'string',
        default: '',
        description: 'Welcome message audio URL',
      },
      {
        displayName: 'Waiting Message',
        name: 'waiting_message',
        type: 'string',
        default: '',
        description: 'Waiting/hold message audio URL',
      },
      {
        displayName: 'Voicemail Message',
        name: 'voicemail_message',
        type: 'string',
        default: '',
        description: 'Voicemail greeting audio URL',
      },
      {
        displayName: 'Closed Message',
        name: 'closed_message',
        type: 'string',
        default: '',
        description: 'Closed hours message audio URL',
      },
    ],
  },
];

export async function executeNumberOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'get': {
      const numberId = this.getNodeParameter('numberId', i) as string;
      const response = await aircallApiRequest.call(this, 'GET', `/numbers/${numberId}`);
      responseData = response.number as IDataObject;
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;

      if (returnAll) {
        responseData = await aircallApiRequestAllItems.call(this, 'GET', '/numbers', 'numbers');
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        const qs: IDataObject = { per_page: Math.min(limit, 50) };
        const response = await aircallApiRequest.call(this, 'GET', '/numbers', {}, qs);
        responseData = (response.numbers as IDataObject[]).slice(0, limit);
      }
      break;
    }

    case 'update': {
      const numberId = this.getNodeParameter('numberId', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

      const response = await aircallApiRequest.call(this, 'PUT', `/numbers/${numberId}`, updateFields);
      responseData = response.number as IDataObject;
      break;
    }

    case 'getMessages': {
      const numberId = this.getNodeParameter('numberId', i) as string;
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;

      if (returnAll) {
        responseData = await aircallApiRequestAllItems.call(
          this,
          'GET',
          `/numbers/${numberId}/messages`,
          'messages',
        );
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        const qs: IDataObject = { per_page: Math.min(limit, 50) };
        const response = await aircallApiRequest.call(
          this,
          'GET',
          `/numbers/${numberId}/messages`,
          {},
          qs,
        );
        responseData = (response.messages as IDataObject[]).slice(0, limit);
      }
      break;
    }

    case 'getMusic': {
      const numberId = this.getNodeParameter('numberId', i) as string;
      const response = await aircallApiRequest.call(this, 'GET', `/numbers/${numberId}/music`);
      responseData = response as IDataObject;
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return responseData;
}
