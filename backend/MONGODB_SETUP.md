# MongoDB Setup Guide

## Prerequisites

1. **Install MongoDB** on your local machine or have access to MongoDB Atlas (cloud)

### Local Installation:
- **Windows**: Download from [mongodb.com/download-center/community](https://www.mongodb.com/try/download/community)
- **macOS**: `brew install mongodb-community`
- **Linux**: Follow [official MongoDB installation guide](https://docs.mongodb.com/manual/administration/install-on-linux/)

### MongoDB Atlas (Cloud):
- Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Create a free cluster
- Get your connection string

## Configuration

### 1. Environment Variables

Update your `.env` file with MongoDB connection string:

```env
# Local MongoDB
MONGO_URI=mongodb://localhost:27017/contiq

# MongoDB Atlas (replace with your credentials)
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/contiq?retryWrites=true&w=majority
```

### 2. Connection Details

- **Database Name**: `contiq`
- **Connection Timeout**: 10 seconds
- **Auto-Reconnect**: Enabled

## Starting the Server

The MongoDB connection is established automatically when you start the server:

```bash
cd backend
npm start
```

You should see:
```
[Server] Starting Contiq Backend...
MongoDB Connected: localhost
Database Name: contiq
[Server] Running on port 5555
```

## Connection Error Handling

If MongoDB connection fails:
1. **Error Message**: Detailed error will be logged to console
2. **Exit Code**: Server exits with code 1
3. **Troubleshooting**:
   - Ensure MongoDB is running locally
   - Check MONGO_URI in .env file
   - Verify MongoDB port (default: 27017)
   - Check firewall settings

## MongoDB Connection Events

The connection monitors these events:
- ✅ **Connected**: Initial connection successful
- ⚠️ **Disconnected**: Connection lost, attempting reconnect
- ✅ **Reconnected**: Connection restored
- ❌ **Error**: Connection error occurred

## Database Structure

Currently, the application uses:
- **Qdrant**: Vector storage for embeddings
- **MongoDB**: User data, session management (ready for future features)

## Verifying Connection

### Method 1: Health Check API
```bash
curl http://localhost:5555/
```

### Method 2: MongoDB Shell
```bash
mongosh
use contiq
show collections
```

## Next Steps

With MongoDB connected, you can:
1. Create user authentication models
2. Store chat history
3. Implement user preferences
4. Track usage analytics

## Common Issues

### Issue: "MongoServerError: connect ECONNREFUSED"
**Solution**: Start MongoDB service
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### Issue: "MONGO_URI is not defined"
**Solution**: Ensure `.env` file has `MONGO_URI` variable

### Issue: "Authentication failed"
**Solution**: Check username/password in connection string (for MongoDB Atlas)

## Additional Resources

- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/getting-started/)
- [Connection String Format](https://docs.mongodb.com/manual/reference/connection-string/)
