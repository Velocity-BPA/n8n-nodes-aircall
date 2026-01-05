/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IExecuteFunctions,
  IHookFunctions,
  ILoadOptionsFunctions,
  IDataObject,
  JsonObject,
  IHttpRequestMethods,
  IRequestOptions,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

const BASE_URL = 'https://api.aircall.io/v1';

export async function aircallApiRequest(
  this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body: IDataObject = {},
  query: IDataObject = {},
): Promise<any> {
  const options: IRequestOptions = {
    method,
    uri: `${BASE_URL}${endpoint}`,
    qs: query,
    body,
    json: true,
  };

  if (Object.keys(body).length === 0) {
    delete options.body;
  }

  if (Object.keys(query).length === 0) {
    delete options.qs;
  }

  try {
    return await this.helpers.requestWithAuthentication.call(this, 'aircallApi', options);
  } catch (error) {
    throw new NodeApiError(this.getNode(), error as JsonObject);
  }
}

export async function aircallApiRequestAllItems(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  propertyName: string,
  body: IDataObject = {},
  query: IDataObject = {},
): Promise<any[]> {
  const returnData: any[] = [];
  let responseData;
  let hasMorePages = true;

  query.per_page = 50;
  query.page = 1;

  while (hasMorePages) {
    responseData = await aircallApiRequest.call(this, method, endpoint, body, query);
    
    if (responseData[propertyName]) {
      returnData.push(...(responseData[propertyName] as any[]));
    }

    const meta = responseData.meta;
    if (meta && meta.next_page_link) {
      query.page = (query.page as number) + 1;
    } else {
      hasMorePages = false;
    }
  }

  return returnData;
}

export function simplifyOutput(data: IDataObject): IDataObject {
  const simplified: IDataObject = {};

  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        const nested = value as IDataObject;
        if (nested.id !== undefined) {
          simplified[`${key}_id`] = nested.id;
          if (nested.name) simplified[`${key}_name`] = nested.name;
        } else {
          simplified[key] = value;
        }
      } else {
        simplified[key] = value;
      }
    }
  }

  return simplified;
}

export function buildDateFilter(
  from?: string,
  to?: string,
): { from?: number; to?: number } {
  const filter: { from?: number; to?: number } = {};
  
  if (from) {
    filter.from = Math.floor(new Date(from).getTime() / 1000);
  }
  
  if (to) {
    filter.to = Math.floor(new Date(to).getTime() / 1000);
  }
  
  return filter;
}

export function parseTagsFilter(tags: string): string[] {
  return tags.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0);
}
