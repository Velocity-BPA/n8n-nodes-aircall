/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import {
  aircallApiRequest,
  aircallApiRequestAllItems,
  buildDateFilter,
  parseTagsFilter,
} from '../../transport/aircallClient';

export const callOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['call'],
      },
    },
    options: [
      {
        name: 'Add Comment',
        value: 'addComment',
        description: 'Add a comment to a call',
        action: 'Add comment to a call',
      },
      {
        name: 'Add Tag',
        value: 'addTag',
        description: 'Add a tag to a call',
        action: 'Add tag to a call',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a call',
        action: 'Delete a call',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a call by ID',
        action: 'Get a call',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many calls',
        action: 'Get many calls',
      },
      {
        name: 'Get Insights',
        value: 'getInsights',
        description: 'Get call insights and analytics',
        action: 'Get call insights',
      },
      {
        name: 'Get Recording',
        value: 'getRecording',
        description: 'Get the recording URL for a call',
        action: 'Get call recording',
      },
      {
        name: 'Link',
        value: 'link',
        description: 'Link a call to an external record',
        action: 'Link a call',
      },
      {
        name: 'Remove Tag',
        value: 'removeTag',
        description: 'Remove a tag from a call',
        action: 'Remove tag from a call',
      },
      {
        name: 'Search',
        value: 'search',
        description: 'Search calls with filters',
        action: 'Search calls',
      },
      {
        name: 'Transfer',
        value: 'transfer',
        description: 'Transfer a call to another user or number',
        action: 'Transfer a call',
      },
    ],
    default: 'get',
  },
];

export const callFields: INodeProperties[] = [
  // Get operation
  {
    displayName: 'Call ID',
    name: 'callId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['call'],
        operation: ['get', 'delete', 'addComment', 'addTag', 'removeTag', 'link', 'transfer', 'getInsights', 'getRecording'],
      },
    },
    description: 'The ID of the call',
  },

  // GetAll operation
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['call'],
        operation: ['getAll', 'search'],
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
        resource: ['call'],
        operation: ['getAll', 'search'],
        returnAll: [false],
      },
    },
    description: 'Max number of results to return',
  },

  // Search filters
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['call'],
        operation: ['search', 'getAll'],
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
        description: 'Filter by call direction',
      },
      {
        displayName: 'From (Start Date)',
        name: 'from',
        type: 'dateTime',
        default: '',
        description: 'Filter calls from this date/time',
      },
      {
        displayName: 'To (End Date)',
        name: 'to',
        type: 'dateTime',
        default: '',
        description: 'Filter calls until this date/time',
      },
      {
        displayName: 'Tags',
        name: 'tags',
        type: 'string',
        default: '',
        description: 'Comma-separated list of tag names (AND condition)',
      },
      {
        displayName: 'User ID',
        name: 'user_id',
        type: 'string',
        default: '',
        description: 'Filter by agent/user ID',
      },
      {
        displayName: 'Number ID',
        name: 'number_id',
        type: 'string',
        default: '',
        description: 'Filter by phone number ID',
      },
    ],
  },

  // Add Comment
  {
    displayName: 'Comment',
    name: 'comment',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['call'],
        operation: ['addComment'],
      },
    },
    description: 'The comment text to add to the call',
  },

  // Add/Remove Tag
  {
    displayName: 'Tag ID',
    name: 'tagId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['call'],
        operation: ['addTag', 'removeTag'],
      },
    },
    description: 'The ID of the tag',
  },

  // Link operation
  {
    displayName: 'Link URL',
    name: 'linkUrl',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['call'],
        operation: ['link'],
      },
    },
    description: 'The URL to link to the call',
  },

  // Transfer operation
  {
    displayName: 'Transfer To',
    name: 'transferTo',
    type: 'options',
    options: [
      { name: 'User', value: 'user' },
      { name: 'Number', value: 'number' },
    ],
    default: 'user',
    displayOptions: {
      show: {
        resource: ['call'],
        operation: ['transfer'],
      },
    },
    description: 'Transfer the call to a user or number',
  },
  {
    displayName: 'User ID',
    name: 'transferUserId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['call'],
        operation: ['transfer'],
        transferTo: ['user'],
      },
    },
    description: 'The ID of the user to transfer to',
  },
  {
    displayName: 'Number ID',
    name: 'transferNumberId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['call'],
        operation: ['transfer'],
        transferTo: ['number'],
      },
    },
    description: 'The ID of the number to transfer to',
  },
];

