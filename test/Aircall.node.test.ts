/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Aircall } from '../nodes/Aircall/Aircall.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('Aircall Node', () => {
  let node: Aircall;

  beforeAll(() => {
    node = new Aircall();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Aircall');
      expect(node.description.name).toBe('aircall');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 6 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(6);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(6);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Call Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiId: 'test-id', 
        apiToken: 'test-token' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  it('should get all calls successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getAllCalls';
        case 'page': return 1;
        case 'per_page': return 50;
        default: return '';
      }
    });

    const mockResponse = { calls: [{ id: '123', status: 'answered' }] };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeCallOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.aircall.io/v1/calls',
      })
    );
  });

  it('should get a specific call successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getCall';
        case 'callId': return '123';
        default: return '';
      }
    });

    const mockResponse = { call: { id: '123', status: 'answered' } };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeCallOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.aircall.io/v1/calls/123',
      })
    );
  });

  it('should create a call successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'createCall';
        case 'toNumber': return '+1234567890';
        case 'fromNumber': return '+0987654321';
        case 'userId': return 'user123';
        default: return '';
      }
    });

    const mockResponse = { call: { id: '456', status: 'initiated' } };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeCallOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'https://api.aircall.io/v1/calls',
        body: {
          to: '+1234567890',
          from: '+0987654321',
          user_id: 'user123',
        },
      })
    );
  });

  it('should handle errors gracefully when continueOnFail is true', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValue('getAllCalls');
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    const result = await executeCallOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
  });

  it('should throw error when continueOnFail is false', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValue('getAllCalls');
    mockExecuteFunctions.continueOnFail.mockReturnValue(false);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    await expect(executeCallOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('API Error');
  });
});

describe('User Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiId: 'test-api-id',
				apiToken: 'test-api-token',
				baseUrl: 'https://api.aircall.io/v1',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
			},
		};
	});

	it('should get all users successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getAllUsers')
			.mockReturnValueOnce(1)
			.mockReturnValueOnce(20)
			.mockReturnValueOnce('asc');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			users: [{ id: 1, email: 'test@example.com' }],
		});

		const result = await executeUserOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json).toEqual({
			users: [{ id: 1, email: 'test@example.com' }],
		});
	});

	it('should get a specific user successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getUser')
			.mockReturnValueOnce('123');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			user: { id: 123, email: 'test@example.com' },
		});

		const result = await executeUserOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.user.id).toBe(123);
	});

	it('should create a user successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('createUser')
			.mockReturnValueOnce('test@example.com')
			.mockReturnValueOnce('John')
			.mockReturnValueOnce('Doe')
			.mockReturnValueOnce('agent')
			.mockReturnValueOnce('+1234567890');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			user: { id: 123, email: 'test@example.com' },
		});

		const result = await executeUserOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.user).toBeDefined();
	});

	it('should handle errors when continueOnFail is true', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAllUsers');
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

		const result = await executeUserOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.error).toBe('API Error');
	});

	it('should throw error when continueOnFail is false', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAllUsers');
		mockExecuteFunctions.continueOnFail.mockReturnValue(false);
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

		await expect(executeUserOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('API Error');
	});

	it('should throw error for unknown operation', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('unknownOperation');

		await expect(executeUserOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('Unknown operation: unknownOperation');
	});
});

