# Cyberpunk Frontend Tester 🚀

A cyberpunk-themed web application for running end-to-end Playwright tests with a futuristic hacker aesthetic. Now fully Dockerized for easy deployment!

## ✨ Features

- **🎯 Neural Probe System**: Test any publicly accessible URL with cyberpunk terminology
- **🌐 Multi-Agent Support**: Run tests across Chromium, Firefox, and WebKit browsers
- **⚡ Real-time Matrix Infiltration**: Live progress updates with neon-styled progress bars
- **📊 Detailed Scan Results**: Comprehensive test results with cyberpunk-themed display
- **🎮 Terminal Interface**: Futuristic UI with glowing borders and neon colors
- **📱 Responsive Design**: Optimized for all screen sizes with mobile-first approach
- **🐳 Docker Ready**: Complete containerization with single-command deployment

## 🎨 Design System

- **Color Palette**: Electric cyan (#00ffff), Magenta (#ff00ff), Deep charcoal (#0a0a0a)
- **Typography**: Orbitron (headings), Roboto Mono (body text)
- **Effects**: Neon glows, sharp borders, terminal-style animations
- **Theme**: Cyberpunk hacker aesthetic with Matrix-inspired terminology

## 📁 Project Structure

```
frontend-tester/
├── frontend/              # React cyberpunk interface
│   ├── src/
│   │   ├── components/
│   │   │   ├── TestForm.js      # System Analyzer interface
│   │   │   └── StatusPage.js    # Scan Results display
│   │   ├── App.js
│   │   ├── App.css             # Cyberpunk design system
│   │   └── index.js
│   └── package.json
├── server/                # Node.js backend server
│   ├── server.js          # Express API with test execution
│   └── package.json
├── e2e-tests/             # Playwright E2E test suite
│   └── basic-functionality.spec.js
├── tests/                 # Generated Playwright test files
├── Dockerfile.frontend    # Multi-stage React build
├── Dockerfile.backend     # Express server container
├── docker-compose.yml     # Service orchestration
├── nginx.conf            # Frontend proxy configuration
├── e2e-package.json      # E2E test dependencies
├── playwright.config.js
└── package.json
```

## 🚀 Setup

### Prerequisites
- Install [Docker](https://docs.docker.com/get-docker/)
- Install [Docker Compose](https://docs.docker.com/compose/install/)

### Local Development (Optional)
```bash
git clone <repository-url>
cd frontend-tester
npm install
npx playwright install
```

## 💻 Usage

### Docker Deployment (Recommended)
Deploy the entire stack with a single command:

```bash
docker-compose up
```

This will:
- Build and start the React frontend on `http://localhost:3000`
- Launch the Express backend on `http://localhost:5000`
- Run comprehensive E2E tests using Playwright
- Set up networking between all services

### Manual Development Mode
```bash
# Backend Matrix Server
cd server && npm start

# Frontend Neural Interface  
cd frontend && npm start
```

## 🔍 Verification

After running `docker-compose up`, verify the deployment:

1. **Frontend**: Navigate to `http://localhost:3000` to access the System Analyzer
2. **Backend Health**: Check `http://localhost:5000/api/health` for server status
3. **E2E Tests**: Monitor the `e2e-tests` service logs for test results:
   ```bash
   docker-compose logs e2e-tests
   ```

Look for test completion messages and HTML reports in the container logs.

## 🔌 API Endpoints

- `GET /api/health` - Health check for Docker monitoring
- `POST /api/run-tests` - Initiate neural probe sequence
- `GET /api/test-status/:testId` - Monitor infiltration progress
- `GET /api/test-results/:testId` - Retrieve scan analysis
- `POST /api/cancel-test/:testId` - Terminate active probe

## ⚡ System Operation

1. **Target Acquisition**: Input URL via System Analyzer interface
2. **Agent Selection**: Choose browser agents (Chromium, Firefox, WebKit)
3. **Matrix Infiltration**: Dynamic test generation and execution
4. **Neural Probe**: Real-time progress monitoring with cyberpunk visuals
5. **Data Extraction**: Comprehensive results with terminal-style display

## 🛠 Technologies

- **Frontend**: React, React Router, Axios, Nginx
- **Backend**: Node.js, Express, Playwright
- **Testing**: Playwright E2E tests with Docker integration
- **Containerization**: Docker, Docker Compose
- **Interface**: Custom cyberpunk CSS design system
- **Fonts**: Google Fonts (Orbitron, Roboto Mono)

## 🐳 Docker Services

- **frontend**: React app built and served via Nginx with API proxy
- **backend**: Express server with Playwright integration and health checks
- **e2e-tests**: Automated Playwright tests running in isolated container

## 🌐 Browser Agent Support

- **Chromium Agent**: Latest stable version
- **Firefox Agent**: Latest stable version
- **WebKit Agent**: Safari engine for cross-platform analysis

## 🎯 Cyberpunk Features

- Terminal-style command interface
- Neon glowing progress indicators  
- Matrix-inspired status messages
- Responsive design for all devices
- Sharp, angular UI elements
- Futuristic color scheme and typography
- Custom dropdown components with cyberpunk styling
- Page element detection (buttons, links, inputs)
- Basic accessibility checks (titles, headings)
- Screenshot capture for visual verification

## 🚀 Quick Commands

```bash
# Start entire stack
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild containers
docker-compose up --build
```

## Development

### Frontend Development
```bash
cd frontend
npm start
```

### Backend Development
```bash
cd server
npm run dev
```

### Run Playwright Tests
```bash
npx playwright test
```