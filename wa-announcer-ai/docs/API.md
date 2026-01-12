# 📖 REST API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

### JWT Token (untuk User endpoints)
```
Authorization: Bearer <jwt_token>
```

### API Key (untuk Webhook/External endpoints)
```
x-api-key: <api_key>
```

---

## 🔐 Auth Endpoints

### 1. Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password",
  "phone": "62812345678",
  "organization": "PT. Contoh"
}
```

**Response (201)**
```json
{
  "success": true,
  "userId": "uuid-xxx",
  "message": "Registrasi berhasil"
}
```

---

### 2. Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure_password"
}
```

**Response (200)**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid-xxx",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "organization": "PT. Contoh"
  }
}
```

---

### 3. Refresh Token
```http
POST /auth/refresh
Authorization: Bearer <old_token>
Content-Type: application/json

{
  "token": "<old_jwt_token>"
}
```

**Response (200)**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### 4. Create API Key
```http
POST /auth/api-key
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "My App Integration"
}
```

**Response (201)**
```json
{
  "success": true,
  "keyId": "key-uuid-xxx",
  "apiKey": "sk_live_xxxxxxxxxxxxxxxx",
  "name": "My App Integration",
  "expiresAt": "2027-01-12T12:00:00.000Z"
}
```

---

## 📢 Announcement Endpoints

### 1. Format Pengumuman
```http
POST /announcements/format
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "text": "ada acara camping minggu depan jam 8 pagi di gunung bromo dipandu pak budi",
  "provider": "openai"
}
```

**Response (200)**
```json
{
  "success": true,
  "announcementId": "ann-uuid-xxx",
  "formattedContent": "📢 *PENGUMUMAN*\n\nAssalamu'alaikum...",
  "provider": "openai",
  "timeTaken": 1234
}
```

---

### 2. Validate Pengumuman
```http
POST /announcements/validate
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "content": "📢 *PENGUMUMAN*\n\nAssalamu'alaikum...",
  "provider": "openai"
}
```

**Response (200)**
```json
{
  "success": true,
  "valid": true,
  "feedback": "✅ APPROVED",
  "provider": "openai"
}
```

---

### 3. List Pengumuman
```http
GET /announcements?limit=50&offset=0
Authorization: Bearer <jwt_token>
```

**Response (200)**
```json
{
  "success": true,
  "count": 15,
  "announcements": [
    {
      "id": "ann-xxx",
      "user_id": "user-xxx",
      "original_input": "ada rapat besok...",
      "formatted_content": "📢 *PENGUMUMAN*...",
      "status": "draft",
      "created_at": "2026-01-12T10:30:00Z",
      "sent_at": null
    }
  ]
}
```

---

### 4. Get Pengumuman Detail
```http
GET /announcements/{announcementId}
Authorization: Bearer <jwt_token>
```

**Response (200)**
```json
{
  "success": true,
  "announcement": {
    "id": "ann-xxx",
    "user_id": "user-xxx",
    "original_input": "...",
    "formatted_content": "...",
    "activity_name": "Camping",
    "event_date": "2026-01-15",
    "location": "Gunung Bromo",
    "coordinator": "Bapak Budi",
    "status": "sent",
    "created_at": "2026-01-12T10:30:00Z",
    "sent_at": "2026-01-12T11:00:00Z"
  },
  "history": [
    {
      "id": "hist-xxx",
      "announcement_id": "ann-xxx",
      "target_type": "group",
      "target_id": "group-xxx",
      "target_name": "Komunitas Camping",
      "status": "sent",
      "sent_at": "2026-01-12T11:00:00Z"
    }
  ],
  "stats": {
    "total": 1,
    "sent": 1,
    "failed": 0,
    "pending": 0
  }
}
```

---

### 5. Send Pengumuman
```http
POST /announcements/{announcementId}/send
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "targetType": "group",
  "targetId": "120363123456789-1234567890@g.us",
  "targetName": "Komunitas Camping"
}
```

**Response (200)**
```json
{
  "success": true,
  "groupId": "120363123456789-1234567890@g.us",
  "groupName": "Komunitas Camping",
  "messageLength": 342,
  "timestamp": "2026-01-12T11:00:00Z"
}
```

---

### 6. Delete Pengumuman
```http
DELETE /announcements/{announcementId}
Authorization: Bearer <jwt_token>
```

**Response (200)**
```json
{
  "success": true,
  "message": "Pengumuman dihapus"
}
```

---

## 📝 Template Endpoints

### 1. List Templates
```http
GET /templates
Authorization: Bearer <jwt_token>
```

**Response (200)**
```json
{
  "success": true,
  "count": 5,
  "templates": [
    {
      "id": "tpl-xxx",
      "user_id": "user-xxx",
      "name": "Rapat Rutin",
      "description": "Template untuk rapat rutin mingguan",
      "category": "meeting",
      "usage_count": 12,
      "is_favorite": 1,
      "created_at": "2026-01-01T10:00:00Z"
    }
  ]
}
```

---

### 2. Create Template
```http
POST /templates
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Rapat Rutin",
  "description": "Template untuk rapat rutin mingguan",
  "content": "📢 *PENGUMUMAN*\n\nAssalamu'alaikum...",
  "category": "meeting"
}
```

**Response (201)**
```json
{
  "success": true,
  "templateId": "tpl-uuid-xxx",
  "message": "Template berhasil disimpan"
}
```

---

### 3. Get Template
```http
GET /templates/{templateId}
Authorization: Bearer <jwt_token>
```

**Response (200)**
```json
{
  "success": true,
  "template": {
    "id": "tpl-xxx",
    "user_id": "user-xxx",
    "name": "Rapat Rutin",
    "content": "📢 *PENGUMUMAN*...",
    "category": "meeting",
    "usage_count": 12,
    "created_at": "2026-01-01T10:00:00Z"
  }
}
```

---

### 4. Update Template
```http
PUT /templates/{templateId}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Rapat Rutin Updated",
  "content": "📢 *PENGUMUMAN*\n\nAssalamu'alaikum...",
  "is_favorite": 1
}
```

**Response (200)**
```json
{
  "success": true,
  "message": "Template berhasil diupdate"
}
```

---

### 5. Delete Template
```http
DELETE /templates/{templateId}
Authorization: Bearer <jwt_token>
```

**Response (200)**
```json
{
  "success": true,
  "message": "Template dihapus"
}
```

---

## 🤖 Bot Status Endpoints

### 1. Get Bot Status
```http
GET /bot/status
Authorization: Bearer <jwt_token>
```

**Response (200)**
```json
{
  "success": true,
  "bot": {
    "ready": true,
    "hasQR": false,
    "qrCode": null
  },
  "whatsapp": {
    "ready": true,
    "chats": 25,
    "groups": 5,
    "contacts": 20
  },
  "ai": {
    "available": true,
    "message": "OpenAI API available"
  },
  "timestamp": "2026-01-12T12:00:00Z"
}
```

---

### 2. Get QR Code
```http
GET /bot/qr
Authorization: Bearer <jwt_token>
```

**Response (200)**
```json
{
  "success": true,
  "qrCode": "data:image/png;base64,iVBORw0KGgo...",
  "message": "Scan QR code dengan WhatsApp"
}
```

---

### 3. List Groups
```http
GET /bot/groups
Authorization: Bearer <jwt_token>
```

**Response (200)**
```json
{
  "success": true,
  "count": 5,
  "groups": [
    {
      "id": "120363123456789-1234567890@g.us",
      "name": "Komunitas Camping",
      "membersCount": 25,
      "isArchived": false
    }
  ]
}
```

---

### 4. List Contacts
```http
GET /bot/contacts
Authorization: Bearer <jwt_token>
```

**Response (200)**
```json
{
  "success": true,
  "count": 20,
  "contacts": [
    {
      "id": "62812345678@c.us",
      "name": "Bapak Budi",
      "phone": "62812345678",
      "isBlocked": false
    }
  ]
}
```

---

## 🔗 Webhook Endpoints

### 1. Send via Webhook
```http
POST /webhook/send
x-api-key: <api_key>
Content-Type: application/json

