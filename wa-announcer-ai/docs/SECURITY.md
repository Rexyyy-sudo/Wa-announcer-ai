# 🔐 Security & Best Practices Guide

## 🛡️ Security Features Built-in

### 1. Authentication & Authorization
- **JWT Tokens**: Secure bearer token authentication
- **API Keys**: For external integrations
- **Role-based Access Control**: User roles (user, admin)
- **Token Expiration**: 7 days by default
- **Refresh Tokens**: Renew without re-login

### 2. Data Protection
- **AES-256 Encryption**: Sensitive data encryption
- **Bcrypt Hashing**: Password hashing (SHA-256)
- **HTTPS/TLS**: Enforced in production
- **Database**: SQLite with WAL mode for concurrency

### 3. API Security
- **Rate Limiting**: 100 requests/15 minutes per user
- **CORS**: Whitelist allowed origins
- **Helmet.js**: Security headers (CSP, HSTS, etc)
- **Input Validation**: Schema-based validation
- **XSS Prevention**: Sanitized output

### 4. WhatsApp Security
- **Session Encryption**: Session data encrypted
- **Token Masking**: API keys hidden in logs
- **Session Isolation**: Per-user session storage
- **Auto-cleanup**: Expired sessions deleted

---

## ⚙️ Security Configuration

### .env Security

```env
# Strong JWT Secret (min 32 chars)
JWT_SECRET=your_very_long_random_secret_min_32_characters_!@#$%

# Strong Encryption Key (exactly 32 chars)
ENCRYPTION_KEY=01234567890123456789012345678901

# Strong API Key
API_KEY=your_random_api_key_at_least_32_chars

# Admin Password (will be hashed)
ADMIN_PASSWORD=strong_password_mix_case_numbers_symbols

# Only allow trusted origins
ALLOW_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Secure HTTPS in production
NODE_ENV=production

# Log level - info or warn in production
LOG_LEVEL=info
```

### Generate Secure Keys

```bash
# OpenSSL (Linux/Mac)
openssl rand -hex 16  # Generate random hex 32 chars
openssl rand -base64 32  # Generate random base64

# Python
python3 -c "import secrets; print(secrets.token_hex(16))"
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🔑 API Key Management

### Create API Key (via API)

```bash
curl -X POST http://localhost:3000/api/auth/api-key \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"My App Integration"}'
```

### Use API Key

```bash
curl -X POST http://localhost:3000/api/webhook/send \
  -H "x-api-key: sk_live_xxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### Rotate API Keys

1. Create new API key
2. Update in external system
3. Revoke old key (via DB or admin panel)
4. Monitor logs for old key attempts

---

## 🔒 WhatsApp Session Security

### Session Storage

Session files stored in `./sessions/` (encrypted in future versions):
- `Default/` - Main session data
- Don't share or commit to Git

### Session Protection

```bash
# Add to .gitignore
echo "sessions/" >> .gitignore
echo "data/" >> .gitignore
echo ".env" >> .gitignore
echo "logs/" >> .gitignore
```

### Session Backup

```bash
# Regular backup
tar czf backups/session-$(date +%Y%m%d).tar.gz sessions/

# Restore
tar xzf backups/session-YYYYMMDD.tar.gz
```

---

## 🌐 HTTPS/TLS Setup

### Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Auto-renew
sudo certbot renew --dry-run
```

### Nginx SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL best practices
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000" always;
    
    # CORS
    add_header "Access-Control-Allow-Origin" "$http_origin" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 🔐 User Credential Security

### Password Requirements

Enforce in frontend:
- Minimum 8 characters
- Mix of uppercase, lowercase, numbers
- At least 1 special character
- Not common dictionary words

### Password Hashing

Backend uses SHA-256 (current) → Upgrade to Argon2:

```javascript
import argon2 from 'argon2';

// Hash
const hash = await argon2.hash(password, {
  type: argon2.argon2i,
  memoryCost: 2 ** 16
});

// Verify
const valid = await argon2.verify(hash, password);
```

### Password Reset

```javascript
// Generate reset token
const resetToken = crypto.randomBytes(32).toString('hex');
const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest();

// Store hash with expiration (1 hour)
// Send token in email link
// Verify token before allowing reset
```

---

## 🛡️ SQL Injection Prevention

### Current Implementation (Safe)

Using parameterized queries:
```javascript
// SAFE - uses prepared statements
db.run('SELECT * FROM users WHERE email = ?', [email]);

// UNSAFE - string concatenation
db.run(`SELECT * FROM users WHERE email = '${email}'`);
```

### Always Use Parameter Binding

```javascript
// ✅ GOOD
await db.run('INSERT INTO users VALUES (?, ?, ?)', [id, name, email]);

