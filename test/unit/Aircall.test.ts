/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { Aircall } from '../../nodes/Aircall/Aircall.node';
import { AircallTrigger } from '../../nodes/Aircall/AircallTrigger.node';
import { AIRCALL_WEBHOOK_EVENTS } from '../../nodes/Aircall/utils/types';

describe('Aircall Node', () => {
  let aircall: Aircall;

  beforeEach(() => {
    aircall = new Aircall();
  });

  describe('Node Description', () => {
    it('should have correct basic properties', () => {
      expect(aircall.description.displayName).toBe('Aircall');
      expect(aircall.description.name).toBe('aircall');
      expect(aircall.description.group).toContain('transform');
      expect(aircall.description.version).toBe(1);
    });

    it('should require aircallApi credentials', () => {
      expect(aircall.description.credentials).toBeDefined();
      expect(aircall.description.credentials).toHaveLength(1);
      expect(aircall.description.credentials![0].name).toBe('aircallApi');
      expect(aircall.description.credentials![0].required).toBe(true);
    });

    it('should have all 10 resources defined', () => {
      const resourceProperty = aircall.description.properties.find(
        (p) => p.name === 'resource',
      );
      expect(resourceProperty).toBeDefined();
      expect(resourceProperty!.type).toBe('options');

      const options = resourceProperty!.options as Array<{ value: string }>;
      const resourceValues = options.map((opt) => opt.value);

      expect(resourceValues).toContain('call');
      expect(resourceValues).toContain('user');
      expect(resourceValues).toContain('number');
      expect(resourceValues).toContain('contact');
      expect(resourceValues).toContain('team');
      expect(resourceValues).toContain('tag');
      expect(resourceValues).toContain('webhook');
      expect(resourceValues).toContain('message');
      expect(resourceValues).toContain('company');
      expect(resourceValues).toContain('integration');
      expect(resourceValues).toHaveLength(10);
    });
  });

  describe('Call Operations', () => {
    it('should have all call operations defined', () => {
      const operationProperty = aircall.description.properties.find(
        (p) =>
          p.name === 'operation' &&
          p.displayOptions?.show?.resource?.includes('call'),
      );
      expect(operationProperty).toBeDefined();

      const options = operationProperty!.options as Array<{ value: string }>;
      const operationValues = options.map((opt) => opt.value);

      expect(operationValues).toContain('get');
      expect(operationValues).toContain('getAll');
      expect(operationValues).toContain('search');
      expect(operationValues).toContain('delete');
      expect(operationValues).toContain('addComment');
      expect(operationValues).toContain('addTag');
      expect(operationValues).toContain('removeTag');
      expect(operationValues).toContain('link');
      expect(operationValues).toContain('transfer');
      expect(operationValues).toContain('getInsights');
      expect(operationValues).toContain('getRecording');
    });
  });

  describe('User Operations', () => {
    it('should have all user operations defined', () => {
      const operationProperty = aircall.description.properties.find(
        (p) =>
          p.name === 'operation' &&
          p.displayOptions?.show?.resource?.includes('user'),
      );
      expect(operationProperty).toBeDefined();

      const options = operationProperty!.options as Array<{ value: string }>;
      const operationValues = options.map((opt) => opt.value);

      expect(operationValues).toContain('create');
      expect(operationValues).toContain('get');
      expect(operationValues).toContain('getAll');
      expect(operationValues).toContain('update');
      expect(operationValues).toContain('delete');
      expect(operationValues).toContain('getAvailability');
      expect(operationValues).toContain('setAvailability');
      expect(operationValues).toContain('startOutboundCall');
      expect(operationValues).toContain('dialNumber');
    });
  });

  describe('Contact Operations', () => {
    it('should have all contact operations defined', () => {
      const operationProperty = aircall.description.properties.find(
        (p) =>
          p.name === 'operation' &&
          p.displayOptions?.show?.resource?.includes('contact'),
      );
      expect(operationProperty).toBeDefined();

      const options = operationProperty!.options as Array<{ value: string }>;
      const operationValues = options.map((opt) => opt.value);

      expect(operationValues).toContain('create');
      expect(operationValues).toContain('get');
      expect(operationValues).toContain('getAll');
      expect(operationValues).toContain('update');
      expect(operationValues).toContain('delete');
      expect(operationValues).toContain('search');
    });
  });

  describe('Team Operations', () => {
    it('should have all team operations defined', () => {
      const operationProperty = aircall.description.properties.find(
        (p) =>
          p.name === 'operation' &&
          p.displayOptions?.show?.resource?.includes('team'),
      );
      expect(operationProperty).toBeDefined();

      const options = operationProperty!.options as Array<{ value: string }>;
      const operationValues = options.map((opt) => opt.value);

      expect(operationValues).toContain('create');
      expect(operationValues).toContain('get');
      expect(operationValues).toContain('getAll');
      expect(operationValues).toContain('update');
      expect(operationValues).toContain('delete');
      expect(operationValues).toContain('addUser');
      expect(operationValues).toContain('removeUser');
    });
  });

  describe('Message Operations', () => {
    it('should have SMS operations defined', () => {
      const operationProperty = aircall.description.properties.find(
        (p) =>
          p.name === 'operation' &&
          p.displayOptions?.show?.resource?.includes('message'),
      );
      expect(operationProperty).toBeDefined();

      const options = operationProperty!.options as Array<{ value: string }>;
      const operationValues = options.map((opt) => opt.value);

      expect(operationValues).toContain('send');
      expect(operationValues).toContain('get');
      expect(operationValues).toContain('getAll');
    });
  });
});

