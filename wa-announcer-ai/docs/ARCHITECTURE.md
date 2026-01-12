# 📢 WhatsApp AI Announcement Bot - System Architecture

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Interface Layer                          │
│  ┌─────────────────────┬─────────────────────┬──────────────┐  │
│  │   Web Dashboard     │   Mobile App        │  WhatsApp    │  │
│  │   (React + Vite)    │   (React Native)    │   Direct     │  │
│  └────────┬────────────┴────────┬────────────┴──────┬───────┘  │
└───────────┼────────────────────┼───────────────────┼─────────────
            │                    │                   │
            │ REST API           │ Webhook API       │ Message
            │ (JWT Auth)         │ (API Key Auth)    │ (Direct)
            │                    │                   │
┌───────────▼────────────────────▼───────────────────▼─────────────┐
│                    API Gateway Layer                              │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  Express.js Server (Port 3000)                              ││
│  │  - JWT Authentication                                        ││
│  │  - Rate Limiting (100 req/15 min)                           ││
│  │  - CORS + Helmet Security                                   ││
│  │  - Request Logging (Pino)                                   ││
│  │  - Error Handling                                           ││
│  └──────────────────────────────────────────────────────────────┘│
│     ┌──────────┬──────────┬──────────┬──────────┬────────────┐   │
│     │ Auth     │ Announce │ Template │ Bot      │ Webhook    │   │
│     │ Routes   │ Routes   │ Routes   │ Routes   │ Routes     │   │
│     └──────────┴──────────┴──────────┴──────────┴────────────┘   │
└─────────┼──────────┬──────────┬──────────┬──────────┬────────────┘
          │          │          │          │          │
┌─────────▼──────────▼──────────▼──────────▼──────────▼────────────┐
│                    Service Layer                                 │
│  ┌─────────────────┬─────────────────┬────────────────────────┐ │
│  │ AI Service      │ Send Service    │ Auth Service           │ │
│  │                 │                 │                        │ │
│  │ - OpenAI        │ - Group Send    │ - User Registration   │ │
│  │ - Ollama Local  │ - Personal Send │ - JWT Generation      │ │
│  │ - Format Prompt │ - Broadcast     │ - API Key Management  │ │
│  │ - Validation    │ - History Track │ - Token Verification  │ │
│  │ - Extraction    │                 │                        │ │
│  └─────────────────┴─────────────────┴────────────────────────┘ │
└─────────┬──────────┬──────────────────┬──────────────────────────┘
          │          │                  │
          │    ┌─────▼──────┐           │
          │    │  WhatsApp  │           │
          │    │  Bot Core  │           │
          │    │  (WWeb.js) │           │
          │    └──────┬─────┘           │
          │           │                 │
┌─────────▼───────────▼─────────────────▼─────────────────────────┐
│                    Data Layer                                   │
│  ┌──────────────────────────────────┐                          │
│  │  SQLite3 Database                │                          │
│  │  ├─ Users & Authentication       │                          │
│  │  ├─ Announcements & History      │                          │
│  │  ├─ Templates                    │                          │
│  │  ├─ Broadcasts & Recipients      │                          │
│  │  ├─ WhatsApp Groups & Contacts   │                          │
│  │  ├─ API Keys                     │                          │
│  │  └─ Audit Logs                   │                          │
│  └──────────────────────────────────┘                          │
│  ┌──────────────────────────────────┐                          │
│  │  Session Storage                 │                          │
│  │  ├─ WhatsApp Session             │                          │
│  │  ├─ Auth Tokens                  │                          │
│  │  └─ Cache                        │                          │
│  └──────────────────────────────────┘                          │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                  External Services                             │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │  OpenAI / GPT    │         │  Ollama Local    │            │
│  │  (Cloud LLM)     │         │  (Private LLM)   │            │
│  └──────────────────┘         └──────────────────┘            │
└────────────────────────────────────────────────────────────────┘
```

## 📂 Project Structure

```
wa-announcer-ai/
├── src/
│   ├── index.js                 # Main entry point
│   ├── api/
│   │   ├── server.js            # Express app setup
│   │   └── routes/
│   │       ├── auth.routes.js
│   │       ├── announcements.routes.js
│   │       ├── templates.routes.js
│   │       ├── bot.routes.js
│   │       └── webhook.routes.js
│   ├── bot/
│   │   └── whatsapp.js          # WhatsApp bot core
│   ├── services/
│   │   ├── ai.service.js        # AI formatting & validation
│   │   ├── send.service.js      # Send to groups/personal/broadcast
│   │   └── auth.service.js      # User & token management
│   ├── db/
│   │   ├── database.js          # SQLite wrapper & CRUD
│   │   └── schema.sql           # Database schema
│   ├── prompts/
│   │   └── announcement.prompt.js # AI prompts for formatting
│   ├── middleware/
│   │   └── auth.middleware.js   # JWT, API key, rate limit
│   └── utils/
│       ├── logger.js            # Pino logging
│       ├── crypto.js            # Encryption & hashing
│       └── helpers.js           # Utility functions
├── web/                         # React Dashboard (to be created)
├── config/                      # Configuration files
├── docs/                        # Documentation
├── sessions/                    # WhatsApp session storage
├── logs/                        # Application logs
├── data/                        # SQLite database
├── .env.example                 # Environment template
├── package.json
├── README.md
└── .gitignore
```

## 🔄 Data Flow Diagram

### 1. **Message Format Flow**

```
User Input (mentah)
    ↓
