/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { aircallApiRequest, aircallApiRequestAllItems } from '../../transport/aircallClient';

export const messageOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['message'],
      },
    },
    options: [
      {
        name: 'Get',
        value: 'get',
        description: 'Get a message by ID',
        action: 'Get a message',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many messages',
        action: 'Get many messages',
      },
      {
        name: 'Send',
        value: 'send',
        description: 'Send an SMS message',
        action: 'Send an SMS message',
      },
    ],
    default: 'send',
  },
];

export const messageFields: INodeProperties[] = [
  // Message ID for get
  {
    displayName: 'Message ID',
    name: 'messageId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['message'],
        operation: ['get'],
      },
    },
    description: 'The ID of the message',
  },

  // Send message fields
  {
    displayName: 'Number ID',
    name: 'numberId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['message'],
        operation: ['send'],
      },
    },
    description: 'The ID of the Aircall number to send from',
  },
  {
    displayName: 'To',
    name: 'to',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['message'],
        operation: ['send'],
      },
    },
    description: 'The destination phone number (E.164 format recommended)',
  },
  {
    displayName: 'Content',
    name: 'content',
    type: 'string',
    required: true,
    typeOptions: {
      rows: 4,
    },
    default: '',
    displayOptions: {
      show: {
        resource: ['message'],
        operation: ['send'],
      },
    },
    description: 'The message text to send',
  },

  // GetAll options
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['message'],
        operation: ['getAll'],
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
        resource: ['message'],
        operation: ['getAll'],
        returnAll: [false],
      },
    },
    description: 'Max number of results to return',
  },

  // Filter options for getAll
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['message'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Direction',
        name: 'direction',
        type: 'options',
        options: [
          { name: 'Inbound', value: 'inbound' },
          { name: 'Outbound', value: 'outbound' },
        ],
        default: 'inbound',
        description: 'Filter by message direction',
      },
      {
        displayName: 'Number ID',
        name: 'number_id',
        type: 'string',
        default: '',
        description: 'Filter by Aircall number ID',
      },
    ],
  },
];

export async function executeMessageOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'send': {
      const numberId = this.getNodeParameter('numberId', i) as string;
      const to = this.getNodeParameter('to', i) as string;
      const content = this.getNodeParameter('content', i) as string;

      const body: IDataObject = {
        to,
        content,
      };

      const response = await aircallApiRequest.call(
        this,
        'POST',
        `/numbers/${numberId}/messages`,
        body,
      );
      responseData = response.message as IDataObject;
      break;
    }

    case 'get': {
      const messageId = this.getNodeParameter('messageId', i) as string;
      const response = await aircallApiRequest.call(this, 'GET', `/messages/${messageId}`);
      responseData = response.message as IDataObject;
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
      const qs: IDataObject = {};

      if (filters.direction) qs.direction = filters.direction;
      if (filters.number_id) qs.number_id = filters.number_id;

      if (returnAll) {
        responseData = await aircallApiRequestAllItems.call(
          this,
          'GET',
          '/messages',
          'messages',
          {},
          qs,
        );
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        qs.per_page = Math.min(limit, 50);
        const response = await aircallApiRequest.call(this, 'GET', '/messages', {}, qs);
        responseData = (response.messages as IDataObject[]).slice(0, limit);
      }
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return responseData;
}
