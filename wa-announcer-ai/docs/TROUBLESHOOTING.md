# 🆘 Troubleshooting & FAQ

## ❌ Common Issues & Solutions

### Bot Issues

#### 1. Bot tidak bisa initialize / QR tidak muncul

**Error**: `Error: Failed to initialize bot`

**Solutions**:
```bash
# Clear session
rm -rf sessions/
rm -rf .wwebjs_auth/

# Restart
npm run dev

# If still not working, check Chrome:
which chromium-browser
which google-chrome
```

---

#### 2. QR code sudah scan tapi bot tidak ready

**Possible causes**:
- Network timeout
- Chrome crash
- Session corrupted

**Solutions**:
```bash
# Clear & try again
rm -rf sessions/
npm run dev

# Check internet connection
ping google.com

# Check logs for errors
tail -f logs/app-*.log | grep -i error
```

---

#### 3. WhatsApp message tidak diterima

**Possible causes**:
- Phone not connected to internet
- Session expired
- WhatsApp update

**Solutions**:
```bash
# Re-authenticate
rm -rf sessions/
npm run bot

# Make sure phone has internet
# Update WhatsApp to latest version
# Restart device
```

---

### API Issues

#### 4. API not responding / Port in use

**Error**: `Port 3000 already in use`

**Solutions**:
```bash
# Find process using port
lsof -i :3000
# or
netstat -tulpn | grep 3000

# Kill process
kill -9 <PID>

# Or change port in .env
API_PORT=3001

# Restart
npm start
```

---

#### 5. Authentication error / Token invalid

**Error**: `401 Unauthorized - Token invalid`

**Solutions**:
```bash
# Check token expiration
# Tokens expire after 7 days
# Refresh token:
POST /api/auth/refresh

# Or login again to get new token
POST /api/auth/login

# Check JWT_SECRET in .env
echo $JWT_SECRET
```

---

#### 6. CORS error from frontend

**Error**: `Access to XMLHttpRequest blocked by CORS`

**Solutions**:
```bash
# Check ALLOW_ORIGINS in .env
ALLOW_ORIGINS=http://localhost:3001,https://yourdomain.com

# Restart API server
npm run api

# Or check Nginx config for CORS headers
```

---

### Database Issues

#### 7. Database locked / Can't write to DB

**Error**: `SQLITE_BUSY: database is locked`

**Solutions**:
```bash
# Close all connections first
killall node

# Repair database
sqlite3 data/announcer.db "PRAGMA integrity_check;"

# Vacuum database
sqlite3 data/announcer.db "VACUUM;"

# Restart
npm start
```

---

#### 8. Database corrupted

**Error**: `database disk image is malformed`

**Solutions**:
```bash
# Restore from backup
cp data_backup_20260101.db data/announcer.db

# Or recreate
rm data/announcer.db
npm run setup
```

---

### AI/LLM Issues

#### 9. OpenAI API error / Invalid key

**Error**: `401 Unauthorized - Invalid API key`

**Solutions**:
```bash
# Verify API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models

# Check key in .env
nano .env | grep OPENAI_API_KEY

# Generate new key at https://platform.openai.com/api-keys
```

---

#### 10. Ollama not responding

**Error**: `connect ECONNREFUSED 127.0.0.1:11434`

**Solutions**:
```bash
# Check if Ollama running
ps aux | grep ollama

# Start Ollama
ollama serve

# Or via Docker
docker run -d -p 11434:11434 ollama/ollama

# Check if model exists
ollama list

# Pull model
ollama pull mistral
```

---

#### 11. AI format timeout

**Error**: `Request timeout - AI service not responding`

**Solutions**:
```bash
# Increase timeout in ai.service.js
// Change timeout: 30000 to 60000

# Check API quota
# Login to OpenAI dashboard

# Check rate limits
# Free tier: 3 requests/min

# Wait or upgrade account
```

---

### Deployment Issues

#### 12. PM2 not starting / Process crashes

**Error**: `PM2 not found or process keeps restarting`

**Solutions**:
```bash
# Check PM2 logs
pm2 logs wa-announcer

# Increase memory limit
pm2 start src/index.js --max-memory-restart 512M

# Check for errors in app
npm start
# Look for actual error messages

# Increase Node memory
NODE_OPTIONS='--max-old-space-size=512' npm start
```

---

#### 13. Nginx proxy not working

**Error**: `502 Bad Gateway` or `upstream connect error`

**Solutions**:
```bash
# Check Nginx config
sudo nginx -t

# Check app running
curl http://localhost:3000/api/health

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx

# Check if app listening on 127.0.0.1
netstat -tulpn | grep 3000
```

---

#### 14. SSL certificate error

**Error**: `ERR_CERT_AUTHORITY_INVALID` or certificate renewal failed

**Solutions**:
```bash
# Check certificate validity
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal

# Check renewal logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Fix permissions if needed
sudo chown -R root:root /etc/letsencrypt/
```

---

### Performance Issues

#### 15. Slow announcement formatting

**Solutions**:
- Check OpenAI API status
- Reduce input size (max 1000 chars)
- Switch to local Ollama
- Increase Node memory

```bash
NODE_OPTIONS='--max-old-space-size=1024' npm start
```

---

#### 16. High memory usage

**Solutions**:
```bash
# Monitor memory
top -p <PID>
ps aux --sort=-%mem | head

# Reduce cache size
# Restart process regularly
pm2 restart wa-announcer

# Check for memory leaks
node --trace-gc src/index.js
```

---

## 📚 FAQ

### Q: Berapa cost untuk OpenAI API?
**A**: Pay-as-you-go. GPT-3.5-turbo ~$0.0015 per 1K tokens. $5-50/month typical.

---

### Q: Bisa pakai LLM lain?
**A**: Ya! Ollama support Mistral, Neural Chat, Llama 2, dll. Edit `ai.service.js` untuk OpenAI API alternative.

---

### Q: Data aman di WhatsApp?
**A**: WhatsApp E2E encrypted. Tapi session file lokal tidak encrypted by default. Encrypt sessions atau use secure storage.

---

### Q: Bisa deploy di Windows?
**A**: Tidak recommended. Gunakan WSL2 atau VirtualBox Ubuntu. Atau pakai Docker.

---

### Q: Bandwidth usage?
**A**: ~1MB per message dengan session sync. ~100MB/bulan untuk 1000 messages.

---

### Q: Bisa handle multiple WhatsApp accounts?
**A**: Not currently. One account per instance. Scale dengan multiple containers.

---

### Q: Token expiration bagaimana?
**A**: 7 hari. Refresh otomatis atau login ulang. Implementasi JWT blacklist untuk logout.

---

### Q: Backup strategy apa?
**A**: Daily backup DB + sessions. Keep 7 days. Use cronjob atau cloud storage.

---

### Q: Bisa send ke broadcast/channel?
**A**: WhatsApp tidak punya broadcast API. Use group atau personal. Implementasi custom broadcast list.

---

### Q: Rate limit bisa dirubah?
**A**: Ya di `.env`. RATE_LIMIT_WINDOW & RATE_LIMIT_MAX_REQUESTS.

---

## 🔧 Debug Mode

Enable detailed logging:

```bash
# .env
LOG_LEVEL=debug

# Restart
npm run dev
```

View detailed logs:
```bash
tail -f logs/app-*.log | grep -i debug
```

---

## 📞 Getting Help

1. Check logs: `logs/app-*.log`
2. Search this FAQ
3. Google the error message
4. Check GitHub issues
5. Ask in community forums

---

**Still stuck? Enable debug mode, capture full error message, dan share di issues!**