export async function executeCallOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'get': {
      const callId = this.getNodeParameter('callId', i) as string;
      const response = await aircallApiRequest.call(this, 'GET', `/calls/${callId}`);
      responseData = response.call as IDataObject;
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
      const qs: IDataObject = {};

      if (filters.direction) qs.direction = filters.direction;
      if (filters.user_id) qs.user_id = filters.user_id;
      if (filters.number_id) qs.number_id = filters.number_id;

      const dateFilter = buildDateFilter(filters.from as string, filters.to as string);
      if (dateFilter.from) qs.from = dateFilter.from;
      if (dateFilter.to) qs.to = dateFilter.to;

      if (filters.tags) {
        const tags = parseTagsFilter(filters.tags as string);
        if (tags.length > 0) qs.tags = tags;
      }

      if (returnAll) {
        responseData = await aircallApiRequestAllItems.call(this, 'GET', '/calls', 'calls', {}, qs);
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        qs.per_page = Math.min(limit, 50);
        const response = await aircallApiRequest.call(this, 'GET', '/calls', {}, qs);
        responseData = (response.calls as IDataObject[]).slice(0, limit);
      }
      break;
    }

    case 'search': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
      const qs: IDataObject = {};

      if (filters.direction) qs.direction = filters.direction;
      if (filters.user_id) qs.user_id = filters.user_id;
      if (filters.number_id) qs.number_id = filters.number_id;

      const dateFilter = buildDateFilter(filters.from as string, filters.to as string);
      if (dateFilter.from) qs.from = dateFilter.from;
      if (dateFilter.to) qs.to = dateFilter.to;

      if (filters.tags) {
        const tags = parseTagsFilter(filters.tags as string);
        if (tags.length > 0) qs.tags = tags;
      }

      if (returnAll) {
        responseData = await aircallApiRequestAllItems.call(this, 'GET', '/calls/search', 'calls', {}, qs);
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        qs.per_page = Math.min(limit, 50);
        const response = await aircallApiRequest.call(this, 'GET', '/calls/search', {}, qs);
        responseData = (response.calls as IDataObject[]).slice(0, limit);
      }
      break;
    }

    case 'delete': {
      const callId = this.getNodeParameter('callId', i) as string;
      await aircallApiRequest.call(this, 'DELETE', `/calls/${callId}`);
      responseData = { success: true, callId };
      break;
    }

    case 'addComment': {
      const callId = this.getNodeParameter('callId', i) as string;
      const comment = this.getNodeParameter('comment', i) as string;
      const response = await aircallApiRequest.call(this, 'POST', `/calls/${callId}/comments`, {
        content: comment,
      });
      responseData = response as IDataObject;
      break;
    }

    case 'addTag': {
      const callId = this.getNodeParameter('callId', i) as string;
      const tagId = this.getNodeParameter('tagId', i) as string;
      const response = await aircallApiRequest.call(this, 'POST', `/calls/${callId}/tags`, {
        tag_id: tagId,
      });
      responseData = response.call as IDataObject;
      break;
    }

    case 'removeTag': {
      const callId = this.getNodeParameter('callId', i) as string;
      const tagId = this.getNodeParameter('tagId', i) as string;
      const response = await aircallApiRequest.call(this, 'DELETE', `/calls/${callId}/tags/${tagId}`);
      responseData = response.call as IDataObject;
      break;
    }

    case 'link': {
      const callId = this.getNodeParameter('callId', i) as string;
      const linkUrl = this.getNodeParameter('linkUrl', i) as string;
      const response = await aircallApiRequest.call(this, 'POST', `/calls/${callId}/link`, {
        link: linkUrl,
      });
      responseData = response.call as IDataObject;
      break;
    }

    case 'transfer': {
      const callId = this.getNodeParameter('callId', i) as string;
      const transferTo = this.getNodeParameter('transferTo', i) as string;
      const body: IDataObject = {};

      if (transferTo === 'user') {
        body.user_id = this.getNodeParameter('transferUserId', i) as string;
      } else {
        body.number_id = this.getNodeParameter('transferNumberId', i) as string;
      }

      const response = await aircallApiRequest.call(this, 'POST', `/calls/${callId}/transfers`, body);
      responseData = response.call as IDataObject;
      break;
    }

    case 'getInsights': {
      const callId = this.getNodeParameter('callId', i) as string;
      const response = await aircallApiRequest.call(this, 'GET', `/calls/${callId}/insights`);
      responseData = response as IDataObject;
      break;
    }

    case 'getRecording': {
      const callId = this.getNodeParameter('callId', i) as string;
      const response = await aircallApiRequest.call(this, 'GET', `/calls/${callId}`);
      const call = response.call as IDataObject;
      responseData = {
        callId,
        recording: call.recording || null,
        asset: call.asset || null,
        voicemail: call.voicemail || null,
      };
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return responseData;
}