describe('Aircall Trigger Node', () => {
  let trigger: AircallTrigger;

  beforeEach(() => {
    trigger = new AircallTrigger();
  });

  describe('Node Description', () => {
    it('should have correct basic properties', () => {
      expect(trigger.description.displayName).toBe('Aircall Trigger');
      expect(trigger.description.name).toBe('aircallTrigger');
      expect(trigger.description.group).toContain('trigger');
      expect(trigger.description.version).toBe(1);
    });

    it('should require aircallApi credentials', () => {
      expect(trigger.description.credentials).toBeDefined();
      expect(trigger.description.credentials).toHaveLength(1);
      expect(trigger.description.credentials![0].name).toBe('aircallApi');
    });

    it('should have webhook configured', () => {
      expect(trigger.description.webhooks).toBeDefined();
      expect(trigger.description.webhooks).toHaveLength(1);
      expect(trigger.description.webhooks![0].httpMethod).toBe('POST');
      expect(trigger.description.webhooks![0].path).toBe('webhook');
    });

    it('should have events property with all webhook events', () => {
      const eventsProperty = trigger.description.properties.find(
        (p) => p.name === 'events',
      );
      expect(eventsProperty).toBeDefined();
      expect(eventsProperty!.type).toBe('multiOptions');

      const options = eventsProperty!.options as Array<{ value: string }>;
      expect(options.length).toBe(AIRCALL_WEBHOOK_EVENTS.length);
    });
  });

  describe('Webhook Methods', () => {
    it('should have webhook methods defined', () => {
      expect(trigger.webhookMethods).toBeDefined();
      expect(trigger.webhookMethods.default).toBeDefined();
      expect(trigger.webhookMethods.default.checkExists).toBeDefined();
      expect(trigger.webhookMethods.default.create).toBeDefined();
      expect(trigger.webhookMethods.default.delete).toBeDefined();
    });
  });
});

describe('Webhook Events', () => {
  it('should have all required webhook events', () => {
    expect(AIRCALL_WEBHOOK_EVENTS).toContain('call.created');
    expect(AIRCALL_WEBHOOK_EVENTS).toContain('call.ringing_on_agent');
    expect(AIRCALL_WEBHOOK_EVENTS).toContain('call.answered');
    expect(AIRCALL_WEBHOOK_EVENTS).toContain('call.ended');
    expect(AIRCALL_WEBHOOK_EVENTS).toContain('call.voicemail_left');
    expect(AIRCALL_WEBHOOK_EVENTS).toContain('call.tagged');
    expect(AIRCALL_WEBHOOK_EVENTS).toContain('call.commented');
    expect(AIRCALL_WEBHOOK_EVENTS).toContain('contact.created');
    expect(AIRCALL_WEBHOOK_EVENTS).toContain('contact.updated');
    expect(AIRCALL_WEBHOOK_EVENTS).toContain('contact.deleted');
    expect(AIRCALL_WEBHOOK_EVENTS).toContain('user.created');
    expect(AIRCALL_WEBHOOK_EVENTS).toContain('user.connected');
    expect(AIRCALL_WEBHOOK_EVENTS).toContain('user.disconnected');
    expect(AIRCALL_WEBHOOK_EVENTS).toContain('number.created');
    expect(AIRCALL_WEBHOOK_EVENTS).toContain('message.created');
  });

  it('should have 27 total webhook events', () => {
    expect(AIRCALL_WEBHOOK_EVENTS).toHaveLength(27);
  });
});
