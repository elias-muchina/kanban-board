# Kanban Board

A Kanban board application built with React, TypeScript, and Docker. Features comprehensive drag-and-drop functionality with full accessibility support.

## 🚀 Quick Setup & Running

### Option 1: Docker (Recommended)

**Single command to run the application:**

```bash
docker-compose up --build
```

The application will be available at: **http://localhost:3000**

**Alternative Docker commands:**

```bash
# Build the image
docker build -t kanban-board .

# Run the container
docker run -p 3000:80 kanban-board
```

### Option 2: Local Development

**Prerequisites:**

- Node.js 18 or higher
- npm or yarn

**Setup and run:**

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

The application will be available at: **http://localhost:5173**

**Production build:**

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

## 🛠 Technology Stack

- **React 19.1.1** with TypeScript
- **Tailwind CSS 4.1.16** for styling
- **Vite 7.1.7** for build tooling
- **Docker** with Nginx for deployment

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── draggable/        # Reusable drag-drop components
│   │   ├── kanban/           # Kanban-specific components
│   │   └── ui/               # UI primitives
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript definitions
│   └── data/                 # Sample data
├── public/                   # Static assets
├── docker-compose.yml        # Docker orchestration
├── Dockerfile               # Container configuration
└── nginx.conf              # Production server config
```

## 🎯 Key Features Implemented

- **Dynamic Columns**: Add, rename, and delete columns
- **Rich Cards**: Title, description, assignee, and priority levels
- **Drag & Drop**: Full mouse and keyboard support
- **Accessibility**: WCAG compliant with ARIA labels and keyboard navigation
- **State Persistence**: Data saved in localStorage
- **Responsive Design**: Works on all device sizes
- **Generic Components**: Reusable `DraggableList<T>` component

## 🐳 Docker Deployment

The project includes production-ready Docker configuration:

- **Multi-stage build** for optimized image size
- **Nginx** web server for efficient static file serving
- **Health checks** for container monitoring
- **Gzip compression** for faster loading
- **Security headers** for production safety

## 🚨 Troubleshooting

**Port already in use:**

```bash
# Change port in docker-compose.yml or stop conflicting services
docker-compose down
# Or use different port
docker run -p 8080:80 kanban-board
```

**Node.js version issues:**

```bash
# Check Node.js version (requires 18+)
node --version

# Install Node.js from https://nodejs.org if needed
```

**Permission issues on Docker:**

```bash
# On Linux/Mac, may need sudo
sudo docker-compose up --build
```

## 🏗️ Implementation Approach

**Architecture:** Built a generic `DraggableList<T>` component using TypeScript generics, reused for both columns and cards. Clean separation between generic drag-drop logic and Kanban-specific business logic.

**Accessibility:** Full keyboard navigation (Space/Enter/Arrow keys/Escape) with ARIA attributes and live region announcements. Semantic HTML structure throughout.

**State Management:** Custom `useKanbanState` hook with localStorage persistence and immutable updates. Components use clean API functions without direct state manipulation.

**Drag & Drop:** HTML5 Drag API for mouse users, separate keyboard system with focus management. Supports cross-column movement for both interaction methods.

**Deployment:** Multi-stage Docker build (Node.js → Nginx Alpine) with production optimizations: gzip compression, security headers, health checks.

**Tech Stack:** React 19 + TypeScript + Tailwind CSS + Vite, fully responsive design with error handling and graceful fallbacks.

---
