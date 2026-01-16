---
name: auth-skill
description: Implement secure authentication including signup, signin, password hashing, JWT tokens, and Better Auth integration.
---

# Authentication System

## Instructions

1. **User Authentication**
   - User signup with email & password
   - User signin with credentials
   - Input validation and error handling

2. **Security**
   - Hash passwords using bcrypt or argon2
   - Never store plain-text passwords
   - Use environment variables for secrets

3. **JWT Token Management**
   - Generate access tokens on login
   - Verify tokens on protected routes
   - Support token expiration and refresh

4. **Better Auth Integration**
   - Configure Better Auth provider
   - Use Better Auth for session handling
   - Sync Better Auth user data with database

## Best Practices
- Use strong hashing algorithms
- Short-lived access tokens
- Secure HTTP-only cookies (if applicable)
- Clear error messages without leaking sensitive info
- Follow OWASP authentication guidelines

## Example Structure
```js
// Signup
POST /auth/signup
{
  "email": "user@example.com",
  "password": "strongPassword123"
}

// Signin
POST /auth/signin
{
  "email": "user@example.com",
  "password": "strongPassword123"
}
