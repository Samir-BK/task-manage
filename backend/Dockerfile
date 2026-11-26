# Stage 1: Build the backend application
FROM node:24-slim AS builder

WORKDIR /app

# Copy dependency manifests and npm configuration
COPY package.json package-lock.json .npmrc ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install backend dependencies
RUN npm ci --workspace backend

# Copy backend source code and TypeScript configuration
COPY backend/src ./backend/src
COPY backend/tsconfig.json ./backend/

# Compile the backend application
RUN npm run build:backend

# Stage 2: Production runtime
FROM node:24-slim AS runtime

WORKDIR /app

# Copy dependency manifests and npm configuration
COPY package.json package-lock.json .npmrc ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install production dependencies only
RUN npm ci --omit=dev --workspace backend

# Copy compiled application and database schema from builder
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/src/db/schema.sql ./backend/src/db/schema.sql

# Run the application as a non-root user
USER node

# Configure the production runtime
WORKDIR /app/backend
ENV NODE_ENV=production

EXPOSE 5000

# Start the backend application
CMD ["node", "dist/server.js"]