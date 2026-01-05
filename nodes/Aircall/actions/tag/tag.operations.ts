/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { aircallApiRequest, aircallApiRequestAllItems } from '../../transport/aircallClient';

export const tagOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['tag'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new tag',
        action: 'Create a tag',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a tag',
        action: 'Delete a tag',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a tag by ID',
        action: 'Get a tag',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many tags',
        action: 'Get many tags',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a tag',
        action: 'Update a tag',
      },
    ],
    default: 'get',
  },
];

export const tagFields: INodeProperties[] = [
  // Tag ID
  {
    displayName: 'Tag ID',
    name: 'tagId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['tag'],
        operation: ['get', 'update', 'delete'],
      },
    },
    description: 'The ID of the tag',
  },

  // Create tag fields
  {
    displayName: 'Tag Name',
    name: 'name',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['tag'],
        operation: ['create'],
      },
    },
    description: 'Name of the tag',
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
        resource: ['tag'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Color',
        name: 'color',
        type: 'color',
        default: '#4A90E2',
        description: 'Color for the tag (hex format)',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description of the tag',
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
        resource: ['tag'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Color',
        name: 'color',
        type: 'color',
        default: '#4A90E2',
        description: 'Color for the tag (hex format)',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description of the tag',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'New name for the tag',
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
        resource: ['tag'],
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
        resource: ['tag'],
        operation: ['getAll'],
        returnAll: [false],
      },
    },
    description: 'Max number of results to return',
  },
];

export async function executeTagOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'create': {
      const name = this.getNodeParameter('name', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

      const body: IDataObject = {
        name,
        ...additionalFields,
      };

      const response = await aircallApiRequest.call(this, 'POST', '/tags', body);
      responseData = response.tag as IDataObject;
      break;
    }

    case 'get': {
      const tagId = this.getNodeParameter('tagId', i) as string;
      const response = await aircallApiRequest.call(this, 'GET', `/tags/${tagId}`);
      responseData = response.tag as IDataObject;
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;

      if (returnAll) {
        responseData = await aircallApiRequestAllItems.call(this, 'GET', '/tags', 'tags');
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        const qs: IDataObject = { per_page: Math.min(limit, 50) };
        const response = await aircallApiRequest.call(this, 'GET', '/tags', {}, qs);
        responseData = (response.tags as IDataObject[]).slice(0, limit);
      }
      break;
    }

    case 'update': {
      const tagId = this.getNodeParameter('tagId', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

      const response = await aircallApiRequest.call(this, 'PUT', `/tags/${tagId}`, updateFields);
      responseData = response.tag as IDataObject;
      break;
    }

    case 'delete': {
      const tagId = this.getNodeParameter('tagId', i) as string;
      await aircallApiRequest.call(this, 'DELETE', `/tags/${tagId}`);
      responseData = { success: true, tagId };
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return responseData;
}
