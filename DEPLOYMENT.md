# 🚀 Cyberpunk Frontend Tester - Docker Deployment Guide

## Quick Start

### Windows Users
```cmd
docker-test.bat
```

### Linux/Mac Users
```bash
docker-compose up --build
```

## Service URLs
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## Verification Steps

1. **Check all services are running**:
   ```bash
   docker-compose ps
   ```

2. **View service logs**:
   ```bash
   # All services
   docker-compose logs -f
   
   # Specific service
   docker-compose logs frontend
   docker-compose logs backend
   docker-compose logs e2e-tests
   ```

3. **Test the application**:
   - Navigate to http://localhost:3000
   - Verify cyberpunk styling loads correctly
   - Test dropdown functionality
   - Submit a test scan

4. **Check E2E test results**:
   ```bash
   docker-compose logs e2e-tests
   ```

## Troubleshooting

### Common Issues

**Port conflicts**:
```bash
# Check what's using ports 3000/5000
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Stop conflicting processes or change ports in docker-compose.yml
```

**Docker build issues**:
```bash
# Clean rebuild
docker-compose down
docker system prune -f
docker-compose up --build --force-recreate
```

**E2E tests failing**:
```bash
# Check if frontend/backend are healthy first
curl http://localhost:3000
curl http://localhost:5000/api/health

# Run tests manually
docker-compose run e2e-tests npx playwright test --headed
```

## Development Workflow

### Making Changes
1. Edit source code
2. Rebuild affected services:
   ```bash
   # Frontend changes
   docker-compose up --build frontend
   
   # Backend changes  
   docker-compose up --build backend
   ```

### Debugging
```bash
# Access running container
docker-compose exec backend sh
docker-compose exec frontend sh

# View real-time logs
docker-compose logs -f backend
```

### Cleanup
```bash
# Stop all services
docker-compose down

# Remove volumes and networks
docker-compose down -v

# Clean up Docker system
docker system prune -a
```

## Production Deployment

### Environment Variables
Create `.env` file:
```env
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://api.your-domain.com
```

### SSL/HTTPS Setup
Update `nginx.conf` for SSL configuration and modify `docker-compose.yml` to include SSL certificates.

### Scaling
```bash
# Scale backend instances
docker-compose up --scale backend=3

# Use load balancer for production
```
