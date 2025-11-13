# Environment Configuration for Gyaan Buddy

## Development Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_USE_MOCK_DATA=true

# Environment
NODE_ENV=development

# Authentication
REACT_APP_JWT_SECRET=your-jwt-secret-key

# AI Services (when implemented)
REACT_APP_OPENAI_API_KEY=your-openai-api-key
REACT_APP_AI_SERVICE_URL=http://localhost:3002/api

# Database (for future implementation)
REACT_APP_DATABASE_URL=postgresql://username:password@localhost:5432/gyaanbuddy

# File Upload
REACT_APP_MAX_FILE_SIZE=10485760
REACT_APP_ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx

# Analytics (optional)
REACT_APP_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX

# Feature Flags
REACT_APP_ENABLE_AI_FEATURES=true
REACT_APP_ENABLE_REAL_TIME_NOTIFICATIONS=false
REACT_APP_ENABLE_OFFLINE_MODE=false
```

## Production Environment Variables

For production deployment, update the following:

```bash
# API Configuration
REACT_APP_API_URL=https://api.gyaanbuddy.com/api
REACT_APP_USE_MOCK_DATA=false

# Environment
NODE_ENV=production

# Authentication
REACT_APP_JWT_SECRET=your-production-jwt-secret-key

# AI Services
REACT_APP_OPENAI_API_KEY=your-production-openai-api-key
REACT_APP_AI_SERVICE_URL=https://ai.gyaanbuddy.com/api

# Database
REACT_APP_DATABASE_URL=postgresql://prod_user:prod_password@prod_host:5432/gyaanbuddy_prod

# Feature Flags
REACT_APP_ENABLE_AI_FEATURES=true
REACT_APP_ENABLE_REAL_TIME_NOTIFICATIONS=true
REACT_APP_ENABLE_OFFLINE_MODE=true
```

## Mock Data Configuration

The application currently uses mock data for development. To enable/disable mock data:

1. Set `REACT_APP_USE_MOCK_DATA=true` for development with mock data
2. Set `REACT_APP_USE_MOCK_DATA=false` for development with real API calls
3. Always set to `false` in production

## API Service Configuration

The API service automatically detects the environment and uses appropriate configuration:

- **Development with Mock Data**: Uses local mock data files
- **Development with Real API**: Makes HTTP requests to `REACT_APP_API_URL`
- **Production**: Makes HTTP requests to production API endpoint

## Security Notes

1. Never commit `.env` files to version control
2. Use different JWT secrets for development and production
3. Rotate API keys regularly
4. Use environment-specific database credentials
5. Enable HTTPS in production

## Testing Environment

For testing, create a `.env.test` file:

```bash
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_USE_MOCK_DATA=true
NODE_ENV=test
REACT_APP_JWT_SECRET=test-jwt-secret
```

## Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set `REACT_APP_USE_MOCK_DATA=false`
- [ ] Configure production API URL
- [ ] Set production JWT secret
- [ ] Configure production database
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure CDN for static assets
- [ ] Set up backup strategies
- [ ] Configure security headers
