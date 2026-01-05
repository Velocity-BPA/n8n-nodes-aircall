/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { aircallApiRequest, aircallApiRequestAllItems } from '../../transport/aircallClient';

export const userOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['user'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new user',
        action: 'Create a user',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a user',
        action: 'Delete a user',
      },
      {
        name: 'Dial Number',
        value: 'dialNumber',
        description: 'Dial a number from a user\'s phone',
        action: 'Dial number from user phone',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a user by ID',
        action: 'Get a user',
      },
      {
        name: 'Get Availability',
        value: 'getAvailability',
        description: 'Get user availability status',
        action: 'Get user availability',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many users',
        action: 'Get many users',
      },
      {
        name: 'Set Availability',
        value: 'setAvailability',
        description: 'Set user availability status',
        action: 'Set user availability',
      },
      {
        name: 'Start Outbound Call',
        value: 'startOutboundCall',
        description: 'Initiate an outbound call from a user',
        action: 'Start outbound call',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a user',
        action: 'Update a user',
      },
    ],
    default: 'get',
  },
];

export const userFields: INodeProperties[] = [
  // User ID for operations requiring it
  {
    displayName: 'User ID',
    name: 'userId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['user'],
        operation: ['get', 'update', 'delete', 'getAvailability', 'setAvailability', 'startOutboundCall', 'dialNumber'],
      },
    },
    description: 'The ID of the user',
  },

  // Create user fields
  {
    displayName: 'Email',
    name: 'email',
    type: 'string',
    placeholder: 'name@email.com',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['user'],
        operation: ['create'],
      },
    },
    description: 'Email address of the user',
  },
  {
    displayName: 'First Name',
    name: 'firstName',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['user'],
        operation: ['create'],
      },
    },
    description: 'First name of the user',
  },
  {
    displayName: 'Last Name',
    name: 'lastName',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['user'],
        operation: ['create'],
      },
    },
    description: 'Last name of the user',
  },

  // Additional options for create
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['user'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Is Admin',
        name: 'is_admin',
        type: 'boolean',
        default: false,
        description: 'Whether the user should have admin privileges',
      },
      {
        displayName: 'Language',
        name: 'language',
        type: 'options',
        options: [
          { name: 'English', value: 'en' },
          { name: 'French', value: 'fr' },
          { name: 'German', value: 'de' },
          { name: 'Spanish', value: 'es' },
          { name: 'Portuguese', value: 'pt' },
        ],
        default: 'en',
        description: 'Language preference for the user',
      },
      {
        displayName: 'Wrap Up Time',
        name: 'wrap_up_time',
        type: 'number',
        default: 0,
        description: 'Wrap-up time in seconds after calls',
      },
    ],
  },

  // Update user fields
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['user'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        default: '',
        description: 'Email address of the user',
      },
      {
        displayName: 'First Name',
        name: 'first_name',
        type: 'string',
        default: '',
        description: 'First name of the user',
      },
      {
        displayName: 'Is Admin',
        name: 'is_admin',
        type: 'boolean',
        default: false,
        description: 'Whether the user should have admin privileges',
      },
      {
        displayName: 'Language',
        name: 'language',
        type: 'options',
        options: [
          { name: 'English', value: 'en' },
          { name: 'French', value: 'fr' },
          { name: 'German', value: 'de' },
          { name: 'Spanish', value: 'es' },
          { name: 'Portuguese', value: 'pt' },
        ],
        default: 'en',
        description: 'Language preference for the user',
      },
      {
        displayName: 'Last Name',
        name: 'last_name',
        type: 'string',
        default: '',
        description: 'Last name of the user',
      },
      {
        displayName: 'Wrap Up Time',
        name: 'wrap_up_time',
        type: 'number',
        default: 0,
        description: 'Wrap-up time in seconds after calls',
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
        resource: ['user'],
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
        resource: ['user'],
        operation: ['getAll'],
        returnAll: [false],
      },
    },
    description: 'Max number of results to return',
  },

  // Set Availability
  {
    displayName: 'Availability Status',
    name: 'availabilityStatus',
    type: 'options',
    required: true,
    options: [
      { name: 'Available', value: 'available' },
      { name: 'Custom', value: 'custom' },
      { name: 'Do Not Disturb', value: 'do_not_disturb' },
    ],
    default: 'available',
    displayOptions: {
      show: {
        resource: ['user'],
        operation: ['setAvailability'],
      },
    },
    description: 'The availability status to set',
  },
  {
    displayName: 'Custom Availability Message',
    name: 'customMessage',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['user'],
        operation: ['setAvailability'],
        availabilityStatus: ['custom'],
      },
    },
    description: 'Custom message when status is set to custom',
  },

  // Start Outbound Call
  {
    displayName: 'Phone Number',
    name: 'phoneNumber',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['user'],
        operation: ['startOutboundCall', 'dialNumber'],
      },
    },
    description: 'The phone number to call (E.164 format recommended)',
  },
  {
    displayName: 'Number ID',
    name: 'numberId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['user'],
        operation: ['startOutboundCall'],
      },
    },
    description: 'The Aircall number ID to call from',
  },
];

