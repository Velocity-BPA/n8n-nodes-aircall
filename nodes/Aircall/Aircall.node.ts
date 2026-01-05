/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';

import { callOperations, callFields, executeCallOperation } from './actions/call/call.operations';
import { userOperations, userFields, executeUserOperation } from './actions/user/user.operations';
import {
  numberOperations,
  numberFields,
  executeNumberOperation,
} from './actions/number/number.operations';
import {
  contactOperations,
  contactFields,
  executeContactOperation,
} from './actions/contact/contact.operations';
import { teamOperations, teamFields, executeTeamOperation } from './actions/team/team.operations';
import { tagOperations, tagFields, executeTagOperation } from './actions/tag/tag.operations';
import {
  webhookOperations,
  webhookFields,
  executeWebhookOperation,
} from './actions/webhook/webhook.operations';
import {
  messageOperations,
  messageFields,
  executeMessageOperation,
} from './actions/message/message.operations';
import {
  companyOperations,
  companyFields,
  executeCompanyOperation,
} from './actions/company/company.operations';
import {
  integrationOperations,
  integrationFields,
  executeIntegrationOperation,
} from './actions/integration/integration.operations';

// Log licensing notice once on module load
const LICENSING_NOTICE = `[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`;

let hasLoggedLicenseNotice = false;

function logLicenseNotice(): void {
  if (!hasLoggedLicenseNotice) {
    console.warn(LICENSING_NOTICE);
    hasLoggedLicenseNotice = true;
  }
}

export class Aircall implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Aircall',
    name: 'aircall',
    icon: 'file:aircall.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with Aircall cloud phone system API',
    defaults: {
      name: 'Aircall',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'aircallApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Call',
            value: 'call',
            description: 'Manage calls, recordings, tags, and comments',
          },
          {
            name: 'Company',
            value: 'company',
            description: 'Get company information',
          },
          {
            name: 'Contact',
            value: 'contact',
            description: 'Manage contacts',
          },
          {
            name: 'Integration',
            value: 'integration',
            description: 'Manage integrations and call linking',
          },
          {
            name: 'Message',
            value: 'message',
            description: 'Send and manage SMS messages',
          },
          {
            name: 'Number',
            value: 'number',
            description: 'Manage phone numbers',
          },
          {
            name: 'Tag',
            value: 'tag',
            description: 'Manage tags for calls',
          },
          {
            name: 'Team',
            value: 'team',
            description: 'Manage teams and team members',
          },
          {
            name: 'User',
            value: 'user',
            description: 'Manage users/agents',
          },
          {
            name: 'Webhook',
            value: 'webhook',
            description: 'Manage webhooks',
          },
        ],
        default: 'call',
      },
      // Call operations and fields
      ...callOperations,
      ...callFields,
      // User operations and fields
      ...userOperations,
      ...userFields,
      // Number operations and fields
      ...numberOperations,
      ...numberFields,
      // Contact operations and fields
      ...contactOperations,
      ...contactFields,
      // Team operations and fields
      ...teamOperations,
      ...teamFields,
      // Tag operations and fields
      ...tagOperations,
      ...tagFields,
      // Webhook operations and fields
      ...webhookOperations,
      ...webhookFields,
      // Message operations and fields
      ...messageOperations,
      ...messageFields,
      // Company operations and fields
      ...companyOperations,
      ...companyFields,
      // Integration operations and fields
      ...integrationOperations,
      ...integrationFields,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    logLicenseNotice();

    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let responseData: IDataObject | IDataObject[];

        switch (resource) {
          case 'call':
            responseData = await executeCallOperation.call(this, operation, i);
            break;
          case 'user':
            responseData = await executeUserOperation.call(this, operation, i);
            break;
          case 'number':
            responseData = await executeNumberOperation.call(this, operation, i);
            break;
          case 'contact':
            responseData = await executeContactOperation.call(this, operation, i);
            break;
          case 'team':
            responseData = await executeTeamOperation.call(this, operation, i);
            break;
          case 'tag':
            responseData = await executeTagOperation.call(this, operation, i);
            break;
          case 'webhook':
            responseData = await executeWebhookOperation.call(this, operation, i);
            break;
          case 'message':
            responseData = await executeMessageOperation.call(this, operation, i);
            break;
          case 'company':
            responseData = await executeCompanyOperation.call(this, operation, i);
            break;
          case 'integration':
            responseData = await executeIntegrationOperation.call(this, operation, i);
            break;
          default:
            throw new Error(`Unknown resource: ${resource}`);
        }

        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(responseData),
          { itemData: { item: i } },
        );

        returnData.push(...executionData);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: (error as Error).message,
            },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
