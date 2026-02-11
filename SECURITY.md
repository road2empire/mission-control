# Security Configuration

## PIN Protection

The Mission Control dashboard is protected with a PIN authentication system.

### Access PIN
```
5991
```

**Hard-coded in:** `/app/login/page.tsx`

### How It Works

1. User visits the dashboard
2. Redirected to `/login` if not authenticated
3. Enter PIN: `5991`
4. Authentication stored in `localStorage`
5. Access granted to dashboard
6. Logout clears authentication

### Changing the PIN

To change the PIN, edit `/app/login/page.tsx`:

```typescript
if (pin === '5991') {  // Change this value
  localStorage.setItem('mission-control-auth', 'true');
  router.push('/');
}
```

## API Authentication

Backend API is protected with API key authentication.

### API Key
```
X-API-Key: 3376e9ea1076c166240444063ef33ebe6480b21aef9de346e8621aec22f403a4
```

**Location:** 
- Backend: `/backend/.env`
- Frontend: `.env.local`, `.env.production`

### Endpoints

- **Public:** `/api/health` (no auth required)
- **Protected:** All other endpoints require `X-API-Key` header

## HTTPS

Backend API accessible via HTTPS reverse proxy:
```
https://dealdetective.xyz/mission-control-api
```

**Nginx config:** `/etc/nginx/sites-available/dealdetective.xyz`

## Security Checklist

- ✅ PIN protection for frontend
- ✅ API key authentication for backend
- ✅ HTTPS encrypted traffic
- ✅ CORS configured for Vercel domain
- ✅ Environment variables not in git (.gitignore)
- ✅ Logout functionality
- ✅ Session stored in localStorage only

## Production Recommendations

For production deployment:

1. **Change the PIN** from default `5991`
2. **Rotate API key** periodically
3. **Add rate limiting** to backend
4. **Set up monitoring** for unauthorized access attempts
5. **Consider JWT tokens** instead of localStorage for auth
6. **Add session timeout** (auto-logout after inactivity)
7. **Enable HTTPS** for all traffic
8. **Add IP whitelist** if backend should only be accessible from specific IPs

---

**Current Setup:** Development/Testing
**PIN:** 5991 (hard-coded)
**API Key:** 3376e9ea1076c166240444063ef33ebe6480b21aef9de346e8621aec22f403a4
