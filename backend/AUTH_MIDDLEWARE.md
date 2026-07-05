# Authentication Middleware

## ✅ Implementation Complete

The authentication middleware (`middleware/auth.js`) is now ready to protect routes by verifying JWT tokens.

## Features

### 1. Token Extraction
✅ Reads `Authorization` header
✅ Validates "Bearer" format
✅ Extracts token from "Bearer <token>"

### 2. Token Verification
✅ Verifies JWT using `process.env.JWT_SECRET`
✅ Decodes token payload
✅ Checks token expiration

### 3. Request Enhancement
✅ Attaches `req.user` object with decoded user id
✅ Available in protected route handlers

### 4. Error Handling
✅ **401**: Missing token
✅ **401**: Invalid token format
✅ **401**: Invalid/expired token
✅ **500**: Missing JWT_SECRET

## Usage

### Protecting Routes

#### Example 1: Protect a Single Route

```javascript
const auth = require('./middleware/auth');

// Protected route - requires authentication
router.get('/profile', auth, (req, res) => {
  // req.user.id is available here
  res.json({
    success: true,
    userId: req.user.id,
    message: 'This is a protected route'
  });
});
```

#### Example 2: Protect Multiple Routes

```javascript
const auth = require('./middleware/auth');

// All routes below will require authentication
router.use(auth);

router.get('/dashboard', (req, res) => {
  // Protected
  res.json({ userId: req.user.id });
});

router.get('/settings', (req, res) => {
  // Protected
  res.json({ userId: req.user.id });
});
```

#### Example 3: Mix Public and Protected Routes

```javascript
const auth = require('./middleware/auth');

// Public routes (no authentication required)
router.post('/login', loginController);
router.post('/register', registerController);

// Protected routes (authentication required)
router.get('/profile', auth, getProfileController);
router.put('/profile', auth, updateProfileController);
router.delete('/account', auth, deleteAccountController);
```

### Accessing User ID in Controllers

```javascript
// In your controller
const getProfile = async (req, res) => {
  try {
    // req.user.id is set by auth middleware
    const userId = req.user.id;
    
    // Fetch user from database
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
```

## Testing

### Valid Request with Token

```bash
# 1. Login to get token
TOKEN=$(curl -s -X POST http://localhost:5555/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }' | jq -r '.token')

# 2. Use token to access protected route
curl -X GET http://localhost:5555/protected-route \
  -H "Authorization: Bearer $TOKEN"
```

### Missing Token

```bash
curl -X GET http://localhost:5555/protected-route
```

**Response (401)**:
```json
{
  "success": false,
  "message": "Access denied. No token provided"
}
```

### Invalid Token Format

```bash
curl -X GET http://localhost:5555/protected-route \
  -H "Authorization: InvalidToken123"
```

**Response (401)**:
```json
{
  "success": false,
  "message": "Invalid token format. Use: Bearer <token>"
}
```

### Invalid Token

```bash
curl -X GET http://localhost:5555/protected-route \
  -H "Authorization: Bearer invalid.token.here"
```

**Response (401)**:
```json
{
  "success": false,
  "message": "Invalid token"
}
```

### Expired Token

```bash
curl -X GET http://localhost:5555/protected-route \
  -H "Authorization: Bearer <expired_token>"
```

**Response (401)**:
```json
{
  "success": false,
  "message": "Token expired"
}
```

## Implementation Example: User Profile Routes

Create `routes/user.js`:

```javascript
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

/**
 * @route   GET /user/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/profile', auth, async (req, res) => {
  try {
    // req.user.id is set by auth middleware
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   PUT /user/profile
 * @desc    Update current user's profile
 * @access  Private
 */
router.put('/profile', auth, async (req, res) => {
  try {
    const { name } = req.body;
    
    // Find and update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
```

Register in `server.js`:

```javascript
const userRoute = require('./routes/user');
app.use('/user', userRoute);
```

## Token Flow Diagram