Parse Command (/buat)
    ↓
Extract AI Service
    ↓
Format with OpenAI/Ollama
    ↓
Validate Announcement
    ↓
Save to Database
    ↓
Send Preview to User
```

### 2. **Send to Group Flow**

```
User Command (/kirimgrup)
    ↓
Find Target Group
    ↓
Get Announcement from DB
    ↓
Validate Message Length
    ↓
Send via WhatsApp Client
    ↓
Record to History
    ↓
Update Announcement Status
    ↓
Return Result to User
```

### 3. **Broadcast Flow**

```
API Request (REST/Webhook)
    ↓
Format if needed
    ↓
Save Announcement
    ↓
Create Broadcast Record
    ↓
Loop through Recipients:
    ├─ Send to Personal
    ├─ Record to History
    ├─ Update Status
    └─ Delay 500ms
    ↓
Update Broadcast Status
    ↓
Return Results
```

## 🔐 Security Architecture

```
┌────────────────────────────────────┐
│      Request Entry Point           │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│   Authentication Check             │
│  ├─ JWT Token (Bearer)             │
│  ├─ API Key (x-api-key header)     │
│  └─ WebSocket Auth                 │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│   Authorization Check              │
│  ├─ User Role Validation           │
│  ├─ Resource Ownership             │
│  └─ Permission Check               │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│   Rate Limiting Check              │
│  ├─ Per-user limit                 │
│  ├─ Per-IP limit                   │
│  └─ Sliding window (15 min)        │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│   Input Validation                 │
│  ├─ Schema validation              │
│  ├─ XSS prevention                 │
│  └─ SQL injection prevention       │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│   Request Processing               │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│   Response Encryption              │
│  ├─ HTTPS/TLS                      │
│  └─ Sensitive data masking         │
└────────────────────────────────────┘
```

## 📊 Database Schema Relationships

```
users
├─ announcements (1-to-many)
│  └─ announcement_history (1-to-many)
├─ templates (1-to-many)
├─ broadcasts (1-to-many)
│  └─ broadcast_recipients (1-to-many)
├─ api_keys (1-to-many)
└─ audit_logs (1-to-many)

whatsapp_groups (lookup)
whatsapp_contacts (lookup)
settings (user-specific config)
```

## 🔄 Message Processing Pipeline

```
Message Input
    ↓
[Format with AI]
    ├─ Extract structure (kegiatan, tanggal, dll)
    ├─ Generate professional format
    └─ Validate output
    ↓
[Store in Database]
    ├─ Original input
    ├─ Formatted output
    ├─ AI provider used
    └─ Processing time
    ↓
[Send Operation]
    ├─ Get target (group/personal)
    ├─ Validate recipient exists
    ├─ Send message
    ├─ Record delivery status
    └─ Log to history
    ↓
[Response to User]
    ├─ Success confirmation
    ├─ Delivery status
    ├─ Timing info
    └─ History link
```

## 🎯 API Request/Response Flow

```
Request:
  ↓
[Express Middleware Chain]
  ├─ requestLogger
  ├─ helmet (security headers)
  ├─ cors (cross-origin)
  ├─ body parser
  ├─ rate limiter
  ├─ authenticate (JWT/API Key)
  └─ authorize (if needed)
  ↓
[Route Handler]
  ├─ Input validation
  ├─ Business logic
  ├─ Database operations
  └─ Service calls
  ↓
[Response]
  ├─ Status code
  ├─ JSON data
  └─ Headers (security)
  ↓
[Error Handler]
  ├─ Catch errors
  ├─ Log errors
  └─ Return safe error response
```

## 🚀 Deployment Targets

### Development
- Local machine with Node.js + Chromium
- SQLite for data storage
- Console logging

### Production (VPS)
- Ubuntu/Debian server
- PM2/Systemd for process management
- SQLite or PostgreSQL
- Nginx as reverse proxy
- SSL/TLS with Let's Encrypt

### Mobile (Termux)
- Android with Termux app
- Node.js in Termux environment
- SQLite storage
- Running as background service

### Docker
- containerized application
- Volume mounting for persistence
- Network configuration
- Environment-based config

## 📈 Performance Considerations

- **Message Queue**: Consider Bull/Redis for large broadcasts
- **Caching**: Redis for frequently accessed data
- **Database**: Index on user_id, created_at, status
- **Rate Limiting**: Prevent abuse
- **Message Limits**: WhatsApp max 4096 chars
- **Batch Operations**: Group multiple sends

## 🔌 Extension Points

1. **AI Providers**: Add Anthropic, Hugging Face, local models
2. **Messaging Platforms**: Telegram, Signal, Discord
3. **Storage**: PostgreSQL, MongoDB for scale-up
4. **Auth**: OAuth2, SAML for enterprise
5. **Notifications**: Email, SMS alerts
6. **Analytics**: Data warehouse integration

---

**Design Philosophy**: Simple, secure, scalable, and easy to deploy.
