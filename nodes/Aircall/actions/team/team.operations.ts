/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { aircallApiRequest, aircallApiRequestAllItems } from '../../transport/aircallClient';

export const teamOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['team'],
      },
    },
    options: [
      {
        name: 'Add User',
        value: 'addUser',
        description: 'Add a user to a team',
        action: 'Add user to a team',
      },
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new team',
        action: 'Create a team',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a team',
        action: 'Delete a team',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a team by ID',
        action: 'Get a team',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many teams',
        action: 'Get many teams',
      },
      {
        name: 'Remove User',
        value: 'removeUser',
        description: 'Remove a user from a team',
        action: 'Remove user from a team',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a team',
        action: 'Update a team',
      },
    ],
    default: 'get',
  },
];

export const teamFields: INodeProperties[] = [
  // Team ID
  {
    displayName: 'Team ID',
    name: 'teamId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['team'],
        operation: ['get', 'update', 'delete', 'addUser', 'removeUser'],
      },
    },
    description: 'The ID of the team',
  },

  // Create team fields
  {
    displayName: 'Team Name',
    name: 'name',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['team'],
        operation: ['create'],
      },
    },
    description: 'Name of the team',
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
        resource: ['team'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'User IDs',
        name: 'users',
        type: 'string',
        default: '',
        description: 'Comma-separated list of user IDs to add to the team',
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
        resource: ['team'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'New name for the team',
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
        resource: ['team'],
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
        resource: ['team'],
        operation: ['getAll'],
        returnAll: [false],
      },
    },
    description: 'Max number of results to return',
  },

  // Add/Remove User
  {
    displayName: 'User ID',
    name: 'userId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['team'],
        operation: ['addUser', 'removeUser'],
      },
    },
    description: 'The ID of the user to add or remove',
  },
];

export async function executeTeamOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'create': {
      const name = this.getNodeParameter('name', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

      const body: IDataObject = { name };

      if (additionalFields.users) {
        const userIds = (additionalFields.users as string)
          .split(',')
          .map((id) => parseInt(id.trim(), 10))
          .filter((id) => !isNaN(id));
        if (userIds.length > 0) {
          body.users = userIds;
        }
      }

      const response = await aircallApiRequest.call(this, 'POST', '/teams', body);
      responseData = response.team as IDataObject;
      break;
    }

    case 'get': {
      const teamId = this.getNodeParameter('teamId', i) as string;
      const response = await aircallApiRequest.call(this, 'GET', `/teams/${teamId}`);
      responseData = response.team as IDataObject;
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;

      if (returnAll) {
        responseData = await aircallApiRequestAllItems.call(this, 'GET', '/teams', 'teams');
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        const qs: IDataObject = { per_page: Math.min(limit, 50) };
        const response = await aircallApiRequest.call(this, 'GET', '/teams', {}, qs);
        responseData = (response.teams as IDataObject[]).slice(0, limit);
      }
      break;
    }

    case 'update': {
      const teamId = this.getNodeParameter('teamId', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

      const response = await aircallApiRequest.call(this, 'PUT', `/teams/${teamId}`, updateFields);
      responseData = response.team as IDataObject;
      break;
    }

    case 'delete': {
      const teamId = this.getNodeParameter('teamId', i) as string;
      await aircallApiRequest.call(this, 'DELETE', `/teams/${teamId}`);
      responseData = { success: true, teamId };
      break;
    }

    case 'addUser': {
      const teamId = this.getNodeParameter('teamId', i) as string;
      const userId = this.getNodeParameter('userId', i) as string;

      const response = await aircallApiRequest.call(this, 'POST', `/teams/${teamId}/users`, {
        user_id: parseInt(userId, 10),
      });
      responseData = response.team as IDataObject;
      break;
    }

    case 'removeUser': {
      const teamId = this.getNodeParameter('teamId', i) as string;
      const userId = this.getNodeParameter('userId', i) as string;

      const response = await aircallApiRequest.call(
        this,
        'DELETE',
        `/teams/${teamId}/users/${userId}`,
      );
      responseData = response.team as IDataObject;
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return responseData;
}