```
Client Request
     ↓
Contains Authorization header?
     ├─ No → 401 "No token provided"
     └─ Yes
          ↓
     Format is "Bearer <token>"?
          ├─ No → 401 "Invalid token format"
          └─ Yes
               ↓
          Extract token after "Bearer "
               ↓
          Token exists?
               ├─ No → 401 "No token provided"
               └─ Yes
                    ↓
               Verify with JWT_SECRET
                    ├─ Invalid → 401 "Invalid token"
                    ├─ Expired → 401 "Token expired"
                    └─ Valid
                         ↓
                    Decode payload
                         ↓
                    Attach req.user = { id: decoded.id }
                         ↓
                    Call next() → Continue to route handler
```

## Error Types

| Error Type | Status | Message | Cause |
|------------|--------|---------|-------|
| Missing Header | 401 | Access denied. No token provided | No Authorization header |
| Invalid Format | 401 | Invalid token format | Not "Bearer <token>" |
| Missing Token | 401 | Access denied. No token provided | "Bearer " without token |
| Invalid Token | 401 | Invalid token | JWT verification failed |
| Expired Token | 401 | Token expired | Token past expiration time |
| Server Error | 500 | Server configuration error | JWT_SECRET not set |

## Security Considerations

### Why 401 Not 403?

- **401 Unauthorized**: Authentication required or failed
- **403 Forbidden**: Authenticated but not authorized

Since this middleware handles authentication, we use 401.

### Token Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Why "Bearer"?**
- Industry standard (OAuth 2.0)
- Indicates token-based authentication
- Distinguishes from other auth schemes (Basic, Digest, etc.)

### req.user Structure

```javascript
req.user = {
  id: "507f1f77bcf86cd799439011" // MongoDB ObjectId as string
}
```

**Why only id?**
- Minimal payload keeps tokens small
- Always fetch fresh user data from database
- Prevents stale data from long-lived tokens

## Frontend Integration

### React Example with Axios

```javascript
import axios from 'axios';

// Set default Authorization header
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Make authenticated request
const getProfile = async () => {
  try {
    const response = await axios.get('http://localhost:5555/user/profile');
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // Token invalid or expired - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }
};
```

### Fetch API Example

```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:5555/user/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  if (response.status === 401) {
    // Token invalid - redirect to login
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return response.json();
})
.then(data => console.log(data));
```

## Common Patterns

### Pattern 1: Optional Authentication

Some routes that work better with auth but don't require it:

```javascript
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token - continue without user
    return next();
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
  } catch (error) {
    // Invalid token - continue without user
  }
  
  next();
};

// Route works with or without auth
router.get('/content', optionalAuth, (req, res) => {
  if (req.user) {
    // Personalized content
  } else {
    // Public content
  }
});
```

### Pattern 2: Role-Based Authorization

Extend the middleware for role checking:

```javascript
// middleware/authorize.js
const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      if (!roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access forbidden'
        });
      }
      
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
};

// Usage
router.delete('/users/:id', auth, authorize('admin'), deleteUser);
```

## Troubleshooting

### Issue: "Invalid token format"
**Solution**: Ensure Authorization header is `Bearer <token>`, not just `<token>`

### Issue: "Token expired"
**Solution**: User needs to login again to get a new token

### Issue: "Access denied. No token provided"
**Solution**: Include Authorization header in request

### Issue: "Server configuration error"
**Solution**: Ensure JWT_SECRET is set in .env file

## Best Practices

✅ Always use HTTPS in production
✅ Store tokens securely (httpOnly cookies or secure storage)
✅ Implement token refresh mechanism
✅ Set reasonable token expiration times
✅ Log auth failures for security monitoring
✅ Use different secrets for dev/staging/production

## Summary

The authentication middleware is production-ready with:
- ✅ Bearer token extraction
- ✅ JWT verification
- ✅ User ID attachment to request
- ✅ Comprehensive error handling
- ✅ Clear error messages
- ✅ Easy to use in routes
- ✅ Reusable for all protected endpoints

Ready to protect your routes! 🔒
