/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { aircallApiRequest } from '../../transport/aircallClient';

export const companyOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['company'],
      },
    },
    options: [
      {
        name: 'Get',
        value: 'get',
        description: 'Get company information',
        action: 'Get company information',
      },
    ],
    default: 'get',
  },
];

export const companyFields: INodeProperties[] = [];

export async function executeCompanyOperation(
  this: IExecuteFunctions,
  operation: string,
  _i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'get': {
      const response = await aircallApiRequest.call(this, 'GET', '/company');
      responseData = response.company as IDataObject;
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return responseData;
}
