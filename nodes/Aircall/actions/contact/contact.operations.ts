/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { aircallApiRequest, aircallApiRequestAllItems } from '../../transport/aircallClient';

export const contactOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['contact'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new contact',
        action: 'Create a contact',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a contact',
        action: 'Delete a contact',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a contact by ID',
        action: 'Get a contact',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many contacts',
        action: 'Get many contacts',
      },
      {
        name: 'Search',
        value: 'search',
        description: 'Search contacts',
        action: 'Search contacts',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a contact',
        action: 'Update a contact',
      },
    ],
    default: 'get',
  },
];

export const contactFields: INodeProperties[] = [
  // Contact ID
  {
    displayName: 'Contact ID',
    name: 'contactId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['contact'],
        operation: ['get', 'update', 'delete'],
      },
    },
    description: 'The ID of the contact',
  },

  // Create contact fields
  {
    displayName: 'First Name',
    name: 'firstName',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['contact'],
        operation: ['create'],
      },
    },
    description: 'First name of the contact',
  },
  {
    displayName: 'Last Name',
    name: 'lastName',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['contact'],
        operation: ['create'],
      },
    },
    description: 'Last name of the contact',
  },
  {
    displayName: 'Phone Numbers',
    name: 'phoneNumbers',
    type: 'fixedCollection',
    typeOptions: {
      multipleValues: true,
    },
    default: {},
    displayOptions: {
      show: {
        resource: ['contact'],
        operation: ['create'],
      },
    },
    options: [
      {
        name: 'phoneNumberValues',
        displayName: 'Phone Number',
        values: [
          {
            displayName: 'Label',
            name: 'label',
            type: 'string',
            default: 'Work',
            description: 'Label for the phone number (e.g., Work, Mobile)',
          },
          {
            displayName: 'Value',
            name: 'value',
            type: 'string',
            default: '',
            description: 'The phone number',
          },
        ],
      },
    ],
    description: 'Phone numbers for the contact',
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
        resource: ['contact'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Company Name',
        name: 'company_name',
        type: 'string',
        default: '',
        description: 'Company name of the contact',
      },
      {
        displayName: 'Information',
        name: 'information',
        type: 'string',
        default: '',
        description: 'Additional information about the contact',
      },
      {
        displayName: 'Is Shared',
        name: 'is_shared',
        type: 'boolean',
        default: true,
        description: 'Whether the contact is shared across the company',
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
        resource: ['contact'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Company Name',
        name: 'company_name',
        type: 'string',
        default: '',
        description: 'Company name of the contact',
      },
      {
        displayName: 'First Name',
        name: 'first_name',
        type: 'string',
        default: '',
        description: 'First name of the contact',
      },
      {
        displayName: 'Information',
        name: 'information',
        type: 'string',
        default: '',
        description: 'Additional information about the contact',
      },
      {
        displayName: 'Is Shared',
        name: 'is_shared',
        type: 'boolean',
        default: true,
        description: 'Whether the contact is shared across the company',
      },
      {
        displayName: 'Last Name',
        name: 'last_name',
        type: 'string',
        default: '',
        description: 'Last name of the contact',
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
        resource: ['contact'],
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
        resource: ['contact'],
        operation: ['getAll', 'search'],
        returnAll: [false],
      },
    },
    description: 'Max number of results to return',
  },

  // Search options
  {
    displayName: 'Search Query',
    name: 'searchQuery',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['contact'],
        operation: ['search'],
      },
    },
    description: 'Search query (searches name, phone, email, company)',
  },
  {
    displayName: 'Search Filters',
    name: 'searchFilters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['contact'],
        operation: ['search'],
      },
    },
    options: [
      {
        displayName: 'Phone Number',
        name: 'phone_number',
        type: 'string',
        default: '',
        description: 'Filter by phone number',
      },
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        default: '',
        description: 'Filter by email address',
      },
    ],
  },
];

export async function executeContactOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'create': {
      const firstName = this.getNodeParameter('firstName', i, '') as string;
      const lastName = this.getNodeParameter('lastName', i, '') as string;
      const phoneNumbersData = this.getNodeParameter('phoneNumbers', i, {}) as IDataObject;
      const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

      const body: IDataObject = {
        ...additionalFields,
      };

      if (firstName) body.first_name = firstName;
      if (lastName) body.last_name = lastName;

      // Process phone numbers
      if (phoneNumbersData.phoneNumberValues) {
        const phoneNumbers = phoneNumbersData.phoneNumberValues as IDataObject[];
        body.phone_numbers = phoneNumbers.map((pn) => ({
          label: pn.label,
          value: pn.value,
        }));
      }

      const response = await aircallApiRequest.call(this, 'POST', '/contacts', body);
      responseData = response.contact as IDataObject;
      break;
    }

    case 'get': {
      const contactId = this.getNodeParameter('contactId', i) as string;
      const response = await aircallApiRequest.call(this, 'GET', `/contacts/${contactId}`);
      responseData = response.contact as IDataObject;
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;

      if (returnAll) {
        responseData = await aircallApiRequestAllItems.call(this, 'GET', '/contacts', 'contacts');
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        const qs: IDataObject = { per_page: Math.min(limit, 50) };
        const response = await aircallApiRequest.call(this, 'GET', '/contacts', {}, qs);
        responseData = (response.contacts as IDataObject[]).slice(0, limit);
      }
      break;
    }

    case 'update': {
      const contactId = this.getNodeParameter('contactId', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

      const response = await aircallApiRequest.call(
        this,
        'PUT',
        `/contacts/${contactId}`,
        updateFields,
      );
      responseData = response.contact as IDataObject;
      break;
    }

    case 'delete': {
      const contactId = this.getNodeParameter('contactId', i) as string;
      await aircallApiRequest.call(this, 'DELETE', `/contacts/${contactId}`);
      responseData = { success: true, contactId };
      break;
    }

    case 'search': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const searchQuery = this.getNodeParameter('searchQuery', i, '') as string;
      const searchFilters = this.getNodeParameter('searchFilters', i, {}) as IDataObject;

      const qs: IDataObject = {};
      if (searchQuery) qs.query = searchQuery;
      if (searchFilters.phone_number) qs.phone_number = searchFilters.phone_number;
      if (searchFilters.email) qs.email = searchFilters.email;

      if (returnAll) {
        responseData = await aircallApiRequestAllItems.call(
          this,
          'GET',
          '/contacts/search',
          'contacts',
          {},
          qs,
        );
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        qs.per_page = Math.min(limit, 50);
        const response = await aircallApiRequest.call(this, 'GET', '/contacts/search', {}, qs);
        responseData = (response.contacts as IDataObject[]).slice(0, limit);
      }
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return responseData;
}