describe('Contact Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ apiKey: 'test-key', baseUrl: 'https://api.aircall.io/v1' }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { httpRequest: jest.fn(), requestWithAuthentication: jest.fn() },
    };
  });

  test('getAllContacts - success', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAllContacts');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce(1);
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce(20);
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('asc');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ contacts: [] });

    const result = await executeContactOperations.call(mockExecuteFunctions, [{ json: {} }]);
    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ contacts: [] });
  });

  test('getContact - success', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getContact');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('12345');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ contact: { id: '12345' } });

    const result = await executeContactOperations.call(mockExecuteFunctions, [{ json: {} }]);
    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ contact: { id: '12345' } });
  });

  test('createContact - success', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('createContact');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('John');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('Doe');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('Test contact');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ contact: { id: '12345', first_name: 'John' } });

    const result = await executeContactOperations.call(mockExecuteFunctions, [{ json: {} }]);
    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ contact: { id: '12345', first_name: 'John' } });
  });

  test('updateContact - success', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('updateContact');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('12345');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('Jane');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('Doe');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('Updated contact');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ contact: { id: '12345', first_name: 'Jane' } });

    const result = await executeContactOperations.call(mockExecuteFunctions, [{ json: {} }]);
    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ contact: { id: '12345', first_name: 'Jane' } });
  });

  test('deleteContact - success', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('deleteContact');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('12345');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ success: true });

    const result = await executeContactOperations.call(mockExecuteFunctions, [{ json: {} }]);
    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ success: true });
  });

  test('searchContacts - success', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('searchContacts');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('+1234567890');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('test@example.com');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('John');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('Doe');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ contacts: [{ id: '12345' }] });

    const result = await executeContactOperations.call(mockExecuteFunctions, [{ json: {} }]);
    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ contacts: [{ id: '12345' }] });
  });

  test('error handling', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getContact');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('12345');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeContactOperations.call(mockExecuteFunctions, [{ json: {} }]);
    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ error: 'API Error' });
  });
});

describe('Number Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key',
        baseUrl: 'https://api.aircall.io/v1'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn()
      },
    };
  });

  it('should get all numbers successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getAllNumbers')
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(20);

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      numbers: [{ id: 1, name: 'Test Number' }]
    });

    const result = await executeNumberOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ numbers: [{ id: 1, name: 'Test Number' }] });
  });

  it('should get a specific number successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getNumber')
      .mockReturnValueOnce('123');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      number: { id: 123, name: 'Specific Number' }
    });

    const result = await executeNumberOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ number: { id: 123, name: 'Specific Number' } });
  });

  it('should update a number successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('updateNumber')
      .mockReturnValueOnce('123')
      .mockReturnValueOnce('Updated Number')
      .mockReturnValueOnce('US')
      .mockReturnValueOnce('+12345678901')
      .mockReturnValueOnce('America/New_York');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      number: { id: 123, name: 'Updated Number' }
    });

    const result = await executeNumberOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ number: { id: 123, name: 'Updated Number' } });
  });

  it('should handle errors gracefully when continueOnFail is true', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAllNumbers');
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    const result = await executeNumberOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('API Error');
  });

  it('should throw error when continueOnFail is false', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAllNumbers');
    mockExecuteFunctions.continueOnFail.mockReturnValue(false);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    await expect(executeNumberOperations.call(mockExecuteFunctions, [{ json: {} }]))
      .rejects.toThrow('API Error');
  });
});

