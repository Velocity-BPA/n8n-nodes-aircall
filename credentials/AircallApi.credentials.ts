/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class AircallApi implements ICredentialType {
  name = 'aircallApi';
  displayName = 'Aircall API';
  documentationUrl = 'https://developer.aircall.io/api-references/';
  properties: INodeProperties[] = [
    {
      displayName: 'API ID',
      name: 'apiId',
      type: 'string',
      default: '',
      required: true,
      description: 'The API ID from your Aircall dashboard',
    },
    {
      displayName: 'API Token',
      name: 'apiToken',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'The API Token from your Aircall dashboard',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      auth: {
        username: '={{$credentials.apiId}}',
        password: '={{$credentials.apiToken}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: 'https://api.aircall.io/v1',
      url: '/company',
      method: 'GET',
    },
  };
}
