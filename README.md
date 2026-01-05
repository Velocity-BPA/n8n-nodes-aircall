# n8n-nodes-aircall

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Aircall, a cloud-based phone system for sales and support teams. This node provides full integration with Aircall's REST API, enabling workflow automation for call management, user administration, contact handling, SMS messaging, and analytics.

![n8n](https://img.shields.io/badge/n8n-community--node-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **Call Management**: Get, list, search, transfer, and manage calls with comments and tags
- **User Administration**: Create, update, and manage agents including availability status
- **Contact Sync**: Full CRUD operations for contacts with search capabilities
- **Team Management**: Create and manage teams with user assignments
- **Phone Numbers**: Configure phone number settings and retrieve SMS messages
- **Tags**: Organize calls with customizable tags
- **Webhooks**: Create and manage webhook subscriptions
- **SMS Messaging**: Send and retrieve SMS messages
- **Company Info**: Access company-level information
- **Integration Linking**: Link calls to external CRM records
- **Trigger Node**: Real-time webhook events for 27 different event types

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** > **Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-aircall`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the package
npm install n8n-nodes-aircall
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-aircall.git
cd n8n-nodes-aircall

# Install dependencies
npm install

# Build the project
npm run build

# Create symlink to n8n custom nodes directory
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-aircall

# Restart n8n
n8n start
```

## Credentials Setup

### Aircall API Credentials

| Field | Description |
|-------|-------------|
| **API ID** | Your Aircall API ID |
| **API Token** | Your Aircall API Token |

To obtain API credentials:

1. Log in to your Aircall Dashboard
2. Go to **Settings** > **Integrations** > **API Keys**
3. Create a new API key pair
4. Copy the API ID and API Token

## Resources & Operations

### Call Resource (11 operations)

| Operation | Description |
|-----------|-------------|
| Get | Get details of a specific call |
| Get All | List all calls with pagination |
| Search | Search calls with filters (direction, date range, tags) |
| Delete | Delete a call |
| Add Comment | Add a comment to a call |
| Add Tag | Add a tag to a call |
| Remove Tag | Remove a tag from a call |
| Link | Link a call to an external record |
| Transfer | Transfer a call to another user or number |
| Get Insights | Get AI-powered insights for a call |
| Get Recording | Get the recording URL for a call |

### User Resource (9 operations)

| Operation | Description |
|-----------|-------------|
| Create | Create a new user |
| Get | Get details of a specific user |
| Get All | List all users |
| Update | Update user information |
| Delete | Delete a user |
| Get Availability | Get user's current availability status |
| Set Availability | Set user's availability status |
| Start Outbound Call | Initiate an outbound call for a user |
| Dial Number | Dial a number from a user's phone |

### Number Resource (5 operations)

| Operation | Description |
|-----------|-------------|
| Get | Get details of a phone number |
| Get All | List all phone numbers |
| Update | Update phone number settings |
| Get Messages | Get SMS messages for a number |
| Get Music | Get hold music settings |

### Contact Resource (6 operations)

| Operation | Description |
|-----------|-------------|
| Create | Create a new contact |
| Get | Get details of a specific contact |
| Get All | List all contacts |
| Update | Update contact information |
| Delete | Delete a contact |
| Search | Search contacts by query, phone, or email |

### Team Resource (7 operations)

| Operation | Description |
|-----------|-------------|
| Create | Create a new team |
| Get | Get details of a specific team |
| Get All | List all teams |
| Update | Update team information |
| Delete | Delete a team |
| Add User | Add a user to a team |
| Remove User | Remove a user from a team |

### Tag Resource (5 operations)

| Operation | Description |
|-----------|-------------|
| Create | Create a new tag |
| Get | Get details of a specific tag |
| Get All | List all tags |
| Update | Update tag information |
| Delete | Delete a tag |

### Webhook Resource (5 operations)

| Operation | Description |
|-----------|-------------|
| Create | Create a new webhook subscription |
| Get | Get details of a webhook |
| Get All | List all webhooks |
| Update | Update webhook configuration |
| Delete | Delete a webhook |

### Message Resource (3 operations)

| Operation | Description |
|-----------|-------------|
| Send | Send an SMS message |
| Get | Get details of a message |
| Get All | List all messages |

### Company Resource (1 operation)

| Operation | Description |
|-----------|-------------|
| Get | Get company information (read-only) |

### Integration Resource (3 operations)

| Operation | Description |
|-----------|-------------|
| Get All | List all integrations |
| Link | Link a call to an external record |
| Unlink | Unlink a call from an external record |

## Trigger Node

The Aircall Trigger node listens for real-time webhook events from Aircall.

### Available Events (27 total)

**Call Events:**
- call.created, call.ringing_on_agent, call.agent_declined, call.answered
- call.transferred, call.unsuccessful_transfer, call.ended, call.voicemail_left
- call.assigned, call.archived, call.tagged, call.untagged, call.commented

**Contact Events:**
- contact.created, contact.updated, contact.deleted

**User Events:**
- user.created, user.opened, user.closed, user.deleted
- user.connected, user.disconnected

**Number Events:**
- number.created, number.opened, number.closed, number.deleted

**Message Events:**
- message.created

## Usage Examples

### Example 1: Log Missed Calls to Spreadsheet

```
Aircall Trigger (call.ended) 
  → IF (status = "missed") 
    → Google Sheets (Append Row)
```

### Example 2: Sync Contacts to CRM

```
Aircall (Contact: Get All) 
  → Loop Over Items 
    → HubSpot (Create/Update Contact)
```

### Example 3: Send SMS Notification

```
Webhook Trigger 
  → Aircall (Message: Send)
    → Set number_id, to, content
```

### Example 4: Agent Availability Dashboard

```
Schedule Trigger (Every 5 min) 
  → Aircall (User: Get All) 
    → Aircall (User: Get Availability) 
      → Slack (Post Message)
```

## Aircall Concepts

### Call Direction
- **inbound**: Calls received by your team
- **outbound**: Calls made by your team

### Call Status
- **answered**: Call was answered
- **missed**: Call was not answered
- **voicemail**: Caller left a voicemail

### User Availability
- **available**: Ready to take calls
- **custom**: Custom availability message
- **do_not_disturb**: Not accepting calls

### Integration Link Types
- Contact, Lead, Account, Opportunity
- Ticket, Case, Deal, Custom

## Error Handling

The node provides detailed error messages for common scenarios:

| Error | Description | Solution |
|-------|-------------|----------|
| 401 Unauthorized | Invalid API credentials | Check API ID and Token |
| 403 Forbidden | Insufficient permissions | Verify API key permissions |
| 404 Not Found | Resource not found | Check resource ID |
| 429 Too Many Requests | Rate limit exceeded | Reduce request frequency |

## Security Best Practices

1. **Secure Credentials**: Store API credentials securely using n8n's credential system
2. **Webhook Verification**: Use webhook tokens to verify incoming requests
3. **Least Privilege**: Create API keys with minimal required permissions
4. **Audit Logs**: Monitor API usage through Aircall dashboard
5. **Data Handling**: Be mindful of call recordings and personal data

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)
- Email: licensing@velobpa.com

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **Documentation**: [Aircall API Docs](https://developer.aircall.io/)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-aircall/issues)
- **n8n Community**: [n8n Community Forum](https://community.n8n.io/)

## Acknowledgments

- [Aircall](https://aircall.io/) for their comprehensive API
- [n8n](https://n8n.io/) for the workflow automation platform
- The n8n community for inspiration and support