// ❌ BAD
await db.run(`INSERT INTO users VALUES ('${id}', '${name}', '${email}')`);
```

---

## 🌐 CORS Security

### Whitelist Origins

```env
ALLOW_ORIGINS=https://yourdomain.com,https://app.yourdomain.com,http://localhost:3001
```

### CORS Middleware

```javascript
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOW_ORIGINS.split(',');
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));
```

---

## 📝 Audit Logging

### What Gets Logged

- User login/logout
- API key creation/revocation
- Announcement creation/sending
- Template modifications
- Failed authentication attempts
- Rate limit violations

### View Logs

```bash
# All logs
cat logs/*.log

# Search for errors
grep "ERROR" logs/*.log

# Real-time monitoring
tail -f logs/app-*.log
```

### Secure Log Storage

```bash
# Restrict permissions
chmod 600 logs/*.log
chown appuser:appuser logs/

# Rotate logs
# Using logrotate in /etc/logrotate.d/wa-announcer
```

---

## 🔄 Backup & Disaster Recovery

### Database Backup

```bash
# Daily backup
sqlite3 data/announcer.db ".backup data_backup_$(date +%Y%m%d).db"

# Automated backup (Crontab)
0 2 * * * sqlite3 /path/to/announcer.db ".backup /path/to/backup_$(date +\%Y\%m\%d).db"
```

### Session Backup

```bash
# Before important changes
tar czf sessions_backup_$(date +%Y%m%d).tar.gz sessions/
```

### Restore from Backup

```bash
# Database
sqlite3 data/announcer.db ".restore data_backup_20260101.db"

# Sessions
tar xzf sessions_backup_20260101.tar.gz -C sessions/
```

---

## ⚠️ Common Vulnerabilities & Fixes

### 1. Weak Credentials
**Risk**: Account takeover  
**Fix**: Enforce strong passwords, 2FA

```javascript
// Implement 2FA
router.post('/auth/2fa/setup', async (req, res) => {
  const secret = speakeasy.generateSecret();
  // Save secret to DB
  res.json({ qrCode: secret.qr_code_url });
});
```

### 2. Exposed Secrets
**Risk**: API key leaks  
**Fix**: Use environment variables, never commit secrets

```bash
# .gitignore
.env
.env.local
sessions/
data/
logs/
*.log
```

### 3. Unvalidated Redirects
**Risk**: Phishing attacks  
**Fix**: Whitelist redirect URLs

```javascript
const allowedRedirects = ['yourdomain.com', 'app.yourdomain.com'];
if (allowedRedirects.includes(redirect)) {
  res.redirect(redirect);
}
```

### 4. Missing Rate Limiting
**Risk**: Brute force, DDoS  
**Fix**: Implement rate limiting

```javascript
app.use('/api/auth/login', limiter);
// 5 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Terlalu banyak login attempt. Coba lagi dalam 15 menit.'
});
```

### 5. No Input Validation
**Risk**: Injection attacks  
**Fix**: Validate all inputs

```javascript
const schema = {
  required: ['text', 'targetType'],
  text: { type: 'string', maxLength: 4000 },
  targetType: { enum: ['group', 'personal', 'broadcast'] }
};

app.post('/announce', validate(schema), handler);
```

---

## 🔍 Security Checklist

### Before Production Deployment

- [ ] All secrets in .env (not in code)
- [ ] .env file in .gitignore
- [ ] HTTPS enabled (Let's Encrypt)
- [ ] JWT_SECRET changed (32+ random chars)
- [ ] ENCRYPTION_KEY changed
- [ ] API_KEY changed
- [ ] ADMIN_PASSWORD strong
- [ ] Database backed up
- [ ] Sessions backed up
- [ ] Nginx SSL configured
- [ ] CORS origins whitelisted
- [ ] Rate limiting enabled
- [ ] Logging enabled
- [ ] Firewall configured (allow only ports 80, 443)
- [ ] SSH key-based auth only (no password)
- [ ] Regular security updates

### Ongoing

- [ ] Monitor logs daily for anomalies
- [ ] Rotate API keys quarterly
- [ ] Update dependencies monthly
- [ ] Backup database daily
- [ ] Review user access logs
- [ ] Test disaster recovery quarterly

---

## 📞 Security Incident Response

### If API Key Leaked

1. Immediately revoke key via admin panel
2. Generate new API key
3. Update external systems
4. Monitor logs for unauthorized use
5. Review audit log for suspicious activity
6. Change other credentials as precaution

### If Database Compromised

1. Rotate all user passwords
2. Revoke all API keys
3. Generate new JWT secret
4. Check audit logs
5. Notify users
6. Restore from clean backup if needed

### If WhatsApp Account Hacked

1. Revoke WhatsApp session
2. Scan QR code to re-authenticate
3. Change associated email/phone
4. Review sent messages
5. Notify organization

---

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Helmet.js Docs](https://helmetjs.github.io/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Remember**: Security is an ongoing process, not a one-time setup!