{
  "text": "ada acara camping minggu depan...",
  "targetType": "group",
  "targetId": "120363123456789-1234567890@g.us",
  "targetName": "Komunitas Camping"
}
```

**Response (200)**
```json
{
  "success": true,
  "announcementId": "ann-xxx",
  "groupId": "120363123456789-1234567890@g.us",
  "groupName": "Komunitas Camping",
  "messageLength": 342,
  "timestamp": "2026-01-12T12:00:00Z"
}
```

---

### 2. Broadcast via Webhook
```http
POST /webhook/broadcast
x-api-key: <api_key>
Content-Type: application/json

{
  "text": "ada acara camping minggu depan...",
  "recipients": [
    {
      "name": "Bapak Budi",
      "phone": "62812345678"
    },
    {
      "name": "Ibu Ani",
      "phone": "62887654321"
    }
  ]
}
```

**Response (200)**
```json
{
  "success": true,
  "announcementId": "ann-xxx",
  "total": 2,
  "sent": 2,
  "failed": 0,
  "results": [
    {
      "success": true,
      "recipient": "Bapak Budi",
      "timestamp": "2026-01-12T12:00:00Z"
    },
    {
      "success": true,
      "recipient": "Ibu Ani",
      "timestamp": "2026-01-12T12:00:30Z"
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Field 'email' wajib diisi"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Token tidak ditemukan"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Akses ditolak"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Pengumuman tidak ditemukan"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Terlalu banyak request. Coba lagi nanti."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Terjadi error di server"
}
```

---

## Rate Limiting

- **Limit**: 100 requests per 15 minutes
- **Per User**: ID dari JWT token atau IP address
- **Headers**: 
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: 95
  - `X-RateLimit-Reset`: 1234567890

---

## Best Practices

1. **Always use HTTPS** in production
2. **Store tokens securely** in httpOnly cookies or secure storage
3. **Rotate API keys** regularly
4. **Handle rate limits** gracefully with exponential backoff
5. **Validate input** before sending
6. **Log errors** for debugging
7. **Use pagination** for large result sets

---

**API Version**: 1.0.0  
**Last Updated**: 2026-01-12
