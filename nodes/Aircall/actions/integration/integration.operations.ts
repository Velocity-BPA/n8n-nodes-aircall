/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { aircallApiRequest, aircallApiRequestAllItems } from '../../transport/aircallClient';

export const integrationOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['integration'],
      },
    },
    options: [
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many integrations',
        action: 'Get many integrations',
      },
      {
        name: 'Link Call',
        value: 'link',
        description: 'Link a call to an external integration record',
        action: 'Link call to integration',
      },
      {
        name: 'Unlink Call',
        value: 'unlink',
        description: 'Unlink a call from an external integration record',
        action: 'Unlink call from integration',
      },
    ],
    default: 'getAll',
  },
];

export const integrationFields: INodeProperties[] = [
  // GetAll options
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['integration'],
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
        resource: ['integration'],
        operation: ['getAll'],
        returnAll: [false],
      },
    },
    description: 'Max number of results to return',
  },

  // Link/Unlink fields
  {
    displayName: 'Call ID',
    name: 'callId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['integration'],
        operation: ['link', 'unlink'],
      },
    },
    description: 'The ID of the call',
  },
  {
    displayName: 'Integration ID',
    name: 'integrationId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['integration'],
        operation: ['link', 'unlink'],
      },
    },
    description: 'The ID of the integration',
  },

  // Link-specific fields
  {
    displayName: 'Link Type',
    name: 'linkType',
    type: 'options',
    required: true,
    options: [
      { name: 'Contact', value: 'Contact' },
      { name: 'Lead', value: 'Lead' },
      { name: 'Account', value: 'Account' },
      { name: 'Opportunity', value: 'Opportunity' },
      { name: 'Ticket', value: 'Ticket' },
      { name: 'Case', value: 'Case' },
      { name: 'Deal', value: 'Deal' },
      { name: 'Custom', value: 'Custom' },
    ],
    default: 'Contact',
    displayOptions: {
      show: {
        resource: ['integration'],
        operation: ['link'],
      },
    },
    description: 'The type of external record to link to',
  },
  {
    displayName: 'Link Value',
    name: 'linkValue',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['integration'],
        operation: ['link'],
      },
    },
    description: 'The external ID/value of the record in the integration',
  },
  {
    displayName: 'Link URL',
    name: 'linkUrl',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['integration'],
        operation: ['link'],
      },
    },
    description: 'Optional URL to the external record',
  },
];

export async function executeIntegrationOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;

      if (returnAll) {
        responseData = await aircallApiRequestAllItems.call(
          this,
          'GET',
          '/integrations',
          'integrations',
        );
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        const qs: IDataObject = { per_page: Math.min(limit, 50) };
        const response = await aircallApiRequest.call(this, 'GET', '/integrations', {}, qs);
        responseData = (response.integrations as IDataObject[]).slice(0, limit);
      }
      break;
    }

    case 'link': {
      const callId = this.getNodeParameter('callId', i) as string;
      const integrationId = this.getNodeParameter('integrationId', i) as string;
      const linkType = this.getNodeParameter('linkType', i) as string;
      const linkValue = this.getNodeParameter('linkValue', i) as string;
      const linkUrl = this.getNodeParameter('linkUrl', i, '') as string;

      const body: IDataObject = {
        link_type: linkType,
        link_value: linkValue,
      };

      if (linkUrl) {
        body.link = linkUrl;
      }

      const response = await aircallApiRequest.call(
        this,
        'POST',
        `/calls/${callId}/integrations/${integrationId}`,
        body,
      );
      responseData = response as IDataObject;
      break;
    }

    case 'unlink': {
      const callId = this.getNodeParameter('callId', i) as string;
      const integrationId = this.getNodeParameter('integrationId', i) as string;

      await aircallApiRequest.call(
        this,
        'DELETE',
        `/calls/${callId}/integrations/${integrationId}`,
      );
      responseData = { success: true, callId, integrationId };
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return responseData;
}
