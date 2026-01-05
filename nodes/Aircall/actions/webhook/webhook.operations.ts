/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { aircallApiRequest, aircallApiRequestAllItems } from '../../transport/aircallClient';
import { AIRCALL_WEBHOOK_EVENTS } from '../../utils/types';

export const webhookOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['webhook'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new webhook',
        action: 'Create a webhook',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a webhook',
        action: 'Delete a webhook',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a webhook by ID',
        action: 'Get a webhook',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many webhooks',
        action: 'Get many webhooks',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a webhook',
        action: 'Update a webhook',
      },
    ],
    default: 'get',
  },
];

const webhookEventOptions = AIRCALL_WEBHOOK_EVENTS.map((event) => ({
  name: event.replace(/\./g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  value: event,
}));

export const webhookFields: INodeProperties[] = [
  // Webhook ID
  {
    displayName: 'Webhook ID',
    name: 'webhookId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['webhook'],
        operation: ['get', 'update', 'delete'],
      },
    },
    description: 'The ID of the webhook',
  },

  // Create webhook fields
  {
    displayName: 'URL',
    name: 'url',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'https://example.com/webhook',
    displayOptions: {
      show: {
        resource: ['webhook'],
        operation: ['create'],
      },
    },
    description: 'The URL to send webhook events to',
  },
  {
    displayName: 'Events',
    name: 'events',
    type: 'multiOptions',
    required: true,
    options: webhookEventOptions,
    default: [],
    displayOptions: {
      show: {
        resource: ['webhook'],
        operation: ['create'],
      },
    },
    description: 'Events to subscribe to',
  },

  // Additional fields for create
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['webhook'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Custom Headers',
        name: 'custom_headers',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        default: {},
        options: [
          {
            name: 'headerValues',
            displayName: 'Header',
            values: [
              {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
                description: 'Header name',
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
                description: 'Header value',
              },
            ],
          },
        ],
        description: 'Custom headers to include in webhook requests',
      },
      {
        displayName: 'Token',
        name: 'token',
        type: 'string',
        default: '',
        description: 'Verification token for webhook security',
      },
    ],
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
        resource: ['webhook'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Active',
        name: 'active',
        type: 'boolean',
        default: true,
        description: 'Whether the webhook is active',
      },
      {
        displayName: 'Events',
        name: 'events',
        type: 'multiOptions',
        options: webhookEventOptions,
        default: [],
        description: 'Events to subscribe to',
      },
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        default: '',
        description: 'The URL to send webhook events to',
      },
    ],
  },

  // GetAll options
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['webhook'],
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
        resource: ['webhook'],
        operation: ['getAll'],
        returnAll: [false],
      },
    },
    description: 'Max number of results to return',
  },
];

export async function executeWebhookOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'create': {
      const url = this.getNodeParameter('url', i) as string;
      const events = this.getNodeParameter('events', i) as string[];
      const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

      const body: IDataObject = {
        url,
        events,
      };

      // Process custom headers
      if (additionalFields.custom_headers) {
        const headersData = additionalFields.custom_headers as IDataObject;
        if (headersData.headerValues) {
          const headers: Record<string, string> = {};
          const headerValues = headersData.headerValues as IDataObject[];
          for (const header of headerValues) {
            headers[header.name as string] = header.value as string;
          }
          body.custom_headers = headers;
        }
      }

      if (additionalFields.token) {
        body.token = additionalFields.token;
      }

      const response = await aircallApiRequest.call(this, 'POST', '/webhooks', body);
      responseData = response.webhook as IDataObject;
      break;
    }

    case 'get': {
      const webhookId = this.getNodeParameter('webhookId', i) as string;
      const response = await aircallApiRequest.call(this, 'GET', `/webhooks/${webhookId}`);
      responseData = response.webhook as IDataObject;
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;

      if (returnAll) {
        responseData = await aircallApiRequestAllItems.call(this, 'GET', '/webhooks', 'webhooks');
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        const qs: IDataObject = { per_page: Math.min(limit, 50) };
        const response = await aircallApiRequest.call(this, 'GET', '/webhooks', {}, qs);
        responseData = (response.webhooks as IDataObject[]).slice(0, limit);
      }
      break;
    }

    case 'update': {
      const webhookId = this.getNodeParameter('webhookId', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

      const response = await aircallApiRequest.call(
        this,
        'PUT',
        `/webhooks/${webhookId}`,
        updateFields,
      );
      responseData = response.webhook as IDataObject;
      break;
    }

    case 'delete': {
      const webhookId = this.getNodeParameter('webhookId', i) as string;
      await aircallApiRequest.call(this, 'DELETE', `/webhooks/${webhookId}`);
      responseData = { success: true, webhookId };
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return responseData;
}