export async function executeUserOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'create': {
      const email = this.getNodeParameter('email', i) as string;
      const firstName = this.getNodeParameter('firstName', i) as string;
      const lastName = this.getNodeParameter('lastName', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

      const body: IDataObject = {
        email,
        first_name: firstName,
        last_name: lastName,
        ...additionalFields,
      };

      const response = await aircallApiRequest.call(this, 'POST', '/users', body);
      responseData = response.user as IDataObject;
      break;
    }

    case 'get': {
      const userId = this.getNodeParameter('userId', i) as string;
      const response = await aircallApiRequest.call(this, 'GET', `/users/${userId}`);
      responseData = response.user as IDataObject;
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;

      if (returnAll) {
        responseData = await aircallApiRequestAllItems.call(this, 'GET', '/users', 'users');
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        const qs: IDataObject = { per_page: Math.min(limit, 50) };
        const response = await aircallApiRequest.call(this, 'GET', '/users', {}, qs);
        responseData = (response.users as IDataObject[]).slice(0, limit);
      }
      break;
    }

    case 'update': {
      const userId = this.getNodeParameter('userId', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

      const response = await aircallApiRequest.call(this, 'PUT', `/users/${userId}`, updateFields);
      responseData = response.user as IDataObject;
      break;
    }

    case 'delete': {
      const userId = this.getNodeParameter('userId', i) as string;
      await aircallApiRequest.call(this, 'DELETE', `/users/${userId}`);
      responseData = { success: true, userId };
      break;
    }

    case 'getAvailability': {
      const userId = this.getNodeParameter('userId', i) as string;
      const response = await aircallApiRequest.call(this, 'GET', `/users/${userId}/availability`);
      responseData = response as IDataObject;
      break;
    }

    case 'setAvailability': {
      const userId = this.getNodeParameter('userId', i) as string;
      const availabilityStatus = this.getNodeParameter('availabilityStatus', i) as string;
      const body: IDataObject = { availability_status: availabilityStatus };

      if (availabilityStatus === 'custom') {
        const customMessage = this.getNodeParameter('customMessage', i, '') as string;
        if (customMessage) {
          body.custom_message = customMessage;
        }
      }

      const response = await aircallApiRequest.call(this, 'PUT', `/users/${userId}/availability`, body);
      responseData = response.user as IDataObject;
      break;
    }

    case 'startOutboundCall': {
      const userId = this.getNodeParameter('userId', i) as string;
      const phoneNumber = this.getNodeParameter('phoneNumber', i) as string;
      const numberId = this.getNodeParameter('numberId', i) as string;

      const body: IDataObject = {
        number_id: numberId,
        to: phoneNumber,
      };

      const response = await aircallApiRequest.call(this, 'POST', `/users/${userId}/calls`, body);
      responseData = response as IDataObject;
      break;
    }

    case 'dialNumber': {
      const userId = this.getNodeParameter('userId', i) as string;
      const phoneNumber = this.getNodeParameter('phoneNumber', i) as string;

      const body: IDataObject = { to: phoneNumber };

      const response = await aircallApiRequest.call(this, 'POST', `/users/${userId}/dial`, body);
      responseData = response as IDataObject;
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return responseData;
}