describe('Team Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiId: 'test-id',
        apiKey: 'test-key', 
        baseUrl: 'https://api.aircall.io/v1' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  describe('getAllTeams operation', () => {
    it('should retrieve all teams successfully', async () => {
      const mockTeams = { teams: [{ id: 1, name: 'Team 1' }] };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAllTeams')
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(20);
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockTeams);

      const result = await executeTeamOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockTeams, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.aircall.io/v1/teams',
        headers: { 'Authorization': expect.stringContaining('Basic ') },
        qs: { page: 1, per_page: 20 },
        json: true,
      });
    });

    it('should handle errors when retrieving teams', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAllTeams')
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(20);
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeTeamOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('getTeam operation', () => {
    it('should retrieve a specific team successfully', async () => {
      const mockTeam = { team: { id: 1, name: 'Team 1' } };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getTeam')
        .mockReturnValueOnce('1');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockTeam);

      const result = await executeTeamOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockTeam, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.aircall.io/v1/teams/1',
        headers: { 'Authorization': expect.stringContaining('Basic ') },
        json: true,
      });
    });
  });

  describe('createTeam operation', () => {
    it('should create a new team successfully', async () => {
      const mockTeam = { team: { id: 1, name: 'New Team' } };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createTeam')
        .mockReturnValueOnce('New Team')
        .mockReturnValueOnce('1,2,3');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockTeam);

      const result = await executeTeamOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockTeam, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.aircall.io/v1/teams',
        headers: { 
          'Authorization': expect.stringContaining('Basic '),
          'Content-Type': 'application/json'
        },
        body: { name: 'New Team', users: ['1', '2', '3'] },
        json: true,
      });
    });
  });

  describe('updateTeam operation', () => {
    it('should update a team successfully', async () => {
      const mockTeam = { team: { id: 1, name: 'Updated Team' } };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('updateTeam')
        .mockReturnValueOnce('1')
        .mockReturnValueOnce('Updated Team')
        .mockReturnValueOnce('1,2');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockTeam);

      const result = await executeTeamOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockTeam, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'PUT',
        url: 'https://api.aircall.io/v1/teams/1',
        headers: { 
          'Authorization': expect.stringContaining('Basic '),
          'Content-Type': 'application/json'
        },
        body: { name: 'Updated Team', users: ['1', '2'] },
        json: true,
      });
    });
  });

  describe('deleteTeam operation', () => {
    it('should delete a team successfully', async () => {
      const mockResponse = { message: 'Team deleted successfully' };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('deleteTeam')
        .mockReturnValueOnce('1');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTeamOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'DELETE',
        url: 'https://api.aircall.io/v1/teams/1',
        headers: { 'Authorization': expect.stringContaining('Basic ') },
        json: true,
      });
    });
  });
});

describe('Webhook Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({ 
				apiId: 'test-id', 
				apiToken: 'test-token',
				baseUrl: 'https://api.aircall.io/v1' 
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: { httpRequest: jest.fn(), requestWithAuthentication: jest.fn() },
		};
	});

	it('should get all webhooks successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getAllWebhooks')
			.mockReturnValueOnce(1)
			.mockReturnValueOnce(20);
		
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			webhooks: [{ id: 'webhook1', url: 'https://example.com/webhook' }]
		});

		const result = await executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json).toEqual({
			webhooks: [{ id: 'webhook1', url: 'https://example.com/webhook' }]
		});
	});

	it('should get a specific webhook successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getWebhook')
			.mockReturnValueOnce('webhook123');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			webhook: { id: 'webhook123', url: 'https://example.com/webhook', events: ['call.created'] }
		});

		const result = await executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.webhook.id).toBe('webhook123');
	});

	it('should create a webhook successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('createWebhook')
			.mockReturnValueOnce('https://example.com/webhook')
			.mockReturnValueOnce(['call.created', 'call.ended']);

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			webhook: { id: 'new-webhook', url: 'https://example.com/webhook', events: ['call.created', 'call.ended'] }
		});

		const result = await executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.webhook.url).toBe('https://example.com/webhook');
	});

	it('should reject non-HTTPS URLs when creating webhook', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('createWebhook')
			.mockReturnValueOnce('http://example.com/webhook')
			.mockReturnValueOnce(['call.created']);

		await expect(
			executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }])
		).rejects.toThrow('Webhook URL must be HTTPS');
	});

	it('should update a webhook successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('updateWebhook')
			.mockReturnValueOnce('webhook123')
			.mockReturnValueOnce('https://example.com/new-webhook')
			.mockReturnValueOnce(['call.created', 'call.answered']);

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			webhook: { id: 'webhook123', url: 'https://example.com/new-webhook', events: ['call.created', 'call.answered'] }
		});

		const result = await executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.webhook.url).toBe('https://example.com/new-webhook');
	});

	it('should delete a webhook successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('deleteWebhook')
			.mockReturnValueOnce('webhook123');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			message: 'Webhook deleted successfully'
		});

		const result = await executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.message).toBe('Webhook deleted successfully');
	});

	it('should handle API errors gracefully when continueOnFail is true', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAllWebhooks');
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

		const result = await executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.error).toBe('API Error');
	});

	it('should throw error for unknown operation', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('unknownOperation');

		await expect(
			executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }])
		).rejects.toThrow('Unknown operation: unknownOperation');
	});
});
});
