# Authentication Routes Setup

## Overview

Authentication routes have been created following clean MVC architecture with separation of concerns between routes and controllers.

## Files Created

### 1. `controllers/authController.js`
**Purpose**: Handles authentication business logic

**Functions**:
- `register(req, res)` - User registration handler (not implemented yet)
- `login(req, res)` - User login handler (not implemented yet)

**Status**: Placeholder functions that return 501 (Not Implemented) status

### 2. `routes/auth.js`
**Purpose**: Defines authentication endpoints

**Routes**:
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login existing user

**Structure**: Uses Express Router for clean route definitions

## MVC Structure

```
backend/
├── controllers/
│   └── authController.js    ← Business logic (to be implemented)
├── routes/
│   └── auth.js               ← Route definitions
├── models/
│   └── User.js               ← User data model
└── server.js                 ← Routes registered here
```

## Route Registration

Added to `server.js`:
```javascript
const authRoute = require('./routes/auth');
app.use('/auth', authRoute);
```

## API Endpoints

### 1. Register User
```
POST /auth/register
```

**Expected Request Body** (when implemented):
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Current Response** (501 Not Implemented):
```json
{
  "success": false,
  "message": "Register endpoint not implemented yet"
}
```

### 2. Login User
```
POST /auth/login
```

**Expected Request Body** (when implemented):
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Current Response** (501 Not Implemented):
```json
{
  "success": false,
  "message": "Login endpoint not implemented yet"
}
```

## Testing Routes

### Using cURL

**Test Register Endpoint**:
```bash
curl -X POST http://localhost:5555/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123"
  }'
```

**Test Login Endpoint**:
```bash
curl -X POST http://localhost:5555/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Using Postman/Thunder Client

1. **Method**: POST
2. **URL**: `http://localhost:5555/auth/register` or `/auth/login`
3. **Headers**: `Content-Type: application/json`
4. **Body** (JSON):
   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "test123"
   }
   ```

## Next Steps

To implement the authentication logic:

1. **In `authController.js`**:
   - Import User model
   - Import bcryptjs for password hashing
   - Import jsonwebtoken for JWT generation
   - Implement validation logic
   - Hash passwords before storing
   - Generate JWT tokens on login
   - Handle errors appropriately

2. **Add Middleware** (optional):
   - Input validation middleware
   - Authentication middleware for protected routes

3. **Error Handling**:
   - Duplicate email errors
   - Invalid credentials
   - Validation errors

## Code Structure Benefits

✅ **Separation of Concerns**: Routes define endpoints, controllers handle logic
✅ **Maintainability**: Easy to add new auth routes or modify logic
✅ **Testability**: Controllers can be tested independently
✅ **Scalability**: Easy to add middleware or new features
✅ **Clean Code**: Follows Express.js best practices

## Dependencies Already Available

- ✅ `express` - Web framework
- ✅ `bcryptjs` - Password hashing
- ✅ `jsonwebtoken` - JWT token generation
- ✅ `mongoose` - MongoDB ODM

## Environment Variables

Already configured in `.env`:
```env
JWT_SECRET=your_secret_key
JWT_EXPIRES=7d
MONGO_URI=mongodb://localhost:27017/contiq
```

## Route Flow Diagram

```
Client Request
     ↓
POST /auth/register or /auth/login
     ↓
Express Router (routes/auth.js)
     ↓
Controller Function (controllers/authController.js)
     ↓
[TO BE IMPLEMENTED]
├── Validate input
├── Hash password (register) or verify (login)
├── Save to MongoDB / Verify credentials
└── Generate JWT token
     ↓
Response to Client
```

## Status

✅ Routes created and registered in server.js
✅ Controller structure in place
✅ MVC pattern implemented
⏳ Controller logic pending implementation
⏳ Input validation pending
⏳ JWT generation pending
⏳ Password hashing pending

## Verification

Start the server and test the endpoints:
```bash
cd backend
npm start

# In another terminal:
curl -X POST http://localhost:5555/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456"}'
```

Expected output: 501 status with "not implemented yet" message
