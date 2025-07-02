## 🔧 Create New Google OAuth Credentials

### Go to Google Cloud Console and create NEW credentials:

1. **Go to**: [Google Cloud Console](https://console.cloud.google.com/)
2. **Navigate to**: APIs & Services → Credentials
3. **Click**: "Create Credentials" → "OAuth 2.0 Client IDs"

### Configure the new client:

**Application type**: Web application
**Name**: Socipedia-New
**Authorized JavaScript origins**:
```
http://localhost:5173
```

**Authorized redirect URIs**:
```
http://localhost:5173/auth/google/callback
```

### After creating, you'll get:
- **New Client ID**: (copy this)
- **New Client Secret**: (copy this)

### Update your .env file with the new credentials:
```
REACT_APP_GOOGLE_CLIENT_ID=your_new_client_id_here
GOOGLE_CLIENT_SECRET=your_new_client_secret_here
```

This will give you a fresh start with clean OAuth credentials.
