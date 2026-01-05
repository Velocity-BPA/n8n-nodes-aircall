/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IHookFunctions,
  IWebhookFunctions,
  IDataObject,
  INodeType,
  INodeTypeDescription,
  IWebhookResponseData,
} from 'n8n-workflow';
import { aircallApiRequest } from './transport/aircallClient';
import { AIRCALL_WEBHOOK_EVENTS } from './utils/types';

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

const webhookEventOptions = AIRCALL_WEBHOOK_EVENTS.map((event) => ({
  name: event.replace(/\./g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  value: event,
}));

export class AircallTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Aircall Trigger',
    name: 'aircallTrigger',
    icon: 'file:aircall.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["events"].join(", ")}}',
    description: 'Starts workflow when Aircall events occur',
    defaults: {
      name: 'Aircall Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'aircallApi',
        required: true,
      },
    ],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'webhook',
      },
    ],
    properties: [
      {
        displayName: 'Events',
        name: 'events',
        type: 'multiOptions',
        options: webhookEventOptions,
        default: ['call.ended'],
        required: true,
        description: 'The events to listen to',
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Token',
            name: 'token',
            type: 'string',
            typeOptions: {
              password: true,
            },
            default: '',
            description: 'Verification token for webhook security (optional)',
          },
        ],
      },
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        logLicenseNotice();

        const webhookUrl = this.getNodeWebhookUrl('default');
        const webhookData = this.getWorkflowStaticData('node');

        // Check if webhook already exists
        if (webhookData.webhookId) {
          try {
            const response = await aircallApiRequest.call(
              this,
              'GET',
              `/webhooks/${webhookData.webhookId}`,
            );
            if (response.webhook && response.webhook.url === webhookUrl) {
              return true;
            }
          } catch {
            // Webhook doesn't exist anymore
            delete webhookData.webhookId;
          }
        }

        // Check all webhooks for matching URL
        try {
          const response = await aircallApiRequest.call(this, 'GET', '/webhooks');
          const webhooks = response.webhooks as IDataObject[];

          for (const webhook of webhooks) {
            if (webhook.url === webhookUrl) {
              webhookData.webhookId = webhook.id;
              return true;
            }
          }
        } catch {
          // Unable to check webhooks
        }

        return false;
      },

      async create(this: IHookFunctions): Promise<boolean> {
        logLicenseNotice();

        const webhookUrl = this.getNodeWebhookUrl('default');
        const events = this.getNodeParameter('events') as string[];
        const options = this.getNodeParameter('options', {}) as IDataObject;

        const body: IDataObject = {
          url: webhookUrl,
          events,
        };

        if (options.token) {
          body.token = options.token;
        }

        try {
          const response = await aircallApiRequest.call(this, 'POST', '/webhooks', body);
          const webhookData = this.getWorkflowStaticData('node');
          webhookData.webhookId = response.webhook.id;
          return true;
        } catch (error) {
          return false;
        }
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        logLicenseNotice();

        const webhookData = this.getWorkflowStaticData('node');

        if (webhookData.webhookId) {
          try {
            await aircallApiRequest.call(this, 'DELETE', `/webhooks/${webhookData.webhookId}`);
          } catch {
            // Webhook may have already been deleted
          }
          delete webhookData.webhookId;
        }

        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    logLicenseNotice();

    const bodyData = this.getBodyData();
    const options = this.getNodeParameter('options', {}) as IDataObject;

    // Verify token if configured
    if (options.token) {
      const webhookToken = bodyData.token;
      if (webhookToken !== options.token) {
        // Token mismatch - reject the request
        return {
          webhookResponse: 'Invalid token',
        };
      }
    }

    // Extract event data
    const eventData: IDataObject = {
      event: bodyData.event,
      resource: bodyData.resource,
      timestamp: bodyData.timestamp,
      data: bodyData.data || bodyData,
    };

    return {
      workflowData: [this.helpers.returnJsonArray([eventData])],
    };
  }
}
