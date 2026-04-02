# n8n-nodes-aircall

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides comprehensive integration with Aircall's cloud-based phone system platform. Supporting 6 core resources (Call, User, Contact, Number, Team, Webhook), it enables automation of call center operations, contact management, team coordination, and real-time call data processing within your n8n workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Aircall API](https://img.shields.io/badge/Aircall-API%20v1-green)
![Call Center](https://img.shields.io/badge/Call%20Center-Automation-orange)
![Webhooks](https://img.shields.io/badge/Webhooks-Supported-purple)

## Features

- **Call Management** - Retrieve call records, initiate outbound calls, and access call analytics
- **Contact Operations** - Create, update, delete, and search contacts with custom properties
- **User Administration** - Manage team members, roles, and user configurations
- **Number Management** - Handle phone numbers, configure routing, and manage availability
- **Team Coordination** - Organize users into teams and manage team-based call routing
- **Webhook Integration** - Real-time event notifications for calls, contacts, and user activities
- **Comprehensive Filtering** - Advanced search and filtering across all resources
- **Bulk Operations** - Efficient batch processing for large datasets

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-aircall`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-aircall
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-aircall.git
cd n8n-nodes-aircall
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-aircall
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API ID | Your Aircall API ID from the Aircall Dashboard | Yes |
| API Token | Your Aircall API Token from the Aircall Dashboard | Yes |
| Environment | Select Production or Sandbox environment | Yes |

## Resources & Operations

### 1. Call

| Operation | Description |
|-----------|-------------|
| Get | Retrieve a specific call record by ID |
| Get Many | List calls with filtering options |
| Create | Initiate an outbound call |
| Update | Modify call properties and add notes |
| Delete | Remove a call record |

### 2. User

| Operation | Description |
|-----------|-------------|
| Get | Retrieve user details by ID |
| Get Many | List all users with filtering |
| Create | Add new team member |
| Update | Modify user profile and settings |
| Delete | Remove user from account |

### 3. Contact

| Operation | Description |
|-----------|-------------|
| Get | Retrieve contact information by ID |
| Get Many | Search and list contacts |
| Create | Add new contact with custom fields |
| Update | Modify contact details |
| Delete | Remove contact from database |

### 4. Number

| Operation | Description |
|-----------|-------------|
| Get | Retrieve phone number configuration |
| Get Many | List all configured numbers |
| Create | Add new phone number |
| Update | Modify number settings and routing |
| Delete | Remove phone number |

### 5. Team

| Operation | Description |
|-----------|-------------|
| Get | Retrieve team details and members |
| Get Many | List all teams |
| Create | Create new team |
| Update | Modify team configuration |
| Delete | Remove team |

### 6. Webhook

| Operation | Description |
|-----------|-------------|
| Get | Retrieve webhook configuration |
| Get Many | List all webhooks |
| Create | Register new webhook endpoint |
| Update | Modify webhook settings |
| Delete | Remove webhook subscription |

## Usage Examples

```javascript
// Create a new contact
{
  "first_name": "John",
  "last_name": "Doe",
  "phone_numbers": [
    {
      "label": "Work",
      "value": "+1234567890"
    }
  ],
  "emails": [
    {
      "label": "Work",
      "value": "john.doe@company.com"
    }
  ]
}
```

```javascript
// Initiate an outbound call
{
  "to": "+1234567890",
  "from": "+1987654321",
  "user_id": 123456,
  "automatic_recording": true
}
```

```javascript
// Create webhook for call events
{
  "url": "https://your-webhook-endpoint.com/aircall",
  "events": ["call.created", "call.ended", "call.answered"],
  "active": true
}
```

```javascript
// Search calls with filters
{
  "from": "2024-01-01T00:00:00Z",
  "to": "2024-01-31T23:59:59Z",
  "direction": "inbound",
  "user_id": 123456,
  "per_page": 50
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| 401 Unauthorized | Invalid API credentials | Verify API ID and Token in credentials |
| 403 Forbidden | Insufficient permissions | Check user permissions in Aircall dashboard |
| 404 Not Found | Resource doesn't exist | Verify the ID of the resource being accessed |
| 422 Validation Error | Invalid request parameters | Check required fields and data formats |
| 429 Rate Limited | Too many requests | Implement delays between requests |
| 500 Server Error | Aircall service issue | Retry request or check Aircall status page |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-aircall/issues)
- **Aircall API Documentation**: [Aircall Developer Hub](https://developer.aircall.io/)
- **Aircall Community**: [Aircall Help Center](https://help.aircall.io/)